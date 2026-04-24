// -----------------------------------------------------------------------------
// Supabase 수동 타입 정의 (빌드 통과용).
// `npm run gen:types` 실행 시 이 파일이 실제 스키마 기반 타입으로 교체됩니다.
//   npx supabase gen types typescript --project-id lkejzmtgpktrlnkkhatb --schema public > types/database.ts
// -----------------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// 각 테이블의 Row 타입을 명시해서 Supabase 쿼리 결과가 never로 추론되는 문제 해결.
// gen:types 실행 전까지 사용하는 수동 타입.

type TableDef<Row extends Record<string, unknown>> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: unknown[];
};

export type Database = {
  public: {
    Tables: {
      users: TableDef<{
        id: string;
        email: string | null;
        auth_provider: string;
        nickname: string;
        career_tag: string;
        google_profile_image_url: string | null;
        interested_categories: string[];
        created_at: string;
        updated_at: string;
        last_login_at: string | null;
        deleted_at: string | null;
      }>;
      products: TableDef<{
        id: string;
        owner_id: string;
        slug: string;
        name: string;
        tagline: string;
        maker_quote: string | null;
        category: string;
        thumbnail_url: string | null;
        external_url: string | null;
        submission_type: string;
        status: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        view_count: number;
        click_count: number;
        feedback_count: number;
      }>;
      product_versions: TableDef<{
        id: string;
        product_id: string;
        version_label: string;
        change_note: string | null;
        new_thumbnail_url: string | null;
        new_external_url: string | null;
        content_hash: string;
        is_initial: boolean;
        version_number: number;
        created_at: string;
      }>;
      feedbacks: TableDef<{
        id: string;
        product_id: string;
        product_version_id: string;
        reviewer_id: string;
        reviewer_career_tag_snapshot: string;
        created_at: string;
        submitted_at: string;
        total_writing_seconds: number | null;
        is_flagged: boolean;
      }>;
      feedback_answers: TableDef<{
        id: string;
        feedback_id: string;
        question_number: number;
        answer_text: string | null;
        answer_choice: string | null;
        answer_scale: number | null;
      }>;
      credits: TableDef<{
        id: number;
        user_id: string;
        transaction_type: string;
        amount: number;
        related_feedback_id: string | null;
        related_product_id: string | null;
        balance_after: number;
        note: string | null;
        created_at: string;
      }>;
      certificates: TableDef<{
        id: string;
        product_id: string | null;
        registration_number: string;
        content_hash: string;
        product_name_snapshot: string;
        tagline_snapshot: string;
        category_snapshot: string;
        nickname_snapshot: string;
        career_tag_snapshot: string;
        pdf_url: string | null;
        issued_at: string;
      }>;
      registry_entries: TableDef<{
        id: number;
        certificate_id: string;
        registration_number: string;
        is_visible: boolean;
        created_at: string;
      }>;
      product_views: TableDef<{
        id: number;
        product_id: string;
        viewer_user_id: string | null;
        viewer_fingerprint: string | null;
        viewed_at: string;
        referrer: string | null;
        utm_source: string | null;
        utm_medium: string | null;
        utm_campaign: string | null;
      }>;
      product_clicks: TableDef<{
        id: number;
        product_id: string;
        clicker_user_id: string | null;
        clicker_fingerprint: string | null;
        clicked_at: string;
      }>;
      notifications: TableDef<{
        id: string;
        recipient_user_id: string;
        notification_type: string;
        subject: string | null;
        body_html: string | null;
        related_product_id: string | null;
        related_feedback_id: string | null;
        status: string;
        scheduled_at: string;
        sent_at: string | null;
        error_message: string | null;
        created_at: string;
      }>;
      newsletter_subscriptions: TableDef<{
        id: string;
        user_id: string;
        weekly_newsletter_enabled: boolean;
        version_update_alerts_enabled: boolean;
        draft_reminder_enabled: boolean;
        unsubscribed_all_at: string | null;
        created_at: string;
        updated_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
