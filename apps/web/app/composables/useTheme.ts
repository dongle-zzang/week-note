export function useTheme() {
  const theme = ref<'light' | 'dark'>('light')
  const isDark = computed(() => theme.value === 'dark')
  let manuallySelected = false
  let preference: MediaQueryList | undefined

  function syncSystemTheme() {
    if (!manuallySelected) theme.value = preference?.matches ? 'dark' : 'light'
  }

  function toggleTheme() {
    manuallySelected = true
    theme.value = isDark.value ? 'light' : 'dark'
  }

  onMounted(() => {
    preference = window.matchMedia('(prefers-color-scheme: dark)')
    syncSystemTheme()
    preference.addEventListener('change', syncSystemTheme)
  })
  onUnmounted(() => preference?.removeEventListener('change', syncSystemTheme))

  useHead(() => ({
    htmlAttrs: { 'data-theme': theme.value },
    meta: [{ name: 'theme-color', content: isDark.value ? '#151923' : '#f7f8fa' }],
  }))

  return { isDark, toggleTheme }
}
