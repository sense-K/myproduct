-- =============================================================================
-- RLS 정책 (PRD 섹션 8.4)
-- auth.uid() = public.users.id 라는 전제 (앱 가입 시 id를 auth.users.id로 맞춰 삽입)
-- 서버 사이드 작업은 service_role 키로 수행하면 RLS를 우회합니다.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 모든 테이블 RLS 활성화
-- -----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE registry_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- users (PRD 8.4.7)
-- 칼럼 단위 프라이버시(예: email 숨김)는 앱 레벨에서 공개 뷰로 필터링할 것.
-- -----------------------------------------------------------------------------
CREATE POLICY "users_select_active" ON users
  FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "users_insert_self" ON users
  FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_self" ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- -----------------------------------------------------------------------------
-- products (PRD 8.4.1)
-- -----------------------------------------------------------------------------
CREATE POLICY "products_select_public_or_owner" ON products
  FOR SELECT
  USING (status = 'public' OR owner_id = auth.uid());

CREATE POLICY "products_insert_owner" ON products
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "products_update_owner" ON products
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "products_delete_owner" ON products
  FOR DELETE
  USING (owner_id = auth.uid());

-- -----------------------------------------------------------------------------
-- product_versions
-- SELECT: 상위 product의 공개 여부 / 소유권 승계
-- INSERT: 해당 product의 소유자만
-- UPDATE/DELETE: 불변 (정책 없음)
-- -----------------------------------------------------------------------------
CREATE POLICY "versions_select_via_parent" ON product_versions
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = product_versions.product_id
      AND (p.status = 'public' OR p.owner_id = auth.uid())
  ));

CREATE POLICY "versions_insert_owner" ON product_versions
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = product_versions.product_id
      AND p.owner_id = auth.uid()
  ));

-- -----------------------------------------------------------------------------
-- feedbacks (PRD 8.4.2)
-- SELECT: 리뷰어 본인 또는 해당 제품 소유자
-- INSERT: 리뷰어 본인 (reviewer_id=auth.uid() 강제)
-- UPDATE/DELETE: 제출 후 불변 (정책 없음)
-- -----------------------------------------------------------------------------
CREATE POLICY "feedbacks_select_reviewer_or_product_owner" ON feedbacks
  FOR SELECT
  USING (
    reviewer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = feedbacks.product_id
        AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "feedbacks_insert_reviewer" ON feedbacks
  FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());

-- -----------------------------------------------------------------------------
-- feedback_answers (PRD 8.4.3) — 상위 feedbacks RLS 계승
-- -----------------------------------------------------------------------------
CREATE POLICY "answers_select_via_parent" ON feedback_answers
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM feedbacks f
    WHERE f.id = feedback_answers.feedback_id
      AND (
        f.reviewer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM products p
          WHERE p.id = f.product_id AND p.owner_id = auth.uid()
        )
      )
  ));

CREATE POLICY "answers_insert_via_parent" ON feedback_answers
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM feedbacks f
    WHERE f.id = feedback_answers.feedback_id
      AND f.reviewer_id = auth.uid()
  ));

-- -----------------------------------------------------------------------------
-- credits (PRD 8.4.4)
-- SELECT: 본인 것만, CUD는 서버(service_role)만 (정책 없음 = 막힘)
-- -----------------------------------------------------------------------------
CREATE POLICY "credits_select_own" ON credits
  FOR SELECT
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- certificates (PRD 8.4.5)
-- SELECT: 누구나 (공개 증명서)
-- CUD: 서버 사이드만 (정책 없음)
-- -----------------------------------------------------------------------------
CREATE POLICY "certificates_select_all" ON certificates
  FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- registry_entries (PRD 8.4.5)
-- SELECT: is_visible=true인 행만
-- -----------------------------------------------------------------------------
CREATE POLICY "registry_select_visible" ON registry_entries
  FOR SELECT
  USING (is_visible = true);

-- -----------------------------------------------------------------------------
-- product_views
-- INSERT: 누구나 (익명 트래킹용) — 트리거가 제품 존재를 FK로 강제
-- SELECT: 해당 제품 소유자만
-- -----------------------------------------------------------------------------
CREATE POLICY "views_insert_any" ON product_views
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "views_select_owner" ON product_views
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = product_views.product_id AND p.owner_id = auth.uid()
  ));

-- -----------------------------------------------------------------------------
-- product_clicks (product_views와 동일 정책)
-- -----------------------------------------------------------------------------
CREATE POLICY "clicks_insert_any" ON product_clicks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "clicks_select_owner" ON product_clicks
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = product_clicks.product_id AND p.owner_id = auth.uid()
  ));

-- -----------------------------------------------------------------------------
-- notifications (PRD 8.4.6)
-- 본인 수신 건만 조회. 발송/삭제는 서버(service_role) 전용.
-- -----------------------------------------------------------------------------
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT
  USING (recipient_user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- newsletter_subscriptions (PRD 8.4.6)
-- 본인 것만 접근 (SELECT/INSERT/UPDATE)
-- -----------------------------------------------------------------------------
CREATE POLICY "newsletter_select_own" ON newsletter_subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "newsletter_insert_own" ON newsletter_subscriptions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "newsletter_update_own" ON newsletter_subscriptions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
