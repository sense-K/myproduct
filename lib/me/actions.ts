"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CareerTag, Category } from "@/lib/constants/user";
import { CAREER_TAG_VALUES, CATEGORY_VALUES } from "@/lib/constants/user";

// ─── 프로필 수정 ──────────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const nickname = String(formData.get("nickname") ?? "").trim().slice(0, 20);
  const careerTag = String(formData.get("career_tag") ?? "");
  const categories = formData.getAll("interested_categories").map(String);

  if (nickname.length < 2) return { error: "닉네임은 2자 이상 입력해주세요" };
  if (!CAREER_TAG_VALUES.includes(careerTag as CareerTag)) return { error: "창업 경력을 선택해주세요" };

  const { error } = await supabase
    .from("users")
    .update({
      nickname,
      career_tag: careerTag,
      interested_categories: categories.filter((c) => CATEGORY_VALUES.includes(c as Category)),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/me/settings");
  revalidatePath("/me");
  return { ok: true };
}

// ─── 알림 설정 ────────────────────────────────────────────────────────────────

export async function updateNotificationSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const weekly = formData.get("weekly_newsletter") === "on";
  const versionAlerts = formData.get("version_update_alerts") === "on";
  const draftReminder = formData.get("draft_reminder") === "on";

  await supabase.from("newsletter_subscriptions").upsert(
    {
      user_id: user.id,
      weekly_newsletter_enabled: weekly,
      version_update_alerts_enabled: versionAlerts,
      draft_reminder_enabled: draftReminder,
    },
    { onConflict: "user_id" },
  );

  revalidatePath("/me/settings");
  return { ok: true };
}

// ─── 제품 비공개 전환 ─────────────────────────────────────────────────────────

export async function toggleProductPrivacy(productId: string, setPrivate: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 필요" };

  const { error } = await supabase
    .from("products")
    .update({ status: setPrivate ? "private" : "public" })
    .eq("id", productId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/me/products");
  return { ok: true };
}

// ─── 제품 완전 삭제 (PRD 6.2.7, 7.13) ───────────────────────────────────────

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 필요" };

  // 소유권 확인
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!product) return { error: "권한이 없어요" };

  // registry_entries 먼저 삭제 (certificates FK로 cascade이지만 명시)
  await admin
    .from("registry_entries")
    .delete()
    .in(
      "certificate_id",
      (
        await admin
          .from("certificates")
          .select("id")
          .eq("product_id", productId)
      ).data?.map((c) => c.id) ?? [],
    );

  // credits / notifications: related_product_id NULL로 (이력 보존, FK 제약 해제)
  // ON DELETE 미지정 컬럼이라 products DELETE 전에 반드시 해제해야 함
  await admin.from("credits").update({ related_product_id: null }).eq("related_product_id", productId);
  await admin.from("notifications").update({ related_product_id: null }).eq("related_product_id", productId);

  // certificates는 snapshot 보존 (ON DELETE SET NULL)
  // products hard delete (cascade: versions, feedbacks, views, clicks)
  const { error } = await admin.from("products").delete().eq("id", productId);
  if (error) return { error: error.message };

  revalidatePath("/me/products");
  return { ok: true };
}

// ─── 회원 탈퇴 (PRD 8.7) ─────────────────────────────────────────────────────

type DeleteAccountOption = "private" | "delete_all";

export async function deleteAccount(productOption: DeleteAccountOption) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const userId = user.id;

  // 1. 내 제품 처리
  if (productOption === "private") {
    await admin
      .from("products")
      .update({ status: "private" })
      .eq("owner_id", userId);
  } else {
    const { data: myProducts } = await admin
      .from("products")
      .select("id")
      .eq("owner_id", userId);
    for (const p of myProducts ?? []) {
      await deleteProduct(p.id);
    }
  }

  // 2. 개인정보 익명화 (PRD 8.7)
  await admin.from("users").update({
    email: null,
    google_profile_image_url: null,
    nickname: "탈퇴한 메이커",
    deleted_at: new Date().toISOString(),
  }).eq("id", userId);

  // 3. 부속 데이터 즉시 삭제
  await Promise.all([
    admin.from("credits").delete().eq("user_id", userId),
    admin.from("notifications").delete().eq("recipient_user_id", userId),
    admin.from("newsletter_subscriptions").delete().eq("user_id", userId),
  ]);

  // 4. 로그아웃
  await supabase.auth.signOut();

  redirect("/?goodbye=1");
}
