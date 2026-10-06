import MarkdownIt from 'markdown-it'

// One renderer for previews and cards. Raw HTML stays text; unsafe links stay inert.
export const markdown = new MarkdownIt({ html: false, breaks: true, linkify: false })
// Notes are text-only: image syntax is shown as text instead of loading remote media.
markdown.disable('image')

export function renderMarkdown(content: string): string {
  return markdown.render(content)
}

export function markdownToText(content: string): string {
  const tokens = markdown.parse(content, {})
  let result = ''
  let listDepth = 0
  let pendingItem = false
  for (const token of tokens) {
    if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') listDepth++
    if (token.type === 'bullet_list_close' || token.type === 'ordered_list_close') listDepth--
    if (token.type === 'list_item_open') pendingItem = true
    if (token.type === 'inline') {
      if (pendingItem) {
        result += `${'  '.repeat(Math.max(0, listDepth - 1))}- `
        pendingItem = false
      }
      result += (token.children ?? []).map(child => {
        if (child.type === 'softbreak' || child.type === 'hardbreak') return '\n'
        return child.type === 'text' || child.type === 'code_inline' ? child.content : ''
      }).join('')
      result += '\n'
    }
    if (token.type === 'fence' || token.type === 'code_block') result += `${token.content}\n`
    if (token.type === 'hr') result += '—\n'
  }
  return result.trim()
}
