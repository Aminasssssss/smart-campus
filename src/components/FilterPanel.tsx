import { Users } from 'lucide-react';
import { NumberField } from './NumberField';

interface FilterPanelProps {
  attendeesRaw: string;
  onAttendeesChange: (v: string) => void;
  attendeesError?: string;
  equipmentOptions: string[];
  equipmentSelection: Record<string, boolean>;
  onEquipmentToggle: (item: string) => void;
}

// Attendees + equipment filters. Layout and classes preserved from App.tsx.
export function FilterPanel({
  attendeesRaw,
  onAttendeesChange,
  attendeesError,
  equipmentOptions,
  equipmentSelection,
  onEquipmentToggle,
}: FilterPanelProps) {
  return (
    <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label={
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-500" />
              Attendees
            </span>
          }
          value={attendeesRaw}
          onChange={onAttendeesChange}
          error={attendeesError}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Equipment
          </label>
          <div className="flex flex-wrap gap-2">
            {equipmentOptions.map((item) => {
              const active = !!equipmentSelection[item];
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onEquipmentToggle(item)}
                  className={[
                    'rounded-full border px-3 py-1 text-xs font-medium capitalize transition',
                    active
                      ? 'border-teal-600 bg-teal-50 text-teal-700 ring-1 ring-teal-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
