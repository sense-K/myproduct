"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Category } from "@/lib/constants/user";
import type { FeedbackCategory, PricingModel, ProductStage } from "@/app/submit/_components/types";

export type UpdateInput = {
  name: string;
  tagline: string;
  category: Category;
  external_url: string | null;
  target_audience: string;
  problem_statement: string;
  solution_approach: string;
  thumbnail_url: string | null;
  og_image_url?: string | null;
  screenshot_urls: string[];
  demo_video_url: string | null;
  differentiator: string | null;
  product_stage: ProductStage | null;
  pricing_model: PricingModel | null;
  feedback_categories: FeedbackCategory[];
  maker_note: string | null;
};

export type UpdateResult = { ok: true } | { ok: false; error: string };

export async function updateProduct(
  slug: string,
  input: UpdateInput,
): Promise<UpdateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요해요" };

  const admin = createAdminClient();

  // 소유권 재확인 (Server Action 보안 — 클라이언트 우회 방지)
  const { data: product } = await admin
    .from("products")
    .select("owner_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!product) return { ok: false, error: "제품을 찾을 수 없어요" };
  if (product.owner_id !== user.id) return { ok: false, error: "수정 권한이 없어요" };

  const { error } = await admin
    .from("products")
    .update({
      name: input.name,
      tagline: input.tagline,
      category: input.category,
      external_url: input.external_url,
      target_audience: input.target_audience || null,
      problem_statement: input.problem_statement || null,
      solution_approach: input.solution_approach || null,
      thumbnail_url: input.thumbnail_url,
      og_image_url: input.og_image_url ?? undefined,
      screenshot_urls: input.screenshot_urls.length ? input.screenshot_urls : null,
      demo_video_url: input.demo_video_url,
      differentiator: input.differentiator || null,
      product_stage: input.product_stage,
      pricing_model: input.pricing_model,
      feedback_categories: input.feedback_categories.length
        ? input.feedback_categories
        : null,
      maker_note: input.maker_note || null,
      updated_at: new Date().toISOString(),
      // slug는 절대 수정하지 않음 — 등록 증명 무결성 유지
    })
    .eq("slug", slug);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/p/${slug}`);
  revalidatePath("/me/products");
  return { ok: true };
}
