"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateContentHash, generateRegistrationNumber } from "./hash";
import { generateUniqueSlug } from "./slug";
import { type Category } from "@/lib/constants/user";
import {
  PRODUCT_CATEGORY_VALUES,
  type ProductStage,
  type PricingModel,
} from "@/lib/constants/product";

// ─── AI 자동 채움 ─────────────────────────────────────────────────────────────

export type AiFillResult =
  | {
      ok: true;
      name: string;
      tagline: string;
      category: Category;
      thumbnailUrl: string | null;
      target_audience: string;
      problem_statement: string;
      solution_approach: string;
      differentiator: string;
      product_stage: ProductStage | null;
      pricing_model: PricingModel | null;
      auto_filled_fields: string[];
    }
  | { ok: false; error: string };

// SSRF 방어: 공개 외부 URL만 허용
function isValidPublicUrl(rawUrl: string): boolean {
  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch { return false; }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  const host = parsed.hostname.toLowerCase().replace(/\.+$/, "");
  if (host === "localhost" || host === "localhost.localdomain") return false;
  const blocked = ["127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"];
  if (blocked.includes(host)) return false;
  const parts = host.split(".").map(Number);
  if (parts.length === 4 && parts.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
    const [a, b] = parts;
    if (a === 10 || a === 127) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
  }
  return true;
}

