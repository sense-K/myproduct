import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// RLS를 우회하는 서버 전용 클라이언트. API 라우트·서버 액션에서만 사용.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
