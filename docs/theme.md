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

| Level | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `2.5rem` (40px) | `900` | `1.1` | Landing page main heading. |
| **Section Header** | `1.25rem` (20px) | `800` | `1.25` | Table title, analytics header. |
| **Card Value** | `1.875rem` (30px) | `900` | `1.0` | Fibonacci card numbers. |
| **Body Title** | `0.875rem` (14px) | `700` | `1.4` | Story title in input bar. |
| **Label** | `0.75rem` (12px) | `600` | `1.4` | Participant names, badges. |
| **Monospace** | `0.6875rem` (11px)| `700` | `1.3` | Room code badges. |

---

## 3. 3D Card Physics

Cards simulate physical playing cards using CSS 3D transforms:

- `.perspective-1000`: Adds `1000px` perspective to the card container.
- `.preserve-3d`: Keeps front and back faces in 3D space.
- `.backface-hidden`: Hides the opposite side during card flips.
- `.rotate-y-180`: Rotates the card 180 degrees along the Y-axis on reveal.

### Card States
- **Resting:** Soft border, neutral background.
- **Hover:** Lifts slightly (`-translate-y-2`) with an indigo glow.
- **Selected:** Lifts higher (`-translate-y-3`) with an indigo ring and corner indicator.
- **Revealed:** Flips smoothly in 500ms to show the point value.

---

## 4. Theme Switching

- Managed with `next-themes` and stored in `localStorage`.
- Handled with `useSyncExternalStore` in `ThemeToggle.tsx` to prevent hydration mismatches on initial render.
- Light mode softens shadows; dark mode deepens contrasts for dimly lit conference rooms.

---

## 5. Accessibility

1. **Contrast:** Meets WCAG 2.1 AA with at least 4.5:1 text-to-background contrast.
2. **Keyboard:** All cards are real `<button>` elements with `aria-pressed` states. You can tab through them and hit `Enter` or `Space` to vote.
3. **Focus Rings:** Focusable elements use `focus-visible:ring-2 focus-visible:ring-indigo-500`.
4. **Labels:** Icon buttons include `aria-label` and `title` attributes.
