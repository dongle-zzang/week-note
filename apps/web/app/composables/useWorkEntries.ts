import type { MemoDraft, WorkMemo } from '~/types/work'

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

  return { memos, saveMemo }
}
