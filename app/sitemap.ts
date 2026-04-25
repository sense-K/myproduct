import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/config";
import { createAdminClient } from "@/lib/supabase/admin";

// PRD 9.5 — 동적 sitemap.
// Phase 1은 단일 sitemap.xml로 운영. 제품 수 10k+ 시 sitemap-index 분할 방식으로 전환.

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  { url: `${SITE_URL}/feed`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  { url: `${SITE_URL}/registry`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${SITE_URL}/guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const admin = createAdminClient();

    // 공개 제품
    const { data: products } = await admin
      .from("products")
      .select("slug, updated_at")
      .eq("status", "public")
      .order("created_at", { ascending: false })
      .limit(5000);

    const productUrls: MetadataRoute.Sitemap = (products ?? []).map((p: { slug: string; updated_at: string }) => ({
      url: `${SITE_URL}/p/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // 공개 레지스트리 (증명서)
    const { data: registry } = await admin
      .from("registry_entries")
      .select("registration_number, created_at")
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(5000);

    const registryUrls: MetadataRoute.Sitemap = (registry ?? []).map((r: { registration_number: string; created_at: string }) => ({
      url: `${SITE_URL}/registry/${r.registration_number}`,
      lastModified: new Date(r.created_at),
      changeFrequency: "never",
      priority: 0.5,
    }));

    return [...STATIC_PAGES, ...productUrls, ...registryUrls];
  } catch {
    // 마이그레이션 미실행 등 DB 오류 시 정적 페이지만 반환
    return STATIC_PAGES;
  }
}
