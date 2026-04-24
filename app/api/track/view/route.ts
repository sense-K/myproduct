import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { productId, fingerprint } = await request.json();
    if (!productId || !fingerprint) return NextResponse.json({ ok: false }, { status: 400 });

    const supabase = createAdminClient();
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 24h 이내 동일 fingerprint 중복 체크
    const { data: existing } = await supabase
      .from("product_views")
      .select("id")
      .eq("product_id", productId)
      .eq("viewer_fingerprint", fingerprint)
      .gte("viewed_at", cutoff)
      .limit(1)
      .maybeSingle();

    if (existing) return NextResponse.json({ counted: false });

    await supabase.from("product_views").insert({
      product_id: productId,
      viewer_fingerprint: fingerprint,
    });

    return NextResponse.json({ counted: true });
  } catch {
    // 마이그레이션 미완료 등 예외는 무시
    return NextResponse.json({ ok: false });
  }
}
