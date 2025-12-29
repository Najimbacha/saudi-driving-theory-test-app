# Minimal Patch Summary

## Files changed
- `src/index.css`: replace remote Google Fonts import with local font CSS import.
- `src/fonts.css`: new local font-face definitions (generated from Google Fonts CSS).
- `public/fonts/*`: added local WOFF2 font files for offline use.
- `android/app/src/main/AndroidManifest.xml`: removed `android.permission.INTERNET`.
- `src/context/AppContext.tsx`: safe localStorage read/write with dev-only logging.
- `src/pages/Exam.tsx`, `src/pages/Practice.tsx`: dev-only legacy-data warnings.

## Rationale
- Removes network dependency to keep offline-only behavior and avoid Play Store risk.
- Eliminates unused permission and reduces review risk.
- Prevents startup crashes on storage failures and reduces production logging noise.
