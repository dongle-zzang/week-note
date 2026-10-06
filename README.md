# weeknote

매일 업무를 자유롭게 메모하는 개인용 Nuxt 프런트엔드입니다.

## 실행

Node.js 22.12 이상(24 LTS 권장), pnpm 11.19.0을 사용합니다.

```sh
pnpm install
pnpm dev
```

브라우저에서 http://127.0.0.1:3000 을 엽니다.

```sh
pnpm typecheck  # Vue / TypeScript 검사
pnpm test       # 날짜 계산, 태그 분류와 Markdown 검사
pnpm build      # 프로덕션 빌드
pnpm preview    # 빌드 미리보기
pnpm generate   # CSR 정적 파일 생성: apps/web/.output/public
```

## Git으로 다른 컴퓨터에서 이어서 작업하기

원격 저장소를 연결하고 최초 코드를 업로드한 뒤, 다른 컴퓨터에서는 다음 순서로 실행합니다. `<저장소-주소>`는 실제 원격 Git 주소로 바꿉니다.

```sh
git clone <저장소-주소> week-note
cd week-note
cp apps/web/.env.example apps/web/.env
pnpm install --frozen-lockfile
pnpm dev
```

현재 앱은 환경 설정 없이도 실행됩니다. `.env.example`의 항목은 향후 서버 연결을 위한 예시이며, 아직 코드에서 사용하지 않습니다.

작업을 시작할 때 `git pull --ff-only`로 최신 코드를 받고, 완료 후 변경 파일을 확인하여 커밋하고 업로드합니다.

```sh
git status
git add <변경한-파일>
git diff --cached
git commit -m "변경 내용 설명"
git push
```

의존성 관리는 pnpm을 사용하며 `pnpm-lock.yaml`을 함께 커밋합니다. 각 컴퓨터의 환경 설정은 별도로 준비해야 합니다.

## 민감한 설정 관리

- 실제 서버 IP, 사내 URL, API 키와 비밀번호는 `apps/web/.env` 또는 루트의 `local/` 폴더에 보관합니다. 이 파일과 폴더는 Git에서 제외됩니다.
- `.env.example`은 Git에 포함되는 설정 양식이므로 실제 값을 넣지 않습니다. 서버 연결 구현 시 환경 변수를 읽도록 연결해야 합니다.
- `.gitignore`는 파일을 제외하는 규칙입니다. 소스 코드나 README에 직접 적은 서버 주소와 비밀값은 보호하지 못합니다.
- 환경 설정, 인증서·개인 키, 로컬 DB, 의존성·빌드 결과·캐시는 기본적으로 제외합니다. 공개 전에는 `git diff --cached`로 업로드할 내용을 확인합니다.
- 이미 커밋한 파일은 `.gitignore`만으로 제외되지 않습니다. 추적을 해제해야 하며, 이전 커밋에는 내용이 남습니다. 비밀값을 올렸다면 해당 값을 교체하고 필요에 따라 Git 이력도 정리합니다.
- 현재 앱은 브라우저에서 실행됩니다. 향후 브라우저에 전달하는 설정이나 요청 URL은 사용자에게 보이므로, API 비밀키는 별도 서버에서 사용해야 합니다. 공개 저장소 제외와 실행 중 비밀 보호는 각각 관리해야 합니다.

## 화면과 동작

- 빈 주간 보드에서 `+ 메모 추가`로 기록을 시작합니다. 예시 데이터는 자동 생성하지 않습니다.
- 날짜는 한국 시간 기준이며, 이번 주는 오늘·다른 주는 월요일이 기본 선택됩니다.
- 작성 모달에서 날짜와 내용을 입력하면 같은 입력 영역에서 Markdown 서식이 바로 적용됩니다. `# `는 제목, `- `는 목록, `**내용**`은 굵은 글씨로 변환됩니다. 별도 미리보기는 없습니다. 카드는 날짜순, 같은 날짜에서는 추가 순서로 쌓이며 수정할 수 있습니다.
- 줄 시작의 `@프로젝트명` 또는 `@[프로젝트 이름]`이 다음 태그까지 이어지는 내용을 분류합니다. 태그 이전 내용은 미분류이며 이메일·코드 안의 @는 태그로 해석하지 않습니다.
- `AI 정리`는 선택 주의 메모를 프로젝트별로 묶은 **임시 결과**를 보여줍니다. 문장 개선이나 실제 AI 호출은 하지 않습니다. `전체 복사`로 일반 텍스트 결과를 복사합니다.
- 주 이동 중에는 메모가 유지되며 새로고침하면 초기화됩니다. Backend·API·DB·인증·localStorage는 없습니다.
- 라이트/다크 테마, 요일별 카드 색상, 최대 3열 보드와 모바일 단일 목록을 지원합니다. 카드 일러스트는 제거했습니다.
- 모달은 키보드 포커스와 Escape 닫기를 지원합니다. 시스템의 동작 줄이기 설정에서는 전환 애니메이션을 끕니다.

Nuxt 4.5.2 / Vue 3 / Composition API / TypeScript / `ssr: false`를 사용합니다. Markdown은 markdown-it으로 렌더링하며 원시 HTML과 위험한 링크를 실행하지 않습니다. 외부 이미지 문법은 텍스트로 표시합니다.

## 주요 구성과 Backend 연결 지점

- `apps/web/app/components/WeeklyWorkEditor.vue`: 주별 메모 조회, 작성 모달과 정리 실행을 연결합니다. 실제 AI 연동은 `organize()`를 교체합니다.
- `apps/web/app/components/MemoEditorModal.vue`: 날짜와 Markdown으로 직렬화한 내용을 `{ date, content }`로 전달합니다. 기존 메모 수정 시 ID도 전달합니다.
- `apps/web/app/components/MemoCard.vue`, `MemoContent.vue`: 카드와 Markdown 본문 표시입니다.
- `apps/web/app/components/InlineMarkdownEditor.vue`: Tiptap 기반 인라인 편집기이며 Markdown 입력 변환·붙여넣기·실행 취소를 지원합니다.
- `apps/web/app/components/ReportModal.vue`: 정리 결과 확인·일반 텍스트 전체 복사입니다.
- `apps/web/app/composables/useWorkEntries.ts`: 현재 Vue 메모리 배열과 `saveMemo()`에 향후 조회·저장 API를 연결합니다.
- `apps/web/app/types/work.ts`: 메모 최소 타입 `{ id, date, content, createdAt }`입니다. 프로젝트 태그는 원문에서 계산합니다.
- `apps/web/app/utils/projects.ts`: 태그 해석과 임시 프로젝트별 정리를 분리했습니다.
- `apps/web/app/utils/markdown.ts`: 미리보기·카드의 공통 Markdown 렌더링과 일반 텍스트 변환입니다.
- `apps/web/tests/`: 한국 날짜 계산, 태그 분류, 정리 순서와 Markdown 처리 테스트입니다.

루트 workspace의 `apps/*` 구조에 맞춰 추후 `apps/api`를 추가할 수 있습니다.
