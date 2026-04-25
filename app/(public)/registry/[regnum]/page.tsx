import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_NAME, SITE_URL } from "@/lib/seo/config";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, buildCreativeWorkSchema } from "@/lib/seo/json-ld";
import { HashVerify } from "./HashVerify";
import { CAREER_TAGS, CATEGORIES } from "@/lib/constants/user";

export const revalidate = 3600;

type PageProps = { params: Promise<{ regnum: string }> };

async function getCert(regnum: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("certificates")
      .select(
        `registration_number, content_hash, issued_at,
         product_name_snapshot, tagline_snapshot, category_snapshot,
         nickname_snapshot, career_tag_snapshot, pdf_url,
         product_id,
         products(slug, status)`,
      )
      .eq("registration_number", regnum)
      .maybeSingle();

    if (data) return data;
  } catch { /* DB 오류 */ }

  return null;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { regnum } = await params;
  const cert = await getCert(regnum);
  if (!cert) return { title: "존재하지 않는 증명서" };

  const title = `${cert.product_name_snapshot} 등록 증명서 #${regnum} · ${SITE_NAME}`;
  const desc = `${cert.product_name_snapshot}: ${cert.tagline_snapshot}. ${new Date(cert.issued_at).toLocaleDateString("ko-KR")} 마이프로덕트 타임스탬프 증명.`;
  const url = `${SITE_URL}/registry/${regnum}`;

  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description: desc, siteName: SITE_NAME, locale: "ko_KR" },
    twitter: { card: "summary", title, description: desc },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZone: "UTC",
  }) + " (UTC)";
}

function getCategoryLabel(v: string) { return CATEGORIES.find(c => c.value === v)?.label ?? v; }
function getCareerLabel(v: string) { return CAREER_TAGS.find(t => t.value === v)?.label ?? v; }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RegistryDetailPage({ params }: PageProps) {
  const { regnum } = await params;
  const cert = await getCert(regnum);
  if (!cert) notFound();

  const productSlug = (cert.products as any)?.slug ?? null;
  const productStatus = (cert.products as any)?.status ?? null;
  const pdfUrl = cert.pdf_url ?? `${SITE_URL}/api/cert/${regnum}/pdf`;

  const breadcrumb = buildBreadcrumbSchema([
    { name: "홈", url: SITE_URL },
    { name: "레지스트리", url: `${SITE_URL}/registry` },
    { name: `#${regnum}`, url: `${SITE_URL}/registry/${regnum}` },
  ]);

  const creativeWork = buildCreativeWorkSchema({
    productName: cert.product_name_snapshot,
    tagline: cert.tagline_snapshot,
    makerNickname: cert.nickname_snapshot,
    issuedAt: cert.issued_at,
    contentHash: cert.content_hash,
    regnum,
  });

  return (
    <>
      <JsonLd schema={breadcrumb} />
      <JsonLd schema={creativeWork} />

      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        {/* 뒤로 */}
        <Link href="/registry" className="mb-5 inline-block text-[13px] font-semibold text-ink-60 hover:text-ink">
          ← 레지스트리
        </Link>

        {/* 제목 */}
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-ink-40">등록 증명서</p>
          <h1 className="mt-1 text-[22px] font-extrabold tracking-tight">
            등록번호 #{regnum}
          </h1>
        </div>

        {/* 증명서 카드 (검정 배경) */}
        <div className="relative mb-5 overflow-hidden rounded-[14px] bg-ink px-5 py-5 text-cream">
          <span className="pointer-events-none absolute -bottom-5 -right-5 text-[90px] opacity-[0.06]">🛡️</span>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-accent">타임스탬프 등록 증명서</p>
          <p className="mb-4 text-[13px] font-bold leading-relaxed">
            {formatDateTime(cert.issued_at)}
          </p>

          <dl className="divide-y divide-white/10 text-[11px]">
            {[
              ["제품명", cert.product_name_snapshot],
              ["한 줄 소개", cert.tagline_snapshot],
              ["카테고리", getCategoryLabel(cert.category_snapshot)],
              ["등록자", `${cert.nickname_snapshot} · 창업 ${getCareerLabel(cert.career_tag_snapshot)}`],
              ["등록번호", `#${cert.registration_number}`],
              ["해시 (앞 16자)", cert.content_hash.slice(0, 16) + "..."],
            ].map(([key, val]) => (
              <div key={key} className="flex justify-between gap-4 py-2">
                <dt className="flex-shrink-0 text-[#9a958a]">{key}</dt>
                <dd className="min-w-0 break-all font-semibold text-right">{val}</dd>
              </div>
            ))}
          </dl>

          {/* PDF + 제품 링크 */}
          <div className="mt-4 flex gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] bg-white/10 py-2 text-[12px] font-bold transition-colors hover:bg-white/20"
            >
              📄 PDF 다운로드
            </a>
            {productSlug && productStatus === "public" && (
              <Link
                href={`/p/${productSlug}`}
                className="flex flex-1 items-center justify-center rounded-[8px] bg-white/10 py-2 text-[12px] font-bold transition-colors hover:bg-white/20"
              >
                제품 페이지 →
              </Link>
            )}
          </div>
        </div>

        {/* 해시 검증 */}
        <HashVerify
          fullHash={cert.content_hash}
          registrationNumber={cert.registration_number}
        />

        {/* 고지 문구 */}
        <p className="mt-5 text-[11px] leading-relaxed text-ink-40">
          본 증명서는 특정 시각에 해당 내용이 마이프로덕트에 등록되었음을 기록한 문서입니다.
          법적 효력은 제한적이며 참고 자료로만 활용해주세요.
        </p>
      </div>
    </>
  );
}
