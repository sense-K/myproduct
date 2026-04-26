"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateContentHash, generateRegistrationNumber } from "./hash";
import { generateUniqueSlug } from "./slug";
import { CATEGORY_VALUES, type Category } from "@/lib/constants/user";

// ─── AI 자동 채움 ─────────────────────────────────────────────────────────────

export type AiFillResult =
  | { ok: true; name: string; tagline: string; category: Category; thumbnailUrl: string | null }
  | { ok: false; error: string };

// SSRF 방어: 공개 외부 URL만 허용
function isValidPublicUrl(rawUrl: string): boolean {
  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch { return false; }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

  const host = parsed.hostname.toLowerCase().replace(/\.+$/, "");

  // 로컬 호스트 차단
  if (host === "localhost" || host === "localhost.localdomain") return false;

  // 루프백·링크로컬·메타데이터 IP 문자열 차단
  const blocked = ["127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"];
  if (blocked.includes(host)) return false;

  // IPv4 사설 대역 차단 (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x)
  const parts = host.split(".").map(Number);
  if (parts.length === 4 && parts.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
    const [a, b] = parts;
    if (a === 10) return false;
    if (a === 127) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
  }

  return true;
}

// 큰따옴표·작은따옴표 모두 처리하는 메타 추출
function extractMeta(html: string) {
  const q = `["']`;
  const val = (attr: string) =>
    new RegExp(`${attr}\\s*=\\s*${q}([^"']+)${q}`, "i");

  const ogAttr = (prop: string) =>
    html.match(
      new RegExp(
        `property\\s*=\\s*${q}${prop}${q}[^>]*content\\s*=\\s*${q}([^"']+)${q}`,
        "i",
      ),
    )?.[1] ??
    html.match(
      new RegExp(
        `content\\s*=\\s*${q}([^"']+)${q}[^>]*property\\s*=\\s*${q}${prop}${q}`,
        "i",
      ),
    )?.[1];

  const title =
    ogAttr("og:title") ??
    html.match(/name\s*=\s*["']title["'][^>]*content\s*=\s*["']([^"']+)["']/i)?.[1] ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ??
    "";

  const desc =
    ogAttr("og:description") ??
    html.match(/name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']+)["']/i)?.[1] ??
    html.match(/content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']description["']/i)?.[1] ??
    "";

  const image = ogAttr("og:image") ?? null;

  return { title, desc, image };
}

export async function aiFillFromUrl(url: string): Promise<AiFillResult> {
  const normalized = url.startsWith("http") ? url : `https://${url}`;

  // SSRF 차단
  if (!isValidPublicUrl(normalized)) {
    return { ok: false, error: "허용되지 않는 URL이에요" };
  }

  try {
    // 1. URL에서 HTML 메타 추출 (타임아웃 5초)
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    let html = "";
    try {
      const res = await fetch(normalized, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; MyProduct-Bot/1.0; +https://myproduct.kr)",
        },
      });
      if (res.ok) html = await res.text();
    } catch {
      // fetch 실패해도 AI 호출 시도 (URL 자체를 단서로)
    } finally {
      clearTimeout(timer);
    }

    const { title: ogTitle, desc: ogDesc, image: ogImage } = extractMeta(html);

    // 2. Claude API 호출
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[aiFillFromUrl] ANTHROPIC_API_KEY is not set");
      throw new Error("ANTHROPIC_API_KEY not set");
    }

    const anthropic = new Anthropic({ apiKey });

    const prompt = [
      `다음 제품 웹사이트 정보를 바탕으로 JSON만 반환하세요 (다른 텍스트 없음):`,
      ``,
      `URL: ${normalized}`,
      `페이지 제목: ${ogTitle}`,
      `설명: ${ogDesc}`,
      ``,
      `반환 형식 (JSON only):`,
      `{`,
      `  "name": "제품명 (2~40자, 한국어 가능)",`,
      `  "tagline": "한 줄 소개 (10~150자, 핵심 가치 중심)",`,
      `  "category": "saas|mobile_app|webtoon_creative|quirky|etc 중 하나"`,
      `}`,
      ``,
      `규칙: name은 간결하게, tagline은 누가 쓰는지+뭘 해결하는지를 담아주세요.`,
    ].join("\n");

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";

    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[aiFillFromUrl] AI response not parseable:", text.slice(0, 200));
      throw new Error("AI 응답을 파싱할 수 없어요");
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      name?: string;
      tagline?: string;
      category?: string;
    };

    const category = CATEGORY_VALUES.includes(parsed.category as Category)
      ? (parsed.category as Category)
      : "etc";

    return {
      ok: true,
      name: String(parsed.name ?? "").slice(0, 40) || ogTitle.slice(0, 40) || "내 제품",
      tagline:
        String(parsed.tagline ?? "").slice(0, 150) ||
        ogDesc.slice(0, 150) ||
        "한 줄 소개를 입력해주세요",
      category,
      thumbnailUrl: ogImage,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI 채움 실패";
    console.error("[aiFillFromUrl] error:", msg);
    return { ok: false, error: msg };
  }
}

