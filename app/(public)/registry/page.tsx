import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/seo/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_REGISTRY } from "@/lib/mock/registry";
import { RegistryList } from "./RegistryList";
import type { RegistryEntry } from "@/lib/mock/registry";

export const revalidate = 300; // 5분 ISR

export const metadata: Metadata = {
  title: { absolute: `공개 레지스트리 · ${SITE_NAME}에 등록된 모든 제품 공개 기록` },
  description:
    "마이프로덕트에 등록된 모든 제품의 공개 기록입니다. 각 등록은 SHA-256 해시와 타임스탬프로 영구 보존됩니다.",
  alternates: { canonical: `${SITE_URL}/registry` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/registry`,
    title: `공개 레지스트리 · ${SITE_NAME}`,
    description: "모든 등록 제품의 타임스탬프 기록",
    siteName: SITE_NAME,
    locale: "ko_KR",
  },
};

const PAGE_SIZE = 20;

async function fetchRegistryPage(): Promise<{
  items: RegistryEntry[];
  total: number;
  hasMore: boolean;
  cursor: string | null;
}> {
  try {
    const admin = createAdminClient();
    const { data, count } = await admin
      .from("registry_entries")
      .select(
        `registration_number, created_at,
         certificates(product_name_snapshot, tagline_snapshot, nickname_snapshot, content_hash, issued_at,
           products(slug))`,
        { count: "exact" },
      )
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (data && data.length > 0) {
      const items: RegistryEntry[] = data.map((r: any) => ({
        registration_number: r.registration_number,
        issued_at: r.certificates?.issued_at ?? r.created_at,
        product_name: r.certificates?.product_name_snapshot ?? "—",
        tagline: r.certificates?.tagline_snapshot ?? "",
        nickname: r.certificates?.nickname_snapshot ?? "익명 메이커",
        hash_short: (r.certificates?.content_hash ?? "").slice(0, 16),
        product_slug: r.certificates?.products?.slug ?? null,
      }));
      return {
        items,
        total: count ?? 0,
        hasMore: items.length === PAGE_SIZE,
        cursor: items.at(-1)?.issued_at ?? null,
      };
    }
  } catch { /* DB 미연동 */ }

  return {
    items: MOCK_REGISTRY,
    total: MOCK_REGISTRY.length,
    hasMore: false,
    cursor: null,
  };
}

export default async function RegistryPage() {
  const { items, total, hasMore, cursor } = await fetchRegistryPage();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold tracking-tight">등록 레지스트리</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-60">
          마이프로덕트에 등록된 모든 제품의 공개 기록입니다.
          <br />각 등록은 SHA-256 해시와 타임스탬프로 영구 보존됩니다.
        </p>
      </div>

      {/* 총 등록 수 */}
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-ink px-2.5 py-0.5 text-[12px] font-bold text-cream">
          총 {total.toLocaleString()}개
        </span>
        <span className="text-[11px] text-ink-40">수정·삭제 불가 기록</span>
      </div>

      <RegistryList
        initialItems={items}
        initialHasMore={hasMore}
        initialCursor={cursor}
      />
    </div>
  );
}
