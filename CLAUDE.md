@AGENTS.md

---

## 함정 노트

### 1. 프로덕션 빌드는 반드시 Webpack (`next build --webpack`)
Next.js 16 + `@opennextjs/cloudflare` 조합에서 Turbopack으로 빌드하면 일부 청크 파일이 `handler.mjs`에 누락된 채 배포된다. CF Workers는 파일 시스템이 없어서 누락된 청크를 런타임에 로드할 수 없고, 해당 페이지에서 `ChunkLoadError → HTTP 500`이 발생한다. `package.json`의 `build` 스크립트는 `next build --webpack`으로 고정한다.

### 2. CF Workers 라우트에 `export const runtime = "edge"` 쓰지 말 것
CF Workers 환경 자체가 이미 edge 런타임이라 이 선언이 불필요하고, Webpack 빌드 시 `@opennextjs/cloudflare` 번들러가 에러를 던져 빌드가 막힌다. 라우트 파일에서 제거하면 된다.

### 3. 빌드 명령은 `npm run pages:build` 단일 소스
GitHub Actions 워크플로우와 로컬 모두 `npm run pages:build`를 사용한다. 워크플로우에서 `npx @opennextjs/cloudflare build`를 직접 호출하면 `package.json`의 빌드 옵션 변경이 CI에 반영되지 않는다.
