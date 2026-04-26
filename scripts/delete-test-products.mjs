// 테스트 제품 2개(9d8214, af05e3) 완전 삭제 — B안 (credits row 삭제)
// 실행 전: 형 OK 확인 필수

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OPERATOR_ID = "eec43340-d913-4f0d-a620-698e0f035201";
const SLUGS = ["9d8214", "af05e3"];

// ─── 잔액 조회 헬퍼 ──────────────────────────────────────────────────────────
async function getBalance() {
  const { data } = await supabase
    .from("credits")
    .select("amount")
    .eq("user_id", OPERATOR_ID);
  return (data ?? []).reduce((s, r) => s + r.amount, 0);
}

// ─── 삭제 전 잔액 ────────────────────────────────────────────────────────────
const balanceBefore = await getBalance();
console.log(`\n운영자 잔액 (삭제 전): ${balanceBefore}개`);

// ─── 제품별 삭제 ─────────────────────────────────────────────────────────────
for (const slug of SLUGS) {
  console.log(`\n${"─".repeat(40)}\n[${slug}] 삭제 시작`);

  const { data: product } = await supabase
    .from("products").select("id").eq("slug", slug).single();

  if (!product) { console.log(`[${slug}] 이미 없음 — SKIP`); continue; }
  const pid = product.id;

  // 1. credits row DELETE (related_product_id 일치하는 행 전체)
  const { data: creditRows } = await supabase
    .from("credits").select("id, amount, note").eq("related_product_id", pid);

  if (creditRows?.length) {
    const { error: e1 } = await supabase
      .from("credits").delete().eq("related_product_id", pid);
    if (e1) { console.error(`[${slug}] credits 삭제 실패:`, e1.message); process.exit(1); }
    console.log(`[${slug}] credits ${creditRows.length}건 삭제:`,
      creditRows.map(r => `id=${r.id} (${r.amount > 0 ? "+" : ""}${r.amount}, "${r.note}")`).join(", "));
  } else {
    console.log(`[${slug}] credits 관련 행 없음 — SKIP`);
  }

  // 2. registry_entries 삭제 (certificates.id 기준, CASCADE 없으므로 수동)
  const { data: certs } = await supabase
    .from("certificates").select("id, registration_number").eq("product_id", pid);

  if (certs?.length) {
    for (const cert of certs) {
      const { error: e2 } = await supabase
        .from("registry_entries").delete().eq("certificate_id", cert.id);
      if (e2) { console.error(`[${slug}] registry_entries 삭제 실패:`, e2.message); process.exit(1); }
    }
    console.log(`[${slug}] registry_entries 삭제 (${certs.length}건, 등록번호: ${certs.map(c => c.registration_number).join(", ")})`);

    // 3. certificates 삭제
    const { error: e3 } = await supabase
      .from("certificates").delete().eq("product_id", pid);
    if (e3) { console.error(`[${slug}] certificates 삭제 실패:`, e3.message); process.exit(1); }
    console.log(`[${slug}] certificates 삭제 (${certs.length}건)`);
  }

  // 4. products 삭제 → CASCADE 자동: product_versions, feedbacks,
  //    feedback_answers, product_views, product_clicks
  const { error: e4 } = await supabase
    .from("products").delete().eq("id", pid);
  if (e4) { console.error(`[${slug}] products 삭제 실패:`, e4.message); process.exit(1); }
  console.log(`[${slug}] products 삭제 완료 (CASCADE: versions/feedbacks/views/clicks 자동)`);
}

// ─── 삭제 후 잔액 ────────────────────────────────────────────────────────────
const balanceAfter = await getBalance();
console.log(`\n${"─".repeat(40)}`);
console.log(`운영자 잔액 (삭제 전): ${balanceBefore}개`);
console.log(`운영자 잔액 (삭제 후): ${balanceAfter}개`);
console.log(`변화: ${balanceAfter - balanceBefore >= 0 ? "+" : ""}${balanceAfter - balanceBefore}개`);
console.log("\n✅ 테스트 제품 2개 완전 삭제 완료");