// ─── 제품 등록 트랜잭션 ───────────────────────────────────────────────────────

export type RegisterInput = {
  name: string;
  tagline: string;
  maker_quote: string | null;
  category: Category;
  external_url: string | null;
  submission_type: "url" | "manual";
  thumbnail_url: string | null;
  // v2 fields (all nullable — DB allows existing rows without them)
  target_audience?: string;
  problem_statement?: string;
  solution_approach?: string;
  differentiator?: string | null;
  product_stage?: string | null;
  pricing_model?: string | null;
  feedback_categories?: string[];
  maker_note?: string | null;
  screenshot_urls?: string[];
  demo_video_url?: string | null;
};

export type RegisterResult =
  | { ok: true; slug: string; regNum: string }
  | { ok: false; error: string };

export async function registerProduct(input: RegisterInput): Promise<RegisterResult> {
  const supabase = await createClient();
  const admin = createAdminClient();

  // 1. 로그인 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요해요" };

  // 2. 유저 프로필 확인
  const { data: profile } = await supabase
    .from("users")
    .select("id, nickname, career_tag")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return { ok: false, error: "프로필 설정을 먼저 완료해주세요" };

  // 3. 크레딧 잔고 확인 (개발 환경은 바이패스)
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev) {
    const { data: creditRows } = await admin
      .from("credits")
      .select("amount")
      .eq("user_id", user.id);
    const balance = (creditRows ?? []).reduce((s, r) => s + r.amount, 0);
    if (balance < 1)
      return { ok: false, error: "등록권이 없어요. 먼저 피드백을 남겨주세요" };
  }

  const registeredAt = new Date().toISOString();

  // 4. 고유 슬러그 생성
  const slug = await generateUniqueSlug(input.name, async (s) => {
    const { data } = await admin
      .from("products")
      .select("id")
      .eq("slug", s)
      .maybeSingle();
    return !!data;
  });

  // 5. products INSERT
  const { data: product, error: prodErr } = await admin
    .from("products")
    .insert({
      owner_id: user.id,
      slug,
      name: input.name,
      tagline: input.tagline,
      maker_quote: input.maker_note || input.maker_quote || null,
      category: input.category,
      thumbnail_url: input.thumbnail_url,
      external_url: input.external_url,
      submission_type: input.submission_type,
      status: "public",
      // v2 fields
      target_audience: input.target_audience || null,
      problem_statement: input.problem_statement || null,
      solution_approach: input.solution_approach || null,
      differentiator: input.differentiator || null,
      product_stage: input.product_stage || null,
      pricing_model: input.pricing_model || null,
      feedback_categories: input.feedback_categories?.length ? input.feedback_categories : null,
      maker_note: input.maker_note || null,
      screenshot_urls: input.screenshot_urls?.length ? input.screenshot_urls : null,
      demo_video_url: input.demo_video_url || null,
    })
    .select("id")
    .single();

  if (prodErr || !product)
    return { ok: false, error: prodErr?.message ?? "제품 등록에 실패했어요" };

  const productId = product.id;

  try {
    // 6. product_versions INSERT (is_initial=true)
    const contentHash = generateContentHash({
      name: input.name,
      tagline: input.tagline,
      maker_quote: input.maker_quote ?? null,
      category: input.category,
      nickname: profile.nickname,
      registered_at: registeredAt,
    });

    await admin.from("product_versions").insert({
      product_id: productId,
      version_label: "v1.0 · 최초 등록",
      change_note: null,
      new_thumbnail_url: input.thumbnail_url,
      new_external_url: input.external_url,
      content_hash: contentHash,
      is_initial: true,
      version_number: 1,
    });

    // 7. 등록번호 생성 (중복 방지)
    let regNum = generateRegistrationNumber();
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await admin
        .from("certificates")
        .select("id")
        .eq("registration_number", regNum)
        .maybeSingle();
      if (!existing) break;
      regNum = generateRegistrationNumber();
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const pdfUrl = `${siteUrl}/api/cert/${regNum}/view`;

    // 8. certificates INSERT
    await admin.from("certificates").insert({
      product_id: productId,
      registration_number: regNum,
      content_hash: contentHash,
      product_name_snapshot: input.name,
      tagline_snapshot: input.tagline,
      category_snapshot: input.category,
      nickname_snapshot: profile.nickname,
      career_tag_snapshot: profile.career_tag,
      pdf_url: pdfUrl,
    });

    // 9. registry_entries INSERT
    const { data: cert } = await admin
      .from("certificates")
      .select("id")
      .eq("registration_number", regNum)
      .single();
    if (cert) {
      await admin.from("registry_entries").insert({
        certificate_id: cert.id,
        registration_number: regNum,
        is_visible: true,
      });
    }

    // 10. credits 차감 (dev 환경에서는 생략)
    if (!isDev) {
      const { data: creditRows } = await admin
        .from("credits")
        .select("amount")
        .eq("user_id", user.id);
      const balance = (creditRows ?? []).reduce((s: number, r: any) => s + r.amount, 0);
      await admin.from("credits").insert({
        user_id: user.id,
        transaction_type: "spent_on_submission",
        amount: -1,
        related_product_id: productId,
        balance_after: balance - 1,
        note: `제품 등록: ${input.name}`,
      });
    }

    // 11. 증명서 발급 완료 이메일 (비동기, 실패해도 무시)
    import("@/lib/email/send")
      .then(({ sendCertIssuedNotification }) =>
        sendCertIssuedNotification({
          userId: user.id,
          productName: input.name,
          productSlug: slug,
          registrationNumber: regNum,
        }),
      )
      .catch(() => null);

    return { ok: true, slug, regNum };
  } catch (err) {
    // 보상 트랜잭션: 제품 삭제
    await admin.from("products").delete().eq("id", productId);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "등록 중 오류가 발생했어요",
    };
  }
}

// ─── 크레딧 잔고 조회 ─────────────────────────────────────────────────────────

export async function getCreditBalance(): Promise<number> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;
    const admin = createAdminClient();
    const { data } = await admin
      .from("credits")
      .select("amount")
      .eq("user_id", user.id);
    return (data ?? []).reduce((s, r) => s + r.amount, 0);
  } catch {
    return 0;
  }
}

// 개발용: 크레딧 1개 지급
export async function grantDevCredit(): Promise<void> {
  if (process.env.NODE_ENV !== "development") return;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const admin = createAdminClient();
  await admin.from("credits").insert({
    user_id: user.id,
    transaction_type: "admin_grant",
    amount: 1,
    balance_after: 1,
    note: "개발 테스트용 지급",
  });
}
