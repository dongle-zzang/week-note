<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { renderMarkdown } from '~/utils/markdown'

const content = defineModel<string>({ required: true })
const isEmpty = ref(!content.value.trim())
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      underline: false,
      link: { openOnClick: false, autolink: false },
    }),
    Markdown,
  ],
  // Use the same safe Markdown renderer as memo cards when reopening saved notes.
  content: renderMarkdown(content.value),
  editorProps: {
    attributes: {
      class: 'inline-markdown markdown-body',
      role: 'textbox',
      'aria-label': '메모 내용',
      'aria-multiline': 'true',
      'aria-describedby': 'tag-guide markdown-guide',
      tabindex: '0',
      spellcheck: 'false',
    },
    handlePaste: (_view, event) => {
      const text = event.clipboardData?.getData('text/plain')
      if (!text || !editor.value || editor.value.isActive('codeBlock') || editor.value.isActive('code')) return false
      // Parse plain Markdown on paste instead of importing arbitrary clipboard HTML.
      editor.value.commands.insertContent(renderMarkdown(text))
      return true
    },
  },
  onCreate: ({ editor }) => {
    isEmpty.value = editor.isEmpty
    editor.commands.focus('end')
  },
  onUpdate: ({ editor }) => {
    isEmpty.value = editor.isEmpty
    content.value = editor.isEmpty ? '' : editor.getMarkdown()
  },
})
</script>

<template>
  <div class="inline-editor-shell" :class="{ 'is-empty': isEmpty }">
    <EditorContent :editor="editor" />
    <p v-if="isEmpty" class="inline-editor-placeholder" aria-hidden="true">@프로젝트명과 오늘 한 일을 적어보세요.</p>
  </div>
</template>
