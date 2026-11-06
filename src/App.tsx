import { useMemo, useState } from 'react';
import {
  CalendarCheck,
  DoorClosed,
  DoorOpen,
  Clock,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ROOMS, type Room } from '@/data/rooms';
import { checkAvailability, type AvailabilityResult } from '@/lib/availability';
import { minutesToLabel } from '@/lib/time';
import {
  validateFields,
  type FieldErrors,
  MINUTE_MAX,
} from '@/lib/timeRules';


export default function App() {
  const [roomId, setRoomId] = useState<string>(ROOMS[0].id);
  // Keep raw user input as strings — never clamp or round.
  const [nowRaw, setNowRaw] = useState<string>('480');
  const [startRaw, setStartRaw] = useState<string>('700');
  const [endRaw, setEndRaw] = useState<string>('760');
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const room: Room | undefined = useMemo(
    () => ROOMS.find((r) => r.id === roomId),
    [roomId]
  );

  function handleCheck() {
    if (!room) return;
    const errors = validateFields(nowRaw, startRaw, endRaw);
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
        now: Number(nowRaw),
        start: Number(startRaw),
        end: Number(endRaw),
      })
    );
  }

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

          {/* Room selector */}
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Room
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {ROOMS.map((r) => {
              const active = r.id === roomId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRoomId(r.id);
                    setResult(null);
                    setFieldErrors({});
                  }}
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
                  {r.blocked && (
                    <span className="mt-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                      Blocked
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Existing bookings (read-only) */}
          {room && (
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
          )}

          {/* Time inputs */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TimeField
              label="Now (current time)"
              value={nowRaw}
              onChange={(v) => {
                setNowRaw(v);
                setResult(null);
              }}
              error={fieldErrors.now}
            />
            <TimeField
              label="Start"
              value={startRaw}
              onChange={(v) => {
                setStartRaw(v);
                setResult(null);
              }}
              error={fieldErrors.start}
            />
            <TimeField
              label="End"
              value={endRaw}
              onChange={(v) => {
                setEndRaw(v);
                setResult(null);
              }}
              error={fieldErrors.end}
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
              className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:bg-teal-800 sm:w-auto"
            >
              Check availability
            </button>
          </div>

          {/* Result */}
          {result && (
            <div
              className={[
                'mt-5 flex items-start gap-3 rounded-xl border p-4',
                result.available
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-rose-200 bg-rose-50',
              ].join(' ')}
            >
              {result.available ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" />
              )}
              <div>
                <p
                  className={[
                    'text-sm font-semibold',
                    result.available ? 'text-emerald-800' : 'text-rose-800',
                  ].join(' ')}
                >
                  {result.available ? 'Available' : 'Unavailable'}
                </p>
                {!result.available && (
                  <p className="mt-1 text-sm text-rose-700">{result.reason}</p>
                )}
                {result.available && (
                  <p className="mt-1 text-sm text-emerald-700">
                    {minutesToLabel(Number(startRaw))}–{minutesToLabel(Number(endRaw))} works for {room?.name}.
                    No booking has been created.
                  </p>
                )}
              </div>
            </div>
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

interface TimeFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

function TimeField({ label, value, onChange, error }: TimeFieldProps) {
  // Show the HH:MM preview only when the raw input is a valid integer in range.
  let preview = '--:--';
  if (/^-?\d+$/.test(value.trim())) {
    const n = Number(value.trim());
    if (Number.isInteger(n) && n >= 0 && n <= MINUTE_MAX) {
      preview = minutesToLabel(n);
    }
  }
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            'w-full rounded-lg border bg-white px-3 py-2 text-sm tabular-nums shadow-sm outline-none transition',
            'focus:border-teal-600 focus:ring-1 focus:ring-teal-600',
            error ? 'border-rose-300' : 'border-slate-300',
          ].join(' ')}
        />
      </div>
      <div className="mt-1 text-xs text-slate-400">{preview}</div>
      {error && <div className="mt-1 text-xs text-rose-600">{error}</div>}
    </div>
  );
}
