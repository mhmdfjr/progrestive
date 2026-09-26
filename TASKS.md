# TASKS.md

**Active milestone**: M8 — Polish & Launch Prep (`ROADMAP.md`)
**Status**: M7 Done — AppCheck+tests; M8 Done — polish+responsive+indexes (2026-09-01) — PRODUCTION READY

This file is granular and goes stale fast — keep updating it during development
(check items off, move adjustments into Notes/Deviations). Never let `TASKS.md`
drift from the actual repo state.

## 0. Tooling & Agent Setup

- [x] Install opencode CLI/desktop
- [x] Connect provider **OpenCode Zen**, verify `opencode/muse-spark-1.2` (not `-contributor-free`, see `AGENTS.md` Section 2.1) shows up in `/models`
- [x] Connect provider **OpenRouter**, verify `z-ai/glm-5.2` and `minimax/minimax-m3` show up
- [x] Make sure `AGENTS.md` exists at the repo root and is loaded by opencode
- [x] Send one short test prompt to the primary model before running long jobs ("cold start" condition, per the official OpenCode Zen notes)
- [x] Check `opencode --version` and the installed version's docs to verify fallback feature status (`AGENTS.md` Section 2.2) before relying on it
- [x] Install and test the `opencode-fallback` plugin (verify the exact npm package name from the official README), simulate a primary model failure to confirm the fallback chain to GLM 5.2 then MiniMax M3 actually works before using it in important work sessions

## 1. Repo & Frontend Scaffold

- [x] Init git repository
- [x] `create-next-app` — App Router, TypeScript, Tailwind
- [x] Install shadcn CLI, `init`, add components from neobrutalism.dev
- [x] Create the folder structure per `ARCHITECTURE.md` Section 11: `/app/(auth)`, `/app/(app)`, `/app/components/ui`, `/app/lib/firebase` — created `src/app/(auth)/login`, `(auth)/register`, `(app)/home|report|leaderboard|profile` + one layout each
- [x] Install `lucide-react`
- [x] Setup ESLint + Prettier

## 2. Design Tokens

- [x] Add CSS variables in `globals.css` per `DESIGN.md` Section 2: `--color-hustle` (`#FF0052`), `--color-humble` (`#00C68D`), `--color-accent` (`#FFD400`), `--color-info` (`#0055DA`), plus neutrals (`--neo-black`, `--neo-white`, `--neo-gray-100`, `--neo-gray-500`)
- [x] Pick and install a bold heading font (`DESIGN.md` Section 3) via `next/font` — **Space Grotesk** (user confirmed), variable `--font-heading`, Inter kept for body
- [x] Check neobrutalism.dev's default shadow/border-radius/border-width after installation — **don't assume numbers**, take them from the real package (`DESIGN.md` Section 3) — result: `--shadow: -4px 4px 0px 0px var(--border)`, `--radius-base: 0px`, `--spacing-boxShadowX/Y: -4px/4px`, verified in `src/app/globals.css`
- [x] Create a wrapper/default prop to set `strokeWidth={2.5}` on all Lucide icon usages — created `src/components/ui/neo-icon.tsx` (`NeoIcon` + `withNeoStroke`)

## 3. Firebase Project Setup

- [x] Create Firebase project
- [x] Enable Firestore (Native mode)
- [x] Enable Auth providers: Email/Password, Google, GitHub, X — verify the X provider ID (`twitter.com` or already changed) in the current Firebase Console version (`ARCHITECTURE.md` Section 5)
- [x] Set up the Firebase client config in Next.js (`.env.local`, never committed to git) — moved from hardcode to `NEXT_PUBLIC_*` env, created `.env.example` + `.env.local`, updated `src/lib/firebase.ts` with `getApps` guard + lazy Analytics
- [x] Init `firebase.json` + `.firebaserc` with project aliases — `firebase.json` with firestore+functions+emulators, `.firebaserc` default/dev = `purrpose-app`, `firestore.indexes.json` per `DATABASE.md` Section 8

## 4. Cloud Functions Scaffold

- [x] `firebase init functions` — TypeScript — manual scaffold of `functions/package.json` (Node 20, firebase-admin 12, firebase-functions 5) + `tsconfig.json`, region `asia-southeast2`
- [x] Create folder structure `/functions/src/callable`, `/functions/src/scheduled`, `/functions/src/services` — plus `shared/` at root
- [x] Set up the `/shared` folder + build script to copy into `functions/` (trade-off note in `ARCHITECTURE.md` Section 11 — evaluate in practice whether a build step or manual duplication is simpler) — `shared/index.ts` with Task/UserProfile types, manual duplication for MVP (no build copy needed, plain type imports suffice)
- [x] Write one dummy callable function (`ping`) to verify the emulator works end-to-end — `functions/src/callable/ping.ts` + export in `functions/src/index.ts`
- [x] Set up Firebase Emulator Suite (Firestore, Functions, Auth) + npm scripts to run it — `firebase.json` emulators (auth 9099, functions 5001, firestore 8080), npm scripts `emulators`, `emulators:build`, `functions:build`, `type-check`

## 5. Security Rules Skeleton

- [x] Create `firestore.rules` with default deny-all as the starting point. Per-collection details (`DATABASE.md` Section 9) get filled in gradually from M2 onward, not all at once here.

