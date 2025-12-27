# Release Notes

Build command:
- `npm run build`

Test command:
- `npm run test`

Lint command:
- `npm run lint`

Play Store upload checklist (generic):
- Verify version number and release notes are updated.
- Run `npm run build` and validate the generated `dist/`.
- Confirm PWA manifest and icons are present in `public/`.
- Test offline mode on a device/emulator (airplane mode).
- Smoke-test key flows: onboarding, signs list, search, flashcards, exam.
- Confirm no external network dependencies are required for core flows.

Versioning notes:
- Update `package.json` version when preparing a new release.
- Keep a changelog of user-facing updates and fixes.
