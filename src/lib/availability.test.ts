import { describe, it, expect } from 'vitest';
import { checkAvailability } from './availability';
import type { Room } from '@/data/rooms';

// Fixed clock and fresh fixtures for every test.
const NOW = 540;

function freeRoom(): Room {
  return {
    id: 'a-101',
    name: 'A-101',
    capacity: 30,
    equipment: ['projector', 'whiteboard'],
    blocked: false,
    bookings: [
      { start: 900, end: 960 },
      { start: 600, end: 660 },
    ],
  };
}

function blockedRoom(): Room {
  return { id: 'b-202', name: 'B-202', capacity: 20, equipment: ['projector'], blocked: true, bookings: [] };
}

function check(room: Room, start: number, end: number, now = NOW) {
  return checkAvailability({ room, now, start, end }).available;
}

describe('AC1 time order and past requests', () => {
  it('T01 rejects start equal to now', () => {
    expect(check(freeRoom(), 540, 570)).toBe(false);
  });
  it('T02 rejects start before now', () => {
    expect(check(freeRoom(), 500, 530)).toBe(false);
  });
  it('T03 rejects start equal to end', () => {
    expect(check(freeRoom(), 720, 720)).toBe(false);
  });
  it('T04 rejects start after end', () => {
    expect(check(freeRoom(), 720, 660)).toBe(false);
  });
  it('T05 rejects end after 1440', () => {
    expect(check(freeRoom(), 1321, 1441)).toBe(false);
  });
});

describe('AC2 maximum duration', () => {
  it('T06 allows exactly 120 minutes', () => {
    expect(check(freeRoom(), 720, 840)).toBe(true);
  });
  it('T07 rejects 121 minutes', () => {
    expect(check(freeRoom(), 720, 841)).toBe(false);
  });
});

describe('AC3 blocked room', () => {
  it('T08 rejects a valid request for a blocked room', () => {
    expect(check(blockedRoom(), 660, 720)).toBe(false);
  });
});

describe('AC4 overlap and touching endpoints', () => {
  it('T09 allows a request that starts when a booking ends (660-720)', () => {
    expect(check(freeRoom(), 660, 720)).toBe(true);
  });
  it('T10 allows a request that ends when a booking starts (840-900)', () => {
    expect(check(freeRoom(), 840, 900)).toBe(true);
  });
  it('T11 rejects a partial overlap (630-690)', () => {
    expect(check(freeRoom(), 630, 690)).toBe(false);
  });
  it('T12 rejects overlap with the second booking (940-1000)', () => {
    expect(check(freeRoom(), 940, 1000)).toBe(false);
  });
  it('T13 allows the gap between two bookings (780-900)', () => {
    expect(check(freeRoom(), 780, 900)).toBe(true);
  });
});

describe('AC5 result without changing booking data', () => {
  it('T14 does not change the bookings array or its order', () => {
    const room = freeRoom();
    const before = JSON.parse(JSON.stringify(room.bookings));
    checkAvailability({ room, now: NOW, start: 660, end: 720 });
    expect(room.bookings).toEqual(before);
  });
  it('T15 does not change booking data after a rejected request', () => {
    const room = freeRoom();
    const before = JSON.parse(JSON.stringify(room));
    checkAvailability({ room, now: NOW, start: 630, end: 690 });
    expect(room).toEqual(before);
  });
  it('T16 returns a reason when unavailable', () => {
    const result = checkAvailability({ room: freeRoom(), now: NOW, start: 630, end: 690 });
    expect(result.available).toBe(false);
    if (!result.available) expect(result.reason.length).toBeGreaterThan(0);
  });
});