<script setup lang="ts">
import type { MemoDraft, WorkMemo } from '~/types/work'
import { getSeoulDate, getWeekStart } from '~/utils/week'
import { organizeMemos } from '~/utils/projects'
const { days, weekLabel, isCurrentWeek, selectedWeekStart, previousWeek, nextWeek, goToCurrentWeek } = useWeekNavigation()
const { memos, saveMemo } = useWorkEntries()
const selectedDate = ref(getSeoulDate())
const addButton = useTemplateRef('addButton')
const editorOpen = ref(false)
const editingMemo = ref<WorkMemo>()
const reportOpen = ref(false)
const report = ref('')
const weekMemos = computed(() => memos.value.filter(memo => getWeekStart(memo.date) === selectedWeekStart.value))
const groups = computed(() => days.value.map(day => ({ ...day, memos: weekMemos.value.filter(memo => memo.date === day.date).sort((a, b) => a.createdAt - b.createdAt) })).filter(day => day.memos.length))
watch(selectedWeekStart, () => {
  selectedDate.value = isCurrentWeek.value ? getSeoulDate() : selectedWeekStart.value
  reportOpen.value = false
}, { flush: 'sync' })
function openEditor(memo?: WorkMemo) {
  editingMemo.value = memo
  editorOpen.value = true
}
async function save(draft: MemoDraft, id?: string) {
  saveMemo(draft, id)
  selectedWeekStart.value = getWeekStart(draft.date)
  selectedDate.value = draft.date
  editorOpen.value = false
  await nextTick()
  addButton.value?.focus({ preventScroll: true })
}
function organize() {
  report.value = organizeMemos(weekMemos.value)
  reportOpen.value = true
}
</script>

<template>
  <div class="weekly-editor">
    <WeekNavigator :week-label="weekLabel" :is-current-week="isCurrentWeek" :days="days" :selected-date="selectedDate" @previous="previousWeek" @next="nextWeek" @current="goToCurrentWeek" @select="selectedDate = $event" />
    <div class="entries-heading"><div><h2>이번 주 메모 <span class="memo-count">{{ weekMemos.length }}</span></h2><p>짧게 남긴 기록을 프로젝트별로 모아보세요.</p></div><button ref="addButton" class="ai-button" type="button" @click="openEditor()">+ 메모 추가</button></div>
    <Transition name="week" mode="out-in">
      <div :key="selectedWeekStart" class="memo-board">
        <div v-if="!groups.length" class="empty-state"><span class="empty-eyebrow">A LITTLE NOTE, EVERY DAY</span><h3>이번 주의 첫 메모를 남겨보세요</h3><p>완벽한 문장이 아니어도 좋아요.<br>@프로젝트명과 오늘 한 일을 가볍게 적어두세요.</p><button type="button" class="secondary-button" @click="openEditor()">+ 첫 메모 작성</button></div>
        <section v-for="day in groups" :key="day.date" class="memo-day-group" :aria-label="`${day.shortDate} ${day.weekday} 메모`">
          <header class="memo-group-heading"><h3>{{ day.shortDate }} <span>{{ day.weekday }}</span></h3><span v-if="day.isToday" class="today-badge">오늘</span><span class="group-count">{{ day.memos.length }}개의 메모</span></header>
          <div class="memo-grid"><MemoCard v-for="memo in day.memos" :key="memo.id" :memo="memo" :weekday-index="day.weekdayIndex" :weekday="day.weekday" :short-date="day.shortDate" :is-today="day.isToday" @edit="openEditor" /></div>
        </section>
      </div>
    </Transition>
    <div class="editor-actions"><p class="organize-hint">이번 주에 쌓인 메모를 프로젝트별로 정리해보세요.</p><AiOrganizeButton :disabled="!weekMemos.length" @organize="organize" /></div>
    <p class="demo-notice">입력 내용은 새로고침하면 초기화됩니다. AI 정리는 현재 프로젝트별로 원문을 묶는 임시 기능입니다.</p>
    <MemoEditorModal v-if="editorOpen" :memo="editingMemo" :initial-date="selectedDate" @close="editorOpen = false" @save="save" />
    <ReportModal v-if="reportOpen" :report="report" :week-label="weekLabel" @close="reportOpen = false" />
  </div>
</template>