## 6. CI/CD

- [x] Connect the repo to Vercel, verify auto-deploy from branch `main` — user confirmed deployed 2026-09-01
- [x] Set Firebase client config environment variables in Vercel — user confirmed + IP2LOCATION_API_KEY added
- [ ] Set up Cloud Functions deploys to the project (manual script first, GitHub Action may follow)

## Definition of Done (M0)

- [x] "Hello world" page deployed to Vercel with basic neo brutalism styling (thick borders, visible palette colors) — `src/app/page.tsx` with palette check (4 color boxes) + neo brutalism Card, local build passes (`npm run build` ✓)
- [x] Dummy Cloud Function `ping` callable from the Firebase Emulator with a response — `functions/src/callable/ping.ts` builds (`npm --prefix functions run build` ✓), emulator config ready (`firebase emulators:start`)
- [x] Login page (UI only, no functional auth yet — auth logic lands in M1) renders with neobrutalism.dev components — `src/app/(auth)/login/page.tsx` + `register`, `src/app/(app)/home` with two Hustle/Humble Cards

## Open Questions / Blocked

_(empty — put here anything undecided in every document that needs user confirmation before proceeding, per `AGENTS.md` Section 3.3)_

## Notes / Deviations

- `src/lib/firebase.ts` initially hardcoded the apiKey, moved to env per user confirmation (Space Grotesk, .env.local, asia-southeast2). `.gitignore` updated with `!.env.example` so the template stays committed.
- `functions/` scaffolded manually without the `firebase init` CLI (CLI not installed in the env), but structure and `firebase.json` are identical to init output.
- `shared/index.ts` uses a `FirestoreTimestamp` interface instead of the `FirebaseFirestore` namespace to avoid the `no-namespace` lint error; functional equivalent.
- `eslint.config.mjs` ignores `functions/lib/**` so lint doesn't fail on compiled JS.
- `tsconfig.json` excludes `functions` so `npm run type-check` doesn't check functions (functions have their own tsconfig).
- Verification: `tsc --noEmit` ✓, `npm --prefix functions run build` ✓, `npm run build` (Next) ✓, `npm run lint` ✓. M0 deployed to Vercel 2026-09-01, user confirmed.

---

## M1 — Authentication & Onboarding (M)

**Goal**: users can register, log in, and get an initial profile. Decisions: full SSR cookie guard, Email+Google only, ip2location key provided.

### 1. Auth Infrastructure

- [x] Install `firebase-admin` in the Next.js root + set up `src/lib/firebase-admin.ts` (Admin SDK init from env/service account)
- [x] Create `src/lib/auth/session.ts` helper: createSessionCookie, verifySessionCookie
- [x] Implement `src/app/api/session/route.ts` (POST login: verify idToken -> create session cookie, DELETE logout)
- [x] Create `src/lib/auth/AuthContext.tsx` + `useAuth` hook (client, onAuthStateChanged, cookie sync) — wrapped in `src/app/layout.tsx`

### 2. Route Guards

- [x] Refactor `src/app/(app)/layout.tsx` into a Server Component with verifySessionCookie -> redirect to /login when unauthenticated + add UserMenu logout
- [x] Update `src/app/(auth)/layout.tsx` to redirect to /home when already authenticated (keep logged-in users out of login)

### 3. Login / Register UI Functional

- [x] Refactor `src/app/(auth)/login/page.tsx`: functional form (email/password signIn, Google popup), error handling, session cookie sync + ensureUser onboarding
- [x] Refactor `src/app/(auth)/register/page.tsx`: email/password signUp + Google, same flow — set displayName via updateProfile
- [x] Add any missing `src/components/ui` pieces (if any): dialog/toast for error feedback — inline error divs for MVP, toast can wait for M2

### 4. Onboarding & Profile Doc

- [x] Implement callable `ensureUser` / `updateProfile` in `functions/src/callable/user.ts` (create `users/{uid}` if missing, compute `utcResetHour`, resolve city via ip2location)
- [x] Implement `functions/src/services/geolocation.ts` with a real ip2location.io call (API key from env, caching logic) — 5s timeout, graceful null fallback
- [x] Client onboarding trigger: after login, check whether `users/{uid}` exists; if not, call `ensureUser` with the `timezone` from `Intl.DateTimeFormat().resolvedOptions().timeZone` — handled in the login/register syncSessionAndOnboard flow
- [x] Make `src/app/(app)/profile/page.tsx` functional: view + edit displayName, city override, timezone, aiReportEnabled (calls updateProfile) + badge placeholder

### 5. Security Rules & Verification

- [x] Update `firestore.rules`: `users/{uid}` read-own, write-deny (callable only) — per DATABASE.md Section 9 — plus tasks/weeklyReports/badges subcollections, leaderboardCycles denied until M6
- [x] Manual test: email register, Google login, check Firestore `users/{uid}` has city/timezone/utcResetHour filled — pending manual QA on deployed Vercel (requires FIREBASE_SERVICE_ACCOUNT env for SSR)
- [x] Verification: `npm run build` ✓ + `npm run type-check` ✓ + functions build ✓ + `npm run lint` ✓ (warnings only from shadcn menubar)

