# Testing Strategy: BlindScrum

This document explains the test runner setup, test suites, and manual verification steps for BlindScrum.

---

## 1. Test Setup

Tests run with **Vitest**:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
  },
});
```

---

## 2. Unit Test Suites

### 2.1 Analytics (`apps/web/src/utils/analytics.test.ts`)

- **Empty input:** Returns 0 total votes, null for average and mode, and false for consensus.
- **Numbers:** Tests arithmetic mean, mode, and spread across standard values (`[3, 5, 5, 8]`).
- **Consensus rule:** Checks that consensus triggers when 70% or more of the team votes the same.
- **Distribution:** Confirms accurate vote counting, percentage calculations, and frequency tracking across numeric Fibonacci values.

### 2.2 Personas (`apps/web/src/utils/persona.test.ts`)

- **Two-word alias:** Checks that the generator produces an adjective and a noun.
- **Valid SVG:** Confirms generated strings are valid `data:image/svg+xml` data URIs with `<svg>` and `</svg>` tags.
- **Determinism:** Verifies that passing the same seed string produces the same avatar every time.

### 2.3 Room Codes (`apps/web/src/utils/roomCode.test.ts`)

- **Format:** Confirms codes match `^[A-Z]+-\d{3}$`.
- **Normalization:** Verifies trimming, uppercase conversion, and removal of illegal characters.
- **Length limits:** Ensures codes between 3 and 16 characters pass validation.

### 2.4 WebRTC P2P Room Utilities (`apps/web/src/utils/p2p.test.ts`)

- **SSR safety:** Returns `null` when invoked in Node.js server environments (`window === "undefined"`).
- **Room normalization:** Normalizes room codes to lowercase alphanumeric-and-hyphen identifiers for Nostr room discovery.

---

## 3. Concurrency Checks

Before deploying, verify these multi-user interactions:

1. **Private voting:** Open three browser tabs to the same room. Pick a card in tab A. Tabs B and C should see that participant A voted, but not see the number.
2. **Synchronized reveal:** Click reveal in the host tab. All tabs should flip their cards simultaneously and render the bar chart.
3. **Host switch:** Close the host's tab. The second oldest participant should gain host controls automatically.
4. **Queue sync:** Queue a story in a participant tab. It should immediately show up in the host's queue drawer and arena Up Next preview card.
5. **Interactive reactions:** Click another participant's seat in tab A and select a throwable (e.g. egg or zap). Tabs B and C should see the projectile arc, impact splatter or lightning bolt, and hear the Web Audio sound.
6. **Browser validation matrix:** Full cross-theme, responsive, and multi-session steps are documented in [docs/browser-test.md](./browser-test.md).

---

## 4. Commands

| Command            | Action                   | Expected                            |
| :----------------- | :----------------------- | :---------------------------------- |
| `pnpm test`        | Run Vitest               | 13 tests passing across 4 files     |
| `pnpm check-types` | TypeScript check         | 0 errors                            |
| `pnpm lint`        | ESLint 9                 | 0 errors, 0 warnings                |
| `pnpm build`       | Production Next.js build | Compiles cleanly for Vercel         |
| `pnpm deploy`      | Production deployment    | Deploys to Vercel (`vercel --prod`) |
