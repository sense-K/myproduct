import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FeedbackAccordion } from "./feedback-accordion";
import Link from "next/link";

export const dynamic = "force-dynamic";

type RawFeedback = {
  id: string;
  submitted_at: string;
  reviewer_career_tag_snapshot: string;
  feedback_answers: {
    question_number: number;
    answer_text: string | null;
    answer_choice: string | null;
    answer_scale: number | null;
  }[];
};

type ProductGroup = {
  productId: string;
  productName: string;
  productSlug: string;
  feedbacks: RawFeedback[];
};

export default async function FeedbacksReceivedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let groups: ProductGroup[] = [];
  try {
    const admin = createAdminClient();

    // 내 제품 목록
    const { data: myProducts } = await admin
      .from("products")
      .select("id, name, slug")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    // gen:types 실행 전까지 Supabase 쿼리 결과를 명시적으로 캐스팅
    type ProductRow = { id: string; name: string; slug: string };
    const products = (myProducts ?? []) as ProductRow[];

    if (products.length > 0) {
      for (const product of products) {
        const { data: fbs } = await admin
          .from("feedbacks")
          .select("id, submitted_at, reviewer_career_tag_snapshot, feedback_answers(question_number, answer_text, answer_choice, answer_scale)")
          .eq("product_id", product.id)
          .order("submitted_at", { ascending: false })
          .limit(30);

        if (fbs && fbs.length > 0) {
          groups.push({
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            feedbacks: fbs as RawFeedback[],
          });
        }
      }
    }
  } catch { /* DB 미연동 */ }

  return (
    <div>
      <h1 className="mb-1.5 text-[18px] font-extrabold">내가 받은 피드백</h1>
      <p className="mb-5 text-[12px] text-ink-60">창업자 본인만 열람 가능해요. 내용은 비공개로 보호됩니다.</p>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[28px] bg-paper py-12 text-center">
          <p className="text-3xl">📥</p>
          <p className="text-[14px] font-semibold">아직 받은 피드백이 없어요</p>
          <p className="text-[12px] text-ink-60">제품을 등록하면 다른 메이커의 피드백을 받을 수 있어요</p>
          <Link href="/submit/intro" className="mt-2 rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-cream">
            제품 올리기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <FeedbackAccordion key={g.productId} group={g} />
          ))}
        </div>
      )}
    </div>
  );
}
