import { describe, expect, it } from 'vitest';
import { addMonthsAtRecurrenceDay, getNextRecurrenceDate, resolveRecurrenceDay } from '../../utils/recurrenceUtils';

describe('recurrenceUtils', () => {
  it('clamps short months without losing the intended day', () => {
    const february = addMonthsAtRecurrenceDay(new Date(2026, 0, 31), 1, 31);
    const march = addMonthsAtRecurrenceDay(february, 1, 31);
    const april = addMonthsAtRecurrenceDay(march, 1, 31);

    expect([february.getFullYear(), february.getMonth(), february.getDate()]).toEqual([2026, 1, 28]);
    expect([march.getFullYear(), march.getMonth(), march.getDate()]).toEqual([2026, 2, 31]);
    expect([april.getFullYear(), april.getMonth(), april.getDate()]).toEqual([2026, 3, 30]);
  });

  it('falls back to the source due-date day for legacy plans', () => {
    expect(resolveRecurrenceDay('2026-01-30')).toBe(30);
    expect(getNextRecurrenceDate('2026-01-30', 1)).toBe('2026-02-28');
  });

});
