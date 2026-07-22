import { addMonths, format, getDate, getDaysInMonth, parseISO, setDate, startOfMonth } from 'date-fns';

export function resolveRecurrenceDay(dueDate: string, recurrenceDay?: number) {
  return recurrenceDay ?? getDate(parseISO(dueDate));
}

export function addMonthsAtRecurrenceDay(date: Date, months: number, recurrenceDay: number) {
  const targetMonth = addMonths(startOfMonth(date), months);
  return setDate(targetMonth, Math.min(recurrenceDay, getDaysInMonth(targetMonth)));
}

export function getNextRecurrenceDate(dueDate: string, interval: number, recurrenceDay?: number) {
  return format(
    addMonthsAtRecurrenceDay(parseISO(dueDate), interval, resolveRecurrenceDay(dueDate, recurrenceDay)),
    'yyyy-MM-dd',
  );
}
