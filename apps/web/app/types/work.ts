export interface WorkMemo {
  id: string
  date: string
  content: string
  createdAt: number
}

export type MemoDraft = Pick<WorkMemo, 'date' | 'content'>
