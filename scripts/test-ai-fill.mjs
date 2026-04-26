// AI 자동 채움 테스트 스크립트
// 실행: node --env-file=.env.local scripts/test-ai-fill.mjs

// Server Action을 직접 호출할 수 없으므로, actions.ts의 로직을 재현해서 테스트
import Anthropic from "@anthropic-ai/sdk";

const URLS = [
  { label: "형 서비스 (SSR/SSG 예상)", url: "https://undercov.kr" },
  { label: "Stripe (대형, 잘 된 메타)", url: "https://stripe.com" },
  { label: "메타 없는 사이트 (SPA 예상)", url: "https://news.ycombinator.com" },
  { label: "존재하지 않는 URL (fetch 실패)", url: "https://nonexistent-site-12345xyz.com" },
  { label: "myproduct.kr (자기 자신)", url: "https://myproduct.kr" },
];

function extractMeta(html) {
  const ogAttr = (prop) => {
    const q = `["']`;
    return (
      html.match(new RegExp(`property\\s*=\\s*${q}${prop}${q}[^>]*content\\s*=\\s*${q}([^"']+)${q}`, "i"))?.[1] ??
      html.match(new RegExp(`content\\s*=\\s*${q}([^"']+)${q}[^>]*property\\s*=\\s*${q}${prop}${q}`, "i"))?.[1]
    );
  };
  const title =
    ogAttr("og:title") ??
    html.match(/name\s*=\s*["']title["'][^>]*content\s*=\s*["']([^"']+)["']/i)?.[1] ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
  const desc =
    ogAttr("og:description") ??
    html.match(/name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
  const image = ogAttr("og:image") ?? null;
  return { title, desc, image };
}

function extractPageContent(html) {
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

function resolveUrl(base, url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  try { return new URL(url, base).href; } catch { return url; }
}

const PRODUCT_CATEGORY_VALUES = ["dev_tools","productivity","ai_data","community_content","learning","lifestyle","finance_commerce","etc"];
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function testUrl({ label, url }) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📌 ${label}`);
  console.log(`   ${url}`);

  // 1. HTML fetch
  let html = "";
  let fetchStatus = "성공";
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MyProduct-Bot/1.0)" },
      });
      if (res.ok) html = await res.text();
      else fetchStatus = `HTTP ${res.status}`;
    } finally { clearTimeout(t); }
  } catch (e) {
    fetchStatus = `실패: ${e.message?.slice(0, 50)}`;
  }
  console.log(`   fetch: ${fetchStatus} | HTML: ${html.length}자`);

  const { title, desc, image: imageRaw } = extractMeta(html);
  const thumbnail_url = imageRaw ? resolveUrl(url, imageRaw) : null;
  const pageText = extractPageContent(html);
  console.log(`   og:title: ${title?.slice(0, 60) || "(없음)"}`);
  console.log(`   og:desc:  ${desc?.slice(0, 80) || "(없음)"}`);
  console.log(`   og:image: ${thumbnail_url?.slice(0, 80) || "(없음)"}`);
  console.log(`   pageText: ${pageText.length}자`);

  // 2. Claude 호출
  const prompt = [
    "다음 제품 웹사이트 정보를 분석해서 JSON만 반환하세요. 다른 텍스트 없음.",
    "추출 불가능한 필드는 빈 문자열. 절대 거짓 정보 생성 금지.",
    "",
    `URL: ${url}`,
    `페이지 제목: ${title}`,
    `설명: ${desc}`,
    pageText ? `\n본문 내용(일부):\n${pageText}` : "",
    "",
    '{"name":"","tagline":"","category":"dev_tools|productivity|ai_data|community_content|learning|lifestyle|finance_commerce|etc","target_audience":"","problem_statement":"","solution_approach":"","differentiator":"","product_stage":"idea|prototype|beta|launched","pricing_model":"free|freemium|paid|tbd"}',
    "",
    "- product_stage: 라이브 서비스면 launched, 베타면 beta",
    "- pricing_model: 정보 없으면 tbd",
    "- 한국어 서비스면 한국어로 작성",
  ].filter(Boolean).join("\n");

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) { console.log("   ❌ JSON 파싱 실패:", raw.slice(0, 100)); return; }

    const p = JSON.parse(jsonMatch[0]);
    const category = PRODUCT_CATEGORY_VALUES.includes(p.category) ? p.category : "etc";
    const filledFields = Object.entries({
      name: p.name, tagline: p.tagline, target_audience: p.target_audience,
      problem_statement: p.problem_statement, solution_approach: p.solution_approach,
      differentiator: p.differentiator,
      product_stage: p.product_stage && p.product_stage !== "" ? p.product_stage : null,
      pricing_model: p.pricing_model && p.pricing_model !== "" ? p.pricing_model : null,
    }).filter(([, v]) => v).map(([k]) => k);

    console.log(`\n   ✅ 채워진 필드 (${filledFields.length}/8): ${filledFields.join(", ") || "없음"}`);
    console.log(`   thumbnail: ${thumbnail_url ? "있음" : "없음"}`);
    console.log(`   SPA 경고: ${filledFields.length <= 2 ? "⚠️ 표시됨" : "없음"}`);
    console.log(`\n   name:     ${String(p.name ?? "").slice(0, 50)}`);
    console.log(`   tagline:  ${String(p.tagline ?? "").slice(0, 80)}`);
    console.log(`   category: ${category}`);
    console.log(`   audience: ${String(p.target_audience ?? "").slice(0, 60)}`);
    console.log(`   problem:  ${String(p.problem_statement ?? "").slice(0, 60)}`);
    console.log(`   solution: ${String(p.solution_approach ?? "").slice(0, 60)}`);
    console.log(`   differ:   ${String(p.differentiator ?? "").slice(0, 60)}`);
    console.log(`   stage:    ${p.product_stage || "(비어있음)"}`);
    console.log(`   pricing:  ${p.pricing_model || "(비어있음)"}`);
  } catch (e) {
    console.log(`   ❌ Claude 호출 실패: ${e.message}`);
  }
}

for (const testCase of URLS) {
  await testUrl(testCase);
}
console.log("\n\n=== 테스트 완료 ===");
