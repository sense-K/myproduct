import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ ok: false }, { status: 400 });

    const supabase = createAdminClient();
    await supabase.from("product_clicks").insert({ product_id: productId });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
