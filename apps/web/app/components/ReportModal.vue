<script setup lang="ts">
import { trapDialogFocus, restoreDialogFocus } from '~/utils/dialog'
const props = defineProps<{ report: string; weekLabel: string }>()
const emit = defineEmits<{ close: [] }>()
const dialog = useTemplateRef('dialog')
const status = ref('')
let returnFocus: HTMLElement | null = null
let previousOverflow = ''
async function copyReport() {
  try {
    await navigator.clipboard.writeText(props.report)
    status.value = '전체 결과를 복사했습니다.'
  } catch {
    status.value = '복사하지 못했습니다. 아래 결과를 선택해 직접 복사해주세요.'
    const result = dialog.value?.querySelector<HTMLTextAreaElement>('textarea')
    result?.focus()
    result?.select()
  }
}
onMounted(() => {
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  dialog.value?.showModal()
})
onBeforeUnmount(() => {
  dialog.value?.close()
  document.body.style.overflow = previousOverflow
  returnFocus?.focus({ preventScroll: true })
})
</script>

<template>
  <Teleport to="body">
    <dialog ref="dialog" @keydown.tab="trapDialogFocus" @focusout="restoreDialogFocus" class="memo-dialog report-dialog" aria-labelledby="report-title" @cancel.prevent="emit('close')">
      <header class="modal-header"><div><span class="eyebrow">WEEKLY REPORT</span><h2 id="report-title">프로젝트별 임시 정리</h2></div><button type="button" class="text-button" @click="emit('close')">닫기</button></header>
      <div class="modal-body"><p class="report-period">{{ weekLabel }}</p><p class="input-guide">프로젝트별로 원문을 묶은 결과입니다. AI 문장 개선은 아직 적용되지 않습니다.</p><textarea class="report-text" aria-label="주간 정리 결과" :value="report" readonly spellcheck="false" /></div>
      <footer class="modal-footer"><span role="status" aria-live="polite">{{ status }}</span><button type="button" class="ai-button" autofocus @click="copyReport">전체 복사</button></footer>
    </dialog>
  </Teleport>
</template>
