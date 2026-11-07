import { describe, it, expect } from 'vitest';
import { ROOMS } from '@/data/rooms';

describe('Room catalog integrity', () => {
  it('has at least four rooms', () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
  });

  it('every room has a unique id', () => {
    const ids = ROOMS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every room has capacity > 0 and a non-empty equipment list', () => {
    for (const room of ROOMS) {
      expect(room.capacity).toBeGreaterThan(0);
      expect(room.equipment.length).toBeGreaterThan(0);
    }
  });

  it('every room has its own distinct bookings array (not shared)', () => {
    // Two rooms should never reference the same bookings array instance.
    for (let i = 0; i < ROOMS.length; i++) {
      for (let j = i + 1; j < ROOMS.length; j++) {
        expect(ROOMS[i].bookings).not.toBe(ROOMS[j].bookings);
      }
    }
  });

  it('every booking stays within the 0-1440 minute range', () => {
    for (const room of ROOMS) {
      for (const booking of room.bookings) {
        expect(booking.start).toBeGreaterThanOrEqual(0);
        expect(booking.start).toBeLessThan(booking.end);
        expect(booking.end).toBeLessThanOrEqual(1440);
      }
    }
  });

  it('A-101 keeps its bookings and B-202 keeps its block reason', () => {
    const a101 = ROOMS.find((r) => r.id === 'a-101');
    const b202 = ROOMS.find((r) => r.id === 'b-202');
    expect(a101?.bookings).toEqual([
      { start: 600, end: 660 },
      { start: 900, end: 960 },
    ]);
    expect(b202?.blocked).toBe(true);
    expect(b202?.blockReason).toBe(
      'Closed for maintenance until further notice.'
    );
  });

  it('D-404 exists with capacity 40, three equipment items, and a 720-780 booking', () => {
    const d404 = ROOMS.find((r) => r.id === 'd-404');
    expect(d404).toBeDefined();
    expect(d404?.capacity).toBe(40);
    expect(d404?.equipment).toEqual([
      'projector',
      'whiteboard',
      'video conferencing',
    ]);
    expect(d404?.bookings).toEqual([{ start: 720, end: 780 }]);
  });
});
