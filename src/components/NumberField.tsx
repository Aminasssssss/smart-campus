import { minutesToLabel } from '@/lib/time';
import { parseWholeNumber, MINUTE_MAX } from '@/lib/timeRules';

interface NumberFieldProps {
  label: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  // When set, renders an HH:MM preview for a valid in-range minute value.
  showTimePreview?: boolean;
}

// One shared numeric text input used by the Attendees field and the three
// time fields. CSS classes and structure preserved from the original inputs.
export function NumberField({
  label,
  value,
  onChange,
  error,
  showTimePreview,
}: NumberFieldProps) {
  let preview = '--:--';
  if (showTimePreview) {
    const n = parseWholeNumber(value);
    if (n !== undefined && n >= 0 && n <= MINUTE_MAX) {
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
      {showTimePreview && (
        <div className="mt-1 text-xs text-slate-400">{preview}</div>
      )}
      {error && <div className="mt-1 text-xs text-rose-600">{error}</div>}
    </div>
  );
}
