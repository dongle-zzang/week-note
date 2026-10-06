import assert from 'node:assert/strict'
import { test } from 'node:test'
import { moveBoardMemo } from '../app/utils/memoBoard.ts'
import { organizeMemos } from '../app/utils/projects.ts'
import type { WorkMemo } from '../app/types/work.ts'
const notes: WorkMemo[] = [
  { id: 'a', date: '2026-10-05', content: '@work **첫 메모**', createdAt: 1 },
  { id: 'b', date: '2026-10-05', content: '@work 두 번째', createdAt: 2 },
  { id: 'c', date: '2026-10-06', content: '@work 세 번째', createdAt: 3 },
]
test('moving across days preserves identity, content, creation time and other notes', () => {
  const moved = moveBoardMemo(notes, 'a', '2026-10-06', 'c')
  assert.deepEqual(moved.map(note => note.id), ['b', 'a', 'c'])
  assert.deepEqual(moved[1], { ...notes[0], date: '2026-10-06' })
  assert.equal(notes[0]!.date, '2026-10-05')
  assert.equal(new Set(moved.map(note => note.id)).size, notes.length)
})
test('same-day reorder, append and empty-day drop use the displayed board order', () => {
  const reordered = moveBoardMemo(notes, 'b', '2026-10-05', 'a')
  assert.deepEqual(reordered.map(note => note.id), ['b', 'a', 'c'])
  assert.equal(organizeMemos(reordered), '<work>\n- 두 번째\n- 첫 메모\n- 세 번째')
  assert.deepEqual(moveBoardMemo(notes, 'a', '2026-10-06').map(note => note.id), ['b', 'c', 'a'])
  assert.equal(moveBoardMemo(notes, 'a', '2026-10-07').at(-1)!.date, '2026-10-07')
  assert.equal(moveBoardMemo(notes, 'missing', '2026-10-07'), notes)
})
