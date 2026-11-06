import type { Room } from '@/data/rooms';
import { MINUTE_MAX, MAX_DURATION } from '@/lib/timeRules';

export interface CheckInput {
  room: Room;
  now: number;
  start: number;
  end: number;
}

export type AvailabilityResult =
  | { available: true }
  | { available: false; reason: string };


function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

function intervalsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  // Intervals that only touch at an endpoint do NOT overlap.
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Pure availability logic, fully separate from the UI.
 * Does not mutate the room or its bookings.
 */
export function checkAvailability(input: CheckInput): AvailabilityResult {
  const { room, now, start, end } = input;

  if (!isInteger(now) || !isInteger(start) || !isInteger(end)) {
    return {
      available: false,
      reason: 'All times must be whole numbers of minutes.',
    };
  }

  // AC1: 0 <= start < end <= 1440
  if (!(start >= 0 && start < end && end <= MINUTE_MAX)) {
    return {
      available: false,
      reason:
        'Start must be 0 or later, end must be after start, and end must be at most 1440 (midnight).',
    };
  }

  // AC1: start must be strictly after now
  if (!(start > now)) {
    return {
      available: false,
      reason: 'The start time must be strictly after the current time.',
    };
  }

  // AC2: duration must not exceed 120 minutes (120 is allowed)
  if (end - start > MAX_DURATION) {
    return {
      available: false,
      reason: `Duration must not exceed ${MAX_DURATION} minutes. Requested duration is ${end - start} minutes.`,
    };
  }

  // AC3: reject every request when the room is blocked
  if (room.blocked) {
    return {
      available: false,
      reason: room.blockReason
        ? `This room is blocked. ${room.blockReason}`
        : 'This room is currently blocked and cannot be booked.',
    };
  }

  // AC4: reject overlap with any existing booking (touching endpoints are fine)
  // Check bookings in time order.
  const ordered = [...room.bookings].sort((a, b) => a.start - b.start);
  for (const booking of ordered) {
    if (intervalsOverlap(start, end, booking.start, booking.end)) {
      return {
        available: false,
        reason: `Overlaps with an existing booking from ${booking.start} to ${booking.end}.`,
      };
    }
  }

  // AC5: available result
  return { available: true };
}