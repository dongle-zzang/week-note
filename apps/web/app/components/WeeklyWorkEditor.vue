<script setup lang="ts">
import type { MemoDraft, WorkMemo } from '~/types/work'
import { getSeoulDate, getWeekStart } from '~/utils/week'
import { organizeMemos } from '~/utils/projects'
const { days, weekLabel, isCurrentWeek, selectedWeekStart, previousWeek, nextWeek, goToCurrentWeek } = useWeekNavigation()
const { memos, saveMemo, moveMemo } = useWorkEntries()
const selectedDate = ref(getSeoulDate())
const addButton = useTemplateRef('addButton')
const board = useTemplateRef('board')
const { drag, announcement, startPointer, keyboardMove, cancelDrag } = useMemoDrag(board, () => days.value, () => weekMemos.value, moveMemo)
const draggedMemo = computed(() => memos.value.find(memo => memo.id === drag.value?.id))
const editorOpen = ref(false)
const editingMemo = ref<WorkMemo>()
const reportOpen = ref(false)
const report = ref('')
const weekMemos = computed(() => memos.value.filter(memo => getWeekStart(memo.date) === selectedWeekStart.value))
const groups = computed(() => days.value.map(day => ({ ...day, memos: weekMemos.value.filter(memo => memo.date === day.date) })))
watch(selectedWeekStart, () => {
  cancelDrag()
  selectedDate.value = isCurrentWeek.value ? getSeoulDate() : selectedWeekStart.value
  reportOpen.value = false
}, { flush: 'sync' })
function selectDay(date: string) {
  selectedDate.value = date
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  board.value?.querySelector<HTMLElement>(`[data-column-date="${date}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'instant' : 'smooth' })
}
function addToDay(date: string) {
  selectedDate.value = date
  openEditor()
}
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
    <WeekNavigator :week-label="weekLabel" :is-current-week="isCurrentWeek" :days="days" :selected-date="selectedDate" @previous="previousWeek" @next="nextWeek" @current="goToCurrentWeek" @select="selectDay" />
    <div class="entries-heading"><div><h2>이번 주 메모 <span class="memo-count">{{ weekMemos.length }}</span></h2><p>메모를 끌어 요일과 순서를 자유롭게 옮겨보세요.</p></div><button ref="addButton" class="ai-button" type="button" @click="openEditor()">+ 메모 추가</button></div>
    <p id="board-guide" class="board-guide">요일별로 메모를 쌓아보세요. 오른쪽으로 스크롤하면 주말까지 볼 수 있어요.</p>
    <Transition name="week" mode="out-in">
      <div :key="selectedWeekStart" ref="board" class="kanban-board" role="region" aria-label="요일별 칸반 보드" aria-describedby="board-guide" tabindex="0" :class="{ 'is-dragging': drag }">
        <section v-for="day in groups" :key="day.date" class="kanban-column" :data-column-date="day.date" :data-weekday="day.weekdayIndex" :class="{ 'is-today-column': day.isToday, 'is-drop-target': drag?.targetDate === day.date, 'is-selected-column': selectedDate === day.date }" :aria-label="`${day.shortDate} ${day.weekday} 메모`">
          <header class="kanban-column-heading"><div class="column-title"><span class="day-color-dot" aria-hidden="true" /><h3>{{ day.weekday }}</h3><span class="column-count">{{ day.memos.length }}</span></div><div class="column-date"><span>{{ day.shortDate }}</span><span v-if="day.isToday" class="today-badge">오늘</span><button type="button" class="column-add" :aria-label="`${day.weekday} 메모 추가`" @click="addToDay(day.date)">+</button></div></header>
          <div class="kanban-stack">
            <template v-for="memo in day.memos" :key="memo.id">
              <div v-if="drag?.targetDate === day.date && drag.beforeId === memo.id" class="drop-placeholder" aria-hidden="true">여기에 놓기</div>
              <MemoCard :memo="memo" :weekday-index="day.weekdayIndex" :weekday="day.weekday" :short-date="day.shortDate" :is-today="day.isToday" :dragging="drag?.id === memo.id" @edit="openEditor" @drag-start="startPointer" @drag-key="keyboardMove" />
            </template>
            <div v-if="drag?.targetDate === day.date && !drag.beforeId" class="drop-placeholder" aria-hidden="true">여기에 놓기</div>
            <div v-if="!day.memos.length && drag?.targetDate !== day.date" class="column-empty"><span>아직 메모가 없어요</span><p>가볍게 기록하거나<br>다른 요일의 메모를 옮겨보세요.</p></div>
            <button type="button" class="column-add-note" @click="addToDay(day.date)">+ 메모 추가</button>
          </div>
        </section>
      </div>
    </Transition>
    <p id="drag-guide" class="sr-only">이동 손잡이를 드래그하세요. 키보드에서는 Space로 선택하고 좌우로 요일, 위아래로 순서를 정한 뒤 Enter로 이동합니다. Escape는 취소합니다.</p>
    <p class="sr-only" role="status" aria-live="polite">{{ announcement }}</p>
    <Teleport to="body"><div v-if="drag && !drag.keyboard && draggedMemo" class="drag-preview daily-entry" :data-weekday="days.find(day => day.date === draggedMemo?.date)?.weekdayIndex" :style="{ left: `${drag.x}px`, top: `${drag.y}px`, width: `${drag.width}px` }" aria-hidden="true"><MemoContent :content="draggedMemo.content" /></div></Teleport>
    <div class="editor-actions"><p class="organize-hint">이번 주에 쌓인 메모를 프로젝트별로 정리해보세요.</p><AiOrganizeButton :disabled="!weekMemos.length" @organize="organize" /></div>
    <p class="demo-notice">입력 내용은 새로고침하면 초기화됩니다. AI 정리는 현재 프로젝트별로 원문을 묶는 임시 기능입니다.</p>
    <MemoEditorModal v-if="editorOpen" :memo="editingMemo" :initial-date="selectedDate" @close="editorOpen = false" @save="save" />
    <ReportModal v-if="reportOpen" :report="report" :week-label="weekLabel" @close="reportOpen = false" />
  </div>
</template>
