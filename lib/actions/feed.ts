"use server";

import type { FeedProduct } from "@/types/feed";
import { getThumbnailUrl } from "@/lib/product/thumbnail";

type LoadMoreResult = {
  items: FeedProduct[];
  hasMore: boolean;
  lastCursor: string | null;
};

export async function loadMoreFeed({
  cat,
  sort,
  after,
}: {
  cat: string;
  sort: string;
  after: string;
}): Promise<LoadMoreResult> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    let query = supabase
      .from("products")
      .select(
        "slug, name, tagline, category, feedback_count, view_count, created_at, thumbnail_url, og_image_url, certificates(registration_number)",
      )
      .eq("status", "public")
      .limit(12);

    if (cat && cat !== "all") query = query.eq("category", cat);

    if (sort === "feedback") {
      query = query
        .order("feedback_count", { ascending: false })
        .order("created_at", { ascending: false });
    } else if (sort === "views") {
      query = query
        .order("view_count", { ascending: false })
        .order("created_at", { ascending: false });
    } else {
      query = query.lt("created_at", after).order("created_at", { ascending: false });
    }

    const { data } = await query;
    if (data && data.length > 0) {
      const items: FeedProduct[] = data.map((p: any) => ({
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        category: p.category,
        feedback_count: p.feedback_count,
        view_count: p.view_count,
        hasCertificate: (p.certificates?.length ?? 0) > 0,
        thumbnailUrl: getThumbnailUrl({ thumbnail_url: p.thumbnail_url, og_image_url: p.og_image_url }),
        gradientFrom: "#2D5F3F",
        gradientTo: "#3d7a52",
        label: p.name.slice(0, 6),
        created_at: p.created_at,
      }));
      return {
        items,
        hasMore: items.length === 12,
        lastCursor: items.at(-1)?.created_at ?? null,
      };
    }
  } catch {
    // DB 오류
  }

  return { items: [], hasMore: false, lastCursor: null };
}
