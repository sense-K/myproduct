-- ─── 카테고리 8개 마이그레이션 DDL ───────────────────────────────────────────
-- 실행 순서:
--   Step A (코드 푸시 전): 이 파일 전체 SQL Editor에서 실행
--   Step B (데이터 UPDATE 후): 새 CHECK 제약 추가 (아래 두 번째 블록)

-- ══ Step A: 기존 CHECK 제약 제거 (데이터 UPDATE 허용) ════════════════════════

ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_category_check;

-- 실행 후 클로드 코드에 "제약 제거 완료" 신호 보내주세요.
-- 그러면 scripts/migrate-categories.mjs 로 데이터 자동 UPDATE 진행합니다.

-- ══ Step B: 새 CHECK 제약 추가 (데이터 UPDATE 완료 후) ══════════════════════

-- ALTER TABLE products
-- ADD CONSTRAINT products_category_check
-- CHECK (category IN (
--   'dev_tools', 'productivity', 'ai_data', 'community_content',
--   'learning', 'lifestyle', 'finance_commerce', 'etc'
-- ));

-- 검증 쿼리 (새 제약 추가 후 실행):
-- SELECT category, COUNT(*) FROM products GROUP BY category ORDER BY category;
-- → 8개 값 이외의 카테고리가 없어야 정상
