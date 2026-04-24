-- =============================================================================
-- 트리거 (PRD 섹션 8.5.1)
-- - updated_at 자동 갱신
-- - products 캐시 카운터 자동 증가 (view_count / click_count / feedback_count)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- updated_at 자동 갱신
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- products는 카운터 UPDATE가 자주 일어나므로 콘텐츠 컬럼에 한정해 updated_at을 갱신.
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE OF
    name, tagline, maker_quote, category,
    thumbnail_url, external_url, submission_type,
    status, deleted_at
  ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER newsletter_subscriptions_set_updated_at
  BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- products.feedback_count: feedbacks INSERT 시 +1
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_product_feedback_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET feedback_count = feedback_count + 1
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER feedbacks_increment_count
  AFTER INSERT ON feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION increment_product_feedback_count();

-- -----------------------------------------------------------------------------
-- products.view_count: product_views INSERT 시 +1
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_product_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET view_count = view_count + 1
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER views_increment_count
  AFTER INSERT ON product_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_product_view_count();

-- -----------------------------------------------------------------------------
-- products.click_count: product_clicks INSERT 시 +1
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_product_click_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET click_count = click_count + 1
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER clicks_increment_count
  AFTER INSERT ON product_clicks
  FOR EACH ROW
  EXECUTE FUNCTION increment_product_click_count();
