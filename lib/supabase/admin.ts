import { createClient } from "@supabase/supabase-js";

// RLS를 우회하는 서버 전용 클라이언트. API 라우트·서버 액션에서만 사용.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('[DEBUG-admin-client]', { hasUrl: !!url, hasKey: !!key });
    throw new Error(`SUPABASE env missing: url=${!!url}, key=${!!key}`);
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