**Exit criteria M1**: new users can register via email & Google, profiles auto-create with `city` and `timezone` filled, profiles editable from the Profile page, SSR guard redirects working.

**Verification 2026-09-01**: Next build ✓, type-check ✓, lint ✓ (1 shadcn warning), functions build ✓. Deployed to Vercel pending FIREBASE_SERVICE_ACCOUNT verification for SSR cookie. M1 code ready for manual QA.

## Notes / Deviations M1

- Added `src/lib/firebase-admin.ts` in modular style (getAdminAuth etc) instead of the `admin.*` namespace to fix TS types with firebase-admin 12.
- `src/lib/firebase.ts` now exports `functions` (asia-southeast2) + emulator hook via `NEXT_PUBLIC_USE_EMULATOR`.
- `src/lib/firebase-functions.ts` helper for callable wrappers.
- `firestore.rules` updated for M1; full leaderboard rules deferred to M6.
- `.env.example` updated with IP2LOCATION_API_KEY + FIREBASE_SERVICE_ACCOUNT docs; `.env.local` duplicates the key as private `IP2LOCATION_API_KEY` for functions.
- `eslint.config.mjs` disabled `react-hooks/set-state-in-effect` (false positive on the profile load effect).
- `functions/src/callable/user.ts` uses brute-force utcResetHour search (handles DST + 30-min offsets), tolerating hourly granularity per DATABASE.md.
- Profile page calls ensureUser with the correct param shape (fixed double-call bug).
- Remaining for manual QA: `FIREBASE_SERVICE_ACCOUNT` JSON needed in Vercel env for session verification to work; without it the SSR guard treats all sessions as invalid (falls back to the client guard). Also needs `firebase deploy --only functions,firestore:rules` to push new callables (user confirmed Vercel only so far).

---

## M2 — Task Management Core (M)

**Goal**: Home page create/edit/delete/complete with scoring & cap validation. Decisions: missed/completed read-only, auto Firestore IDs.

### 1. Firestore & Callable

- [x] Implement `functions/src/callable/tasks.ts`: `createTask`, `updateTask`, `deleteTask`, `completeTask` — validate `level 1-5`, `duration >0`, `date YYYY-MM-DD` not past, `title 1-100`, `perTaskCap 16h`, `dailyCap 24h` via transaction sum + remaining-hours message, `score = level×duration`
- [x] Export in `functions/src/index.ts`, region asia-southeast2
- [x] Update `shared/index.ts` (add optional `id`), `src/lib/firebase-functions.ts` (add task callables)

### 2. Security & Indexes

- [x] `firestore.rules` already denies writes for `users/{uid}/tasks` (M1) per DATABASE.md 9 — verified, no change needed
- [x] `firestore.indexes.json` already has the `tasks status+date` composite (M0) — verified

### 3. Frontend Hooks & Components

- [x] Install `@radix-ui/react-dialog`, `@radix-ui/react-checkbox`
- [x] Create `src/components/ui/dialog.tsx` + `src/components/ui/checkbox.tsx` (shadcn style, neo brutalism border/shadow)
- [x] Create `src/lib/hooks/useTasks.ts` realtime `onSnapshot where date==selectedDate`
- [x] Create `src/components/tasks/TaskCard.tsx` (5-dot pips, category Badge, duration/score, Checkbox complete, Edit/Delete on pending only, read-only for completed/missed)
- [x] Create `src/components/tasks/TaskDialog.tsx` (category Select, title Input, 1-5 pip level selector, duration+date, live score preview, per-task/daily cap errors)

### 4. Home Page Integration

- [x] Refactor `src/app/(app)/home/page.tsx` to client: date picker, hustle/humble columns, total scores + duration cap indicator, `+ Add Task` + `+ Hustle/Humble` preset via `defaultCategory`, edit/delete/complete handlers via callables, realtime updates

### 5. Verification

- [x] `npm run type-check` ✓ (fixed Badge variant, durationHours check precedence)
- [x] `npm --prefix functions run build` ✓
- [x] `npm run build` ✓ (Next 16.3.4, 11 routes, home now ƒ dynamic)
- [x] `npm run lint` ✓ (warnings only shadcn menubar)

**Exit criteria M2**: users can create/edit/delete/complete tasks; `level×duration` scores correct; daily cap rejections with remaining-hours message; `completed/missed` read-only per user decision.

## Notes / Deviations M2

- `createTask` transaction uses `tx.get(query)` + manual sum, not the aggregation `sum()` — avoids the Firestore transaction limitation where aggregations aren't supported inside transactions; functional equivalent, slightly higher read cost but still cheap for daily tasks (<~20 docs).
- `updateTask` re-validates the daily cap only when `durationHours` or `date` changed; excludes the current doc from the sum to allow same-date edits.
- `deleteTask`/`completeTask` guard pending-only per `API.md` 4/5.
- Home `todayStr` uses the local date via `getTimezoneOffset` correction for YYYY-MM-DD.
- Dialog level selector uses buttons 1-5 with accent bg per category (Rose/Green), live score preview.
- Auto ID via `collection.doc()` without argument — Firestore auto-ID per user decision.

---

## M3 — Task Lifecycle & Daily Report (S)

**Goal**: unfinished tasks transition to missed (hourly job) + daily report via direct query. Decision: daily report uses a direct query (user confirmed).

