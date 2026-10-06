# Design System & UI/UX Guideline

## 1. Design Philosophy

Neo Brutalism fits this product naturally: high-contrast solid colors, thick
borders, hard shadows with no blur, and no rounded corners pair well with
gamification. The bold, "brave" visuals support the competitive feel
(leaderboards, scores, badges) without going overboard like a casino game skin.
The guiding principle: **visually bold, but still functional** — neo brutalism
here is a visual layer over conventional interaction patterns (clear
navigation, standard information hierarchy), never an excuse for confusing UX.

## 2. Color System

### 2.1 Base Palette (from the brief)

| Hex | Working name |
|---|---|
| `#FF0052` | Rose |
| `#FFD400` | Yellow |
| `#00C68D` | Green |
| `#0055DA` | Blue |

**Important note**: these four are accent/brand colors, not neutrals. Neo
brutalism needs a strong neutral foundation (deep black for borders,
white/off-white for backgrounds) that the given palette lacks. The base
neutrals below were added for that reason — without them, the four vivid
colors above would clash with no room to breathe:

| Token | Hex | Use |
|---|---|---|
| `--neo-black` | `#000000` | borders, primary text, shadows |
| `--neo-white` | `#FFFFFF` | primary background |
| `--neo-gray-100` | `#F2F2F2` | secondary background (card on card) |
| `--neo-gray-500` | `#8A8A8A` | secondary text, disabled states |

### 2.2 Semantic Mapping

| Semantic token | Color | Why |
|---|---|---|
| `--color-push` | Rose `#FF0052` | the "hottest"/most intense color in the palette — fits pressure/productivity |
| `--color-pause` | Green `#00C68D` | the "calmest" color in the palette — fits recovery/relaxation |
| `--color-accent` (main CTA, primary buttons) | Yellow `#FFD400` | most eye-catching — used sparingly so it never visually competes with push/pause |
| `--color-info` (links, neutral states) | Blue `#0055DA` | informational elements outside the push/pause system, e.g. links to other pages |

> Note: `--color-hustle` / `--color-humble` remain defined as aliases of
> `--color-push` / `--color-pause` for backward compatibility. New code uses the
> `push` / `pause` tokens.

This mapping is used consistently on every page: task cards, category tags,
report charts, and progress bars — so users build a long-term visual
association between color and category without reading labels every time.

### 2.3 Contrast and Accessibility

`#FFD400` (yellow) has high luminance — **never use it as text color on a white
background**; it fails WCAG AA contrast. Usage rules:

- Yellow, Rose, Green, Blue are used as **background fills** (buttons, badges,
  thick borders) with black text on top — never as direct text color on white.
- Body text is always `--neo-black` on `--neo-white`/`--neo-gray-100`, never an
  accent color for long passages.

### 2.4 Dark Mode

**Out of scope for the MVP.** Neo brutalism is conventionally more natural on
light backgrounds (hard-shadow contrast reads better). Dark mode would add
significant design effort (re-tuning every shadow/border to stay legible on
dark backgrounds) for value that is not an early priority. This assumption is
reversible and locks in no architecture.

## 3. Typography

Recommendation: a bold sans-serif where available — e.g. **Space Grotesk** or
**Archivo** for headings (the thick geometric character of neo brutalism), and
a standard sans (Inter or the system default) for body text so long passages
like weekly report suggestions stay readable.

**Implementation note**: neobrutalism.dev as a shadcn-based component library
likely ships default font weights and CSS variables (`--font-sans`, shadow
tokens, border widths) once installed via the shadcn CLI. Do not guess exact
values (e.g. their default shadow offset in px) — take them from the installed
package and only override the color tokens per Section 2 above. Writing
specific numbers in this document without verifying against the real package
risks being wrong and misleading during implementation.

## 4. Iconography

Lucide icons, with `strokeWidth` raised from the default (`2`) to **`2.5`**
across the app, so icon weight stays consistent with thick neo-brutalist
borders — thin-stroked icons would look "skinny" next to 2–3px black-bordered
cards.

## 5. Push vs Pause Visual Language

| Element | Push | Pause |
|---|---|---|
| Category tag/border color | Rose | Green |
| Representative icons (examples) | `briefcase`, `book-open`, `laptop` | `bed`, `utensils`, `dumbbell` |
| Scale labels | "Pressure" 1-5 | "Relaxation" 1-5 |

