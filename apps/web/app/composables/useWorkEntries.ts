import type { MemoDraft, WorkMemo } from '~/types/work'
import { moveBoardMemo } from '~/utils/memoBoard'

export function useWorkEntries() {
  const memos = ref<WorkMemo[]>([])

  function saveMemo(draft: MemoDraft, id?: string) {
    const existing = id ? memos.value.find(memo => memo.id === id) : undefined
    if (existing) {
      existing.date = draft.date
      existing.content = draft.content
    } else {
      memos.value.push({ ...draft, id: crypto.randomUUID(), createdAt: Date.now() })
    }
  }

  function moveMemo(id: string, date: string, beforeId?: string) {
    memos.value = moveBoardMemo(memos.value, id, date, beforeId)
  }

  return { memos, saveMemo, moveMemo }
}