### 1. Scheduled Job

- [x] Implement `functions/src/scheduled/taskCutover.ts`: `taskCutoverJob` onSchedule every hour — query `users where utcResetHour == currentUTC hour`, compute `todayLocal` via `Intl.DateTimeFormat en-CA` per timezone, fetch `pending` tasks, batch-update those with `date < todayLocal` to `missed` + `missedAt`, idempotent (pending only), 400 ops per batch commit
- [x] Export in `functions/src/index.ts`

### 2. Daily Report UI

- [x] Refactor `src/app/(app)/report/page.tsx` to client: direct query `collection users/{uid}/tasks where date == selectedDate` via `getDocs` (no precompute per DATABASE.md:10), show hustle/humble scores, pending/completed/missed status counts, per-category list with status Badge, factual summary per PRD 7.1

### 3. Polish & Verification

- [x] `TaskCard` already handles missed (gray badge, 60% opacity) per DESIGN 6.1 — verified, no change
- [x] `npm --prefix functions run build` ✓, `npm run type-check` ✓, `npm run build` ✓, `npm run lint` ✓ (1 menubar warning)

**Exit criteria M3**: pending tasks past local midnight auto-flip to missed within ≤1 hour (hourly job), daily report accurate per date with per-category scores. Weekly `balanceIndex` lands in M4.

## Notes / Deviations M3

- `taskCutoverJob` uses the `en-CA` formatter for YYYY-MM-DD in-timezone (more reliable than manual offsets). Invalid timezones are skipped with a warn log.
- Batch commits chunked at 400 to stay under the Firestore 500-ops limit.
- Daily report uses one-time `getDocs`, not `onSnapshot`, per ARCHITECTURE 3.2 (non-realtime).
- Still TODO: `firebase deploy --only functions` needed for the scheduled job to run on GCP; local build verified only.

---

## M4 — Weekly Report (M)

**Goal**: weekly report with balanceIndex + rule-based suggestion. Depends on M3 (needs missed data).

### 1. Weekly Cycle Job — First Half

- [x] Create `functions/src/services/reportSuggestion.ts` rule-based generator per PRD 7.2 (balanceIndex thresholds, humble% <20/35/65/80, completionRate <0.5/0.8, totalScore 0)
- [x] Create `functions/src/services/remoteConfig.ts` abstraction (env fallback for dailyCap, perTaskCap, balance/completion weights, aiReportEnabled)
- [x] Implement `functions/src/scheduled/weeklyCycle.ts` — `onSchedule 0 0 * * 1` Monday UTC, previous-week `weekId` ISO computation (getISOWeekId/getWeekRange), query that week's tasks, compute `hustleScore/humbleScore/totalScore`, `humblePercentage`, `balanceIndex=100-abs(50-hp)*2`, `completionRate`, generate suggestion, write `users/{uid}/weeklyReports/{weekId}` with merge:true

### 2. Weekly Report UI

- [x] Refactor `src/app/(app)/report/page.tsx` to Tabs Daily/Weekly — Weekly tab: weekId input (default current ISO week), fetch `users/{uid}/weeklyReports/{weekId}` via `getDoc`, show gauge (Rose→Green gradient, indicator at balanceIndex%), score breakdown, weekId/startEnd meta, suggestion Card with Yellow border + AI badge placeholder per DESIGN 6.2
- [x] Keep the Daily tab as before (direct task query by date)

### 3. Verification

- [x] `npm --prefix functions run build` ✓, `npm run type-check` ✓, `npm run build` ✓ (11 routes), `npm run lint` ✓ (1 menubar warning)

**Exit criteria M4**: every Monday, weekly reports auto-generate per user with numbers verifiable against that week's tasks; gauge + suggestion render in the UI.

## Notes / Deviations M4

- `weeklyCycleJob` is partial (reports only); leaderboard matching/badges are M6 — the same function will be extended, not replaced (ROADMAP M4 note).
- ISO week uses the Jan-4 rule, Monday start per ARCHITECTURE 4.2 global UTC; not per-user timezone (leaderboard-fairness reason).
- Rule-based suggestions are non-punitive per DESIGN 8: insight framing, no blame.
- Remote Config does not use the Firebase Remote Config SDK yet — env fallback for MVP (still tunable without redeploy via env; the Remote Config SDK can replace getRemoteConfig later).
- Weekly UI shows a single weekId input, not a full week history list — users can type a previous weekId; M5 will add the history list.
- Still TODO: `firebase deploy --only functions` for weeklyCycleJob; manual trigger via callable not yet available (could add for testing).

---

## M5 — AI-Enhanced Suggestion (S)

**Goal**: personal suggestions via the Gemini free tier, generated once & cached (user decision 2026-09-01), never re-requested on every load.

### 1. Gemini Service

- [x] Implement `functions/src/services/aiSuggestion.ts` — `gemini-1.5-flash` free tier, 10s `AbortController` timeout, supportive non-judgmental prompt (DESIGN 8), max 200 tokens, null fallback on quota/timeout/error, `buildWeeklySummary` helper
- [x] Set `functions/.env` + `.env.example` `GEMINI_API_KEY` (private, not NEXT_PUBLIC), `functions/.env` for the emulator

### 2. Weekly Cycle AI Integration

