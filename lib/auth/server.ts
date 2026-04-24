import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { CareerTag, Category } from "@/lib/constants/user";

export type UserProfile = {
  id: string;
  email: string;
  nickname: string;
  career_tag: CareerTag;
  google_profile_image_url: string | null;
  interested_categories: Category[];
};

export type AuthState = {
  authUser: User | null;
  profile: UserProfile | null;
  needsOnboarding: boolean;
};

// public.users 행 존재 여부로 온보딩 완료를 판단.
// 서버 컴포넌트·라우트 핸들러에서 호출.
export async function getAuthState(): Promise<AuthState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authUser: null, profile: null, needsOnboarding: false };
  }

  const { data: profile } = await supabase
    .from("users")
    .select(
      "id, email, nickname, career_tag, google_profile_image_url, interested_categories",
    )
    .eq("id", user.id)
    .maybeSingle<UserProfile>();

  return {
    authUser: user,
    profile: profile ?? null,
    needsOnboarding: !profile,
  };
}
