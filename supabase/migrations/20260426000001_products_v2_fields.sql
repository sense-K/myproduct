-- =============================================================================
-- products 테이블 v2 필드 추가 (폼 재설계)
-- 실행: Supabase 대시보드 → SQL Editor에 붙여넣기 후 Run
-- 기존 데이터 영향 없음 (모두 nullable로 추가)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Tier 2 — 가치 정의 3축 (폼에서 필수 검증, DB는 nullable)
-- -----------------------------------------------------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS target_audience  TEXT,
  ADD COLUMN IF NOT EXISTS problem_statement TEXT,
  ADD COLUMN IF NOT EXISTS solution_approach TEXT;

-- -----------------------------------------------------------------------------
-- 2. Tier 3 — 선택 항목
-- -----------------------------------------------------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS differentiator      TEXT,
  ADD COLUMN IF NOT EXISTS product_stage       TEXT CHECK (product_stage IN (
    'idea', 'prototype', 'beta', 'launched'
  )),
  ADD COLUMN IF NOT EXISTS pricing_model       TEXT CHECK (pricing_model IN (
    'free', 'freemium', 'paid', 'tbd'
  )),
  ADD COLUMN IF NOT EXISTS feedback_categories TEXT[],
  ADD COLUMN IF NOT EXISTS maker_note          TEXT;

-- -----------------------------------------------------------------------------
-- 3. 시각 자료 (thumbnail_url은 기존 존재 → 추가 불필요)
-- -----------------------------------------------------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS screenshot_urls TEXT[],
  ADD COLUMN IF NOT EXISTS demo_video_url  TEXT;

-- -----------------------------------------------------------------------------
-- 4. Storage 버킷 RLS 정책 (product-images 버킷)
-- 버킷 생성은 scripts/setup-storage.mjs 스크립트로 수행
-- 경로 구조: products/{slug}/thumbnail.{ext}
--            products/{slug}/screenshot-{n}.{ext}
-- -----------------------------------------------------------------------------

-- 공개 읽기 (썸네일/스크린샷 공개 접근)
CREATE POLICY IF NOT EXISTS "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- 업로드: 서버 사이드 전용 (service_role 사용) → 별도 정책 없음
-- 삭제: 서버 사이드 전용 → 별도 정책 없음

-- =============================================================================
-- 검증 쿼리 (실행 후 아래로 확인)
-- =============================================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'products'
  AND column_name  IN (
    'target_audience', 'problem_statement', 'solution_approach',
    'differentiator', 'product_stage', 'pricing_model',
    'feedback_categories', 'maker_note',
    'screenshot_urls', 'demo_video_url'
  )
ORDER BY column_name;
