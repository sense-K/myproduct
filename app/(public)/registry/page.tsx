import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/seo/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { RegistryList } from "./RegistryList";

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

export type RegistryEntry = {
  registration_number: string;
  issued_at: string;
  product_name: string;
  tagline: string;
  nickname: string;
  hash_short: string;
  product_slug: string | null;
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

    const items: RegistryEntry[] = (data ?? []).map((r: any) => ({
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
  } catch {
    return { items: [], total: 0, hasMore: false, cursor: null };
  }
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

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[14px] border border-dashed border-ink-20 py-16 text-center">
          <p className="text-4xl">🛡️</p>
          <div>
            <p className="text-[15px] font-extrabold">아직 등록된 증명서가 없어요</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-60">
              첫 메이커가 되어보세요.
              <br />
              등록 후 자동으로 타임스탬프와 해시가 영구 보존됩니다.
            </p>
          </div>
          <Link
            href="/submit/intro"
            className="mt-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-bold text-cream transition-opacity hover:opacity-80"
          >
            제품 등록하러 가기 →
          </Link>
        </div>
      ) : (
        <RegistryList
          initialItems={items}
          initialHasMore={hasMore}
          initialCursor={cursor}
        />
      )}
    </div>
  );
}
