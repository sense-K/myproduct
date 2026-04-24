import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_NAME, SITE_URL } from "@/lib/seo/config";
import { CopyButton } from "./copy-button";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ reg?: string; slug?: string }>;
};

async function DoneContent({ reg, slug }: { reg: string; slug: string }) {
  const admin = createAdminClient();
  const { data: cert } = await admin
    .from("certificates")
    .select("registration_number, content_hash, issued_at, product_name_snapshot, nickname_snapshot")
    .eq("registration_number", reg)
    .maybeSingle();

  if (!cert) {
    // DB 없거나 mock 환경: URL 파라미터로 fallback
    const mockCert = {
      registration_number: reg,
      content_hash: "mock-hash-" + reg,
      issued_at: new Date().toISOString(),
      product_name_snapshot: slug,
      nickname_snapshot: "익명 메이커",
    };
    return <DoneUI cert={mockCert} slug={slug} />;
  }

  return <DoneUI cert={cert} slug={slug} />;
}

function DoneUI({
  cert,
  slug,
}: {
  cert: {
    registration_number: string;
    content_hash: string;
    issued_at: string;
    product_name_snapshot: string;
    nickname_snapshot: string;
  };
  slug: string;
}) {
  const productUrl = `${SITE_URL}/p/${slug}`;
  const formattedDate = new Date(cert.issued_at).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const hashShort = cert.content_hash.slice(0, 8) + "...";
  const xText = encodeURIComponent(
    `"${cert.product_name_snapshot}"을 마이프로덕트에 올렸어요! ${productUrl} #마이프로덕트 #인디메이커`,
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6 text-center">
        <span className="text-[15px] font-extrabold tracking-tight">
          <span className="mr-1 text-accent">●</span>
          {SITE_NAME}
        </span>
      </div>

      {/* 완료 메시지 */}
      <div className="text-center">
        <p className="text-5xl" role="img" aria-label="축하">🎉</p>
        <h1 className="mt-3 text-[22px] font-extrabold tracking-tight">올라갔어요!</h1>
        <p className="mt-1.5 text-[13px] text-ink-60">
          <strong className="font-semibold text-ink">"{cert.product_name_snapshot}"</strong>이
          레지스트리에 기록됐어요
        </p>
      </div>

      {/* 증명서 카드 */}
      <div className="mt-6 overflow-hidden rounded-[14px] bg-ink px-5 py-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-accent">
          타임스탬프 증명서
        </p>
        <p className="mb-3 text-[13px] font-bold leading-relaxed text-cream">
          {formattedDate}에
          <br />
          마이프로덕트에 등록되었습니다.
        </p>
        <dl className="divide-y divide-white/10 text-[11px]">
          {[
            ["등록번호", `#${cert.registration_number}`],
            ["해시", hashShort],
            ["등록자", cert.nickname_snapshot],
          ].map(([key, val]) => (
            <div key={key} className="flex justify-between py-1.5">
              <dt className="text-[#9a958a]">{key}</dt>
              <dd className="font-mono font-semibold text-cream">{val}</dd>
            </div>
          ))}
        </dl>

        <a
          href={`/api/cert/${cert.registration_number}/view`}
          target="_blank"
          rel="noopener"
          className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-[8px] bg-white/10 text-[12px] font-bold text-cream transition-colors hover:bg-white/20"
        >
          📄 증명서 보기 / 인쇄
        </a>
      </div>

      {/* 제품 URL 복사 */}
      <div className="mt-4 flex items-center gap-2 rounded-[8px] border border-ink-10 bg-paper px-3 py-2.5">
        <span className="flex-1 truncate font-mono text-[12px] text-ink-60">{productUrl}</span>
        <CopyButton text={productUrl} />
      </div>

      {/* 공유 버튼 */}
      <div className="mt-3 flex gap-2">
        <a
          href={`https://twitter.com/intent/tweet?text=${xText}`}
          target="_blank"
          rel="noopener"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] border border-ink-10 py-2.5 text-[12px] font-semibold text-ink hover:bg-ink-10"
        >
          𝕏 공유하기
        </a>
        <a
          href={`https://pf.kakao.com/_share?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(cert.product_name_snapshot + " · 마이프로덕트에서 확인하세요")}`}
          target="_blank"
          rel="noopener"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] border border-ink-10 py-2.5 text-[12px] font-semibold text-ink hover:bg-ink-10"
        >
          💬 카톡 공유
        </a>
      </div>

      {/* 메인 CTA */}
      <div className="mt-6 flex flex-col gap-2.5">
        <Link
          href={`/p/${slug}`}
          className="flex h-[50px] items-center justify-center rounded-[14px] bg-ink text-[14px] font-bold text-cream transition-opacity hover:opacity-90"
        >
          내 제품 페이지 보기 →
        </Link>
        <Link
          href="/me/products"
          className="flex h-[44px] items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink"
        >
          내가 올린 제품 전체 보기
        </Link>
      </div>

      <p className="mt-4 text-center text-[11px] text-ink-40">
        등록 내역은{" "}
        <Link href={`/registry/${cert.registration_number}`} className="underline hover:text-ink">
          공개 레지스트리
        </Link>
        에서 누구나 확인할 수 있어요.
      </p>
    </div>
  );
}


export default async function SubmitDonePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const reg = sp.reg;
  const slug = sp.slug;

  if (!reg || !slug) notFound();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-ink-10 border-t-ink" />
        </div>
      }
    >
      <DoneContent reg={reg} slug={slug} />
    </Suspense>
  );
}
