// 실행: node --env-file=.env.local scripts/check-image-schema.mjs
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── 1. products 테이블 전체 컬럼 (이미지 관련만 필터)
console.log("=== 1. products 이미지 관련 컬럼 ===");
const { data: row } = await admin.from("products").select("*").limit(1);
if (row?.[0]) {
  const cols = Object.keys(row[0]);
  const imageCols = cols.filter(c =>
    /image|thumb|screenshot|og_|photo|media/i.test(c)
  );
  console.log("이미지 관련 컬럼:", imageCols.length ? imageCols : "(없음)");
  console.log("전체 컬럼:", cols.join(", "));
} else {
  console.log("제품 없음 — 전체 컬럼 조회 불가");
}

// ─── 2. Storage 버킷 상태
console.log("\n=== 2. Storage 버킷 목록 ===");
const { data: buckets, error: bErr } = await admin.storage.listBuckets();
if (bErr) {
  console.error("버킷 조회 실패:", bErr.message);
} else {
  for (const b of buckets ?? []) {
    console.log(`\n버킷: ${b.id}`);
    console.log(`  public       : ${b.public}`);
    console.log(`  fileSizeLimit: ${b.file_size_limit ? `${b.file_size_limit / 1024 / 1024}MB` : "없음(기본값)"}`);
    console.log(`  allowedMime  : ${b.allowed_mime_types?.join(", ") || "제한 없음"}`);
  }
}

// ─── 3. product-images 버킷 내 파일 구조
console.log("\n=== 3. product-images 파일 구조 ===");
const { data: topFiles, error: topErr } = await admin.storage
  .from("product-images")
  .list("", { limit: 20 });
if (topErr) {
  console.error("파일 목록 실패:", topErr.message);
} else if (!topFiles?.length) {
  console.log("(비어있음 — 아직 업로드된 파일 없음)");
} else {
  console.log("최상위 항목:", topFiles.map(f => f.name).join(", "));
}

// ─── 4. storage.objects RLS 정책 (service_role로 조회 시도)
console.log("\n=== 4. storage RLS 정책 ===");
// JS 클라이언트로 pg_policies 직접 조회는 불가 → 존재 여부 간접 확인
// anon 클라이언트로 업로드 시도해서 RLS 동작 확인
const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
const testBlob = new Blob(["x"], { type: "image/png" });
const { error: uploadErr } = await anon.storage
  .from("product-images")
  .upload("_rls_test/test.png", testBlob, { upsert: false });

if (!uploadErr) {
  // 성공했다면 RLS 없거나 너무 열려있음 → 정리
  await admin.storage.from("product-images").remove(["_rls_test/test.png"]);
  console.log("⚠️  비인증 업로드 성공 — RLS 정책이 없거나 너무 열려있음");
} else if (uploadErr.message.includes("row-level") || uploadErr.statusCode === "403") {
  console.log("✅ RLS 정책 있음 — 비인증 업로드 차단됨");
  console.log("   에러:", uploadErr.message);
} else {
  console.log("업로드 에러 (RLS 외 원인):", uploadErr.message);
}