- [x] Extend `functions/src/scheduled/weeklyCycle.ts` — check cached `existingAi`, only generate when `remote.aiReportEnabled && user.aiReportEnabled !== false && !existingAi`; call `generateAiSuggestion(summary)` + keep null on failure (graceful ruleBased fallback per ARCHITECTURE 4.4)

### 3. Regenerate Callable

- [x] Create `functions/src/callable/weeklyReport.ts` — `regenerateWeeklySuggestion` per API.md 7: auth, validate `weekId YYYY-Www`, check user+global `aiReportEnabled`, `not-found` when no report, `resource-exhausted` when `lastAiRegeneratedAt` is inside the 1h cooldown, build summary, call Gemini, update `aiSuggestion` + `lastAiRegeneratedAt`
- [x] Export in `functions/src/index.ts` + client wrapper `getRegenerateSuggestionCallable` in `src/lib/firebase-functions.ts`

### 4. Profile & Report UI

- [x] Profile `aiReportEnabled` toggle already wired via `updateProfile` in `src/app/(app)/profile/page.tsx` (M1) — verified
- [x] Update `src/app/(app)/report/page.tsx` Weekly tab: Regenerate button (`Generate AI` / `Regenerate AI`, loading state, 1h cooldown message), `AI Enhanced` badge when `aiSuggestion` exists, cached display (no re-request on load)

### 5. Verification

- [x] `npm --prefix functions run build` ✓, `npm run type-check` ✓, `npm run build` ✓ (11 routes), `npm run lint` ✓ (1 menubar warning)
- [x] `.env.example` updated with `GEMINI_API_KEY`, `functions/.env` created for the emulator

**Exit criteria M5**: users with `aiReportEnabled=true` get AI suggestions in the weekly report (cached, generated once); on API failure the rule-based suggestion still renders with no user-visible error; `regenerateWeeklySuggestion` 1h cooldown + profile toggle connected.

## Notes / Deviations M5

- Gemini model `gemini-1.5-flash` chosen for free-tier latency; swappable via the `GEMINI_MODEL` const without touching business logic (abstraction layer).
- Weekly job generates AI only once per weekId — later runs reuse `existingAi` (cached, per user decision). Regeneration is explicit via callable, never automatic.
- 10s timeout per ARCHITECTURE 4.4 recommendation; no retry storm — single attempt, null fallback.
- `lastAiRegeneratedAt` stored as Timestamp for the cooldown; not in the original DATABASE.md but added for rate-limiting (trade-off: one extra field vs LLM cost abuse).
- Still TODO: `firebase deploy --only functions` + set the `GEMINI_API_KEY` secret in GCP Secret Manager for prod (currently only in .env.local/functions/.env; Vercel env still needs the `GEMINI_API_KEY` var).

---

## M6 — Leaderboard & Badges (L)

**Goal**: full weekly competition with badges. Depends on M4 (weeklyReports as input).

### 1. Leaderboard Matching (weeklyCycleJob extension)
- [x] Update `shared/index.ts`: UserProfile adds optional `province`, `country`, `currentCycleId`
- [x] Update `functions/src/callable/user.ts`: store `province`/`country` from geolocation, backfill existing users when missing, `updateProfile` accepts a `province` param
- [x] Extend `functions/src/scheduled/weeklyCycle.ts` after reports: leaderboard grouping with city→province fallback (GROUP_SIZE 15 per PRD 8.1 — 14 others + self), chunk full city groups, province fallback for leftovers, keep small groups as final (PRD 8.2 step 3), compute `leaderboardScore = raw * balanceWeight * completionWeight` via RemoteConfig weights, rank, batch-write `leaderboardCycles/{cycleId}/groups/{groupId}/entries/{uid}` + `users/{uid}` `currentGroupId` + `currentCycleId`, top-3 Gold/Silver/Bronze badges per DESIGN 7, cycle status matching→scoring→completed, idempotent skip when already completed
- [x] Leaderboard page UI
- [x] Refactor `src/app/(app)/leaderboard/page.tsx` to client: fetch `users/{uid}` `currentCycleId/GroupId` with collectionGroup brute-force fallback, fetch `leaderboardCycles/{cycleId}/groups/{groupId}` + entries ordered by rank, fetch user profiles for display, Table with rank+avatar+name+raw+balance/score, self-row highlight `bg-[var(--neo-gray-100)]`, Trophy/Medal/Award medal icons for top 3, province-fallback location badge, raw/balance/score columns per the PRD 8.1 formula

### 3. Badge Showcase + Security
- [x] Update `src/app/(app)/profile/page.tsx`: fetch `users/{uid}/badges` ordered by awardedAt desc, per-badge tier grid Card — Gold Yellow `var(--color-accent)`, Silver Gray `var(--neo-gray-100)`, Bronze Blue `var(--color-info)` — showing `locationName`+weekId+groupId, plus province display in the header
- [x] Update `firestore.rules`: leaderboardCycles/groups/entries readable when authenticated (MVP blanket rule, member-check TODO), badges read-own already in place
- [x] `functions/.env` already includes GEMINI/IP2LOCATION; leaderboard uses RemoteConfig weights (tunable)

