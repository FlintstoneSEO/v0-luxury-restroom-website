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
