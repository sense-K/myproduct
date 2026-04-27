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

### 5. middleware matcher에는 SEO 라우트 제외 패턴 유지
`sitemap.*`, `robots.*`, `*.xml`은 matcher에서 반드시 제외한다. SEO 크롤러 라우트가 세션 처리를 타면 응답에 script 요소가 침입할 수 있다.

### 6. 공개 환경변수는 `wrangler.toml [vars]`에 코드로 고정
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SITE_URL` 같은 공개값은 `wrangler.toml`의 `[vars]` 섹션에 명시한다. CF 대시보드에서 수동 입력한 값은 배포할 때마다 코드 값으로 덮어쓰이므로 대시보드 관리가 무의미해진다. 비밀키(`SUPABASE_SERVICE_ROLE_KEY` 등)는 wrangler secret 또는 대시보드 Secret에 저장하면 배포에 영향받지 않고 영구 유지된다.

### 7. Storage URL 역추출 시 `.supabase.co` 도메인 검증 필수
`extractStoragePath(url)` 같은 함수에서 public URL → Storage 경로를 추출할 때 반드시 `url.hostname.endsWith('.supabase.co')` 검증을 추가해야 한다. 안 하면 외부 도메인 URL이 들어왔을 때 엉뚱한 경로를 반환해 다른 파일을 삭제할 수 있다. 쿼리 스트링(`?t=xxx`)도 `URL.pathname`으로 파싱해서 자동 제거한다.

### 8. 카드 컴포넌트 신규 추가 시 SELECT·타입·매퍼 3종 세트 동시 수정
카드 컴포넌트에 새 필드(예: `thumbnailUrl`)를 추가할 때 다음 3곳을 빠뜨리면 항상 fallback만 표시된다: ① DB SELECT 쿼리에 컬럼 추가, ② TypeScript 타입(`HomeProduct`, `FeedProduct` 등)에 필드 추가, ③ 매퍼 함수(`.map(p => ...)`)에서 값 할당. 세 곳 중 하나라도 빠지면 카드는 기본값으로만 렌더링된다.

### 9. `products` 삭제 시 `credits` / `notifications` FK 먼저 NULL 처리
`credits.related_product_id`와 `notifications.related_product_id`는 `REFERENCES products(id)` 선언에 `ON DELETE` 절이 없어 기본값 RESTRICT다. `deleteProduct()` 호출 전 두 컬럼을 NULL로 업데이트하지 않으면 `23503` FK 위반 에러로 DELETE가 차단된다. 크레딧 이력은 보존하되 FK만 해제.

### 10. 모달에서 Server Action 에러 시 모달 닫지 말 것
삭제/수정 모달에서 Server Action이 `{ ok: false, error }` 를 반환했을 때 `setModal("none")`을 무조건 실행하면 에러 메시지가 사라져 사용자는 "성공한 것처럼" 보인다. 에러 시에는 `return` 으로 일찍 종료해 모달을 유지하고, 성공 시에만 닫는다.

---

## 프로덕션 에러 디버깅 패턴

**문제**: CF Workers 프로덕션에서 Server Component 에러는 기본적으로 마스킹되어 브라우저에는 빈 500 화면만 표시된다. 로컬 `next dev`에서는 재현되지 않는 경우가 많다.

**디버그 절차**:
1. 의심 페이지의 함수 본문을 `try-catch`로 감싸고, catch 블록에서 `console.error('[DEBUG-xxx]', JSON.stringify({ errorMessage, errorStack, env: { hasKey: !!process.env.KEY } }))` 후 `throw e`로 재던진다.
2. commit + push → 배포 후 시크릿 창에서 접속.
3. CF 대시보드 → Workers & Pages → 해당 Worker → **Logs** 탭에서 `[DEBUG-xxx]` 로그 확인.
4. 원인 파악 후 디버그 코드 제거, 진짜 픽스 commit.

**주의**: 디버그 `console.error`는 절대 프로덕션에 오래 두지 말 것. 환경변수 존재 여부만 출력하고 값 자체는 찍지 않는다.

---

## 다음 세션 작업 큐

우선순위 순서. 각 항목은 독립적으로 작업 가능.

### A. 새 제품 등록 (운영 액션)
- 새 제품(또는 언더커버 재등록)에 v2 필드 직접 채우기
- 운영자 등록권 잔액: 현재 2개

### B. 상세 페이지(/p/[slug]) v2 필드 렌더링
- `target_audience`, `problem_statement`, `solution_approach` 섹션 추가
- `product_stage`, `pricing_model`, `feedback_categories` 배지 표시
- `maker_note` 인용문 스타일 렌더링
- 스크린샷 갤러리, 데모 영상 임베드/링크
- 기존 제품(v2 필드 없는)은 해당 섹션 자체를 렌더링하지 않음

### C. 메이커 자기 제품 삭제 시 등록권 환불 정책 결정 + 구현
- 제품 삭제 시 등록권 환불 여부 → 형이 결정 후 구현
- 현재: 삭제해도 크레딧 잔액 변화 없음

### D. 등록 폼 SPA 사이트 AI 추출 개선
- 메타 태그 없는 SPA 사이트에서 더 많은 정보 추출
- 현재: ≤2개 필드 채워지면 경고 화면 노출

### E. prefers-reduced-motion 사이트 전체 점검
- HeroSlideshow 외 다른 모션(애니메이션, 트랜지션) 있는 컴포넌트 확인
- 첫 적용: HeroSlideshow (2026-04-27)

### F. 고아 파일 정리 (Storage, 우선순위 낮음)
- 등록 취소된 제품의 임시 업로드 파일 정리
- 경로: `products/tmp/{uploadId}/`

---

## 2026-04-27 세션 작업 내역

- **HeroSection 재설계**: 좌/우 2분할(lg:grid-cols-2), 우측 자동/수동 전환 슬라이드 3개
- **슬라이드 콘텐츠**: 헤드라인 + 서브헤드 + 디테일 3개 구조 (피드백/안전/발견)
- **prefers-reduced-motion**: 사이트 전체 첫 적용 (HeroSlideshow)
- **카테고리 8개 정비**: dev_tools/productivity/ai_data/community_content/learning/lifestyle/finance_commerce/etc
- **테스트 데이터 삭제**: 9d8214, af05e3 완전 삭제 (credits B안 처리)
- **AI 자동 채움 재활성화**: Anthropic 결제 해결, 에러 로깅 강화, URL 정규화
- **edit 페이지 구현**: /me/products/[slug]/edit (5단계 폼, 소유권 이중 체크)

---

## 알려진 이슈

- **기존 제품 v2 필드 비어있음**: DB nullable이라 렌더링 문제없지만, 초기 제품은 `target_audience` 등이 null. B 작업 시 조건부 렌더링으로 처리.

- **AI 자동 채움 SPA 한계**: `≤2`개 필드만 채워지면 경고 화면 노출. 추가 개선 필요 (D 항목).

- **운영자 등록권 잔액**: `scripts/` 폴더의 디버그 스크립트로 확인 가능. 또는 Supabase 대시보드 → credits 테이블.
