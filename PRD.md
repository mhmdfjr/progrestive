# Product Requirements Document (PRD)

## 1. Overview

Purrpose is a web app for tracking productivity and mental well-being through
gamification. Users manage a daily to-do list split into two task categories:
**Hustle** (productivity: work, study, and other pressure-adding activities)
and **Humble** (recovery: meals, sleep, exercise, entertainment, and other
pressure-releasing activities). Each completed task earns a score, encouraging
users to balance productive output with mental recovery.

Social competition comes from a location-based weekly leaderboard (city-level),
with collectible badges as the long-term reward.

## 2. Problem Statement

Most productivity trackers only measure output (finished tasks) and ignore
burnout risk. Users who hustle non-stop with no recovery time get no warning
signal from existing tools. This app explicitly tracks both sides —
productivity and recovery — and gives insight into how well they are balanced.

## 3. Target User

Productive individuals (workers, students, freelancers) who want to build
working habits while protecting their mental health, and who are motivated by
competitive/gamified elements (scores, leaderboards, badges).

## 4. Core Concept: Hustle & Humble

| Aspect | Hustle | Humble |
|---|---|---|
| Goal | Productivity | Recovery / stress management |
| Examples | Work, study, meetings, projects | Sleep, meals, exercise, shows, journaling |
| Score scale | 5 pressure levels (1 = light, 5 = heavy) | 5 restoration levels (1 = light, 5 = deeply restoring) |

Tasks are **manual and non-recurring**. Users re-add tasks explicitly every day.
There is no recurring-task template/generator in the initial scope — this keeps
the data model simple, because every task is an independent document with a
`date` field and no template-to-instance syncing is needed.

## 5. Scoring System

### 5.1 Formula

```
score = level (1-5) x duration (hours)
```

- `level` is entered by the user when creating a task: pressure level (hustle)
  or restoration level (humble).
- `duration` is entered by the user in hours (decimals allowed, e.g. 1.5).

### 5.2 Anti-abuse: Duration Caps

Without an upper bound, users could game the score (e.g. entering 20 hours for
a single task). Two cap layers apply:

- **Flat per-task cap**: any single task, regardless of category, may be at
  most **16 hours**. This is generous enough for the longest reasonable
  durations (extreme sleep, marathon work) while still catching clearly absurd
  input. It applies equally to hustle and humble — **not per task type**
  (sleep/exercise/work do not get different caps), because task titles are
  free text in the schema (see `DATABASE.md`), not an enum that could map to
  different caps. Enforcing per-type caps would require a new classification
  field with no value for the MVP phase — the flat cap is a deliberate
  simplicity trade-off.
- **Daily aggregate cap (confirmed)**: the total duration of all tasks (hustle
  + humble combined) on a single date may not exceed **24 hours**.

Validation runs on task create/update: the task's own duration is checked
against the flat cap, then the total duration of existing tasks on the same
date is computed, and the input is rejected if either threshold is exceeded.

Implementation note: daily-cap validation needs to read the existing tasks for
that date before writing, ideally inside a Firestore transaction to avoid race
conditions when a user creates several tasks nearly simultaneously (e.g. from
multiple tabs/devices). Both cap numbers (16h per-task, 24h per-day) live in
Firebase Remote Config, not hardcoded, so they can be tuned without redeploying
(`ARCHITECTURE.md` Section 4.3).

### 5.3 Scores are never reduced

Unfinished tasks do not reduce the score directly (no negative score per task).
The effect still exists through `completion_rate` as one weighting component of
the leaderboard score (`ARCHITECTURE.md` Section 8.1) — so frequently `missed`
tasks still hurt a user's leaderboard competitiveness, just not as a direct
score deduction. This non-punitive decision is applied consistently across all
derived documents (`DESIGN.md` Section 8, microcopy tone) and is considered
final.

## 6. Task Management (Home Page)

- Users create a new task: pick a category (Hustle/Humble), title, level (1-5),
  duration (hours), date.
