// Single source of truth for the booking time limits and field validation.
// Kept pure: no I/O, no clamping or rounding of raw input.

export const MINUTE_MIN = 0;
export const MINUTE_MAX = 1440;
// now is a time-of-day, valid from 0 up to 1439 (not 1440).
export const NOW_MAX = 1439;
export const MAX_DURATION = 120;

export interface FieldErrors {
  now?: string;
  start?: string;
  end?: string;
}

// Parses a raw string into a whole integer, or returns undefined when the input
// is empty, non-integer, or otherwise not a pure whole number. This is the one
// place the whole-number check lives; field validation and the attendees check
// both build on it.
export function parseWholeNumber(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed === '') return undefined;
  if (!/^-?\d+$/.test(trimmed)) return undefined;
  const value = Number(trimmed);
  if (!Number.isInteger(value)) return undefined;
  return value;
}

// Validates raw string input WITHOUT clamping or rounding.
// Empty, non-integer, or out-of-range values produce a clear per-field error.
export function validateFields(nowRaw: string, startRaw: string, endRaw: string): FieldErrors {
  const errors: FieldErrors = {};

  function checkField(name: keyof FieldErrors, raw: string, max: number) {
    const value = parseWholeNumber(raw);
    if (value === undefined) {
      errors[name] = raw.trim() === ''
        ? 'Enter a whole number of minutes.'
        : 'Enter a whole number (no decimals).';
      return;
    }
    if (value < MINUTE_MIN || value > max) {
      errors[name] = `Enter a whole number between ${MINUTE_MIN} and ${max}.`;
    }
  }

  checkField('now', nowRaw, NOW_MAX);
  checkField('start', startRaw, MINUTE_MAX);
  checkField('end', endRaw, MINUTE_MAX);
  return errors;
}

// Pure validation for the attendees field: empty, decimal, or below 1 is invalid.
// Moved here from App.tsx so the whole-number check exists in one place only.
// Exact messages preserved.
export function validateAttendees(raw: string): string | undefined {
  const value = parseWholeNumber(raw);
  if (value === undefined) {
    return raw.trim() === ''
      ? 'Enter a whole number of 1 or more.'
      : 'Enter a whole number (no decimals).';
  }
  if (value < 1) {
    return 'Enter a whole number of 1 or more.';
  }
  return undefined;
}
