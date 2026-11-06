// Regression tests for the timeRules refactor.
// Fixed clock and fresh fixtures for every test; no existing assertions changed.
import { describe, it, expect } from 'vitest';
import { checkAvailability } from './availability';
import { validateFields } from './timeRules';
import type { Room } from '@/data/rooms';

const NOW = 540;

function freeRoom(): Room {
  return {
    id: 'a-101',
    name: 'A-101',
    blocked: false,
    bookings: [
      { start: 900, end: 960 },
      { start: 600, end: 660 },
    ],
  };
}

function blockedRoom(): Room {
  return { id: 'b-202', name: 'B-202', blocked: true, bookings: [] };
}

describe('Refactor regression: checkAvailability (AC1-AC6)', () => {
  // AC1 requires start to be strictly after now; a start equal to now is a
  // past/equal request and must be rejected.
  it('past time: start equal to now is rejected (AC1)', () => {
    expect(checkAvailability({ room: freeRoom(), now: NOW, start: 540, end: 570 }).available).toBe(false);
  });

  // AC1 requires start < end; a reversed interval violates time ordering.
  it('reversed interval: start after end is rejected (AC1)', () => {
    expect(checkAvailability({ room: freeRoom(), now: NOW, start: 720, end: 660 }).available).toBe(false);
  });

  // AC2 caps duration at 120 minutes inclusive; 121 minutes must be rejected.
  it('121-minute duration is rejected, 120 is allowed (AC2)', () => {
    expect(checkAvailability({ room: freeRoom(), now: NOW, start: 720, end: 841 }).available).toBe(false);
    expect(checkAvailability({ room: freeRoom(), now: NOW, start: 720, end: 840 }).available).toBe(true);
  });

  // AC3 rejects every request for a blocked room regardless of times.
  it('blocked room rejects a valid time range (AC3)', () => {
    expect(checkAvailability({ room: blockedRoom(), now: NOW, start: 660, end: 720 }).available).toBe(false);
  });

  // AC4 forbids any overlap with existing bookings; 630-690 overlaps 600-660.
  it('overlap with an existing booking is rejected (AC4)', () => {
    expect(checkAvailability({ room: freeRoom(), now: NOW, start: 630, end: 690 }).available).toBe(false);
  });

  // AC4 treats endpoint-only contact as non-overlap; 660-720 touches 600-660.
  it('touching endpoints are allowed (AC4)', () => {
    expect(checkAvailability({ room: freeRoom(), now: NOW, start: 660, end: 720 }).available).toBe(true);
  });

  // AC5 guarantees the function does not mutate input fixtures; after a
  // rejected overlap check the room and bookings must equal their pre-call copy.
  it('unchanged fixtures: bookings array and order preserved after a check (AC5)', () => {
    const room = freeRoom();
    const before = JSON.parse(JSON.stringify(room));
    checkAvailability({ room, now: NOW, start: 630, end: 690 });
    expect(room).toEqual(before);
    expect(room.bookings).toEqual(before.bookings);
  });
});

describe('Refactor regression: validateFields error messages', () => {
  // Empty input yields the empty-field message on that field only.
  it('empty now field yields the empty-field message', () => {
    const errors = validateFields('', '600', '660');
    expect(errors.now).toBe('Enter a whole number of minutes.');
    expect(errors.start).toBeUndefined();
    expect(errors.end).toBeUndefined();
  });

  // A decimal value is non-integer and yields the no-decimals message.
  it('decimal start value yields the no-decimals message', () => {
    const errors = validateFields('540', '12.5', '660');
    expect(errors.start).toBe('Enter a whole number (no decimals).');
    expect(errors.now).toBeUndefined();
    expect(errors.end).toBeUndefined();
  });

  // now is a time-of-day capped at 1439; 1440 must be rejected.
  it('now = 1440 is rejected (max is 1439)', () => {
    const errors = validateFields('1440', '600', '660');
    expect(errors.now).toBe('Enter a whole number between 0 and 1439.');
  });

  // end is capped at 1440; 1441 must be rejected.
  it('end = 1441 is rejected (max is 1440)', () => {
    const errors = validateFields('540', '600', '1441');
    expect(errors.end).toBe('Enter a whole number between 0 and 1440.');
  });

  // end = 1440 is the inclusive upper bound and must be accepted (no error).
  it('end = 1440 is accepted with valid now and start', () => {
    const errors = validateFields('540', '1320', '1440');
    expect(errors).toEqual({});
  });
});
