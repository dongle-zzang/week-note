<script setup lang="ts">
import { trapDialogFocus, restoreDialogFocus } from '~/utils/dialog'
import type { MemoDraft, WorkMemo } from '~/types/work'
import { parseProjectSections } from '~/utils/projects'
const props = defineProps<{ memo?: WorkMemo; initialDate: string }>()
const emit = defineEmits<{ close: []; save: [draft: MemoDraft, id?: string] }>()
const dialog = useTemplateRef('dialog')
const date = ref(props.memo?.date ?? props.initialDate)
const content = ref(props.memo?.content ?? '')
const confirmDiscard = ref(false)
const initial = { date: date.value, content: content.value }
const canSave = computed(() => Boolean(date.value && parseProjectSections(content.value).some(section => section.content.trim())))
const dirty = computed(() => date.value !== initial.date || content.value !== initial.content)
let returnFocus: HTMLElement | null = null
let previousOverflow = ''
function close() {
  if (dirty.value) confirmDiscard.value = true
  else emit('close')
}
function save() {
  if (canSave.value) emit('save', { date: date.value, content: content.value }, props.memo?.id)
}
function cancel(event: Event) {
  event.preventDefault()
  if (confirmDiscard.value) confirmDiscard.value = false
  else close()
}
watch(confirmDiscard, async (show) => {
  await nextTick()
  dialog.value?.querySelector<HTMLButtonElement>(show ? '[data-continue]' : '[data-cancel]')?.focus()
})
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
    <dialog ref="dialog" @keydown.tab="trapDialogFocus" @focusout="restoreDialogFocus" class="memo-dialog" aria-labelledby="memo-dialog-title" @cancel="cancel">
      <form @submit.prevent="save">
        <header class="modal-header">
          <div><span class="eyebrow">WORK MEMO</span><h2 id="memo-dialog-title">{{ memo ? '메모 수정' : '새 메모 작성' }}</h2></div>
          <button type="button" class="text-button" aria-label="작성 모달 닫기" @click="close">닫기</button>
        </header>
        <div class="modal-body" :inert="confirmDiscard">
          <label class="date-field">기록 날짜 <input v-model="date" type="date" required aria-label="기록 날짜"></label>
          <p id="tag-guide" class="input-guide">줄 앞에 @프로젝트명 또는 @[프로젝트 이름]을 적어보세요. 다음 태그 전까지 같은 프로젝트로 묶입니다.</p>
          <div class="inline-editor-heading"><span>메모 내용</span><span>입력한 자리에서 서식이 적용됩니다</span></div>
          <LazyInlineMarkdownEditor v-model="content" />
          <p id="markdown-guide" class="markdown-guide"><code>#</code> + 공백은 제목, <code>-</code> + 공백은 목록, <code>**내용**</code>은 굵게 · 실행 취소로 서식 변환을 되돌릴 수 있어요.</p>
        </div>
        <div v-if="confirmDiscard" class="discard-notice" role="alert">
          <p>작성 중인 변경사항을 버릴까요?</p>
          <div class="modal-buttons"><button type="button" class="secondary-button" data-continue @click="confirmDiscard = false">계속 작성</button><button type="button" class="secondary-button" @click="emit('close')">변경사항 버리기</button></div>
        </div>
        <footer v-else class="modal-footer"><span>메모는 이 화면을 사용하는 동안만 유지됩니다.</span><div class="modal-buttons"><button type="button" class="secondary-button" data-cancel @click="close">취소</button><button type="submit" class="ai-button" :disabled="!canSave">{{ memo ? '변경사항 저장' : '메모 추가' }}</button></div></footer>
      </form>
    </dialog>
  </Teleport>
</template>
