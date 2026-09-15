# Visual Design & Theme: Stealth Poker

BlindScrum uses a dark-slate theme named **Stealth Poker**. It is built for clarity during sprint meetings, using high-contrast cards, 3D CSS transforms, and clear indicators for consensus and divergence.

---

## 1. Color Palette

The theme pairs dark obsidian backgrounds with indigo interactive elements, emerald for consensus, and amber for debate.

```text
Dark Mode (Default):
- Background:       #090D16 (Deep Obsidian)
- Card / Surface:   #111827 (Slate Navy)
- Elevated Surface: #1E293B (Active Item)
- Primary Accent:   #6366F1 (Indigo)
- Consensus:        #10B981 (Emerald)
- Divergence:       #F59E0B (Amber)
- Border:           rgba(255, 255, 255, 0.09)

Light Mode:
- Background:       #F8FAFC (Arctic Slate)
- Card / Surface:   #FFFFFF (White)
- Elevated Surface: #F1F5F9 (Muted Inset)
- Primary Accent:   #4F46E5 (Deep Indigo)
- Consensus:        #059669 (Emerald)
- Divergence:       #D97706 (Amber)
- Border:           #E2E8F0
```

---

## 2. Typography Hierarchy

Fonts use the system font stack to avoid loading external font files:

| Level              | Size               | Weight | Line Height | Usage                          |
| :----------------- | :----------------- | :----- | :---------- | :----------------------------- |
| **Hero Title**     | `2.5rem` (40px)    | `900`  | `1.1`       | Landing page main heading.     |
| **Section Header** | `1.25rem` (20px)   | `800`  | `1.25`      | Table title, analytics header. |
| **Card Value**     | `1.875rem` (30px)  | `900`  | `1.0`       | Fibonacci card numbers.        |
| **Body Title**     | `0.875rem` (14px)  | `700`  | `1.4`       | Story title in input bar.      |
| **Label**          | `0.75rem` (12px)   | `600`  | `1.4`       | Participant names, badges.     |
| **Monospace**      | `0.6875rem` (11px) | `700`  | `1.3`       | Room code badges.              |

---

## 3. 3D Card Physics

Cards simulate physical playing cards using CSS 3D transforms:

- `.perspective-1000`: Adds `1000px` perspective to the card container.
- `.preserve-3d`: Keeps front and back faces in 3D space.
- `.backface-hidden`: Hides the opposite side during card flips.
- `.rotate-y-180`: Rotates the card 180 degrees along the Y-axis on reveal.

### Avatar-on-Card Architecture

Each player sits at the table as an interactive playing card:

- **Voting Face (Front):** Displays role indicator (host crown), participant avatar with dynamic ring (amber pulse for voting, emerald ring with check for voted), bold alias, and live status pill ("Voting..." with animated spinning clock, or "Voted" with emerald checkmark).
- **Revealed Face (Back):** 3D flips 180 degrees to show the numeric point score with the avatar anchored at the top identity pill and a bottom summary badge (★ Consensus, ★ Majority, Lowest, or Highest).
- **Consensus Glow:** Winning consensus picks gain an emerald border with elevated glow (`border-emerald-500 shadow-emerald-500/20`).

---

## 4. Neumorphic Inset Wells

Adapted from the dual-vector tactile lighting model in `kxnghans.github.io`:

- **Light Mode (`.bevel-light-inset`):** Inset shadows `inset 2px 2px 4px rgba(0, 0, 0, 0.08)` and `inset -2px -2px 4px rgba(255, 255, 255, 0.75)` on slate background (`#f1f5f9`).
- **Dark Mode (`.dark:bevel-dark-inset`):** Inset shadows `inset 2.5px 2.5px 5px rgba(0, 0, 0, 0.85)` and `inset -1.5px -1.5px 3px rgba(255, 255, 255, 0.05)` on deep obsidian (`#0c1017`).
- **Usage:** Applied to active story input well, inline quick queue well, landing page room join input, and user profile dialog input.

---

## 5. 3-Way Theme Switching

- **Default Mode:** `system` (automatically synchronizes with OS preference).
- **Cycle Flow:** Clicking toggles `system` -> `light` -> `dark` -> `system`.
- **Icons:** Monitor (System), Sun (Light), Moon (Dark).
- **Hydration Safety:** Uses `useSyncExternalStore` in `ThemeToggle.tsx` to prevent hydration mismatches on initial server render.

---

## 6. Accessibility

1. **Contrast:** Meets WCAG 2.1 AA with at least 4.5:1 text-to-background contrast.
2. **Keyboard:** All cards are real `<button>` elements with `aria-pressed` states. You can tab through them and hit `Enter` or `Space` to vote.
3. **Focus Rings:** Focusable elements use `focus-visible:ring-2 focus-visible:ring-indigo-500`.
4. **Labels:** Icon buttons include `aria-label` and `title` attributes.

---

## 7. Micro-Interactions & Reactions Motion

Reactions use lightweight CSS keyframe animations designed for playful physical feedback:

- **Flight Arc (`.animate-throw-arc`):** 450ms bezier curve starting off-screen with rotation into the target card center.
- **Splat Burst (`.animate-splat-burst`):** 2500ms scale pop and slow opacity decay for egg yolk and tomato juice drips.
- **Gas Mist (`.animate-gas-mist`):** 2600ms swelling gradient mist coupled with drifting `Zzz` text upward.
- **Lightning Zap (`.animate-zap-flash`):** 1800ms high-voltage flash accompanied by electric vibration (`.animate-card-shake`).
- **Cheers Celebration (`.animate-cheers-burst`):** 2500ms confetti explosion with bouncing party emojis.

---

## 8. Smart Input Limits & Progressive Badges

Input wells render tactile monospace character counters that progressively transition through semantic alert colors as content approaches capacity:

- **Standard State ($< 250$ chars):** Muted slate token (`text-slate-400 dark:text-slate-500 font-mono text-xs`) indicating relaxed remaining headroom.
- **Approaching Limit Warning ($250 \le \text{chars} < 300$):** High-contrast amber token (`text-amber-500 font-semibold`) alerting users of pending truncation.
- **Hard Limit Reached ($300$ chars):** Vivid rose danger token (`text-rose-500 font-bold`) indicating the field boundary is reached.
- **Token Application:**
  - **Story Pipeline:** Active project sizing input and inline quick queue input display `X/300`.
  - **Queue Drawer:** Backlog addition drawer displays `X/300`.
  - **User Profile Modal:** Moniker input displays `X/28` (transitioning to amber at 24 chars).
  - **Landing Page:** Room code input enforces `maxLength={16}` with strict uppercase transformation.
