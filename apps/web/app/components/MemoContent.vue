<script setup lang="ts">
import { parseProjectSections, projectLabel } from '~/utils/projects'
import { renderMarkdown } from '~/utils/markdown'
const props = defineProps<{ content: string }>()
const sections = computed(() => parseProjectSections(props.content))
</script>

<template>
  <div class="memo-content">
    <section v-for="(section, index) in sections" :key="index" class="project-section">
      <span class="project-tag">{{ section.project === null ? '미분류' : `@${projectLabel(section.project)}` }}</span>
      <div class="markdown-body" v-html="renderMarkdown(section.content)" />
    </section>
  </div>
</template>
