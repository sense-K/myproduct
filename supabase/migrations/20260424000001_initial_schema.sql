-- =============================================================================
-- 마이프로덕트 초기 스키마 (PRD 섹션 8.1 ~ 8.2)
-- 12개 테이블 + 인덱스
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. users  (PRD 8.2.1)
--   * id는 auth.users.id와 동일한 UUID여야 함 (앱에서 가입 시 id를 명시 주입)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  auth_provider TEXT NOT NULL CHECK (auth_provider IN ('google', 'magic_link')),
  nickname TEXT NOT NULL DEFAULT '익명 메이커',
  career_tag TEXT NOT NULL CHECK (career_tag IN (
    'pre_founder', 'under_1y', '1_to_3y', '3_to_5y', 'over_5y'
  )),
  google_profile_image_url TEXT,
  interested_categories TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 2. products  (PRD 8.2.2)
-- -----------------------------------------------------------------------------
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  maker_quote TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'saas', 'mobile_app', 'webtoon_creative', 'quirky', 'etc'
  )),
  thumbnail_url TEXT,
  external_url TEXT,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('url', 'manual')),
  status TEXT NOT NULL DEFAULT 'public' CHECK (status IN (
    'public', 'private', 'deleted'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  view_count INT NOT NULL DEFAULT 0,
  click_count INT NOT NULL DEFAULT 0,
  feedback_count INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_owner ON products(owner_id);
CREATE INDEX idx_products_category_status ON products(category, status) WHERE status = 'public';
CREATE INDEX idx_products_created ON products(created_at DESC) WHERE status = 'public';

-- -----------------------------------------------------------------------------
-- 3. product_versions  (PRD 8.2.3)
-- -----------------------------------------------------------------------------
CREATE TABLE product_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL,
  change_note TEXT,
  new_thumbnail_url TEXT,
  new_external_url TEXT,
  content_hash TEXT NOT NULL,
  is_initial BOOLEAN NOT NULL DEFAULT FALSE,
  version_number INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, version_number)
);

CREATE INDEX idx_versions_product ON product_versions(product_id, version_number DESC);

-- -----------------------------------------------------------------------------
-- 4. feedbacks  (PRD 8.2.4)
--   * 한 버전당 한 리뷰어는 1회만 피드백
-- -----------------------------------------------------------------------------
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_version_id UUID NOT NULL REFERENCES product_versions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewer_career_tag_snapshot TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ NOT NULL,
  total_writing_seconds INT,
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (product_version_id, reviewer_id)
);

CREATE INDEX idx_feedbacks_product ON feedbacks(product_id);
CREATE INDEX idx_feedbacks_reviewer ON feedbacks(reviewer_id);
CREATE INDEX idx_feedbacks_submitted ON feedbacks(submitted_at DESC);

-- -----------------------------------------------------------------------------
-- 5. feedback_answers  (PRD 8.2.5)
-- -----------------------------------------------------------------------------
CREATE TABLE feedback_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedbacks(id) ON DELETE CASCADE,
  question_number SMALLINT NOT NULL CHECK (question_number BETWEEN 1 AND 10),
  answer_text TEXT,
  answer_choice TEXT,
  answer_scale SMALLINT,
  UNIQUE (feedback_id, question_number)
);

CREATE INDEX idx_answers_feedback ON feedback_answers(feedback_id);

-- -----------------------------------------------------------------------------
-- 6. credits  (PRD 8.2.6)
-- -----------------------------------------------------------------------------
CREATE TABLE credits (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'earned_from_feedback', 'spent_on_submission', 'admin_grant', 'admin_revoke'
  )),
  amount INT NOT NULL,
  related_feedback_id UUID REFERENCES feedbacks(id),
  related_product_id UUID REFERENCES products(id),
  balance_after INT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credits_user_created ON credits(user_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 7. certificates  (PRD 8.2.7)
--   * product가 hard delete돼도 증명서 snapshot은 유지 → ON DELETE SET NULL
-- -----------------------------------------------------------------------------
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  registration_number TEXT NOT NULL UNIQUE,
  content_hash TEXT NOT NULL,
  product_name_snapshot TEXT NOT NULL,
  tagline_snapshot TEXT NOT NULL,
  category_snapshot TEXT NOT NULL,
  nickname_snapshot TEXT NOT NULL,
  career_tag_snapshot TEXT NOT NULL,
  pdf_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cert_regnum ON certificates(registration_number);
CREATE INDEX idx_cert_product ON certificates(product_id);

-- -----------------------------------------------------------------------------
-- 8. registry_entries  (PRD 8.2.8)
-- -----------------------------------------------------------------------------
CREATE TABLE registry_entries (
  id BIGSERIAL PRIMARY KEY,
  certificate_id UUID NOT NULL UNIQUE REFERENCES certificates(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL UNIQUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_registry_visible ON registry_entries(is_visible, created_at DESC);

-- -----------------------------------------------------------------------------
-- 9. product_views  (PRD 8.2.9)
-- -----------------------------------------------------------------------------
CREATE TABLE product_views (
  id BIGSERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewer_user_id UUID REFERENCES users(id),
  viewer_fingerprint TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

CREATE INDEX idx_views_product_time ON product_views(product_id, viewed_at DESC);
CREATE INDEX idx_views_fingerprint_product ON product_views(viewer_fingerprint, product_id, viewed_at);

-- -----------------------------------------------------------------------------
-- 10. product_clicks  (PRD 8.2.10)
-- -----------------------------------------------------------------------------
CREATE TABLE product_clicks (
  id BIGSERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  clicker_user_id UUID REFERENCES users(id),
  clicker_fingerprint TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clicks_product ON product_clicks(product_id, clicked_at DESC);

-- -----------------------------------------------------------------------------
-- 11. notifications  (PRD 8.2.11)
-- -----------------------------------------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'magic_link', 'product_version_update', 'weekly_newsletter',
    'feedback_draft_reminder', 'certificate_issued'
  )),
  subject TEXT,
  body_html TEXT,
  related_product_id UUID REFERENCES products(id),
  related_feedback_id UUID REFERENCES feedbacks(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'failed', 'cancelled'
  )),
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_pending ON notifications(status, scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 12. newsletter_subscriptions  (PRD 8.2.12)
-- -----------------------------------------------------------------------------
CREATE TABLE newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  weekly_newsletter_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  version_update_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  draft_reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  unsubscribed_all_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
