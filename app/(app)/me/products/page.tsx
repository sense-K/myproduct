import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORIES } from "@/lib/constants/user";
import { ProductActions } from "./product-actions";

export const dynamic = "force-dynamic";

function getCatLabel(v: string) {
  return CATEGORIES.find(c => c.value === v)?.label ?? v;
}

export default async function MyProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let products: any[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("products")
      .select("id, slug, name, tagline, category, status, created_at, view_count, click_count, feedback_count, certificates(registration_number)")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    products = data ?? [];
  } catch { /* DB 미연동 */ }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[18px] font-extrabold">내가 올린 제품</h1>
        <Link href="/submit/url" className="rounded-full bg-ink px-3 py-1.5 text-[12px] font-bold text-cream hover:opacity-90">
          + 올리기
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[28px] bg-paper py-12 text-center">
          <p className="text-3xl">📦</p>
          <p className="text-[14px] font-semibold">아직 올린 제품이 없어요</p>
          <p className="text-[12px] text-ink-60">피드백을 먼저 주고 등록권을 얻어보세요</p>
          <Link href="/feedback/pick" className="mt-2 rounded-full bg-accent px-4 py-2 text-[13px] font-bold text-white">
            피드백 주러 가기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => {
            const regNum = p.certificates?.[0]?.registration_number;
            return (
              <div key={p.id} className="rounded-[14px] bg-paper p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  {/* 썸네일 */}
                  <div className="h-14 w-14 flex-shrink-0 rounded-[8px] bg-gradient-to-br from-[#2D5F3F] to-[#3d7a52]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[14px] font-bold">{p.name}</p>
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${p.status === "public" ? "bg-sage-soft text-sage" : "bg-ink-10 text-ink-60"}`}>
                        {p.status === "public" ? "공개" : "비공개"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-ink-60">{getCatLabel(p.category)}</p>
                    <div className="mt-1.5 flex gap-3 text-[11px] text-ink-60">
                      <span>👁 {p.view_count}</span>
                      <span>💬 {p.feedback_count}</span>
                      <span>🔗 {p.click_count}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-ink-40">
                      {new Date(p.created_at).toLocaleDateString("ko-KR")} 등록
                    </p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="mt-3 flex items-center gap-2 border-t border-ink-10 pt-3">
                  <Link href={`/p/${p.slug}`} className="flex-1 rounded-[8px] border border-ink-10 py-1.5 text-center text-[12px] font-semibold text-ink-60 hover:border-ink hover:text-ink">
                    페이지 보기
                  </Link>
                  {regNum && (
                    <a href={`/api/cert/${regNum}/view`} target="_blank" rel="noopener" className="flex-1 rounded-[8px] border border-ink-10 py-1.5 text-center text-[12px] font-semibold text-ink-60 hover:border-ink hover:text-ink">
                      🛡️ 증명서
                    </a>
                  )}
                  <ProductActions
                    productId={p.id}
                    productName={p.name}
                    isPrivate={p.status !== "public"}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
