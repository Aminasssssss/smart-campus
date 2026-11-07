// Pure room filtering for availability search.
// F1: capacity must be >= requested attendees.
// F2: the room must contain ALL selected equipment.
// These functions never mutate their inputs. Blocked-room handling (F3) stays
// in checkAvailability, which remains unchanged.

import type { Room } from '@/data/rooms';

export interface RoomFilter {
  attendees: number;
  requiredEquipment: string[];
}

export function matchesCapacity(room: Room, attendees: number): boolean {
  return room.capacity >= attendees;
}

export function matchesEquipment(room: Room, requiredEquipment: string[]): boolean {
  return requiredEquipment.every((item) => room.equipment.includes(item));
}

export function filterRooms(
  catalog: Room[],
  filter: RoomFilter
): Room[] {
  return catalog.filter(
    (room) =>
      matchesCapacity(room, filter.attendees) &&
      matchesEquipment(room, filter.requiredEquipment)
  );
}
