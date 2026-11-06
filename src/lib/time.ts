// Helper formatting for minutes-after-m midnight <-> human-readable HH:MM.

export function minutesToLabel(minutes: number): string {
  if (!Number.isFinite(minutes)) return '--:--';
  const clamped = Math.max(0, Math.min(1440, Math.round(minutes)));
  if (clamped === 1440) return '24:00';
  const hh = Math.floor(clamped / 60);
  const mm = clamped % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
