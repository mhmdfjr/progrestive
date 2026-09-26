# API Specification

## 1. Conventions

This app has **no traditional REST API**. There are two kinds of data access:

1. **Firebase Callable Functions** — used for every write touching sensitive
   data (scores, profiles, task lifecycle). These are what this file documents.
2. **Direct Firestore reads** via the client SDK (or the Admin SDK in Server
   Components for SSR) — used for every read (task lists, reports,
   leaderboards). Query patterns are already covered in `DATABASE.md` and are
   not repeated here except where relevant to a function's context.

Every callable function:

- Requires `context.auth != null` (requests without a valid auth token are
  rejected with `unauthenticated`).
- Requires a valid App Check token (`context.app != null`), per
  `ARCHITECTURE.md` Section 7.
- Returns errors with the standard Firebase Functions `HttpsError` (`code`,
  `message`), not a custom error shape, to stay consistent with the Firebase
  SDK's built-in client error handling.

## 2. `createTask`

Creates a new task with `pending` status.

**Request**

| Field | Type | Required | Notes |
|---|---|---|---|
| `category` | `"hustle"` \| `"humble"` | yes | |
| `title` | string | yes | max 100 characters |
| `level` | number | yes | integer 1-5 |
| `durationHours` | number | yes | > 0, decimals allowed |
| `date` | string `YYYY-MM-DD` | yes | must not be a past date |

**Response**

```json
{ "taskId": "abc123", "status": "pending" }
```

**Error cases**

| Code | Condition |
|---|---|
| `invalid-argument` | `level` outside 1-5, `durationHours` <= 0, `date` in the past, malformed `date` |
| `failed-precondition` | this task's own `durationHours` exceeds `perTaskDurationCapHours` from Remote Config (default 16h) — flat cap, same for hustle and humble |
| `failed-precondition` | total task duration on that date (including this new task) exceeds `dailyDurationCapHours` from Remote Config. The message includes the remaining hours available, so the frontend can show a helpful message instead of a generic error |
| `unauthenticated` | no auth context |

**Cap-check implementation**: two sequential validations — (1) check this
task's own `durationHours` against `perTaskDurationCapHours`, failing fast with
no further queries when already over; (2) only then, per `DATABASE.md`
Section 4, use a Firestore aggregation `sum()` to total the existing tasks'
`durationHours` on the same date, inside a transaction together with the new
task write to avoid a race between reading the total and writing the task.

## 3. `updateTask`

Edits a task that is still `pending`. `completed`/`missed` tasks cannot be
edited.

**Request**

| Field | Type | Required |
|---|---|---|
| `taskId` | string | yes |
| `updates` | object, subset of `{ title, level, durationHours, date }` | yes, at least one field |

**Response**

```json
{ "taskId": "abc123", "updated": true }
```

**Error cases**

| Code | Condition |
|---|---|
| `not-found` | `taskId` does not exist or does not belong to that user |
| `failed-precondition` | task is `completed` or `missed` — not editable |
| `failed-precondition` | when `durationHours` changes, it is re-checked against `perTaskDurationCapHours` (flat 16h cap), same as `createTask` |
| `failed-precondition` | when `durationHours` or `date` changes, the daily cap is re-checked for the new date (old duration out, new duration in) — same as `createTask` |
| `invalid-argument` | new fields fail the same validation as `createTask` |

## 4. `deleteTask`

**Request**

```json
{ "taskId": "abc123" }
```

**Response**

```json
{ "taskId": "abc123", "deleted": true }
```

**Error cases**: `not-found`, `failed-precondition` (task is already
`completed`/`missed` and cannot be deleted — tasks that contributed score must
remain as an audit trail).

## 5. `completeTask`

**Request**

```json
{ "taskId": "abc123" }
```

**Response**

```json
{ "taskId": "abc123", "status": "completed", "score": 12 }
```

