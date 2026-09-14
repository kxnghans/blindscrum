# Visual Philosophy & Design System: Stealth Poker

BlindScrum implements a dedicated **Stealth Poker** design system. Purpose-built for high-focus sprint ceremonies, it uses tactile card physics, 3D perspective transforms, and a distinctive high-contrast color palette differentiated from previous company themes.

---

## 🎨 1. Color Palette: The Stealth Poker System

The palette pairs deep obsidian charcoal with electric cyber indigo, balanced by consensus emerald and divergence amber indicators.

```text
Dark Mode (Default):
├── Background Base:       #090D16 (Deep Obsidian Stealth)
├── Surface / Card:        #111827 (Slate Navy Glass)
├── Elevated Surface:      #1E293B (Highlighted Deck Element)
├── Primary Accent:        #6366F1 (Cyber Indigo)
├── Consensus Indicator:   #10B981 (Emerald Agreement)
├── Divergence Alert:      #F59E0B (Amber Discussion Outlier)
└── Border Stroke:         rgba(255, 255, 255, 0.09)

Light Mode:
├── Background Base:       #F8FAFC (Arctic Studio Slate)
├── Surface / Card:        #FFFFFF (Crisp Studio Paper)
├── Elevated Surface:      #F1F5F9 (Soft Muted Inset)
├── Primary Accent:        #4F46E5 (Royal Indigo)
├── Consensus Indicator:   #059669 (Deep Emerald)
├── Divergence Alert:      #D97706 (Warm Amber)
└── Border Stroke:         #E2E8F0
```

---

## 🔤 2. Typography & Hierarchy Scale

Typography is mapped to system fonts with strict numerical line height and letter spacing:

| Level | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `2.5rem` (40px) | `900` (Black) | `1.1` | Landing page main value proposition. |
| **Section Header** | `1.25rem` (20px) | `800` (Extra Bold) | `1.25` | Table title, analytics header. |
| **Card Value** | `1.875rem` (30px) | `900` (Black) | `1.0` | Fibonacci card numerals. |
| **Body Title** | `0.875rem` (14px) | `700` (Bold) | `1.4` | Story title in input bar and drawer. |
| **Label / Meta** | `0.75rem` (12px) | `600` (Semi-Bold) | `1.4` | Participant names, mode badges. |
| **Micro Monospace**| `0.6875rem` (11px)| `700` (Bold) | `1.3` | Room code badges, vote counts. |

---

## 🃏 3. 3D Card Physics & Elevation States

All interactive cards simulate physical playing cards with three-dimensional depth:

### 3.1 3D Perspective Utility Classes
- `.perspective-1000`: Applies a `1000px` 3D viewing perspective to parent card containers.
- `.preserve-3d`: Enforces `transform-style: preserve-3d` across child faces.
- `.backface-hidden`: Hides unrevealed faces during flips (`backface-visibility: hidden`).
- `.rotate-y-180`: Rotates revealed cards `180deg` along the Y-axis.

### 3.2 Elevation States
- **Resting:** `shadow-sm` with subtle `border-slate-200/90 dark:border-slate-800/90`.
- **Hover:** `-translate-y-2` with `shadow-lg shadow-indigo-500/15` and border glow.
- **Selected:** `-translate-y-3` with `shadow-xl shadow-indigo-500/35` and `ring-4 ring-indigo-400/40`.
- **Revealed:** Synchronized `500ms` spring flip revealing point values with emerald consensus borders.

---

## 🌗 4. Dark & Light Mode Consistency

- Theme selection is controlled via `next-themes` and stored in `localStorage`.
- Client hydration is handled via React 19 `useSyncExternalStore` in `ThemeToggle.tsx` to eliminate layout shift and cascading render cycles.
- Shadows adapt automatically: soft ambient diffusion in Light Mode vs. deep volumetric occlusion in Dark Mode.

---

## ♿ 5. Accessibility & ARIA Guidelines

1. **Contrast Ratio:** Text elements exceed WCAG 2.1 AA standards ($> 4.5:1$ contrast against background surfaces).
2. **Keyboard Navigation:** Card deck buttons support `Tab` navigation, `Enter`/`Space` selection, and reflect active state via `aria-pressed`.
3. **Focus Indicators:** Interactive buttons implement high-contrast `focus-visible:ring-2 focus-visible:ring-indigo-500` rings.
4. **Live Regions:** Dynamic status changes (voice listening, vote reveals, queue updates) use visual cues and ARIA labels for assistive technologies.
