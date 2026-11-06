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

// Validates raw string input WITHOUT clamping or rounding.
// Empty, non-integer, or out-of-range values produce a clear per-field error.
export function validateFields(nowRaw: string, startRaw: string, endRaw: string): FieldErrors {
  const errors: FieldErrors = {};

  function checkField(name: keyof FieldErrors, raw: string, max: number) {
    if (raw.trim() === '') {
      errors[name] = 'Enter a whole number of minutes.';
      return;
    }
    // Reject anything that is not a pure integer (no decimals, no signs beyond digits).
    if (!/^-?\d+$/.test(raw.trim())) {
      errors[name] = 'Enter a whole number (no decimals).';
      return;
    }
    const value = Number(raw.trim());
    if (!Number.isInteger(value)) {
      errors[name] = 'Enter a whole number of minutes.';
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