// og:title / og:description / og:image 추출 (regex 기반, no DOM)
function extractMeta(html: string) {
  const ogAttr = (prop: string) => {
    const q = `["']`;
    return (
      html.match(new RegExp(`property\\s*=\\s*${q}${prop}${q}[^>]*content\\s*=\\s*${q}([^"']+)${q}`, "i"))?.[1] ??
      html.match(new RegExp(`content\\s*=\\s*${q}([^"']+)${q}[^>]*property\\s*=\\s*${q}${prop}${q}`, "i"))?.[1]
    );
  };
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

// HTML → 가독성 텍스트 (스크립트·스타일 제거, 앞 3000자)
function extractPageContent(html: string): string {
  const stripped = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
  return stripped.slice(0, 3000);
}

// 상대 URL → 절대 URL
function resolveUrl(base: string, url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  try { return new URL(url, base).href; } catch { return url; }
}

export async function aiFillFromUrl(inputUrl: string): Promise<AiFillResult> {
  const rawUrl = inputUrl.trim();
  if (!rawUrl) return { ok: false, error: "URL을 입력해주세요" };

  const normalized = rawUrl.includes("://") ? rawUrl : `https://${rawUrl}`;
  try { new URL(normalized); } catch { return { ok: false, error: "올바른 URL 형식이 아니에요" }; }
  if (!isValidPublicUrl(normalized)) return { ok: false, error: "허용되지 않는 URL이에요" };

  // 1. HTML fetch (타임아웃 8초)
  let html = "";
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(normalized, {
        signal: ctrl.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MyProduct-Bot/1.0; +https://myproduct.kr)" },
      });
      if (res.ok) html = await res.text();
    } finally {
      clearTimeout(timer);
    }
  } catch {
    // fetch 실패 → URL만으로 Claude 호출 시도
  }

  const { title: ogTitle, desc: ogDesc, image: ogImageRaw } = extractMeta(html);
  const ogImage = ogImageRaw ? resolveUrl(normalized, ogImageRaw) : null;
  const pageText = extractPageContent(html);

  // 2. Claude API 호출 (타임아웃 30초)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const anthropic = new Anthropic({ apiKey });

  const prompt = [
    "다음 제품 웹사이트 정보를 분석해서 JSON만 반환하세요. 다른 텍스트 없음.",
    "추출 불가능한 필드는 빈 문자열 (\"\"). 절대 거짓 정보 생성 금지.",
    "",
    `URL: ${normalized}`,
    `페이지 제목: ${ogTitle}`,
    `설명: ${ogDesc}`,
    pageText ? `\n본문 내용(일부):\n${pageText}` : "",
    "",
    "반환 형식 (JSON only):",
    "{",
    '  "name": "제품명 (2~40자)",',
    '  "tagline": "누구를 위한, 어떤 문제 해결 한 문장 (최대 150자)",',
    '  "category": "dev_tools|productivity|ai_data|community_content|learning|lifestyle|finance_commerce|etc",',
    '  "target_audience": "구체적인 타겟 사용자 (최대 200자)",',
    '  "problem_statement": "해결하는 문제 (최대 200자)",',
    '  "solution_approach": "해결 방법 (최대 200자)",',
    '  "differentiator": "차별점/강점 (최대 200자)",',
    '  "product_stage": "idea|prototype|beta|launched",',
    '  "pricing_model": "free|freemium|paid|tbd"',
    "}",
    "",
    "규칙:",
    "- product_stage: 라이브 서비스·결제·가입 가능하면 launched, 베타/테스트 중이면 beta",
    "- pricing_model: 가격 정보 불명확하면 tbd",
    "- 한국어 서비스면 한국어로, 영어 서비스면 영어로 작성",
  ].filter(Boolean).join("\n");

  try {
    const aiCtrl = new AbortController();
    const aiTimer = setTimeout(() => aiCtrl.abort(), 30000);
    let msg;
    try {
      msg = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });
    } finally {
      clearTimeout(aiTimer);
    }

    const raw = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[ai-fill-error] response not parseable:", raw.slice(0, 300));
      throw new Error("AI 응답을 파싱할 수 없어요");
    }

    const p = JSON.parse(jsonMatch[0]) as Record<string, string>;

    const str = (v: unknown, max: number) => String(v ?? "").slice(0, max);
    const name    = str(p.name, 40) || ogTitle.slice(0, 40);
    const tagline = str(p.tagline, 150) || ogDesc.slice(0, 150);
    const category = (PRODUCT_CATEGORY_VALUES as readonly string[]).includes(p.category)
      ? (p.category as Category)
      : "etc";
    const target_audience  = str(p.target_audience, 200);
    const problem_statement = str(p.problem_statement, 200);
    const solution_approach = str(p.solution_approach, 200);
    const differentiator   = str(p.differentiator, 200);
    const product_stage = (["idea", "prototype", "beta", "launched"] as string[]).includes(p.product_stage)
      ? (p.product_stage as ProductStage)
      : null;
    const pricing_model = (["free", "freemium", "paid", "tbd"] as string[]).includes(p.pricing_model)
      ? (p.pricing_model as PricingModel)
      : null;

    // 실제로 채워진 필드만 auto_filled_fields에 기록
    const auto_filled_fields: string[] = [];
    if (name)              auto_filled_fields.push("name");
    if (tagline)           auto_filled_fields.push("tagline");
    if (category !== "etc" || p.category === "etc") auto_filled_fields.push("category");
    if (target_audience)   auto_filled_fields.push("target_audience");
    if (problem_statement) auto_filled_fields.push("problem_statement");
    if (solution_approach) auto_filled_fields.push("solution_approach");
    if (differentiator)    auto_filled_fields.push("differentiator");
    if (product_stage)     auto_filled_fields.push("product_stage");
    if (pricing_model)     auto_filled_fields.push("pricing_model");
    if (ogImage)           auto_filled_fields.push("thumbnail_url");

    return {
      ok: true,
      name,
      tagline,
      category,
      thumbnailUrl: ogImage,
      target_audience,
      problem_statement,
      solution_approach,
      differentiator,
      product_stage,
      pricing_model,
      auto_filled_fields,
    };
  } catch (err) {
    const isApiErr = err instanceof Anthropic.APIError;
    console.error("[ai-fill-error]", {
      inputUrl,
      status: isApiErr ? err.status : undefined,
      body: isApiErr ? JSON.stringify(err.error)?.slice(0, 300) : String(err).slice(0, 300),
      hasApiKey: !!apiKey,
    });
    return { ok: false, error: err instanceof Error ? err.message : "AI 채움 실패" };
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
