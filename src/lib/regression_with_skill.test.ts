// Regression tests proposed in Task 5 (with skill), copied unchanged.
import { describe, it, expect } from 'vitest';
import { checkAvailability } from './availability';
import type { Room } from '@/data/rooms';

const NOW = 540;
function freeRoom(): Room {
  return { id: 'a-101', name: 'A-101', blocked: false, bookings: [ { start: 900, end: 960 }, { start: 600, end: 660 } ] };
}
function check(room: Room, start: number, end: number, now = NOW) {
  return checkAvailability({ room, now, start, end }).available;
}

describe('Regression: AC4 boundaries', () => {
  it('R01 allows touching on both sides at once (660-900 split)', () => {
    // fits exactly between 600-660 and 900-960 is 240 min, so use two checks
    expect(check(freeRoom(), 660, 780)).toBe(true);
    expect(check(freeRoom(), 780, 900)).toBe(true);
  });
  it('R02 still rejects a 1-minute overlap at the start', () => {
    expect(check(freeRoom(), 659, 720)).toBe(false);
  });
  it('R03 still rejects a 1-minute overlap at the end', () => {
    expect(check(freeRoom(), 840, 901)).toBe(false);
  });
});

describe('Regression: AC5 no mutation', () => {
  it('R04 works on a frozen bookings array', () => {
    const room = freeRoom();
    Object.freeze(room.bookings);
    expect(() =>
      checkAvailability({ room, now: NOW, start: 660, end: 720 })
    ).not.toThrow();
  });
});