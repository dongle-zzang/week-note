const DAY_IN_MS = 86_400_000

// Use UTC only for arithmetic on calendar dates, after resolving today in Seoul.
// This avoids local timezone and daylight-saving changes shifting the week.
function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`)
}

export function getSeoulDate(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)!.value
  return `${value('year')}-${value('month')}-${value('day')}`
}

export function addDays(date: string, days: number): string {
  return new Date(parseDate(date).getTime() + days * DAY_IN_MS).toISOString().slice(0, 10)
}

export function getWeekStart(date: string): string {
  const day = parseDate(date).getUTCDay()
  return addDays(date, -((day + 6) % 7))
}

export function getWeekDates(start: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

export function formatFullDate(date: string): string {
  return date.replaceAll('-', '.')
}

export function formatShortDate(date: string): string {
  return date.slice(5).replace('-', '.')
}
