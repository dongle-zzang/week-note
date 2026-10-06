import { addDays, formatFullDate, formatShortDate, getSeoulDate, getWeekDates, getWeekStart } from '~/utils/week'

const weekdays = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']

export function useWeekNavigation() {
  const today = ref(getSeoulDate())
  const selectedWeekStart = ref(getWeekStart(today.value))
  const currentWeekStart = computed(() => getWeekStart(today.value))
  const isCurrentWeek = computed(() => selectedWeekStart.value === currentWeekStart.value)
  const days = computed(() => getWeekDates(selectedWeekStart.value).map((date, index) => ({
    date,
    weekdayIndex: index,
    weekday: weekdays[index]!,
    shortDate: formatShortDate(date),
    isToday: date === today.value,
    isWeekend: index >= 5,
  })))
  const weekLabel = computed(() => `${formatFullDate(selectedWeekStart.value)} ~ ${formatFullDate(addDays(selectedWeekStart.value, 6))}`)

  function refreshToday() {
    const wasCurrentWeek = isCurrentWeek.value
    today.value = getSeoulDate()
    if (wasCurrentWeek) selectedWeekStart.value = currentWeekStart.value
  }

  function goToCurrentWeek() {
    today.value = getSeoulDate()
    selectedWeekStart.value = getWeekStart(today.value)
  }

  let interval: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    interval = setInterval(refreshToday, 60_000)
    window.addEventListener('focus', refreshToday)
  })
  onUnmounted(() => {
    clearInterval(interval)
    window.removeEventListener('focus', refreshToday)
  })

  return {
    days,
    weekLabel,
    isCurrentWeek,
    selectedWeekStart,
    previousWeek: () => { selectedWeekStart.value = addDays(selectedWeekStart.value, -7) },
    nextWeek: () => { selectedWeekStart.value = addDays(selectedWeekStart.value, 7) },
    goToCurrentWeek,
  }
}
