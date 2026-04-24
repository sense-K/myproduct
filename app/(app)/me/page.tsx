import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CAREER_TAGS } from "@/lib/constants/user";

export const dynamic = "force-dynamic";

async function getMeData(userId: string) {
  const admin = createAdminClient();

  const [profile, credits, productCount, givenCount, certCount] = await Promise.all([
    admin.from("users").select("nickname, career_tag, created_at").eq("id", userId).maybeSingle(),
    admin.from("credits").select("amount").eq("user_id", userId),
    admin.from("products").select("id", { count: "exact", head: true }).eq("owner_id", userId).eq("status", "public"),
    admin.from("feedbacks").select("id", { count: "exact", head: true }).eq("reviewer_id", userId),
    admin.from("certificates").select("id", { count: "exact", head: true }).in(
      "product_id",
      (await admin.from("products").select("id").eq("owner_id", userId)).data?.map(p => p.id) ?? [],
    ),
  ]);

  const balance = (credits.data ?? []).reduce((s, r) => s + r.amount, 0);
  const careerLabel = CAREER_TAGS.find(t => t.value === profile.data?.career_tag)?.label ?? "";

  return {
    nickname: profile.data?.nickname ?? "익명 메이커",
    careerLabel,
    joinedAt: profile.data?.created_at ? new Date(profile.data.created_at).toLocaleDateString("ko-KR") : "",
    balance,
    productCount: productCount.count ?? 0,
    givenCount: givenCount.count ?? 0,
    certCount: certCount.count ?? 0,
  };
}

const STATS = [
  { label: "올린 제품", href: "/me/products", key: "productCount" as const },
  { label: "준 피드백", href: "/me/feedbacks-given", key: "givenCount" as const },
  { label: "받은 증명서", href: "/me/products", key: "certCount" as const },
];

const MENUS = [
  { href: "/me/products", icon: "📦", label: "내 제품 관리" },
  { href: "/me/feedbacks-given", icon: "💬", label: "내가 준 피드백" },
  { href: "/me/feedbacks-received", icon: "📥", label: "내가 받은 피드백" },
  { href: "/me/settings", icon: "⚙️", label: "설정" },
];

export default async function MePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let data;
  try {
    data = await getMeData(user.id);
  } catch {
    data = { nickname: "익명 메이커", careerLabel: "", joinedAt: "", balance: 0, productCount: 0, givenCount: 0, certCount: 0 };
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 프로필 헤더 */}
      <div className="rounded-[28px] bg-paper p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-ink text-xl font-black text-cream">
            {data.nickname.slice(0, 1)}
          </div>
          <div>
            <p className="text-[17px] font-extrabold">{data.nickname}</p>
            {data.careerLabel && (
              <p className="text-[12px] text-ink-60">창업 {data.careerLabel} 메이커</p>
            )}
            {data.joinedAt && (
              <p className="mt-0.5 text-[11px] text-ink-40">{data.joinedAt} 가입</p>
            )}
          </div>
        </div>
      </div>

      {/* 등록권 카드 */}
      <div className="flex items-center justify-between rounded-[14px] bg-sage-soft px-5 py-4">
        <div>
          <p className="text-[11px] font-bold text-sage">등록권 보유</p>
          <p className="text-[24px] font-extrabold text-[#2c4229]">{data.balance}개</p>
        </div>
        <Link
          href="/feedback/pick"
          className="rounded-full bg-sage px-4 py-2 text-[12px] font-bold text-cream hover:opacity-90"
        >
          + 더 얻기
        </Link>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-3 gap-2.5">
        {STATS.map((s) => (
          <Link
            key={s.key}
            href={s.href}
            className="flex flex-col items-center rounded-[14px] bg-paper py-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-[22px] font-extrabold">{data[s.key]}</span>
            <span className="mt-0.5 text-[11px] text-ink-60">{s.label}</span>
          </Link>
        ))}
      </div>

      {/* 바로가기 메뉴 */}
      <div className="flex flex-col gap-2">
        {MENUS.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="flex items-center gap-3 rounded-[14px] bg-paper px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-xl">{m.icon}</span>
            <span className="text-[14px] font-semibold">{m.label}</span>
            <span className="ml-auto text-ink-40">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
