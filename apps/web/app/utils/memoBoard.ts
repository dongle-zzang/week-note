import type { WorkMemo } from '../types/work.ts'

// Array order is the board order; changing dates never changes the memo identity or text.
export function moveBoardMemo(memos: WorkMemo[], id: string, date: string, beforeId?: string): WorkMemo[] {
  const memo = memos.find(item => item.id === id)
  if (!memo) return memos
  const result = memos.filter(item => item.id !== id)
  let position = beforeId ? result.findIndex(item => item.id === beforeId && item.date === date) : -1
  if (position < 0) {
    const lastInDay = result.findLastIndex(item => item.date === date)
    position = lastInDay < 0 ? result.length : lastInDay + 1
  }
  result.splice(position, 0, { ...memo, date })
  return result
}
