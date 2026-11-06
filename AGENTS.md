## Project
Smart Campus room availability checker; fictional data only (rooms A-101, B-202 blocked, C-303). React, TypeScript, Vite.

## Structure
src/lib/availability.ts: pure booking rule checkAvailability.
src/App.tsx: UI.
src/data/rooms.ts: fixture data.
src/lib/*.test.ts: Vitest tests.

## Constraints
Preserve AC1-AC6; no backend, login or booking creation.
No new features or dependencies.

## Engineering rules
Prefer pure functions and minimal changes; use at most 2 justified patterns.
Do not mutate booking fixtures; keep responsive UI feedback.
Do not change UI text or layout.

## Commands
npm test
npm run typecheck
npm run lint
npm run build

## Verification
Run existing tests and add focused regression tests.
Do not weaken or delete existing assertions.
Report changed files, rationale and test evidence.