The score is computed server-side: `score = level x durationHours`, written
together with `status: "completed"` and `completedAt`.

**Error cases**

| Code | Condition |
|---|---|
| `not-found` | `taskId` does not exist or does not belong to the user |
| `failed-precondition` | task is already `completed` or `missed` — cannot complete twice or complete a task past its window |

## 6. `updateProfile`

**Request** (all fields optional, at least one required)

| Field | Type | Notes |
|---|---|---|
| `displayName` | string | |
| `avatarUrl` | string | |
| `city` | string | when filled, automatically sets `cityManualOverride = true` on the document so `weeklyCycleJob` never overwrites it with IP geolocation |
| `timezone` | string | IANA timezone string, validated against the valid timezone list. This function recomputes `utcResetHour` — the value is never accepted from the client |
| `aiReportEnabled` | boolean | |

**Response**

```json
{ "updated": true }
```

**Error cases**: `invalid-argument` (invalid timezone string, empty/overlong
`displayName`), `unauthenticated`.

## 7. `regenerateWeeklySuggestion` (optional, on-demand)

Called from the report page when the user enables `aiReportEnabled` after that
week's report was already generated without an AI suggestion, or wants to retry
after a previous attempt failed.

**Request**

```json
{ "weekId": "2026-W36" }
```

**Response**

```json
{ "weekId": "2026-W36", "aiSuggestion": "..." }
```

**Error cases**

| Code | Condition |
|---|---|
| `not-found` | `weeklyReports/{weekId}` does not exist yet (report not generated by `weeklyCycleJob`) |
| `resource-exhausted` | the user called more than once inside the cooldown window (recommended 1 hour), to prevent LLM API cost abuse — a per-user cooldown specific to this function, not a generic rate limit |
| `failed-precondition` | the profile's `aiReportEnabled` is `false` — the user must enable it in settings before regenerating |

## 8. Scheduled Functions (Internal, Not Client-Facing API)

Never called from the frontend; documented here for system-contract
completeness.

| Function | Trigger | Idempotency |
|---|---|---|
| `taskCutoverJob` | Cloud Scheduler cron `0 * * * *` (hourly) | Safe to run repeatedly: only touches tasks with `status == "pending"` and `date < today` (in the user's timezone); already-`missed` tasks are never reprocessed |
| `weeklyCycleJob` | Cloud Scheduler cron `0 0 * * 1` (fixed, Monday 00:00 UTC — rationale in `ARCHITECTURE.md` Section 4.2) | **Not yet fully idempotent-safe** — logged as an open risk in `ARCHITECTURE.md` Section 12. If the job dies mid-run (e.g. an error at user 500 of 1000), re-running must skip users whose groups/entries are already written in the same cycle, not reprocess from the start. The `status` field on `leaderboardCycles/{cycleId}` (`matching` -> `scoring` -> `completed`) serves as a coarse checkpoint for this, but per-user granularity inside one phase is not yet designed — to be worked out during implementation, not a blocker for starting development |

## 9. Read Patterns (Quick Reference, Details in DATABASE.md)

| Frontend need | Query |
|---|---|
| Today's task list | `users/{uid}/tasks where date == today`, realtime listener |
| Daily report | same as above, one-time fetch (no listener) |
| Weekly report | `users/{uid}/weeklyReports/{weekId}`, single document get |
| The user's group leaderboard | needs the user's `groupId` in the running cycle — denormalize `currentGroupId` onto `users/{uid}` when `weeklyCycleJob` finishes matching, so the frontend avoids an expensive collection group query on every leaderboard page open |
| Profile badge showcase | `users/{uid}/badges`, ordered by `awardedAt desc` |

**Note**: the `currentGroupId` field needed by the read pattern above is
documented in `DATABASE.md` Section 3.

## 10. Next Steps

Continue to `DESIGN.md` for UI/UX guidelines (Neo Brutalism component mapping
per page) before starting implementation.
