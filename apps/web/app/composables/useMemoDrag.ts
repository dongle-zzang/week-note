import type { WorkMemo } from '~/types/work'

interface DragState {
  id: string
  targetDate: string | null
  beforeId?: string
  keyboard: boolean
  x: number
  y: number
  width: number
}

export function useMemoDrag(
  board: Ref<HTMLElement | null>,
  days: () => { date: string; weekday: string }[],
  memos: () => WorkMemo[],
  move: (id: string, date: string, beforeId?: string) => void,
) {
  const drag = ref<DragState>()
  const announcement = ref('')
  let pending: { id: string; x: number; y: number; width: number; offsetX: number; offsetY: number; pointerId: number; handle: HTMLElement } | undefined
  let point = { x: 0, y: 0 }
  let frame = 0

  function finish(commit = false) {
    const state = drag.value
    if (commit && state?.targetDate) {
      move(state.id, state.targetDate, state.beforeId)
      const day = days().find(day => day.date === state.targetDate)
      announcement.value = `${day?.weekday ?? ''}로 메모를 이동했습니다.`
    } else if (state) announcement.value = '메모 이동을 취소했습니다.'
    cancelAnimationFrame(frame)
    if (pending?.handle.hasPointerCapture(pending.pointerId)) pending.handle.releasePointerCapture(pending.pointerId)
    pending = undefined
    drag.value = undefined
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerCancel)
    window.removeEventListener('keydown', onEscape)
    if (state) nextTick(() => {
      const card = [...(board.value?.querySelectorAll<HTMLElement>('[data-memo-id]') ?? [])].find(card => card.dataset.memoId === state.id)
      card?.querySelector<HTMLButtonElement>('.drag-handle')?.focus({ preventScroll: true })
    })
  }

  function updateTarget() {
    const state = drag.value
    if (!state || state.keyboard) return
    const column = document.elementFromPoint(point.x, point.y)?.closest<HTMLElement>('[data-column-date]')
    if (!column || !board.value?.contains(column)) {
      state.targetDate = null
      state.beforeId = undefined
      return
    }
    state.targetDate = column.dataset.columnDate!
    const cards = [...column.querySelectorAll<HTMLElement>('[data-memo-id]')].filter(card => card.dataset.memoId !== state.id)
    state.beforeId = cards.find(card => point.y < card.getBoundingClientRect().top + card.getBoundingClientRect().height / 2)?.dataset.memoId
  }

  function autoScroll() {
    if (!drag.value || drag.value.keyboard || !board.value) return
    const bounds = board.value.getBoundingClientRect()
    if (point.y >= bounds.top && point.y <= bounds.bottom) {
      if (point.x < bounds.left + 48) board.value.scrollLeft -= 10
      if (point.x > bounds.right - 48) board.value.scrollLeft += 10
    }
    const column = document.elementFromPoint(point.x, point.y)?.closest<HTMLElement>('[data-column-date]')
    const list = column?.querySelector<HTMLElement>('.kanban-stack')
    if (list && board.value.contains(column!)) {
      const rect = list.getBoundingClientRect()
      if (point.y < rect.top + 36) list.scrollTop -= 8
      if (point.y > rect.bottom - 36) list.scrollTop += 8
    }
    updateTarget()
    frame = requestAnimationFrame(autoScroll)
  }

  function onPointerMove(event: PointerEvent) {
    if (!pending || event.pointerId !== pending.pointerId) return
    point = { x: event.clientX, y: event.clientY }
    if (!drag.value && Math.hypot(point.x - pending.x, point.y - pending.y) < 6) return
    event.preventDefault()
    if (!drag.value) {
      drag.value = { id: pending.id, targetDate: null, keyboard: false, x: 0, y: 0, width: pending.width }
      announcement.value = '메모를 이동 중입니다. 놓을 요일을 선택하세요.'
      frame = requestAnimationFrame(autoScroll)
    }
    drag.value.x = point.x - pending.offsetX
    drag.value.y = point.y - pending.offsetY
    updateTarget()
  }
  function onPointerUp(event: PointerEvent) {
    if (pending?.pointerId === event.pointerId) finish(true)
  }
  function onPointerCancel() { finish() }
  function onEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); finish() }
  }
  function startPointer(event: PointerEvent, memo: WorkMemo) {
    if (event.button !== 0 || !event.isPrimary) return
    finish()
    const handle = event.currentTarget as HTMLElement
    const bounds = handle.closest<HTMLElement>('[data-memo-id]')!.getBoundingClientRect()
    pending = { id: memo.id, x: event.clientX, y: event.clientY, width: bounds.width, offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top, pointerId: event.pointerId, handle }
    point = { x: event.clientX, y: event.clientY }
    handle.setPointerCapture(event.pointerId)
    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)
    window.addEventListener('keydown', onEscape)
  }

  function keyboardMove(event: KeyboardEvent, memo: WorkMemo) {
    const state = drag.value
    if (state && state.id !== memo.id) return
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (state?.keyboard) return finish(true)
      const siblings = memos().filter(item => item.date === memo.date)
      drag.value = { id: memo.id, targetDate: memo.date, beforeId: siblings[siblings.findIndex(item => item.id === memo.id) + 1]?.id, keyboard: true, x: 0, y: 0, width: 0 }
      announcement.value = '방향키로 요일과 순서를 선택하고 Enter로 이동하세요. Escape는 취소합니다.'
      return
    }
    if (!state?.keyboard) return
    if (event.key === 'Escape') { event.preventDefault(); return finish() }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const allDays = days()
    let target = allDays.findIndex(day => day.date === state.targetDate)
    let siblings = memos().filter(item => item.date === state.targetDate && item.id !== state.id)
    let position = state.beforeId ? siblings.findIndex(item => item.id === state.beforeId) : siblings.length
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      target = Math.max(0, Math.min(allDays.length - 1, target + (event.key === 'ArrowLeft' ? -1 : 1)))
      state.targetDate = allDays[target]!.date
      siblings = memos().filter(item => item.date === state.targetDate && item.id !== state.id)
      position = Math.min(position, siblings.length)
    } else position = Math.max(0, Math.min(siblings.length, position + (event.key === 'ArrowUp' ? -1 : 1)))
    state.beforeId = siblings[position]?.id
    announcement.value = `${allDays[target]!.weekday}, ${position + 1}번째 위치. Enter로 이동하세요.`
    board.value?.querySelector<HTMLElement>(`[data-column-date="${state.targetDate}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' })
  }

  onBeforeUnmount(() => finish())
  return { drag, announcement, startPointer, keyboardMove, cancelDrag: () => finish() }
}
