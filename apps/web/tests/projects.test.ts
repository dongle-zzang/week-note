import assert from 'node:assert/strict'
import { test } from 'node:test'
import { organizeMemos, parseProjectSections } from '../app/utils/projects.ts'
import { markdownToText, renderMarkdown } from '../app/utils/markdown.ts'
import type { WorkMemo } from '../app/types/work.ts'
const memo = (content: string, date = '2026-10-04', createdAt = 1): WorkMemo => ({ id: String(createdAt), date, content, createdAt })

test('tags start project sections and following lines inherit the project', () => {
  assert.deepEqual(parseProjectSections('태그 없는 업무\n@firewatcher 카메라 개선\n- **컴포넌트** 개선\n@[다른 프로젝트] 문서 작업'), [
    { project: null, content: '태그 없는 업무' },
    { project: 'firewatcher', content: '카메라 개선\n- **컴포넌트** 개선' },
    { project: '다른 프로젝트', content: '문서 작업' },
  ])
  assert.deepEqual(parseProjectSections('- @alpha 작업\n1. @beta 작업'), [{ project: 'alpha', content: '- 작업' }, { project: 'beta', content: '1. 작업' }])
})

test('email addresses and code do not introduce tags, even across lines', () => {
  const source = 'name@example.com\n`@inline text`\n`long span\n@not_a_tag code`\n```md\n@fenced code\n```\n\n    @indented code\n\n@real `preserve code`'
  const parsed = parseProjectSections(source)
  assert.equal(parsed.length, 2)
  assert.equal(parsed[0]!.project, null)
  assert.equal(parsed[1]!.project, 'real')
  assert.equal(parsed[1]!.content, '`preserve code`')
  assert.equal(parseProjectSections('@name@example.com')[0]!.project, null)
})

test('grouped results keep chronological order, raw names, duplicate notes and plain text', () => {
  const report = organizeMemos([
    memo('@firewatcher **컴포넌트** 디자인 개선\n@firewatcher_maintanence 전체적으로 디자인 개선함', '2026-10-04', 3),
    memo('@firewatcher 카메라 페이지 테이블 ui 개선', '2026-10-03', 2),
    memo('회의\n@[별도 프로젝트] - 문서 작성', '2026-10-04', 4),
  ])
  assert.equal(report, '<firewatcher>\n- 카메라 페이지 테이블 ui 개선\n- 컴포넌트 디자인 개선\n\n<firewatcher maintanence>\n- 전체적으로 디자인 개선함\n\n<미분류>\n- 회의\n\n<별도 프로젝트>\n- 문서 작성')
  assert.equal(organizeMemos([memo('@a 일\n@a 일')]), '<a>\n- 일\n- 일')
  assert.equal(organizeMemos([memo('@a_b 일\n@[a b] 일')]).split('<a b>').length, 3)
  assert.equal(organizeMemos([]), '')
})

test('Markdown renders readable formatting while HTML and unsafe links stay inert', () => {
  const rendered = renderMarkdown('**강조**\n<script>alert(1)</script>\n[x](javascript:alert(1))\n![x](https://example.com/image.png)')
  assert.ok(rendered.includes('<strong>강조</strong>'))
  assert.ok(!rendered.includes('<script>'))
  assert.ok(!rendered.includes('href="javascript:'))
  assert.ok(!rendered.includes('<img'))
  assert.equal(markdownToText('# 제목\n\n- **강조**와 `코드`\n- [링크](https://example.com)'), '제목\n- 강조와 코드\n- 링크')
})

test('unmatched backticks do not hide tags in a new paragraph and code delimiters match exactly', () => {
  assert.deepEqual(parseProjectSections('`unclosed\n\n@real task `'), [{ project: null, content: '`unclosed' }, { project: 'real', content: 'task `' }])
  assert.equal(parseProjectSections('``code `\n@not_a_tag code``\n@real task')[1]!.project, 'real')
  assert.equal(organizeMemos([memo('@a 작업\n- 다른 작업')]), '<a>\n- 작업\n- 다른 작업')
})

test('rich editor Markdown escaping preserves project tags without changing code', () => {
  assert.deepEqual(parseProjectSections('@firewatcher\\_maintanence **디자인 개선**\n@\\[운영 프로젝트\\] 문서 작성'), [
    { project: 'firewatcher_maintanence', content: '**디자인 개선**' },
    { project: '운영 프로젝트', content: '문서 작성' },
  ])
  assert.equal(organizeMemos([memo('@firewatcher\\_maintanence **디자인 개선**')]), '<firewatcher maintanence>\n- 디자인 개선')
  assert.equal(parseProjectSections('```\n@firewatcher\\_maintanence 코드\n```')[0]!.project, null)
})
