# 실행과 검증

명령의 기준은 루트와 `apps/web/package.json`이다. 아래 명령은 루트에서 실행한다. 설치 절차는 [README](../../README.md)에 있다.

| 명령 | 현재 script의 역할 |
| --- | --- |
| `pnpm dev` | 웹 개발 서버 (`nuxt dev --host 127.0.0.1`) |
| `pnpm test` | 웹의 `tests/*.test.ts` 실행 |
| `pnpm typecheck` | `nuxt typecheck` |
| `pnpm build` | `nuxt build` |
| `pnpm preview` | 빌드 결과 미리보기 (`nuxt preview --host 127.0.0.1`) |
| `pnpm generate` | 정적 생성, 결과는 `apps/web/.output/public` |

`postinstall`은 웹에서 `nuxt prepare`를 실행한다. `apps/web/tsconfig.json`은 `.nuxt/`의 생성된 설정을 참조한다. 타입 검사에서 생성 파일이 없다는 오류가 나면 설치·prepare 상태를 확인하고 생성 파일을 직접 고치지 않는다.

## 테스트 범위와 가장 작은 검증

현재 테스트는 Node 내장 `node:test`와 `node:assert/strict`를 사용한다. 웹 test script는 `node --experimental-strip-types --test tests/*.test.ts`이며 Vitest/Jest나 DOM runner는 없다.

utility 하나의 변경은 해당 테스트부터 실행할 수 있다. 예를 들어 날짜 변경은 기존 script의 runner를 그대로 사용하여 다음처럼 파일을 좁힌다. 이는 별도의 package script가 아니다.

```sh
pnpm --filter @week-note/web exec node --experimental-strip-types --test tests/week.test.ts
```

- 날짜·주 경계: `tests/week.test.ts`.
- 프로젝트 태그·Markdown·보고 결과: `tests/projects.test.ts`.
- 메모 이동·재정렬·보고 순서: `tests/memoBoard.test.ts`.

인접 utility까지 영향을 주면 `pnpm test`, Vue/타입 변경이면 `pnpm typecheck`와 관련 수동 확인을 추가한다. 번들·Nuxt 설정 변경이면 `pnpm build`, 정적 제공 변경이면 `pnpm generate`를 선택한다. 모든 작업에서 모든 명령을 실행할 필요는 없다.

## 자동 검증이 다루지 않는 범위

component/DOM integration·e2e 테스트, lint/formatter script, Docker, CI/CD, reverse proxy 또는 실제 hosting 설정은 현재 저장소에서 확인되지 않는다. build script의 존재를 운영 배포 구조로 해석하지 않는다.

UI 변경은 개발 서버에서 관련 동작을 직접 확인한다. 영향에 따라 편집·재편집·붙여넣기와 태그 분류, pointer/키보드 이동 및 취소, 주 이동, 모달 focus·Escape·미저장 확인, 테마·좁은 화면·reduced motion, 보고 복사와 실패 대체 동작을 선택한다. Node utility 테스트만 통과했다고 브라우저 동작까지 검증했다고 보고하지 않는다.
