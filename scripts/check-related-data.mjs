import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const slugs = ["9d8214", "af05e3"];

for (const slug of slugs) {
  console.log(`\n${"=".repeat(50)}\n${slug}\n${"=".repeat(50)}`);

  const { data: product } = await supabase
    .from("products").select("id, name, category, status").eq("slug", slug).single();

  if (!product) { console.log("제품 없음"); continue; }
  const pid = product.id;
  console.log("product:", product);

  const checks = [
    ["product_versions",  supabase.from("product_versions").select("id", { count: "exact" }).eq("product_id", pid)],
    ["feedbacks",         supabase.from("feedbacks").select("id", { count: "exact" }).eq("product_id", pid)],
    ["feedback_answers",  "feedbacks 캐스케이드로 자동 삭제"],
    ["certificates",      supabase.from("certificates").select("id, registration_number", { count: "exact" }).eq("product_id", pid)],
    ["product_views",     supabase.from("product_views").select("id", { count: "exact" }).eq("product_id", pid)],
    ["product_clicks",    supabase.from("product_clicks").select("id", { count: "exact" }).eq("product_id", pid)],
    ["credits(related)",  supabase.from("credits").select("id", { count: "exact" }).eq("related_product_id", pid)],
    ["notifications",     supabase.from("notifications").select("id", { count: "exact" }).eq("related_product_id", pid)],
  ];

  for (const [name, q] of checks) {
    if (typeof q === "string") { console.log(`  ${name}: ${q}`); continue; }
    const { data, count, error } = await q;
    if (error) { console.log(`  ${name}: 오류 - ${error.message}`); continue; }
    console.log(`  ${name}: ${count ?? data?.length ?? 0}건`, data?.length > 0 ? JSON.stringify(data) : "");
  }
}