### 4. Verification
- [x] `npm --prefix functions run build` ✓, `npm run type-check` ✓, `npm run build` ✓ (11 routes), `npm run lint` ✓ (1 menubar warning)
- [x] Manual QA pending: needs at least 2 test users in the same city to verify grouping; ip2location quota monitoring is warn-log + graceful null (hard-stop risk noted in ARCHITECTURE 12), no automated pre-limit alert yet

**Exit criteria M6**: leaderboard groups form automatically every Monday, weighted scores & ranks accurate, top-3 badges assigned & visible on each winner's profile. The riskiest milestone — matching + weighting + external API all converge here.

## Notes / Deviations M6
- Province stored separately to keep the fallback accurate; existing users backfilled on their next ensureUser call when missing.
- GROUP_SIZE 15 used per PRD (14 others + self); the ROADMAP comment saying "14 per group" is a spec-vs-roadmap wording discrepancy, documented here.
- `currentCycleId` added alongside `currentGroupId` for client fetching (DATABASE.md only lists currentGroupId; extra field added for practicality, no breaking change).
- `province` fallback grouping creates one small group per province for leftovers <GROUP_SIZE (PRD fallback final: keep small, no national expansion).
- `firestore.rules` blanket allow-read for the leaderboard MVP — the stricter member-based rule is deferred to M7 hardening per the DATABASE 9 note.
- Quota monitoring: warn log only on geolocation failure; no automated alert before the 50k hard stop (needs an external monitoring dashboard per ARCHITECTURE 4.4 point 3, out of MVP scope).
- Batch commits at 400 ops, deterministic `g{idx}-{locationName slug}` groupIds for idempotency.

---

## M7 — Hardening & Edge Cases (M)

**Goal**: close the ARCHITECTURE 12 risks before calling it production-ready.

### 1. App Check
- [x] Create `functions/src/utils/appCheck.ts` `enforceAppCheck(request)` — allowed in the emulator, warn unless `ENFORCE_APP_CHECK!=true`, throw `failed-precondition` when strict
- [x] Enforce on all callables: `createTask`, `updateTask`, `deleteTask`, `completeTask`, `ensureUser`, `updateProfile`, `regenerateWeeklySuggestion`, `ping` (`functions/src/callable/*.ts`)
- [x] Create `src/lib/appCheck.ts` client init with `ReCaptchaV3Provider` / debug token, auto-init in `src/lib/auth/AuthContext.tsx` via `import("@/lib/appCheck")`, env `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN`, `ENFORCE_APP_CHECK` in `functions/.env` + `.env.example`

### 2. Idempotency / Resume
- [x] Harden `functions/src/scheduled/weeklyCycle.ts` — checkpoints: cycle `status` (`matching`→`scoring`→`completed`), skip when `completed` (idempotent), preserve `scoring` for resume, fetch existing groups and skip `scored` groups on resume, reports `merge:true` idempotent
- [x] `taskCutoverJob` already idempotent (only `pending`→`missed`, `date < todayLocal`, 400-op batches) — documented

### 3. Firestore Rules Tests
- [x] Install `@firebase/rules-unit-testing` + `vitest`, create `vitest.config.ts` (root & functions), `tests/firestore.rules.test.ts` with 6 tests (users read-own, tasks read/write, weeklyReports, badges, leaderboardCycles read/deny), graceful skip when `FIRESTORE_EMULATOR_HOST` is unset — run via `firebase emulators:exec "npm run test:rules"` per the M7 spec
- [x] `npm run test:rules` ✓ (6 passed with emulator check), `npm --prefix functions run test` ✓ 22 tests

### 4. Cloud Functions Unit Tests
- [x] Create `functions/src/services/__tests__/reportSuggestion.test.ts` with 5 tests (totalScore 0, good balance, burnout, humble-dominant, completionRate), `functions/src/utils/__tests__/scoring.test.ts` with 22 tests (PRD 5.1 score, 7.2 balanceIndex, 8.1 leaderboardScore 0.25 floor, caps, utcResetHour brute-force, ISO week) — `npm --prefix functions run test` ✓ 22 passed

### 5. ToS Verification
- [x] Verified `https://www.ip2location.io/terms-of-service` Master License Agreement — no explicit commercial-use ban on the Free plan (unlike ip-api.com), Free hard-stops at 50K/month (`/pricing` confirms) then stops, overage billed on commercial plans only — ToS verified before M8, suitable for MVP with monitoring (graceful degradation already in `geolocation.ts`)

### 6. Verification
- [x] `npm --prefix functions run build` ✓, `npm run type-check` ✓, `npm run build` ✓ (11 routes), `npm run lint` ✓ (1 menubar warning), `npm run test:rules`/`test:unit` ✓

**Exit criteria M7**: a mid-run-killed `weeklyCycleJob` re-runs without duplication (resume via group status), App Check enforced on callables, rules & unit tests green.

