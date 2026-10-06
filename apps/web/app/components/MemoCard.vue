<script setup lang="ts">
import type { WorkMemo } from '~/types/work'
defineProps<{ memo: WorkMemo; weekdayIndex: number; weekday: string; shortDate: string; isToday: boolean }>()
defineEmits<{ edit: [memo: WorkMemo] }>()
</script>

<template>
  <article class="daily-entry memo-card" :data-weekday="weekdayIndex" :class="{ 'is-today': isToday }">
    <header class="memo-card-header">
      <div class="memo-date"><span>{{ shortDate }} · {{ weekday }}</span><span v-if="isToday" class="today-badge">오늘</span></div>
      <button type="button" class="text-button" :aria-label="`${shortDate} 메모 수정`" @click="$emit('edit', memo)">수정</button>
    </header>
    <MemoContent :content="memo.content" />
  </article>
</template>
