import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

// Edge runtime 명시 — Cloudflare Pages 필수 요건
// proxy.ts(Next.js 16)는 항상 Node.js라 CF 미지원 → middleware.ts + edge 사용
export const runtime = "experimental-edge";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.*|robots.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml)$).*)",
  ],
};
