import { describe, it, expect } from 'vitest';
import {
  matchesCapacity,
  matchesEquipment,
  filterRooms,
} from './roomFilter';
import { ROOMS, type Room } from '@/data/rooms';

// A small stable catalog for focused unit tests; does not depend on ROOMS.
function catalog(): Room[] {
  return [
    {
      id: 'a-101',
      name: 'A-101',
      capacity: 30,
      equipment: ['projector', 'whiteboard'],
      blocked: false,
      bookings: [{ start: 600, end: 660 }],
    },
    {
      id: 'b-202',
      name: 'B-202',
      capacity: 20,
      equipment: ['projector'],
      blocked: true,
      bookings: [],
    },
    {
      id: 'c-303',
      name: 'C-303',
      capacity: 12,
      equipment: ['whiteboard'],
      blocked: false,
      bookings: [],
    },
  ];
}

describe('matchesCapacity (F1)', () => {
  it('passes when attendees equals capacity exactly', () => {
    expect(matchesCapacity(catalog()[0], 30)).toBe(true);
  });
  it('fails when attendees is one above capacity', () => {
    expect(matchesCapacity(catalog()[0], 31)).toBe(false);
  });
  it('passes when attendees is below capacity', () => {
    expect(matchesCapacity(catalog()[2], 10)).toBe(true);
  });
});

describe('matchesEquipment (F2)', () => {
  it('passes when all required equipment is present', () => {
    expect(
      matchesEquipment(catalog()[0], ['projector', 'whiteboard'])
    ).toBe(true);
  });
  it('fails when one required item is missing', () => {
    expect(
      matchesEquipment(catalog()[1], ['projector', 'whiteboard'])
    ).toBe(false);
  });
  it('an empty required-equipment list matches every room', () => {
    for (const room of catalog()) {
      expect(matchesEquipment(room, [])).toBe(true);
    }
  });
  it('passes when only a subset is required', () => {
    expect(matchesEquipment(catalog()[0], ['projector'])).toBe(true);
  });
});

describe('filterRooms (combined)', () => {
  it('returns rooms matching both capacity and equipment', () => {
    // a-101 (cap 30, projector) and b-202 (cap 20, projector) both match;
    // c-303 (cap 12) is below the attendee count. Filtering intentionally
    // ignores blocked status (F3 stays in checkAvailability).
    const result = filterRooms(catalog(), {
      attendees: 15,
      requiredEquipment: ['projector'],
    });
    expect(result.map((r) => r.id)).toEqual(['a-101', 'b-202']);
  });
  it('returns an empty array when nothing matches', () => {
    const result = filterRooms(catalog(), {
      attendees: 50,
      requiredEquipment: ['projector'],
    });
    expect(result).toEqual([]);
  });
  it('returns every room when no equipment is required and attendees is zero', () => {
    const cat = catalog();
    const result = filterRooms(cat, { attendees: 0, requiredEquipment: [] });
    expect(result.map((r) => r.id)).toEqual(['a-101', 'b-202', 'c-303']);
  });
  it('does not mutate the catalog', () => {
    const cat = catalog();
    const snapshot = JSON.parse(JSON.stringify(cat));
    filterRooms(cat, { attendees: 15, requiredEquipment: ['projector'] });
    expect(cat).toEqual(snapshot);
  });
  it('works against the real ROOMS catalog (capacity + equipment)', () => {
    const result = filterRooms(ROOMS, {
      attendees: 25,
      requiredEquipment: ['whiteboard'],
    });
    expect(result.map((r) => r.id).sort()).toEqual(['a-101', 'd-404']);
  });
});
