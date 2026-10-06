<script setup lang="ts">
defineProps<{
  weekLabel: string
  isCurrentWeek: boolean
  selectedDate: string
  days: { date: string; weekday: string; shortDate: string; isToday: boolean }[]
}>()
defineEmits<{ previous: []; next: []; current: []; select: [date: string] }>()
</script>

<template>
  <nav class="week-navigator" aria-label="기록할 주 선택">
    <div class="week-toolbar">
      <div class="week-selection">
        <button class="icon-button" type="button" aria-label="이전 주" @click="$emit('previous')">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 7-5 5 5 5" /></svg>
        </button>
        <div class="week-description" aria-live="polite" aria-atomic="true">
          <span class="week-date">{{ weekLabel }}</span>
          <span v-if="isCurrentWeek" class="week-badge">이번 주</span>
        </div>
        <button class="icon-button" type="button" aria-label="다음 주" @click="$emit('next')">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 7 5 5-5 5" /></svg>
        </button>
      </div>
      <button class="current-week-button" type="button" :disabled="isCurrentWeek" @click="$emit('current')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1.7 7M4 4v6h6" /></svg>
        이번 주로
      </button>
    </div>
    <div class="week-strip" aria-label="메모를 작성할 날짜 선택">
      <button
        v-for="day in days"
        :key="day.date"
        type="button"
        :aria-pressed="day.date === selectedDate"
        @click="$emit('select', day.date)"
        class="week-day-link"
        :class="{ 'is-current-day': day.isToday, 'is-selected-day': day.date === selectedDate }"
        :aria-current="day.isToday ? 'date' : undefined"
        :aria-label="`${day.shortDate} ${day.weekday} 작성 날짜 선택`"
      >
        <span>{{ day.weekday.slice(0, 1) }}</span>
        <strong>{{ day.shortDate.slice(-2) }}</strong>
        <span v-if="day.isToday" class="date-dot" aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>
