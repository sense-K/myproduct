import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { toCertificateHTML, type CertData } from "@/components/certificate/CertificateTemplate";
import { SITE_URL } from "@/lib/seo/config";

// 브라우저 렌더링용 HTML 증명서.
// - 로컬 dev와 CF Pages 양쪽에서 동작.
// - 폰트: Pretendard CDN (브라우저가 직접 로딩) → 한글 완벽 렌더링.
// - 페이지 하단 "PDF로 저장 (인쇄)" 버튼으로 사용자가 직접 PDF 저장.
// - /api/cert/[regnum]/pdf 가 CF Browser Rendering으로 PDF 생성에 실패하면 이 URL로 폴백.

export async function GET(_req: Request, { params }: { params: Promise<{ regnum: string }> }) {
  const { regnum } = await params;

  const admin = createAdminClient();
  const { data: cert } = await admin
    .from("certificates")
    .select(
      "registration_number, content_hash, issued_at, " +
        "product_name_snapshot, tagline_snapshot, category_snapshot, " +
        "nickname_snapshot, career_tag_snapshot",
    )
    .eq("registration_number", regnum)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const certRow = cert as any;
  const data: CertData = cert
    ? { ...certRow, verify_url: `${SITE_URL}/registry/${certRow.registration_number}` }
    : {
        registration_number: regnum,
        content_hash: "MOCK-HASH-" + regnum,
        issued_at: new Date().toISOString(),
        product_name_snapshot: "제품",
        tagline_snapshot: "한 줄 소개",
        category_snapshot: "etc",
        nickname_snapshot: "익명 메이커",
        career_tag_snapshot: "pre_founder",
        verify_url: `${SITE_URL}/registry/${regnum}`,
      };

  // toCertificateHTML 결과에 인쇄 버튼을 추가
  const baseHtml = toCertificateHTML(data);
  const html = baseHtml.replace(
    "</body>",
    `  <div style="position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;align-items:flex-end;gap:8px;font-family:'Pretendard Variable',Pretendard,-apple-system,sans-serif;">
    <button onclick="window.print()" style="background:#F04D2E;color:#FBF6ED;border:none;padding:12px 24px;border-radius:100px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">
      📄 PDF로 저장 (인쇄)
    </button>
    <p style="font-size:10px;color:#9a958a;text-align:right;">인쇄 대화상자 → 대상: PDF로 저장</p>
  </div>
  <style>@media print{div[style*="position:fixed"]{display:none!important}}</style>
</body>`,
  );

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
