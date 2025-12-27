# QA Report

## What was tested
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run dev` (startup smoke-check)

## What was fixed/updated
- Offline-only sign source enforcement and runtime guards: `src/data/ksaSigns.ts`
- Regenerated KSA sign index from `public/ksa-signs`: `scripts/generate-ksa-signs.mjs`, `src/data/ksa_signs.json`
- Sign rendering now uses public SVGs only: `src/components/signs/SignIcon.tsx`, `src/pages/Signs.tsx`, `src/pages/Favorites.tsx`, `src/pages/Flashcards.tsx`, `src/components/SignDetailModal.tsx`, `src/components/Flashcard.tsx`
- Route-level lazy loading for performance: `src/App.tsx`
- PWA offline hygiene (removed external font preconnect/runtime caching): `index.html`, `vite.config.ts`
- ESLint/type fixes: `src/components/ui/command.tsx`, `src/components/ui/textarea.tsx`, `src/context/AchievementsContext.tsx`, `src/context/LearningContext.tsx`, `src/hooks/useFeedback.ts`, `src/hooks/usePWA.ts`, `src/pages/Exam.tsx`, `tailwind.config.ts`, `src/pages/NotFound.tsx`, `src/main.tsx`
- Test setup and core flow tests: `src/test/setup.ts`, `src/test/signs.test.tsx`, `vite.config.ts`, `eslint.config.js`, `package.json`, `package-lock.json`
- Release docs: `RELEASE.md`

## Commands used
- `node scripts/generate-ksa-signs.mjs`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run dev`

## Remaining known issues
- Low: ESLint warnings from `react-refresh/only-export-components` in shared UI/context files (non-blocking).
- Low: React Router future-flag warnings emitted during tests (non-blocking).
- Low: Build warning for main chunk size (~541 kB) despite route-level lazy loading; monitor and split further if needed.

## Play Store readiness notes
- App builds cleanly and tests pass.
- Signs are sourced exclusively from `public/ksa-signs` via `src/data/ksa_signs.json`.
- Offline/PWA config avoids external font dependencies.
