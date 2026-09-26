# Roadmap

Milestones are ordered by technical dependency (foundations first, then the
features that depend on them) — not by time estimates. Team velocity is still
unknown, so each milestone carries a **relative size** label (S/M/L) to help
prioritization, not a date commitment.

## M0 — Project Setup & Infrastructure (S)

**Goal**: technical foundations ready before any feature code is written.

- Init the Next.js App Router project, Tailwind, and install neobrutalism.dev
  components via the shadcn CLI.
- Set up **separate Firebase projects for dev and production** (best practice —
  never develop directly in the same project as production data).
- Enable Firebase Auth providers: email/password, Google, GitHub, X
  (`twitter.com` provider ID — re-verify per the note in `ARCHITECTURE.md`
  Section 5).
- Set up the Cloud Functions project (TypeScript) + Firebase Emulator Suite for
  local development.
- Create the folder structure per `ARCHITECTURE.md` Section 11 (`src/app`,
  `/functions`, `/shared`).
- Apply the design tokens from `DESIGN.md` Section 2 to `globals.css`.
- Basic CI/CD: Vercel for the frontend, Firebase CLI deploys for functions.

**Exit criteria**: a "Hello world" page deployed to Vercel, a dummy Cloud
Function callable from the emulator, and a login page rendering with basic neo
brutalism styling.

## M1 — Authentication & Onboarding (M)

**Goal**: users can register, log in, and get an initial profile set up.

- Login/register pages (email + 3 OAuth providers).
- Session cookie verification in Server Components for the auth guard
  (`ARCHITECTURE.md` Section 5).
- Onboarding flow: create the `users/{uid}` document on first login,
  auto-detect the timezone on the client, send it via `updateProfile`.
- Resolve the initial city during onboarding (not waiting for the first weekly
  cycle) through an ip2location.io call from a Cloud Function, so the user
  profile already has a `city` before the first leaderboard cycle runs.
- Implement the `updateProfile` callable function (including the `utcResetHour`
  computation).

**Depends on**: M0.

**Exit criteria**: a new user can register through every provider, the profile
is auto-created with `city` and `timezone` filled, and the profile is editable
from the Profile page.

## M2 — Task Management Core (M)

**Goal**: the core Home page features: create, edit, delete, and complete
tasks.

- Firestore schema `users/{uid}/tasks` per `DATABASE.md`.
- Callable functions: `createTask`, `updateTask`, `deleteTask`, `completeTask`,
  including daily aggregate cap validation (aggregation `sum()` query).
- Security rules: deny all direct writes to `tasks`.
- Home page UI: two Hustle/Humble columns, task cards, create/edit dialog,
  complete checkbox (`DESIGN.md` Section 6.1).
- Realtime listener for the current day's task list.

**Depends on**: M1 (auth is needed to scope tasks to a user).

**Exit criteria**: users can create, edit, delete, and complete tasks; scores
follow the `level x duration` formula; cap-violating input is rejected with a
clear message.

## M3 — Task Lifecycle & Daily Report (S)

**Goal**: unfinished tasks transition to `missed`, and the daily report is
viewable.

- `taskCutoverJob` scheduled function (hourly, filtering on `utcResetHour`).
- Daily report page: query a given day's tasks, show per-task status and total
  score per category.
- UI state for `missed` tasks (`DESIGN.md` Section 6.1).

**Depends on**: M2.

**Exit criteria**: tasks not completed before day end automatically become
`missed` within at most 1 hour after the user's local midnight; the daily
report shows accurate data.

## M4 — Weekly Report (M)

**Goal**: users see a weekly report with the balance index and rule-based
suggestions.

- First half of `weeklyCycleJob`: compute `hustleScore`, `humbleScore`,
  `balanceIndex`, and `completionRate` per user, written to
  `users/{uid}/weeklyReports/{weekId}`.
- Rule-based suggestion generator (threshold-based, per `PRD.md` Section 7.2).
- Set up Remote Config for `dailyDurationCapHours` and the other constants
  relevant at this stage.
