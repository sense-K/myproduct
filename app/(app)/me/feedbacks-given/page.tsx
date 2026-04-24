import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function FeedbacksGivenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let feedbacks: any[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("feedbacks")
      .select("id, submitted_at, products(slug, name, tagline, updated_at, status)")
      .eq("reviewer_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(50);
    feedbacks = data ?? [];
  } catch { /* DB 미연동 */ }

  return (
    <div>
      <h1 className="mb-4 text-[18px] font-extrabold">내가 준 피드백</h1>

      {feedbacks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[28px] bg-paper py-12 text-center">
          <p className="text-3xl">💬</p>
          <p className="text-[14px] font-semibold">아직 준 피드백이 없어요</p>
          <p className="text-[12px] text-ink-60">피드백을 주면 등록권을 얻을 수 있어요</p>
          <Link href="/feedback/pick" className="mt-2 rounded-full bg-accent px-4 py-2 text-[13px] font-bold text-white">
            피드백 주러 가기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {feedbacks.map((f) => {
            const product = f.products;
            const hasUpdate = product?.updated_at && product.updated_at > f.submitted_at;
            return (
              <Link
                key={f.id}
                href={product?.slug ? `/p/${product.slug}` : "#"}
                className="flex items-center gap-3 rounded-[14px] bg-paper p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="h-12 w-12 flex-shrink-0 rounded-[8px] bg-gradient-to-br from-[#5B6B8A] to-[#3d4d6b]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-bold">{product?.name ?? "삭제된 제품"}</p>
                    {hasUpdate && (
                      <span className="flex-shrink-0 rounded-full bg-sage-soft px-1.5 py-0.5 text-[9px] font-bold text-sage">🌱 업데이트</span>
                    )}
                  </div>
                  <p className="truncate text-[11px] text-ink-60">{product?.tagline ?? ""}</p>
                  <p className="mt-0.5 text-[10px] text-ink-40">
                    {new Date(f.submitted_at).toLocaleDateString("ko-KR")} 작성
                  </p>
                </div>
                <span className="text-ink-40">→</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
