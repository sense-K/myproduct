import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_NAME } from "@/lib/seo/config";
import { FeedbackForm } from "./feedback-form";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("products")
      .select("id, slug, name, tagline, thumbnail_url, external_url, feedback_count")
      .eq("slug", slug)
      .eq("status", "public")
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

export default async function FeedbackSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col">
      {/* 슬림 헤더 */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-10 bg-cream/95 px-4 py-3 backdrop-blur-sm">
        <Link href="/feedback/pick" className="text-sm font-semibold text-ink-60 hover:text-ink">
          ← 뒤로
        </Link>
        <span className="text-[14px] font-extrabold tracking-tight">
          <span className="mr-1 text-accent">●</span>
          {SITE_NAME}
        </span>
        <div className="w-12" />
      </div>

      {/* 제품 미니 카드 */}
      <div className="border-b border-ink-10 bg-paper px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-ink-40">
          피드백 대상
        </p>
        <div className="mt-1.5 flex items-center gap-2.5">
          <div
            className="h-9 w-9 flex-shrink-0 rounded-[6px]"
            style={{ background: "linear-gradient(135deg, #2D5F3F 0%, #3d7a52 100%)" }}
          />
          <div className="min-w-0">
            <p className="text-[13px] font-bold leading-snug">{product.name}</p>
            <p className="truncate text-[11px] text-ink-60">{product.tagline}</p>
          </div>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-60">
          💬 솔직하게 말해주세요. 다만 창업자가 밤새 만든 걸 봐주는 거예요.
        </p>
      </div>

      <FeedbackForm
        productId={product.id}
        productSlug={slug}
        productName={product.name}
      />
    </div>
  );
}
