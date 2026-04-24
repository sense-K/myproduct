"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  CAREER_TAG_VALUES,
  CATEGORY_VALUES,
  DEFAULT_NICKNAME,
  type CareerTag,
  type Category,
} from "@/lib/constants/user";

export type OnboardingState =
  | { ok: true }
  | { ok: false; error: string };

export async function completeOnboarding(
  _prev: OnboardingState | null,
  formData: FormData,
): Promise<OnboardingState> {
  const nicknameRaw = String(formData.get("nickname") ?? "").trim();
  const careerTagRaw = String(formData.get("career_tag") ?? "");
  const interestedCategoriesRaw = formData
    .getAll("interested_categories")
    .map(String);

  const nickname = nicknameRaw.slice(0, 20) || DEFAULT_NICKNAME;

  if (!CAREER_TAG_VALUES.includes(careerTagRaw as CareerTag)) {
    return { ok: false, error: "창업 경력을 선택해주세요." };
  }
  const careerTag = careerTagRaw as CareerTag;

  const interestedCategories = interestedCategoriesRaw.filter(
    (v): v is Category => CATEGORY_VALUES.includes(v as Category),
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { ok: false, error: "로그인이 만료됐어요. 다시 로그인해주세요." };
  }

  const authProvider =
    user.app_metadata?.provider === "google" ? "google" : "magic_link";

  const { error } = await supabase.from("users").insert({
    id: user.id,
    email: user.email,
    auth_provider: authProvider,
    nickname,
    career_tag: careerTag,
    google_profile_image_url:
      (user.user_metadata?.avatar_url as string | undefined) ?? null,
    interested_categories: interestedCategories,
    last_login_at: new Date().toISOString(),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
