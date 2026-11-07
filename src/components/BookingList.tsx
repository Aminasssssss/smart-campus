import { Clock } from 'lucide-react';
import type { Room } from '@/data/rooms';
import { minutesToLabel } from '@/lib/time';

interface BookingListProps {
  room: Room;
}

// Read-only list of a room's existing bookings. Text and classes preserved.
export function BookingList({ room }: BookingListProps) {
  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Clock className="h-4 w-4 text-slate-500" />
        Existing bookings for {room.name}
      </div>
      {room.blocked ? (
        <p className="mt-2 text-sm text-rose-700">
          This room is blocked and cannot be booked.
        </p>
      ) : room.bookings.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          No existing bookings. The room is free all day.
        </p>
      ) : (
        <ul className="mt-2 space-y-1">
          {room.bookings.map((b, i) => (
            <li
              key={i}
              className="flex flex-wrap items-baseline gap-x-2 text-sm text-slate-700"
            >
              <span className="font-mono">
                {minutesToLabel(b.start)} – {minutesToLabel(b.end)}
              </span>
              <span className="text-slate-400">
                ({b.start}–{b.end} min)
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
