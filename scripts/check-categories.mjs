import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from("products")
  .select("slug, name, category, created_at")
  .order("created_at", { ascending: true });

if (error) { console.error(error); process.exit(1); }

console.log("Total products:", data.length);
console.table(data.map(p => ({
  slug: p.slug,
  name: p.name,
  category: p.category,
  created_at: p.created_at?.slice(0, 10),
})));

const freq = {};
for (const p of data) freq[p.category] = (freq[p.category] ?? 0) + 1;
console.log("\n카테고리 분포:", freq);
