import { addDaysToDateOnly, isValidDateOnly } from '@/lib/date-only';

export interface CalendarBlock {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  block_type: string;
  availability_effect: string;
  status: string;
  organization_name?: string | null;
}
export function activeCalendarBlocks(blocks: CalendarBlock[]) {
  return blocks.filter(block => block.status === 'active' && isValidDateOnly(block.start_date) && isValidDateOnly(block.end_date) && block.end_date >= block.start_date);
}
export function blocksOnDate(blocks: CalendarBlock[], date: string) {
  return activeCalendarBlocks(blocks).filter(block => block.start_date <= date && block.end_date >= date);
}
export function blockedCalendarDates(blocks: CalendarBlock[], start: string, end: string) {
  const dates = new Set<string>();
  for (const block of activeCalendarBlocks(blocks)) {
    const last = block.end_date < end ? block.end_date : end;
    for (let date = block.start_date > start ? block.start_date : start; date <= last; date = addDaysToDateOnly(date, 1)) dates.add(date);
  }
  return [...dates];
}
