// Storage 버킷 생성 + 마이그레이션 컬럼 검증
// 실행: node --env-file=.env.local scripts/setup-storage.mjs
//
// 전제: supabase/migrations/20260426000001_products_v2_fields.sql 을
//       Supabase 대시보드 SQL Editor에서 먼저 실행했어야 함

import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── 1. Storage 버킷 생성 ─────────────────────────────────────────────────────

console.log("\n=== Storage 버킷 셋업 ===");

const BUCKET = "product-images";

const { data: existing } = await admin.storage.getBucket(BUCKET);

if (existing) {
  console.log(`버킷 '${BUCKET}' 이미 존재함 — 건너뜀`);
} else {
  const { data, error } = await admin.storage.createBucket(BUCKET, {
    public: true,                          // 썸네일·스크린샷 공개 읽기
    fileSizeLimit: 5 * 1024 * 1024,        // 5MB 상한
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  if (error) {
    console.error("버킷 생성 실패:", error.message);
  } else {
    console.log(`버킷 '${BUCKET}' 생성 완료:`, data);
  }
}

// 버킷 최종 상태 확인
const { data: bucket, error: checkErr } = await admin.storage.getBucket(BUCKET);
if (checkErr) {
  console.error("버킷 조회 실패:", checkErr.message);
} else {
  console.log("버킷 상태:", {
    id: bucket.id,
    public: bucket.public,
    fileSizeLimit: bucket.file_size_limit,
    allowedMimeTypes: bucket.allowed_mime_types,
  });
}

// ─── 2. products 테이블 신규 컬럼 검증 ───────────────────────────────────────

console.log("\n=== products v2 컬럼 검증 ===");

const EXPECTED_COLUMNS = [
  "target_audience",
  "problem_statement",
  "solution_approach",
  "differentiator",
  "product_stage",
  "pricing_model",
  "feedback_categories",
  "maker_note",
  "screenshot_urls",
  "demo_video_url",
];

// information_schema 조회 대신 실제 products 행을 select해서 컬럼 존재 확인
const { data: sample, error: sampleErr } = await admin
  .from("products")
  .select(EXPECTED_COLUMNS.join(", "))
  .limit(1);

if (sampleErr) {
  console.error("\n❌ 마이그레이션 미적용 또는 실패:", sampleErr.message);
  console.error("\n👉 다음 단계:");
  console.error("   1. Supabase 대시보드 → SQL Editor 열기");
  console.error("   2. supabase/migrations/20260426000001_products_v2_fields.sql 내용 붙여넣기");
  console.error("   3. Run 클릭");
  console.error("   4. 이 스크립트 다시 실행");
} else {
  console.log("\n✅ 모든 컬럼 정상 확인:");
  EXPECTED_COLUMNS.forEach((col) => console.log(`   • ${col}`));

  if (sample && sample.length > 0) {
    console.log("\n기존 제품 데이터 신규 필드 상태 (null 정상):");
    console.table(
      EXPECTED_COLUMNS.reduce((acc, col) => {
        acc[col] = sample[0][col] ?? "null (정상)";
        return acc;
      }, {})
    );
  }
}

console.log("\n=== 완료 ===\n");
