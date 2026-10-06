import { markdown, markdownToText } from './markdown.ts'
import type { WorkMemo } from '../types/work.ts'

export interface ProjectSection { project: string | null; content: string }

export const projectLabel = (project: string | null) => project === null ? '미분류' : project.replaceAll('_', ' ')

export function parseProjectSections(source: string): ProjectSection[] {
  const normalized = source.replace(/\r\n?/g, '\n')
  const lines = normalized.split('\n')
  const protectedLines = new Set<number>()
  const tokens = markdown.parse(normalized, {})
  for (const token of tokens) {
    if ((token.type === 'fence' || token.type === 'code_block') && token.map) {
      for (let line = token.map[0]; line < token.map[1]; line++) protectedLines.add(line)
    }
  }
  // Restrict inline code spans to their Markdown block, including multiline spans.
  const mask = [...lines]
  for (const token of tokens) {
    if (token.type !== 'inline' || !token.map) continue
    const [start, end] = token.map
    const block = lines.slice(start, end).join('\n')
    const masked = block.replace(/(?<![\\`])(`+)(?!`)([\s\S]*?)(?<!`)\1(?!`)/g, match => match.replace(/[^\n]/g, ' ')).split('\n')
    masked.forEach((line, offset) => { mask[start + offset] = line })
  }
  const sections: ProjectSection[] = []
  let project: string | null = null
  let body: string[] = []
  const flush = () => {
    const content = body.join('\n').replace(/^\n+|\n+$/g, '')
    if (content.trim()) sections.push({ project, content })
    body = []
  }
  const tag = /^( {0,3}(?:(?:[-+*]|\d+[.)])\s+)?)(?:@\\?\[([^\]\n]+?)\\?\]|@((?:[\p{L}\p{N}_-]|\\_)+))(?=\s|$)[ \t]*/u
  lines.forEach((line, index) => {
    const candidate = line.match(tag)
    const match = candidate && !protectedLines.has(index) && mask[index]?.[candidate[1]!.length] === '@' ? candidate : null
    if (match && (match[2] ?? match[3])?.trim()) {
      flush()
      project = markdown.utils.unescapeAll((match[2] ?? match[3])!.trim())
      const remaining = line.slice(match[0].length)
      if (remaining.trim()) body.push(`${match[1]}${remaining}`)
    } else body.push(line)
  })
  flush()
  return sections
}

export function organizeMemos(memos: WorkMemo[]): string {
  const groups = new Map<string | null, string[]>()
  const ordered = [...memos].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt)
  for (const memo of ordered) {
    for (const section of parseProjectSections(memo.content)) {
      const text = markdownToText(section.content)
      if (!text) continue
      const items = groups.get(section.project) ?? []
      // Existing Markdown lists already carry bullets; other blocks become one item.
      items.push(text.startsWith('- ') ? text : `- ${text.split('\n').map((line, index) => index === 0 || /^\s*- /.test(line) ? line : `  ${line}`).join('\n')}`)
      groups.set(section.project, items)
    }
  }
  return [...groups].map(([project, items]) => `<${projectLabel(project)}>\n${items.join('\n')}`).join('\n\n')
}
