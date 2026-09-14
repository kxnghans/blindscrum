# Testing & Quality Assurance: BlindScrum

---

## 1. Testing Philosophy & Standards

BlindScrum adheres to strict verification standards to guarantee stability in real-time multi-user environments:

- **100% Core Logic Coverage:** All analytical calculations, room code transformations, and persona generators must be protected by automated unit tests.
- **Zero-Tolerance Quality Gates:** Pull requests and deployments are gated by `check-types`, `lint`, and `test` pipelines.
- **Strict Typing:** No `any` casting allowed in test or production source code.

---

## 2. Test Runner Configuration (`apps/web/vitest.config.ts`)

Testing is powered by **Vitest**:

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

## 3. Test Suites Overview

### 3.1 Analytics Calculation Suite (`apps/web/src/utils/analytics.test.ts`)
- **Empty Array Handling:** Verifies total votes equal 0, averages/modes return null, and consensus flags false.
- **Numeric Calculations:** Tests arithmetic mean rounding, mode identification, and min/max spread across standard Fibonacci numbers (`[3, 5, 5, 8]`).
- **Consensus Threshold:** Validates that consensus triggers when $\ge 70\%$ of the team selects the same card.
- **Special Cards:** Confirms `?` and `☕` votes are correctly tallied in frequency distributions without corrupting the numeric average.

### 3.2 Agile Persona Suite (`apps/web/src/utils/persona.test.ts`)
- **Format Verification:** Asserts monikers consist of two non-empty agile words (Adjective + Noun).
- **SVG Integrity:** Ensures generated avatars produce valid `data:image/svg+xml` URIs containing compliant `<svg>` and `</svg>` elements.
- **Determinism:** Confirms identical string seeds yield identical SVG avatars.

### 3.3 Room Code Suite (`apps/web/src/utils/roomCode.test.ts`)
- **Format Structure:** Checks generated codes match `^[A-Z]+-\d{3}$`.
- **Normalization:** Validates trimming, uppercase conversion, and stripping of invalid characters.
- **Validation Rules:** Verifies length boundaries ($3 \le \text{length} \le 16$).

---

## 4. Multi-Client Concurrency Verification

Manual and integration testing validates multi-user behavior:

1. **Simultaneous Voting:** Open three separate browser sessions to the same room (`BLND-92`). Verify voting in one window immediately updates the card back on peer tables without revealing the value.
2. **Synchronized Reveal:** Confirm host's reveal action triggers 3D card flips across all connected clients simultaneously.
3. **Host Failover:** Disconnect the host tab; verify the next oldest participant is automatically designated as the new host with action buttons enabled.
4. **Asynchronous Queue:** Queue a new ticket from a voter tab; verify it appears in the host's queue drawer instantly without disrupting ongoing estimation.

---

## 5. Verification Commands

| Command | Action | Success Criteria |
| :--- | :--- | :--- |
| `pnpm test` | Runs all Vitest suites | 10 passed across 3 test files |
| `pnpm check-types` | Strict TypeScript compiler check | 0 errors (`tsc --noEmit`) |
| `pnpm lint` | ESLint 9 validation | 0 errors, 0 warnings |
| `pnpm build` | Production Next.js build | Zero compilation errors |