- Tasks appear in a daily list, grouped per category.
- Users mark a task as complete to earn its score.
- Users can edit/delete tasks that are not yet finished.
- Completed tasks are read-only (they cannot be edited, to prevent score
  manipulation after the fact).

### 6.1 Task Lifecycle

A task has 3 statuses: `pending` -> `completed` or `missed`.

- `pending`: the default on creation, while still inside the current day's
  window.
- `completed`: the user marks it done before the day ends; it earns a score.
- `missed`: assigned automatically when the day ends while the task is still
  `pending`. It earns no score but is recorded for the leaderboard completion
  rate (see Section 8.1).

**Architecture implication**: the `pending` -> `missed` transition needs a
scheduled job (Cloud Scheduler + Cloud Function) running at end of day. The
cutover is per-user timezone via an hourly scheduled job — see the final
decision in `ARCHITECTURE.md` Section 4.2.

## 7. Report

### 7.1 Daily Report

- Lists all tasks created that day, grouped Hustle/Humble.
- Each task's status: completed / not completed.
- Daily score totals per category.
- No deep analysis or advice at the daily level — just a factual summary.

### 7.2 Weekly Report

- Recap of all tasks in the last 7 days.
- **Balance Score**: a 0-100 metric representing the hustle/humble balance. The
  confirmed ideal target ratio is **50:50**.

```
humble_percentage = humble_score / (hustle_score + humble_score) x 100
balance_index = 100 - abs(50 - humble_percentage) x 2
```

The balance index is 100 when the hustle:humble ratio is exactly 50:50. The
more it skews to one side (all hustle or all humble), the closer the index
drops toward 0.

`balance_index` is used twice: shown in the weekly report, and as one
weighting component of the leaderboard score (Section 8.1).

- **Improvement suggestions**: a rule-based + AI-enhanced combination.
  - Rule-based (default): threshold logic, e.g. if `humble_percentage < 20%`,
    show a standard suggestion about burnout risk and adding recovery tasks.
    Static, fast, no external dependency.
  - AI enhancement (optional): if enabled, send that week's summary data to an
    LLM API for more personalized, contextual suggestions. Falls back to
    rule-based if the API call fails or times out.

## 8. Leaderboard

### 8.1 Weekly Cycle

- At the start of each week, the system finds 14 other users by location
  (city-level) to form a competition group.
- Location is resolved automatically from **IP geolocation** (not manual
  input). Technical consequences:
  - A third-party IP geolocation service is needed to resolve IP to city —
    **decided: ip2location.io** (see `ARCHITECTURE.md` Section 4.4 for free-plan
    limitations).
  - IP geolocation accuracy is imperfect, especially for users on mobile data
    (often resolves to the ISP's city, not the user's actual city) or VPNs.
    Risk: users can land in the wrong group, or deliberately use a VPN to join
    an easier group. Accept this as a known early-phase limitation, with a
    manual city override in profile settings as fallback when users feel their
    detected city is wrong.
  - Resolve timing: resolve and cache the city once at weekly cycle start (not
    on every request) to reduce geolocation API calls.

- The **leaderboard score** is not the raw score, but a weighted score combining
  three components: weekly total score, balance ratio, and completion rate.

```
weekly_raw_score   = total score of completed tasks (hustle + humble) in a week
completion_rate    = completed_tasks / (completed_tasks + missed_tasks)
balance_weight     = 0.5 + (balance_index / 100) x 0.5      -> range 0.5 - 1.0
completion_weight  = 0.5 + completion_rate x 0.5             -> range 0.5 - 1.0

leaderboard_score = weekly_raw_score x balance_weight x completion_weight
```

Rationale: a user with perfect balance (index 100) and 100% completion gets
their full raw score (1.0 multiplier). A user with the worst balance and
completion still keeps 25% of raw score (0.5 x 0.5), not zero — so a bad week
never feels like wasted effort, while consistent users still outcompete them.