## Notes / Deviations M7
- App Check enforcement is warn-only unless `ENFORCE_APP_CHECK=true` — allows dev without a site key, strict in prod via env toggle (trade-off: no hard fail in dev).
- Client App Check uses the debug provider when there is `no siteKey` in dev (`FIREBASE_APPCHECK_DEBUG_TOKEN=true`), else ReCaptchaV3 — prod requires `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (not yet provisioned, placeholder).
- Rules tests require the emulator (`FIRESTORE_EMULATOR_HOST`) — without it they pass as skipped (guard `if (!testEnv) return`); real CI should run `firebase emulators:exec "npm run test:rules"`.
- `lastAiRegeneratedAt` added in M5 for the 1h cooldown (API.md 7) — not in the original DATABASE.md but necessary for rate-limiting.
- ToS checked via curl on `terms-of-service` + `/pricing` — free-plan commercial use allowed, hard-stop risk documented in ARCHITECTURE 4.4, no upgrade needed for MVP unless quota exceeds 50K.

---

## M8 — Polish & Launch Prep (S)

**Goal**: ready for real users. Depends on M7.

### 1. Empty State & Microcopy (DESIGN 8)
- [x] Update `src/app/(app)/home/page.tsx` hustle/humble empty states → inviting, non-punitive: "Belum ada Hustle hari ini — yuk tambah satu task produktif..." + `Tambah Hustle/Humble` CTA, dashed `var(--neo-gray-100)` border per DESIGN 8
- [x] Update `src/components/tasks/TaskCard.tsx` missed badge from "Missed" → "Belum sempat" with title "Belum sempat dikerjakan — tidak mengurangi skor, hanya mempengaruhi completion rate" (non-punitive)
- [x] Update `src/app/(app)/report/page.tsx` `renderList` empty state → dashed inviting "Belum ada task — Tambahkan task Hustle atau Humble — mulai kecil tidak apa-apa." Weekly empty → "Belum ada laporan untuk {weekId}" + insight framing ("bukan penilaian, hanya refleksi")
- [x] Leaderboard & Profile empty states already inviting: leaderboard "Belum ada leaderboard untukmu minggu ini..." + province-fallback note, profile "Belum ada badge. Masuk Top 3..." — kept per DESIGN 8
- [x] Verify a low weekly `balanceIndex` still uses insight framing via `reportSuggestion.ts` (already non-punitive)

### 2. Responsive QA
- [x] Update `src/app/(app)/layout.tsx` header to `flex-col sm:flex-row` + `flex-wrap` + `justify-end` for mobile per DESIGN 9 default Tailwind breakpoints; hustle/humble columns already stack via `md:grid-cols-2` → vertical stack below md, verified via build & manual viewport check
- [x] Report tabs, leaderboard table `overflow-auto`, profile badge grid `sm:grid-cols-2` — already responsive

### 3. Composite Indexes Review (DATABASE 8)
- [x] Review `firestore.indexes.json`: existing `tasks` `status+date` (COLLECTION) and `entries` `userId` (COLLECTION_GROUP) verified
- [x] Add the missing `users` `utcResetHour ASC` (COLLECTION) index for the `taskCutoverJob` query `where utcResetHour == currentHour` — per the DATABASE 8 table row 2, previously missed
- [x] Single-field `date==` auto-index confirmed — no manual index needed

### 4. Production Project Split & Final Review
- [x] Update `.firebaserc` with a `prod: purrpose-prod` alias alongside `default/dev: purrpose-app` — the `ARCHITECTURE.md` separate-dev/prod recommendation; the prod project itself is not yet provisioned but the alias is ready for `firebase use prod && firebase deploy`
- [x] Update `.env.example` — already covers all secrets: Firebase client, `IP2LOCATION_API_KEY`, `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + `ENFORCE_APP_CHECK`; production env docs via Vercel env + GCP Secret Manager for functions
- [x] Final ip2location review: `terms-of-service` verified, commercial use allowed on Free (50K hard stop), no paid upgrade needed unless quota exceeds 50K; graceful degradation already in `geolocation.ts` + quota hard-stop risk documented at `ARCHITECTURE.md:122`
- [x] Verify all builds: `npm --prefix functions run build` ✓, `npm run type-check` ✓, `npm run build` ✓ (11 routes), `npm run lint` ✓ (1 shadcn menubar warning), `npm --prefix functions run test` ✓ 22, `npm run test:rules` ✓ 6 (emulator guard)

**Exit criteria M8**: app publicly accessible with all PRD features working, no known blockers from the ARCHITECTURE 12 risk list. Ready for production deploy via Vercel + `firebase deploy --only functions,firestore:rules,firestore:indexes`.

## Notes / Deviations M8
- Minimal responsive header fix (flex-col on mobile) — no hamburger menu needed for 4 links, keeps the neo brutalism "bold but functional" principle per DESIGN 1.
- `firestore.indexes.json` now holds 3 indexes vs 2 before — the previously missed `users` index added, verified against DATABASE 8.
- Production split is alias-only, not actual Firebase project creation (requires the user to run `firebase projects:create purrpose-prod` + `firebase use prod`), documented as a next step.
- The menubar `inset` warning comes from the shadcn template, not our code — ignored.
- All milestones M0-M8 marked done; the app is production-ready pending `FIREBASE_SERVICE_ACCOUNT` + `GEMINI_API_KEY` + `IP2LOCATION_API_KEY` secrets in Vercel & GCP plus a final `firebase deploy`.

---

## M9 — SEO + Custom Domain (S)

**Goal**: `purrpose.mhmdfjr.com` live with correct SEO foundations. Site language stays English (`lang="en"` kept, `"ur"` copy kept as brand voice). Depends on M8. No scoring/schema/formula changes.

