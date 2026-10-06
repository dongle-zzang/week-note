<script setup lang="ts">
import type { WorkMemo } from '~/types/work'
defineProps<{ memo: WorkMemo; weekdayIndex: number; weekday: string; shortDate: string; isToday: boolean; dragging?: boolean }>()
defineEmits<{ edit: [memo: WorkMemo]; dragStart: [event: PointerEvent, memo: WorkMemo]; dragKey: [event: KeyboardEvent, memo: WorkMemo] }>()
</script>

<template>
  <article class="daily-entry memo-card" :data-weekday="weekdayIndex" :data-memo-id="memo.id" :class="{ 'is-today': isToday, 'is-drag-source': dragging }">
    <header class="memo-card-header">
      <button type="button" class="drag-handle" :aria-label="`${shortDate} 메모 이동`" aria-describedby="drag-guide" :aria-pressed="dragging ?? false" @pointerdown="$emit('dragStart', $event, memo)" @keydown="$emit('dragKey', $event, memo)"><svg viewBox="0 0 16 20" aria-hidden="true"><circle cx="5" cy="5" r="1"/><circle cx="11" cy="5" r="1"/><circle cx="5" cy="10" r="1"/><circle cx="11" cy="10" r="1"/><circle cx="5" cy="15" r="1"/><circle cx="11" cy="15" r="1"/></svg></button>
      <div class="memo-date"><span>{{ shortDate }} · {{ weekday }}</span><span v-if="isToday" class="today-badge">오늘</span></div>
      <button type="button" class="text-button" :aria-label="`${shortDate} 메모 수정`" @click="$emit('edit', memo)">수정</button>
    </header>
    <MemoContent :content="memo.content" />
  </article>
</template>
