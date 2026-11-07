import { CheckCircle2, XCircle } from 'lucide-react';
import type { AvailabilityResult } from '@/lib/availability';
import { minutesToLabel } from '@/lib/time';

interface ResultBannerProps {
  result: AvailabilityResult;
  roomName: string;
  startRaw: string;
  endRaw: string;
}

// Availability verdict banner. Text and classes preserved from App.tsx.
export function ResultBanner({
  result,
  roomName,
  startRaw,
  endRaw,
}: ResultBannerProps) {
  return (
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
            {minutesToLabel(Number(startRaw))}–{minutesToLabel(Number(endRaw))} works for {roomName}.
            No booking has been created.
          </p>
        )}
      </div>
    </div>
  );
}
