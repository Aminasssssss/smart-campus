import { DoorClosed, DoorOpen } from 'lucide-react';
import type { Room } from '@/data/rooms';

interface RoomListProps {
  rooms: Room[];
  selectedRoomId: string | undefined;
  onSelect: (id: string) => void;
}

// Room cards plus the F4 empty state. Layout and classes preserved from App.tsx.
export function RoomList({ rooms, selectedRoomId, onSelect }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <p className="text-sm font-medium text-slate-700">
          No rooms match your filters.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Try fewer attendees or different equipment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {rooms.map((r) => {
        const active = r.id === selectedRoomId;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.id)}
            className={[
              'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition',
              active
                ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
            ].join(' ')}
          >
            <div className="flex items-center gap-2">
              {r.blocked ? (
                <DoorClosed className="h-4 w-4 text-rose-500" />
              ) : (
                <DoorOpen className="h-4 w-4 text-teal-600" />
              )}
              <span className="font-semibold text-slate-800">{r.name}</span>
            </div>
            <div className="text-xs text-slate-500">
              Capacity: {r.capacity}
            </div>
            <div className="flex flex-wrap gap-1">
              {r.equipment.map((e) => (
                <span
                  key={e}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] capitalize text-slate-600"
                >
                  {e}
                </span>
              ))}
            </div>
            {r.blocked && (
              <span className="mt-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                Blocked
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
