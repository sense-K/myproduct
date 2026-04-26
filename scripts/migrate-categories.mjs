// 카테고리 8개 마이그레이션 — 데이터 UPDATE
// 실행 전 필수: Supabase SQL Editor에서 products_category_check 제약 제거 완료 확인
//   ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MIGRATION_MAP = {
  saas:              "productivity",
  mobile_app:        "etc",
  webtoon_creative:  "community_content",
  quirky:            "etc",
  etc:               "etc",
};

const VALID_NEW_CATS = new Set([
  "dev_tools", "productivity", "ai_data", "community_content",
  "learning", "lifestyle", "finance_commerce", "etc",
]);

const { data: products, error } = await supabase
  .from("products")
  .select("id, slug, category");

if (error) { console.error("조회 실패:", error); process.exit(1); }

console.log(`총 ${products.length}개 제품 확인\n`);

let updated = 0;
let skipped = 0;
let failed = 0;

for (const p of products) {
  const newCat = MIGRATION_MAP[p.category] ?? (VALID_NEW_CATS.has(p.category) ? p.category : "etc");

  if (newCat === p.category) {
    console.log(`SKIP  ${p.slug}: ${p.category} (변경 없음)`);
    skipped++;
    continue;
  }

  const { error: updateErr } = await supabase
    .from("products")
    .update({ category: newCat })
    .eq("id", p.id);

  if (updateErr) {
    console.error(`FAIL  ${p.slug}: ${p.category} → ${newCat} | 오류: ${updateErr.message}`);
    failed++;
  } else {
    console.log(`OK    ${p.slug}: ${p.category} → ${newCat}`);
    updated++;
  }
}

console.log(`\n완료: ${updated}개 변경 / ${skipped}개 유지 / ${failed}개 실패`);

if (failed > 0) {
  console.error("\n⚠️  실패한 항목이 있습니다. 위 로그에서 FAIL 행을 확인하세요.");
  process.exit(1);
} else {
  console.log("\n✅ 마이그레이션 완료. 이제 형이 Step B SQL을 실행해주세요.");
}
