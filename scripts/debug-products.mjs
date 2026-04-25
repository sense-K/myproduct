// Debug script: diagnose /p/[slug] Internal Server Error
// Run: node --env-file=.env.local scripts/debug-products.mjs

import { createClient } from "@supabase/supabase-js";

const OWNER_ID = "eec43340-d913-4f0d-a620-698e0f035201";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// 1. products 테이블 컬럼 목록
console.log("=== products 테이블 스키마 ===");
const { data: cols, error: colErr } = await admin
  .from("information_schema.columns")
  .select("column_name, data_type, is_nullable")
  .eq("table_schema", "public")
  .eq("table_name", "products")
  .order("ordinal_position");

if (colErr) {
  console.log("컬럼 조회 실패 (RPC fallback):", colErr.message);
} else {
  console.table(cols);
}

// 2. 특정 owner의 제품 목록 + nullable 컬럼 정밀 검사
console.log("\n=== owner 제품 목록 (nullable 컬럼 정밀 검사) ===");
const { data: products, error: prodErr } = await admin
  .from("products")
  .select("*")
  .eq("owner_id", OWNER_ID)
  .order("created_at", { ascending: false })
  .limit(5);

if (prodErr) {
  console.error("제품 조회 에러:", prodErr);
} else if (products && products.length > 0) {
  const p = products[0];

  // tagline 정밀 검사
  console.log("\n[tagline 검사]");
  console.log("  값:", JSON.stringify(p.tagline));
  if (p.tagline === null)        console.log("  → NULL (DB에 null 저장됨)");
  else if (p.tagline === "")     console.log("  → EMPTY STRING (빈 문자열)");
  else                           console.log("  → 정상값, 길이:", p.tagline.length);

  // 모든 컬럼 nullable 상태 출력
  console.log("\n[모든 컬럼 null/empty 상태]");
  const colStates = Object.entries(p).map(([key, val]) => ({
    column: key,
    type: val === null ? "NULL" : val === "" ? "EMPTY_STRING" : typeof val,
    value_preview: val === null ? "null" : val === "" ? '""' : String(val).slice(0, 40),
  }));
  console.table(colStates);
} else {
  console.log("해당 owner_id로 조회된 제품 없음");
}

// 3. 첫 번째 slug로 page.tsx와 동일한 쿼리 재현
if (products && products.length > 0) {
  const slug = products[0].slug;
  console.log(`\n=== fetchProduct 쿼리 재현 (slug: ${slug}) ===`);
  const { data: detail, error: detailErr } = await admin
    .from("products")
    .select(`
      id, slug, name, tagline, maker_quote, category,
      thumbnail_url, external_url, view_count, click_count,
      feedback_count, created_at, updated_at, status, owner_id,
      users!inner ( nickname, career_tag ),
      product_versions ( id, version_label, change_note, version_number, is_initial, created_at ),
      certificates ( registration_number, content_hash, issued_at )
    `)
    .eq("slug", slug)
    .eq("status", "public")
    .maybeSingle();

  if (detailErr) {
    console.error("fetchProduct 쿼리 에러:", detailErr);
  } else if (!detail) {
    console.log("결과 없음 — slug 불일치 또는 status != public");
    // status 무관하게 재확인
    const { data: anyStatus } = await admin
      .from("products")
      .select("id, slug, status")
      .eq("slug", slug)
      .maybeSingle();
    console.log("status 무관 조회:", anyStatus);
  } else {
    console.log("fetchProduct 성공. users join:", detail.users);
    console.log("product_versions 수:", detail.product_versions?.length ?? 0);
    console.log("certificates 수:", detail.certificates?.length ?? 0);
  }
}