- Weekly report UI: balance index gauge, score breakdown, suggestion card
  (`DESIGN.md` Section 6.2).

**Depends on**: M3 (accurate `missed` data is needed for `completionRate`).

**Note**: this is only **part** of `weeklyCycleJob` — leaderboard matching
follows in M6. The same function gets extended, not replaced with a new one.

**Exit criteria**: every Monday, weekly reports auto-generate for all users
with numbers manually verifiable against that week's tasks.

## M5 — AI-Enhanced Suggestion (S)

**Goal**: optional, more personalized suggestions via LLM.

- Service abstraction for the LLM API call, with timeout and rule-based
  fallback (`ARCHITECTURE.md` Section 4.4).
- `regenerateWeeklySuggestion` callable function with a per-user cooldown.
- The `aiReportEnabled` toggle in Profile settings, wired into suggestion
  generation in `weeklyCycleJob`.

**Depends on**: M4.

**Exit criteria**: users with `aiReportEnabled = true` get extra AI suggestions
in the weekly report; when the API fails, the report still renders with the
rule-based suggestion and no user-visible error.

## M6 — Leaderboard & Badges (L)

**Goal**: the full weekly competition feature with badges.

- Extend `weeklyCycleJob`: city → province fallback matching, `leaderboardScore`
  computation (formula in `PRD.md`/`ARCHITECTURE.md`), rank assignment, top-3
  badge assignment.
- Quota monitoring for ip2location.io (alert before the monthly limit) plus
  graceful degradation on quota exhaustion (`ARCHITECTURE.md` Section 4.4
  point 4).
- Denormalize `currentGroupId` onto `users/{uid}` after matching finishes.
- Leaderboard page UI: table, own-row highlight, location fallback indicator,
  top-3 medal icons (`DESIGN.md` Section 6.3).
- Badge showcase on the Profile page (`DESIGN.md` Section 6.4).

**Depends on**: M4 (needs `weeklyReports` as score input).

**This is the riskiest milestone** — tiered matching complexity, weighting
formulas, and external API interaction (quotas, error handling) all converge
here. Budget extra review time for this milestone versus the initial estimate.

**Exit criteria**: groups form automatically every week start, scores and ranks
are accurate per the formula, and top-3 badges are assigned and visible on each
winner's profile.

## M7 — Hardening & Edge Cases (M)

**Goal**: close the known risks from `ARCHITECTURE.md` before calling it
production-ready.

- Design and implement idempotency/resume for `weeklyCycleJob` (the risk noted
  in `ARCHITECTURE.md` Section 12 — not solved at document level, must be
  solved here).
- Firebase App Check on all callable functions.
- Firestore Security Rules test suite (`@firebase/rules-unit-testing`).
- Cloud Functions unit tests for scoring logic, cap validation, and the balance
  formula (the most correctness-critical part).
- Verify the ip2location.io ToS on commercial use before proceeding to M8.

**Depends on**: M6.

**Exit criteria**: a simulated mid-`weeklyCycleJob` failure (e.g. killing the
function halfway) recovers via re-run without duplicated scores/badges; the
test suite is green.

## M8 — Polish & Launch Prep (S)

**Goal**: ready for real users.

- Empty-state and microcopy pass per the tone in `DESIGN.md` Section 8.
- Responsive QA across all pages.
- Review which composite indexes from `DATABASE.md` Section 8 are actually used
  versus defined; deploy any missing ones.
- Set up the production Firebase project (if not yet done), fully separated
  from dev.
- Final review of upgrading ip2location.io to a paid plan if the M7 ToS
  verification requires it.

**Depends on**: M7.

**Exit criteria**: the app is publicly accessible with every in-scope PRD
feature working and no known blockers from the `ARCHITECTURE.md` risk list.

## Outside This Roadmap

Features deliberately excluded from every milestone as explicitly out-of-scope
in `PRD.md` Section 13 (recurring task templates, push notifications, social
features beyond the leaderboard, monetization). If priorities change and one of
these enters scope, revisit `PRD.md` first before adding it to the roadmap —
so requirements and implementation never diverge.
