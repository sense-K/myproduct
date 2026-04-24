"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AnswerData } from "./questions";

export type SubmitFeedbackInput = {
  slug: string;
  answers: Record<number, AnswerData>;
  startedAt: number; // Date.now() when form started
};

export type SubmitFeedbackResult =
  | { ok: true; productName: string; newBalance: number }
  | { ok: false; error: string };

export async function submitFeedback(input: SubmitFeedbackInput): Promise<SubmitFeedbackResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요해요" };

  // 1. 제품 & 최신 버전 조회
  const { data: product } = await admin
    .from("products")
    .select("id, name, owner_id, product_versions(id, version_number)")
    .eq("slug", input.slug)
    .eq("status", "public")
    .maybeSingle();

  if (!product) return { ok: false, error: "제품을 찾을 수 없어요" };
  if (product.owner_id === user.id) return { ok: false, error: "자기 제품에는 피드백을 남길 수 없어요" };

  const versions = (product.product_versions as { id: string; version_number: number }[]) ?? [];
  const latestVersion = versions.sort((a, b) => b.version_number - a.version_number)[0];
  if (!latestVersion) return { ok: false, error: "제품 버전 정보가 없어요" };

  // 2. 중복 피드백 체크
  const { data: existing } = await admin
    .from("feedbacks")
    .select("id")
    .eq("product_version_id", latestVersion.id)
    .eq("reviewer_id", user.id)
    .maybeSingle();

  if (existing) return { ok: false, error: "이미 이 버전에 피드백을 남겼어요" };

  // 3. 유저 프로필 조회
  const { data: profile } = await admin
    .from("users")
    .select("career_tag")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return { ok: false, error: "프로필 설정을 먼저 완료해주세요" };

  // 4. 작성 시간 계산 (60초 미만 = 플래그)
  const writingSeconds = Math.round((Date.now() - input.startedAt) / 1000);
  const isFlaged = writingSeconds < 60;

  const submittedAt = new Date().toISOString();

  // 5. feedbacks INSERT
  const { data: feedback, error: fbErr } = await admin
    .from("feedbacks")
    .insert({
      product_id: product.id,
      product_version_id: latestVersion.id,
      reviewer_id: user.id,
      reviewer_career_tag_snapshot: profile.career_tag,
      submitted_at: submittedAt,
      total_writing_seconds: writingSeconds,
      is_flagged: isFlaged,
    })
    .select("id")
    .single();

  if (fbErr || !feedback) {
    return { ok: false, error: fbErr?.message ?? "피드백 저장에 실패했어요" };
  }

  // 6. feedback_answers 10개 INSERT
  const answerRows = Object.entries(input.answers).map(([numStr, ans]) => ({
    feedback_id: feedback.id,
    question_number: parseInt(numStr, 10) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    answer_text: ans.text || null,
    answer_choice: ans.choice || null,
    answer_scale: ans.scale ?? null,
  }));

  const { error: ansErr } = await admin.from("feedback_answers").insert(answerRows);
  if (ansErr) {
    // 보상: feedback 삭제
    await admin.from("feedbacks").delete().eq("id", feedback.id);
    return { ok: false, error: ansErr.message };
  }

  // 7. credits +1
  const { data: existingCredits } = await admin
    .from("credits")
    .select("amount")
    .eq("user_id", user.id);
  const currentBalance = (existingCredits ?? []).reduce((s, r) => s + r.amount, 0);

  await admin.from("credits").insert({
    user_id: user.id,
    transaction_type: "earned_from_feedback",
    amount: 1,
    related_feedback_id: feedback.id,
    related_product_id: product.id,
    balance_after: currentBalance + 1,
    note: `피드백 완료: ${product.name}`,
  });

  return {
    ok: true,
    productName: product.name,
    newBalance: currentBalance + 1,
  };
}

// ─── 추천 제품 조회 (PRD 6.1.3) ────────────────────────────────────────────

export type PickProduct = {
  slug: string;
  name: string;
  tagline: string;
  feedback_count: number;
  gradientFrom: string;
  gradientTo: string;
  label: string;
  daysAgo: number;
};

export async function getRecommendedProducts(): Promise<PickProduct[]> {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();

    // 내가 이미 피드백 준 product_id 목록
    let givenProductIds: string[] = [];
    if (user) {
      const { data: given } = await admin
        .from("feedbacks")
        .select("product_id")
        .eq("reviewer_id", user.id);
      givenProductIds = (given ?? []).map((r) => r.product_id);
    }

    let query = admin
      .from("products")
      .select("id, slug, name, tagline, feedback_count, created_at")
      .eq("status", "public")
      .lte("feedback_count", 1)
      .order("created_at", { ascending: false })
      .limit(10);

    if (user) query = query.neq("owner_id", user.id);

    const { data: candidates } = await query;

    if (!candidates || candidates.length === 0) throw new Error("no data");

    const GRADIENTS = [
      ["#2D5F3F", "#3d7a52"],
      ["#D4A574", "#b88751"],
      ["#5B6B8A", "#3d4d6b"],
    ];

    return candidates
      .filter((p) => !givenProductIds.includes(p.id))
      .slice(0, 3)
      .map((p, i) => ({
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        feedback_count: p.feedback_count,
        gradientFrom: GRADIENTS[i % 3][0],
        gradientTo: GRADIENTS[i % 3][1],
        label: p.name.slice(0, 6),
        daysAgo: Math.floor(
          (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24),
        ),
      }));
  } catch {
    // DB 없을 때 mock 폴백
    const { FEED_MOCK } = await import("@/lib/mock/feed");
    const GRADIENTS = [
      ["#2D5F3F", "#3d7a52"],
      ["#D4A574", "#b88751"],
      ["#5B6B8A", "#3d4d6b"],
    ];
    return FEED_MOCK.filter((p) => p.feedback_count <= 1)
      .slice(0, 3)
      .map((p, i) => ({
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        feedback_count: p.feedback_count,
        gradientFrom: GRADIENTS[i % 3][0],
        gradientTo: GRADIENTS[i % 3][1],
        label: p.label,
        daysAgo: 1,
      }));
  }
}
