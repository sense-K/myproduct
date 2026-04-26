// 실행: node --env-file=.env.local scripts/check-thumbnails.mjs
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data, error } = await admin
  .from("products")
  .select("slug, name, thumbnail_url, submission_type, created_at")
  .order("created_at", { ascending: false });

if (error) { console.error("조회 실패:", error.message); process.exit(1); }

console.log(`\n총 ${data.length}개 제품\n`);

for (const p of data) {
  let status;
  if (p.thumbnail_url === null)       status = "NULL";
  else if (p.thumbnail_url === "")    status = "EMPTY_STRING";
  else                                status = `URL (${p.thumbnail_url.slice(0, 80)})`;

  console.log(`[${p.slug}] ${p.name}`);
  console.log(`  submission_type: ${p.submission_type}`);
  console.log(`  thumbnail_url  : ${status}`);
}