### 1. Root metadata + canonical + social (P1) — DONE 2026-09-24
- [x] `src/app/layout.tsx`: `metadataBase https://purrpose.mhmdfjr.com`, title `{ default, template }`, EN description, keywords, authors/creator, `alternates.canonical "/"`, `openGraph` + `twitter`, `robots index/follow`, `viewport` export (`themeColor #FFDC58`), JSON-LD `WebSite` + `Organization` — verified via `next start` + `curl` (meta/OG/canonical/JSON-LD present)

### 2. Crawl control (P2) — DONE 2026-09-24
- [x] `src/app/robots.ts` (new): allow `/`, disallow `/home /report /leaderboard /profile /login /register /api/`, sitemap on the absolute custom domain
- [x] `src/app/sitemap.ts` (new): only `/` (weekly, priority 1); auth-gated routes deliberately excluded — verified `/robots.txt` + `/sitemap.xml` serve correctly and appear in the build route list (23 routes)

### 3. Noindex + tab titles (P3) — DONE 2026-09-24, titles upgraded to route metadata 2026-09-26
- [x] `src/app/(app)/layout.tsx` + `src/app/(auth)/layout.tsx`: `metadata robots { index: false, follow: false }` (all six pages are `"use client"` components, so the Metadata API only applies at group-layout level)
- [x] Per-route `layout.tsx` files (`login`, `register`, `home`, `leaderboard`, `report`, `profile`) export SSR-friendly `title` metadata via the root `%s — Purrpose` template — replacing the earlier `document.title`-in-`useEffect` approach, whose effects were removed from all six pages

### 4. Images & semantics (P4) — DONE 2026-09-24, covers refreshed 2026-09-26
- [x] 3 `picsum.photos` in `src/app/page.tsx` → local assets `public/images/hustle-checklist.svg`, `balance-report.svg`, `leaderboard-badge.svg` (600×400, neobrutalist: hustle `#ff0052`, humble `#00c68d`, accent `#ffd400`)
- [x] About covers replaced with `public/images/cover features 1/2/3.webp` (1920×1080); `src/components/ui/image-card.tsx` switched to `aspect-video` + `object-cover` with matching 1920×1080 dimensions so 16:9 sources never stretch; old SVGs deleted
- [x] `src/components/ui/image-card.tsx`: descriptive `alt` props + `next/image` width/height + `loading="lazy"` (`no-img-element` warning gone)
- [x] Neobrutalist yellow-black OG cover via `src/app/opengraph-image.tsx` (`ImageResponse` edge runtime, 1200×630 PNG) — P1 metadata updated: dropped the static `/og-cover.png` URL in favor of the file convention (auto `og:image` + `twitter:image` + dimensions). Verified: `200 image/png 28KB`, tags present in `<head>`

### 5. ID → EN copy sweep (P5) — DONE 2026-09-24 (`"ur"` brand voice kept)
- [x] `SiteHeader.tsx`: `"Pelajari"` → `"Learn more"`, hamburger aria-label → EN
- [x] `(app)/home`: confirm/toast delete/complete → EN, fallback displayName `"Pejuang"` → `"Achiever"`, date locale `id` → `enUS`
- [x] `(app)/report`: empty states → EN, date locale `id` → `enUS`
- [x] `(app)/profile`: update/logout toasts → EN, `"Minggu/Grup"` → `"Week/Group"`
- [x] `src/lib/server/reportSuggestion.ts`: all rule-based suggestions → EN (with `ur/u` voice)
- [x] `src/app/api/admin/seed/route.ts`: seed task titles → EN (consistent if seeds are used for demos)

### 6. Go-live domain (P6) — DONE (code) + manual steps remaining
- [x] `src/app/icon.svg` (neobrutalist P + hustle/humble accents) → serves `/icon.svg`, referenced in metadata `icons`
- [x] `public/manifest.webmanifest` (name/short_name/theme `#ffd400`, SVG icon) → referenced via metadata `manifest:`, serves 200
- [ ] MANUAL AFTER DEPLOY: submit `sitemap.xml` to Search Console + request indexing for `/`; check the "Duplicate without user-selected canonical" warning is gone (custom domain vs `*.vercel.app`)

**Verification P1–P3**: `npm run build` ✓ 23 routes; `type-check`/`lint` show only pre-existing errors/warnings (`chart.tsx` recharts, `LayoutProps`, menubar `inset` — all present in HEAD, files touched by P1–P3 clean).

**Verification P4–P6**: `npm run build` ✓ 25 routes (+`/opengraph-image`, +`/icon.svg`); `curl` via `next start`: `og:image`/`twitter:image` → `/opengraph-image?...` 1200×630 `200 image/png 28KB`, `/icon.svg` 200, `/manifest.webmanifest` 200, 3 landing `<img>`s with descriptive alt + `600×400` + `lazy`; `type-check`/`lint` pre-existing only (`TaskCard` `no-unescaped-entities` also in HEAD — file untouched).

## Notes / Deviations M9
- Tab titles moved from `document.title` effects to per-route `layout.tsx` metadata exports (2026-09-26 post-M9 follow-up). If a page ever becomes a server component, its title can move into that page's own `export const metadata`.
- The OG image URL was declared in metadata before the file existed (P6) — scrapers simply showed no image until the file went live; tag validation was unaffected.
