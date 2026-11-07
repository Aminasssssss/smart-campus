# Smart Campus Room Availability

A React + TypeScript + Vite app that checks whether a campus room is free for a
requested time slot. It uses fictional fixture data (no backend, no login, and
no booking is ever created or modified).

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Opens the app in development mode with hot reload.

## Test

```bash
npm test
```

Runs the Vitest suite (unit tests for availability logic, room filtering, and
catalog integrity, plus a UI integration test).

## Checks

```bash
npm run typecheck   # TypeScript type checking (tsc --noEmit)
npm run lint        # ESLint
npm run build       # Production build (vite build)
```

## Folder structure

```
src/
  App.tsx                  # UI: state, F5 logic, component wiring
  App.test.tsx             # UI integration test (jsdom)
  main.tsx                 # React entry point
  index.css                # Tailwind base styles
  components/
    NumberField.tsx         # Shared numeric text input (Attendees + time fields)
    FilterPanel.tsx         # Attendees field + equipment checklist
    RoomList.tsx            # Room cards and F4 empty state
    BookingList.tsx         # Read-only existing bookings list
    ResultBanner.tsx        # Availability verdict banner
  data/
    rooms.ts               # Fictional room catalog (A-101, B-202, C-303, D-404)
  lib/
    availability.ts         # Pure booking rule checkAvailability (AC1-AC6)
    roomFilter.ts           # Pure room filtering (F1-F2) + equipment options
    time.ts                 # Minutes <-> HH:MM formatting
    timeRules.ts            # Time limits, parseWholeNumber, validateFields, validateAttendees
    *.test.ts               # Vitest unit tests
```

## Acceptance criteria (AC1-AC6)

| ID  | Rule |
|-----|------|
| AC1 | Start must be 0 or later, end must be after start, end must be at most 1440 (midnight). Start must be strictly after the current time. |
| AC2 | Duration must not exceed 120 minutes (120 is allowed). |
| AC3 | A blocked room is always rejected. |
| AC4 | A request overlapping any existing booking is rejected (touching endpoints are fine). |
| AC5 | If all rules pass the result is Available; existing bookings are never mutated. |
| AC6 | Invalid input shows a clear per-field message and produces no verdict. |

## Filter rules (F1-F5)

| ID  | Rule |
|-----|------|
| F1  | A room matches when its capacity is greater than or equal to the requested attendees. |
| F2  | A room must have all required equipment items; an empty required-equipment list matches every room. |
| F3  | Blocked rooms are handled by checkAvailability (AC3), not by the filter. |
| F4  | When no room matches the filters, an empty-state message is shown, the bookings list and result are hidden, and the Check button is disabled. |
| F5  | When the selected room changes (by click or by filtering), if a result is currently shown the check re-runs with the same times for the new room; if no result is shown the current behavior is kept. |
