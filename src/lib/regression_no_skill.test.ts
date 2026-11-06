// Regression tests proposed in Task 4 (no skill), copied unchanged.
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

describe('Regression: strict overlap boundaries and no input mutation', () => {
  // Guard against loosening the fix too far (e.g. `<` replaced in only one place).
  it('R01 rejects a 1-minute overlap at the end of a booking (659-720)', () => {
    expect(check(freeRoom(), 659, 720)).toBe(false);
  });
  it('R02 rejects a 1-minute overlap at the start of a booking (840-901)', () => {
    expect(check(freeRoom(), 840, 901)).toBe(false);
  });
  it('R03 rejects a request identical to a booking (600-660)', () => {
    expect(check(freeRoom(), 600, 660)).toBe(false);
  });
  it('R04 rejects a request that fully encloses a booking (590-680)', () => {
    expect(check(freeRoom(), 590, 680)).toBe(false);
  });

  // Touching on both sides at once: the exact case defect 1 broke.
  it('R05 allows a request that touches bookings on both ends (660-720)', () => {
    const room: Room = {
      id: 'c-303',
      name: 'C-303',
      blocked: false,
      bookings: [
        { start: 720, end: 780 },
        { start: 600, end: 660 },
      ],
    };
    expect(check(room, 660, 720)).toBe(true);
  });

  // In-place sort on a frozen array throws TypeError, so any future mutation fails loudly.
  it('R06 works on frozen booking data', () => {
    const room = freeRoom();
    room.bookings.forEach((b) => Object.freeze(b));
    Object.freeze(room.bookings);
    Object.freeze(room);
    expect(() => checkAvailability({ room, now: NOW, start: 660, end: 720 })).not.toThrow();
    expect(check(room, 660, 720)).toBe(true);
    expect(check(room, 630, 690)).toBe(false);
  });
});