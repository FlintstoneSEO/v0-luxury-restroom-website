const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidDateOnly(dateString: string) {
  const match = DATE_ONLY_PATTERN.exec(dateString);
  if (!match) return false;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function formatDateOnlyValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalTodayDateOnly(now = new Date()) {
  return formatDateOnlyValue(now);
}

export function addDaysToDateOnly(dateString: string, days: number) {
  if (!isValidDateOnly(dateString)) {
    throw new Error(`Invalid date-only value: ${dateString}`);
  }

  const date = parseLocalDateOnly(dateString);
  date.setDate(date.getDate() + days);
  return formatDateOnlyValue(date);
}

export function enumerateDateOnlyRange(startDate: string, endDate: string) {
  if (!isValidDateOnly(startDate) || !isValidDateOnly(endDate) || endDate < startDate) {
    return [];
  }

  const dates: string[] = [];
  let current = startDate;
  while (current <= endDate) {
    dates.push(current);
    current = addDaysToDateOnly(current, 1);
  }
  return dates;
}

export function dateOnlyRangesOverlap(
  leftStart: string,
  leftEnd: string,
  rightStart: string,
  rightEnd: string,
) {
  return leftStart <= rightEnd && leftEnd >= rightStart;
}

export function getMinimumEventDate(now = new Date(), minimumDaysAhead = 7) {
  return addDaysToDateOnly(getLocalTodayDateOnly(now), minimumDaysAhead);
}

export function isDateOnlyBefore(left: string, right: string) {
  return left < right;
}

export function parseLocalDateOnly(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);

  return new Date(year, month - 1, day);
}

export function formatLocalDateOnly(
  dateString: string,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
) {
  return parseLocalDateOnly(dateString).toLocaleDateString('en-US', options);
}
