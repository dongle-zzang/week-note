# 프런트엔드 구조와 구현 관례

## 범위와 흐름

`apps/web/nuxt.config.ts`는 `ssr: false`이며, `app/app.vue`가 단일 화면의 진입점이다. 현재 `pages/` 기반 routing이나 서버 API 호출은 없다. 프로젝트 소개와 설치는 [README](../../README.md)를 참고한다.

`app.vue` → `WeeklyWorkEditor` → 날짜별 메모 카드·편집 모달·보고 모달로 이어진다. `WeeklyWorkEditor`가 주 이동, 메모 상태, drag, 편집과 정리 동작을 조합한다. 데이터는 `useWorkEntries()` 호출에서 생성하는 `ref`에만 있으며 전역 store나 영구 저장 계층은 없다. “AI 정리”는 `organizeMemos()`의 로컬 분류 결과를 보여주는 동작이다.

`apps/web/.env.example`은 향후 연동용 양식이다. 현재 환경 변수 소비 코드나 API client는 없으므로 양식만 보고 API 연결이 있다고 판단하지 않는다.

## 모듈과 작성 방식

- Vue component는 PascalCase 파일명, `<script setup lang="ts">`, 타입을 지정한 `defineProps`/`defineEmits`를 사용한다. 편집기 값 연결은 `defineModel`을 사용한다.
- Vue/Nuxt API, composable, component는 자동 import를 사용한다. 명시적인 앱 import는 `~/` alias를 사용하며, Node에서 직접 실행되는 utility와 테스트는 상대 경로와 `.ts` 확장자를 사용한다.
- `composables/use*.ts`는 화면 상태·브라우저 lifecycle, `utils/`는 날짜·Markdown·분류·이동 등의 재사용 로직, `types/work.ts`는 메모 계약을 담당한다.
- 스타일은 Nuxt config에서 연결한 `app/assets/css/main.css`에 모여 있다. CSS 변수와 루트 `data-theme`로 테마를 적용하며 responsive·reduced motion 규칙이 있다. 변경 시 인접 규칙뿐 아니라 파일 뒤의 override도 확인한다.

## 변경 시 보존할 계약

- 메모 날짜는 `YYYY-MM-DD` 달력 날짜다. `utils/week.ts`는 오늘을 `Asia/Seoul`로 구하고 달력 계산은 UTC로 수행하여 실행 PC의 timezone·DST가 주 경계를 바꾸지 않도록 한다. 날짜 로직은 이 utility를 재사용한다.
- `utils/memoBoard.ts`의 배열 순서가 보드 표시 순서다. 날짜 이동은 `date`와 배열 위치를 바꾸고 `id`, `content`, `createdAt`은 유지한다. `organizeMemos()`는 날짜순으로 정렬하면서 같은 날짜의 배열 순서를 유지한다. 생성 시각 정렬을 다시 추가하면 사용자 재정렬과 보고 결과가 달라진다.
- `utils/projects.ts`는 줄 시작의 프로젝트 태그와 이후 본문을 구분한다. 이메일·코드의 `@`를 태그로 오인하지 않도록 Markdown block 정보를 사용하며, Tiptap이 저장하는 escape도 처리한다. 프로젝트의 원래 식별 값과 표시 이름(`projectLabel`)을 혼동하지 않는다.
- `utils/markdown.ts`가 카드와 편집기 입력의 공통 renderer다. 원시 HTML은 비활성화하고 외부 이미지 문법은 텍스트로 표시한다. `MemoContent`의 `v-html`에는 이 renderer 결과를 전달한다. 편집기는 plain-text 붙여넣기에도 같은 renderer를 사용한다. 임의 clipboard HTML이나 원문을 직접 HTML로 주입하지 않는다.
- 편집기 저장은 `editor.getMarkdown()`을 사용하고 보고서는 `markdownToText()`로 텍스트를 만든다. 저장→재편집→태그 분류→보고 흐름을 함께 고려한다.
- 모달은 native `dialog`와 `Teleport`를 사용한다. `utils/dialog.ts`의 공통 focus 처리, Escape·미저장 변경 확인, 닫은 뒤 focus와 body overflow 복원을 유지한다. clipboard 실패는 보고 모달에서 텍스트 선택으로 대체한다.
- 브라우저 listener, interval, animation frame은 해제 경로를 함께 유지한다. `useTheme`, `useWeekNavigation`, `useMemoDrag`가 실제 참조점이다. drag는 pointer와 키보드를 모두 지원하고, 주 변경 시 취소된다.

관련 테스트와 브라우저 확인 범위는 [검증 문서](testing.md)를 참고한다. 이 설명은 현재 구현의 계약이며 새 기능의 요구사항을 대신하지 않는다.
