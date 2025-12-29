# Play Store Risk Report

## HIGH
- None found.

## MEDIUM
- Remote font loading created a network dependency in an “offline” app and could violate user expectations or Play Store offline claims.
  - Location: `src/index.css` (Google Fonts `@import`).
  - Risk: App makes network requests at launch; offline claims may be questioned; WebView may show blank/fallback fonts on first load.
  - Fix: Replaced remote import with local font files and local CSS (`src/fonts.css`, `public/fonts/*`, `src/index.css`). Local assets keep UI identical and remove network calls.
- Unnecessary Internet permission present while app is fully offline.
  - Location: `android/app/src/main/AndroidManifest.xml`.
  - Risk: Declaring unused permission may raise review questions and contradict offline-only behavior.
  - Fix: Removed `android.permission.INTERNET` (no runtime dependency on network).

## LOW
- Potential crash on storage read/write failures (e.g., storage quota or restricted WebView), and noisy console warnings in production.
  - Location: `src/context/AppContext.tsx`, `src/pages/Exam.tsx`, `src/pages/Practice.tsx`.
  - Risk: App could fail to launch or show console noise in release builds.
  - Fix: Added safe localStorage wrappers with dev-only logging; guarded legacy-data warnings to dev-only.

## INFO / VERIFIED
- Official/government affiliation: existing in-app disclaimers already state “practice/simulation” and “not affiliated.”
  - Locations: `src/pages/Settings.tsx`, `src/i18n/locales/*.json`, `src/pages/Credits.tsx`.
- No analytics/trackers or network SDKs detected.
  - Location: `package.json`, `src/**` (no analytics SDKs, no fetch/axios calls).
- Capacitor Android config uses modern SDK levels and safe exported flags.
  - Location: `android/variables.gradle`, `android/app/src/main/AndroidManifest.xml`.
