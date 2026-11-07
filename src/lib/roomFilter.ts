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

// Equipment options derived from the catalog, in first-seen order.
// Moved here from App.tsx so the derivation lives next to the filter it feeds.
export function equipmentOptions(catalog: Room[]): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const room of catalog) {
    for (const item of room.equipment) {
      if (!seen.has(item)) {
        seen.add(item);
        list.push(item);
      }
    }
  }
  return list;
}
