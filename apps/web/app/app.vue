<script setup lang="ts">
const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">업무 기록으로 이동</a>
    <aside class="app-sidebar" aria-label="워크스페이스">
      <div class="brand" aria-label="weeknote">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M6 3h12v18H6zM10 8h4m-4 4h4m-4 4h2" /></svg>
        </span>
        <span>weeknote<span class="brand-dot">.</span></span>
      </div>
      <div class="workspace-label">PERSONAL WORKSPACE</div>
      <nav class="sidebar-nav" aria-label="주 메뉴">
        <a href="#main-content" class="sidebar-link" aria-current="page">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
          주간 업무 기록
        </a>
      </nav>
      <div class="sidebar-bottom">
        <span class="workspace-avatar" aria-hidden="true">W</span>
        <div><strong>나의 워크스페이스</strong><span>개인 업무 노트</span></div>
      </div>
    </aside>
    <div class="dashboard-body">
      <header class="app-header">
        <div class="breadcrumb"><span>워크스페이스</span><span aria-hidden="true">/</span><strong>주간 기록</strong></div>
        <button class="theme-toggle" type="button" :aria-label="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'" :aria-pressed="isDark" @click="toggleTheme">
          <svg v-if="isDark" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z"/></svg>
          <span>{{ isDark ? '라이트 모드' : '다크 모드' }}</span>
        </button>
      </header>
      <main id="main-content" class="main-content">
        <div class="page-intro">
          <div class="page-heading">
            <span class="eyebrow">WEEKLY WORK LOG</span>
            <h1>주간 업무 기록<span class="title-dot" aria-hidden="true" /></h1>
            <p>오늘 한 일을 가볍게 남겨두세요. 한 주를 돌아보는 일이 쉬워집니다.</p>
          </div>
          <span class="personal-badge"><span aria-hidden="true" /> 나만의 업무 노트</span>
        </div>
        <WeeklyWorkEditor />
        <footer class="app-footer"><span>weeknote.</span><span>하루의 기록, 한 주의 흐름.</span></footer>
      </main>
    </div>
  </div>
</template>