The 1–5 level scale is visualized as **5 pips/dots**, filled to the selected
level in the category color. Used consistently in the task creation form and on
task cards, so users can scan task intensity without reading numbers.

## 6. Page-by-Page Component Mapping

### 6.1 Home (Task List)

| Need | Component |
|---|---|
| Push / Pause columns | two side-by-side `Card` panels (vertical stack on mobile), each bordered in its Section 5 color |
| Task item | small `Card` inside the column: title, level pips, duration, a large neo-brutalist checkbox for mark-complete |
| Add task | `Dialog`/`Sheet` with a `Form`: category select, title input, pip selector for level, duration input, date picker |
| Finished task (read-only) | distinct visual state: lowered opacity or title strikethrough, solid-filled checkbox |
| Missed task (when shown in history) | small gray "Missed" badge — not a push/pause color, so it never reads as a "third category" |

### 6.2 Report

| Need | Component |
|---|---|
| Daily / Weekly tabs | `Tabs` |
| Daily: task list + status | simple `Table` or `Card` list, grouped per category |
| Weekly: balance index | horizontal gauge/progress bar with a two-color gradient (Rose on one end, Green on the other), position indicator showing the 0-100 score |
| Weekly: total score per category | two large side-by-side numbers, each in its category color |
| Improvement suggestions | separate `Card` with an accent (Yellow) border holding the rule-based suggestion text, plus a small "AI Enhanced" badge when the suggestion comes from the LLM (transparency to the user about the advice source) |

### 6.3 Leaderboard

| Need | Component |
|---|---|
| Group score table | `Table`: rank, avatar + name, leaderboard score. The user's own row is highlighted (different background, e.g. `--neo-gray-100` with a thicker border) so it is visible at a glance without scrolling to find it |
| Group location indicator | small text above the table, e.g. "Group: Jakarta" or "Group: Central Java (fallback)" — transparency when the group is a province fallback rather than the true city, so users understand why opponents are from different cities |
| Top 3 highlight | medal icons (Lucide `medal` or `trophy`) on ranks 1–3, not just rank numbers |

### 6.4 Profile

| Need | Component |
|---|---|
| Identity + edit | `Avatar` + `Form` (name, manual city override, timezone) |
| Badge showcase | grid of small `Card`s per badge, each showing its tier (see Section 7) plus `locationName` + week |
| Settings | `Switch` for `aiReportEnabled`, logout button kept separate in the standard shadcn `destructive` red (not one of the 4 brand colors, so it clearly reads as a different context from Rose/push) |

## 7. Badge Tier Treatment

Traditional metallic colors (gold/silver/bronze) are not in the given palette,
and forcing new colors outside the 4 brand colors would break color-system
consistency. Decision: **tiers differ by icon + label, not new colors**:

| Tier | Icon (Lucide) | Badge background color |
|---|---|---|
| Gold (rank 1) | `trophy` | Yellow (`--color-accent`) — the most "standout" color in the palette, fitting for the top achievement |
| Silver (rank 2) | `medal` | `--neo-gray-100` with a thick black border |
| Bronze (rank 3) | `award` | Blue (`--color-info`) — used here because it overlaps neither push/pause/accent, not because of any traditional bronze association |

Tier text labels ("Gold"/"Silver"/"Bronze") always appear next to the icon —
never color alone — so tiers stay unambiguous and accessible to users with
color vision deficiency.

## 8. Motivational Microcopy Tone

Consistent with the `PRD.md` decision that unfinished tasks never reduce the
score (non-punitive design), microcopy across the app follows these principles:

- No blaming language for `missed` tasks (avoid "You failed"; use neutral
  framing like "Didn't get to it").
- Empty states (no tasks today) use an inviting tone, not pressure — e.g. a
  short nudge to start adding a task, not a warning.
- Weekly reports with a low balance index are still framed as insight to act
  on, not judgment of the user's personal character.

## 9. Responsive Breakpoints

Follow Tailwind's default breakpoints (`sm`, `md`, `lg`, `xl`) with no extra
customization unless a specific need surfaces during implementation. The Home
page's two Push/Pause columns stack vertically below the `md` breakpoint.

## 10. Next Steps

Continue to `ROADMAP.md` to split implementation into milestones.
