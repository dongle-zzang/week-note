export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'weeknote · 주간 업무 기록',
      htmlAttrs: { lang: 'ko' },
      meta: [
        { name: 'description', content: '매일의 업무를 간단하게 기록하는 나만의 주간 업무 노트.' },
        { name: 'theme-color', content: '#f7f8fa' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
})
