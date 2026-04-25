import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { toCertificateHTML, type CertData } from "@/components/certificate/CertificateTemplate";
import { SITE_URL } from "@/lib/seo/config";

// ─── Cloudflare 브라우저 바인딩 가져오기 ─────────────────────────────────────
// CF Pages 환경에서만 사용 가능. 로컬 Node.js dev에서는 null 반환.
async function getCFBrowser(): Promise<unknown | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    return (ctx.env as Record<string, unknown>)?.BROWSER ?? null;
  } catch {
    // 로컬 dev 또는 CF 환경 아님 → null
    return null;
  }
}

// ─── 증명서 데이터 조회 ────────────────────────────────────────────────────────
async function fetchCertData(regnum: string): Promise<CertData | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("certificates")
    .select(
      "registration_number, content_hash, issued_at, " +
        "product_name_snapshot, tagline_snapshot, category_snapshot, " +
        "nickname_snapshot, career_tag_snapshot",
    )
    .eq("registration_number", regnum)
    .maybeSingle();

  if (!data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as unknown as Record<string, string>;
  return { ...row, verify_url: `${SITE_URL}/registry/${row.registration_number}` } as CertData;
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET(
  request: Request,
  { params }: { params: Promise<{ regnum: string }> },
) {
  const { regnum } = await params;
  const { origin } = new URL(request.url);

  // 1. CF 브라우저 바인딩 확인
  const browserBinding = await getCFBrowser();

  if (!browserBinding) {
    // 로컬 dev: /view 페이지로 리다이렉트 (브라우저 print-to-PDF)
    console.log(`[cert/pdf] 로컬 환경 — /view로 리다이렉트: ${regnum}`);
    return NextResponse.redirect(`${origin}/api/cert/${regnum}/view`, { status: 302 });
  }

  // 2. 증명서 데이터 조회
  let certData: CertData | null = null;
  try {
    certData = await fetchCertData(regnum);
  } catch (err) {
    console.error("[cert/pdf] DB 조회 실패:", err);
  }

  if (!certData) {
    return new NextResponse("증명서를 찾을 수 없어요", { status: 404 });
  }

  // 3. Puppeteer로 PDF 생성 (CF Browser Rendering)
  try {
    const puppeteer = await import("@cloudflare/puppeteer");
    const browser = await puppeteer.default.launch(browserBinding as Parameters<typeof puppeteer.default.launch>[0]);
    const page = await browser.newPage();

    // A4 뷰포트 (210mm × 297mm @ 96dpi)
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    // HTML 설정 후 폰트(CDN) 로딩까지 대기
    const html = toCertificateHTML(certData);
    await page.setContent(html, { waitUntil: "networkidle0" });

    // 폰트 렌더링 안정화를 위해 추가 대기
    await new Promise((r) => setTimeout(r, 500));

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true, // 검정 배경 포함 필수
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();

    // 4. Supabase Storage 업로드 (캐싱 — 생략 가능, 이미 있으면 skip)
    try {
      const admin = createAdminClient();
      const filePath = `certificates/${regnum}.pdf`;

      await admin.storage
        .from("certificates")
        .upload(filePath, pdf, {
          contentType: "application/pdf",
          upsert: false, // 이미 있으면 skip
        });

      // pdf_url 업데이트
      const { data: publicUrl } = admin.storage
        .from("certificates")
        .getPublicUrl(filePath);

      if (publicUrl.publicUrl) {
        await admin
          .from("certificates")
          .update({ pdf_url: publicUrl.publicUrl })
          .eq("registration_number", regnum);
      }
    } catch {
      // 스토리지 업로드 실패는 무시 — PDF는 어차피 반환함
    }

    // Edge runtime은 Buffer 대신 Uint8Array를 BodyInit으로 요구
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="certificate-${regnum}.pdf"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[cert/pdf] Puppeteer 오류:", err);
    // 생성 실패 시 /view 페이지로 폴백
    return NextResponse.redirect(`${origin}/api/cert/${regnum}/view`, { status: 302 });
  }
}
