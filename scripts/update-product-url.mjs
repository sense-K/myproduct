// 일회성 스크립트: 특정 제품의 external_url 업데이트
// 실행: node --env-file=.env.local scripts/update-product-url.mjs

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const SLUG = "9d8214";
const NEW_URL = "https://undercov.kr";

// 1) 업데이트 전 현재 값
const { data: before } = await supabase
  .from("products")
  .select("slug, name, external_url")
  .eq("slug", SLUG)
  .single();
console.log("BEFORE:", before);

// 2) UPDATE
const { error } = await supabase
  .from("products")
  .update({ external_url: NEW_URL })
  .eq("slug", SLUG);
if (error) throw error;

// 3) 업데이트 후 재확인
const { data: after } = await supabase
  .from("products")
  .select("slug, name, external_url")
  .eq("slug", SLUG)
  .single();
console.log("AFTER: ", after);
