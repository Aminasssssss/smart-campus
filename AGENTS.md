## Project
Smart Campus room availability checker; fictional data only (rooms A-101, B-202 blocked, C-303, D-404). React, TypeScript, Vite.

Scope note: the course baseline described one room; this project keeps four fictional rooms because Assignment #04 required a catalog of at least four rooms.

## Structure
src/lib/availability.ts: pure booking rule checkAvailability.
src/lib/roomFilter.ts: pure room filtering (capacity + equipment).
src/App.tsx: UI.
src/App.test.tsx: UI integration tests (jsdom).
src/components/: presentational UI components.
src/data/rooms.ts: fixture data (four rooms with capacity and equipment).
src/lib/roomFilter.test.ts: room filter tests.
src/lib/roomCatalog.test.ts: catalog integrity tests.
src/lib/*.test.ts: Vitest tests.
README.md: project documentation.

## Constraints
Preserve AC1-AC6 and F1-F5 behavior; no backend, no database, no login, no booking creation.
No new features. No new runtime dependencies. Dev-only test packages are allowed: @testing-library/react, @testing-library/dom, jsdom.
No secrets, API keys, or credentials in code. No external deployments.

## Engineering rules
Prefer pure functions and minimal changes; use at most 2 justified patterns.
Do not mutate booking fixtures; keep responsive UI feedback.
Do not change UI text or layout.

## Commands
npm run dev
npm test
npm run typecheck
npm run lint
npm run build

## Verification
Run existing tests and add focused regression tests.
Do not weaken or delete existing assertions.
Before proposing acceptance, run npm test, npm run typecheck, npm run lint, and npm run build, and report the exact pass and fail counts.
Report changed files, rationale and test evidence.

## Forbidden actions
Do not deploy or publish.
Do not add secrets or .env values.
Do not delete or weaken tests.
Do not change src/data/rooms.ts or AC1-AC6/F1-F5 behavior without approval.

## Review gate
Before any further change, show the diff and the output of npm test, npm run typecheck, npm run lint, and npm run build.
Wait for human approval before making any further change.
