@AGENTS.md

---

## 함정 노트

### 1. 프로덕션 빌드는 반드시 Webpack (`next build --webpack`)
Next.js 16 + `@opennextjs/cloudflare` 조합에서 Turbopack으로 빌드하면 일부 청크 파일이 `handler.mjs`에 누락된 채 배포된다. CF Workers는 파일 시스템이 없어서 누락된 청크를 런타임에 로드할 수 없고, 해당 페이지에서 `ChunkLoadError → HTTP 500`이 발생한다. `package.json`의 `build` 스크립트는 `next build --webpack`으로 고정한다.

### 2. CF Workers 라우트에 `export const runtime = "edge"` 쓰지 말 것
CF Workers 환경 자체가 이미 edge 런타임이라 이 선언이 불필요하고, Webpack 빌드 시 `@opennextjs/cloudflare` 번들러가 에러를 던져 빌드가 막힌다. 라우트 파일에서 제거하면 된다.

### 3. 빌드 명령은 `npm run pages:build` 단일 소스
GitHub Actions 워크플로우와 로컬 모두 `npm run pages:build`를 사용한다. 워크플로우에서 `npx @opennextjs/cloudflare build`를 직접 호출하면 `package.json`의 빌드 옵션 변경이 CI에 반영되지 않는다.

### 4. `cookies()`·인증을 사용하는 페이지는 반드시 `force-dynamic` 명시
`getAuthState()`나 `createClient()` 등 `cookies()`를 내부적으로 쓰는 페이지·레이아웃에는 반드시 `export const dynamic = 'force-dynamic'`을 추가해야 한다. 없으면 Next.js가 정적 렌더링을 시도하다 "Dynamic server usage" 에러를 던져 HTTP 500이 발생한다. `/p/[slug]`처럼 로그인 여부만 확인하는 퍼블릭 페이지도 예외 없이 적용한다.

### 5. 공개 환경변수는 `wrangler.toml [vars]`에 코드로 고정
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SITE_URL` 같은 공개값은 `wrangler.toml`의 `[vars]` 섹션에 명시한다. CF 대시보드에서 수동 입력한 값은 배포할 때마다 코드 값으로 덮어쓰이므로 대시보드 관리가 무의미해진다. 비밀키(`SUPABASE_SERVICE_ROLE_KEY` 등)는 wrangler secret 또는 대시보드 Secret에 저장하면 배포에 영향받지 않고 영구 유지된다.

---

## 프로덕션 에러 디버깅 패턴

**문제**: CF Workers 프로덕션에서 Server Component 에러는 기본적으로 마스킹되어 브라우저에는 빈 500 화면만 표시된다. 로컬 `next dev`에서는 재현되지 않는 경우가 많다.

**디버그 절차**:
1. 의심 페이지의 함수 본문을 `try-catch`로 감싸고, catch 블록에서 `console.error('[DEBUG-xxx]', JSON.stringify({ errorMessage, errorStack, env: { hasKey: !!process.env.KEY } }))` 후 `throw e`로 재던진다.
2. commit + push → 배포 후 시크릿 창에서 접속.
3. CF 대시보드 → Workers & Pages → 해당 Worker → **Logs** 탭에서 `[DEBUG-xxx]` 로그 확인.
4. 원인 파악 후 디버그 코드 제거, 진짜 픽스 commit.

**주의**: 디버그 `console.error`는 절대 프로덕션에 오래 두지 말 것. 환경변수 존재 여부만 출력하고 값 자체는 찍지 않는다.
