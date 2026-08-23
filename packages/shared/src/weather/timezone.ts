export function isValidIanaTimeZone(value?: string): value is string {
  if (!value?.trim()) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
}
