<script setup lang="ts">
defineProps<{ disabled: boolean }>()
defineEmits<{ organize: [] }>()
</script>
<template>
  <button type="button" class="ai-button" :disabled="disabled" @click="$emit('organize')">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4" /></svg>
    AI 정리
  </button>
</template>
