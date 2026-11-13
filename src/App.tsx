import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { CalendarCheck, Info } from 'lucide-react';
import { ROOMS, type Room } from '@/data/rooms';
import { checkAvailability, type AvailabilityResult } from '@/lib/availability';
import { filterRooms, equipmentOptions } from '@/lib/roomFilter';
import {
  validateFields,
  validateAttendees,
  type FieldErrors,
} from '@/lib/timeRules';
import { FilterPanel } from '@/components/FilterPanel';
import { RoomList } from '@/components/RoomList';
import { BookingList } from '@/components/BookingList';
import { ResultBanner } from '@/components/ResultBanner';
import { NumberField } from '@/components/NumberField';

export default function App() {
  const [roomId, setRoomId] = useState<string>(ROOMS[0].id);
  // Keep raw user input as strings — never clamp or round.
  const [nowRaw, setNowRaw] = useState<string>('480');
  const [startRaw, setStartRaw] = useState<string>('700');
  const [endRaw, setEndRaw] = useState<string>('760');
  const [attendeesRaw, setAttendeesRaw] = useState<string>('1');
  const [equipmentSelection, setEquipmentSelection] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const equipmentOpts = useMemo(() => equipmentOptions(ROOMS), []);

  const attendeesError = useMemo(
    () => validateAttendees(attendeesRaw),
    [attendeesRaw]
  );
  // An invalid attendees value is not used for filtering (capacity stays open).
  const effectiveAttendees = attendeesError ? 0 : Number(attendeesRaw);

  const requiredEquipment = useMemo(
    () => equipmentOpts.filter((e) => equipmentSelection[e]),
    [equipmentOpts, equipmentSelection]
  );

  const filteredRooms = useMemo(
    () => filterRooms(ROOMS, { attendees: effectiveAttendees, requiredEquipment }),
    [effectiveAttendees, requiredEquipment]
  );

  // Resolve the selected room from the filtered list; fall back to the first
  // match if the current selection no longer matches the filters.
  const selectedRoom: Room | undefined = useMemo(
    () => filteredRooms.find((r) => r.id === roomId) ?? filteredRooms[0],
    [filteredRooms, roomId]
  );

  // Keep roomId in sync with the resolved selection.
  useEffect(() => {
    if (selectedRoom && selectedRoom.id !== roomId) {
      setRoomId(selectedRoom.id);
    }
  }, [selectedRoom, roomId]);

  // Latest raw inputs so the re-check callback can stay stable.
  const inputRef = useRef({ nowRaw, startRaw, endRaw });
  inputRef.current = { nowRaw, startRaw, endRaw };

  // F5: re-run the check for a given room using the current times.
  const runCheckFor = useCallback((room: Room) => {
    const { nowRaw: n, startRaw: s, endRaw: e } = inputRef.current;
    const errors = validateFields(n, s, e);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      // AC6: invalid input shows a clear message and produces no verdict.
      setResult(null);
      return;
    }
    // AC5: never mutate existing bookings — pass room straight through.
    setResult(
      checkAvailability({
        room,
        now: Number(n),
        start: Number(s),
        end: Number(e),
      })
    );
  }, []);

  // F5: when the selected room changes (by click or by filtering), if a result
  // is currently shown, re-run the check for the new room with the same times.
  useEffect(() => {
    if (result && selectedRoom) {
      runCheckFor(selectedRoom);
    }
    // Only the selected room's id triggers a re-check; time edits clear the result instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom?.id]);

  function handleCheck() {
    if (!selectedRoom) return;
    runCheckFor(selectedRoom);
  }

  const noRoomsMatch = filteredRooms.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Smart Campus Room Availability
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Check whether a room is free for your chosen time. No booking is created.
              </p>
            </div>
          </div>
        </header>

        {/* Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-4 text-base font-semibold text-slate-800">
            Check availability
          </h2>

          <FilterPanel
            attendeesRaw={attendeesRaw}
            onAttendeesChange={setAttendeesRaw}
            attendeesError={attendeesError}
            equipmentOptions={equipmentOpts}
            equipmentSelection={equipmentSelection}
            onEquipmentToggle={(item) =>
              setEquipmentSelection((prev) => ({ ...prev, [item]: !prev[item] }))
            }
          />

          {/* Room selector */}
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Room
          </label>
          <RoomList
            rooms={filteredRooms}
            selectedRoomId={selectedRoom?.id}
            onSelect={(id) => {
              setRoomId(id);
              setFieldErrors({});
            }}
          />

          {/* Existing bookings (read-only) */}
          {selectedRoom && !noRoomsMatch && <BookingList room={selectedRoom} />}

          {/* Time inputs */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NumberField
              label="Now (current time)"
              value={nowRaw}
              onChange={(v) => {
                setNowRaw(v);
                setResult(null);
              }}
              error={fieldErrors.now}
              showTimePreview
            />
            <NumberField
              label="Start"
              value={startRaw}
              onChange={(v) => {
                setStartRaw(v);
                setResult(null);
              }}
              error={fieldErrors.start}
              showTimePreview
            />
            <NumberField
              label="End"
              value={endRaw}
              onChange={(v) => {
                setEndRaw(v);
                setResult(null);
              }}
              error={fieldErrors.end}
              showTimePreview
            />
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Times are in minutes after midnight (0 = 00:00, 1440 = 24:00). Now is 0–1439. Max duration 120 min.
          </p>

          {/* Action */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleCheck}
              disabled={noRoomsMatch}
              className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Check availability
            </button>
          </div>

          {/* Result */}
          {result && selectedRoom && !noRoomsMatch && (
            <ResultBanner
              result={result}
              roomName={selectedRoom.name}
              startRaw={startRaw}
              endRaw={endRaw}
            />
          )}

          {/* Notes */}
          <div className="mt-5 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              This tool only checks availability. It does not save or confirm any booking,
              and existing bookings are never changed.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
