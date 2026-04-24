import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RegistryEntry } from "@/lib/mock/registry";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const after = searchParams.get("after");

  try {
    const admin = createAdminClient();
    let query = admin
      .from("registry_entries")
      .select(
        `registration_number, created_at,
         certificates(product_name_snapshot, tagline_snapshot, nickname_snapshot, content_hash, issued_at,
           products(slug))`,
      )
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (after) query = query.lt("created_at", after);

    const { data } = await query;
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
      return NextResponse.json({
        items,
        hasMore: items.length === PAGE_SIZE,
        nextCursor: items.at(-1)?.issued_at ?? null,
      });
    }
  } catch { /* DB 미연동 */ }

  return NextResponse.json({ items: [], hasMore: false, nextCursor: null });
}