**Known trade-off**: this is a multiplicative penalty, not additive. A user
with a high raw score but poor balance and completion gets penalized twice
(down to 25% of raw score). If playtesting shows this feels too punitive, the
alternative is additive weighting (e.g.
`leaderboard_score = raw_score x 0.6 + balance_index x 2 + completion_rate x 100 x 0.4`
— arbitrary numbers, needs tuning). Recommendation: do not hardcode the 0.5
floor and the 0.5/0.5 split above; keep them in Firebase Remote Config so they
can be tuned without redeploying.

### 8.2 Fallback Matching

Tiered matching:

1. Try city-level first (14 closest users in the same city).
2. If fewer than 14, expand to the nearest province/region.
3. If still fewer than 14 after the province expansion, the leaderboard runs
   with whoever is there (no further expansion to national level). This is the
   agreed final fallback — users in very quiet regions still get a leaderboard,
   even if the group is small.

### 8.3 Badge System

- The top 3 users of each leaderboard group earn a badge with a different tier:
  Gold (rank 1), Silver (rank 2), Bronze (rank 3).
- Badges are stored as permanent collectibles on the user profile, tied to a
  specific week and competition group (not one generic "once a winner" badge).
- Badge assets: **decided** in `DESIGN.md` Section 7 — tiers differ by icon +
  label (trophy/medal/award), not traditional metallic colors (the brand palette
  has no gold/silver/bronze). No extra variations for winning streaks in the
  initial phase.

## 9. Profile

- User identity: name, email, avatar, city (for leaderboard matching).
- Edit profile.
- Showcase of collected badges (grid/list view).
- Settings: notification preferences, AI-enhanced report on/off toggle.
- Logout.

## 10. Authentication

- Email/password (Firebase Auth).
- OAuth: Google, GitHub, X.
  - Technical note: Firebase Auth's native X provider is registered as the
    `twitter.com` provider ID (legacy Twitter naming, not yet renamed to X in
    the Firebase SDK as of last check). Re-verify against the latest Firebase
    SDK version during implementation, as this may change.

## 11. Non-Functional Requirements

- **Performance**: leaderboard matching computation (city/province fallback) can
  be expensive if run synchronously on request. Prefer a scheduled Cloud
  Function at the start of the week over on-demand computation when the user
  opens the leaderboard page.
- **Security**: Firestore security rules must ensure users can only write their
  own tasks/reports. Scores and badges must never be writable directly from the
  client (they must go through Cloud Function/server-side logic to prevent
  score manipulation).
- **Scalability**: per-group weekly leaderboard data structures must be
  partitioned well so queries never scan the whole users collection.
- **Data privacy**: city-level location is granular enough for matching but
  must not expose more precise location data between users (no exact address or
  GPS coordinates shown to other users).

## 12. Tech Stack

- Framework: Next.js (App Router)
- Database & Auth: Firebase Firestore + Firebase Auth
- UI: Neo Brutalism template (neobrutalism.dev, based on shadcn/ui)
- Icons: Lucide
- Color palette: `#FF0052`, `#FFD400`, `#00C68D`, `#0055DA`

## 13. Out of Scope (Initial Phase)

- Recurring task templates.
- Push notifications/reminders.
- Social features beyond the leaderboard (comments, follows, chat).
- Monetization/subscriptions.

## 14. Open Questions — Resolution Log

Every item below was **already decided** in `ARCHITECTURE.md` Section 8. This
list is kept as the history of the original questions, not as current status.
Check `ARCHITECTURE.md` for the final decisions; do not use this list as a
status reference.

1. ~~Leaderboard weighting formula constants~~ — decided: Firebase Remote
   Config, not hardcoded.
2. ~~Timezone handling for the task lifecycle cutover~~ — decided: per-user
   timezone, hourly scheduled job.
3. ~~IP geolocation service provider~~ — decided: ip2location.io (free plan).
4. ~~Manual city override in profile settings~~ — decided: in scope for MVP.

One item raised during review is now **resolved**: the per-task-type cap in
Section 5.2 was replaced with a flat per-task cap (16h, same for all
categories) because the task schema has no field to structurally distinguish
task types.
