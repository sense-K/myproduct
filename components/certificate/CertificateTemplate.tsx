// 증명서 HTML 템플릿.
// - toCertificateHTML(): Puppeteer의 page.setContent()에 전달할 HTML 문자열 반환
// - CertificateCard: Next.js 페이지에서 증명서 UI를 렌더링하는 React 컴포넌트

export type CertData = {
  registration_number: string;
  content_hash: string;
  issued_at: string;
  product_name_snapshot: string;
  tagline_snapshot: string;
  category_snapshot: string;
  nickname_snapshot: string;
  career_tag_snapshot: string;
  verify_url: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  dev_tools: "개발자 도구", productivity: "생산성 / 업무",
  ai_data: "AI / 데이터", community_content: "커뮤니티 / 콘텐츠",
  learning: "학습 / 교육", lifestyle: "건강 / 라이프스타일",
  finance_commerce: "금융 / 커머스", etc: "기타",
};
const CAREER_LABELS: Record<string, string> = {
  pre_founder: "예비 창업자", under_1y: "1년 미만",
  "1_to_3y": "1~3년차", "3_to_5y": "3~5년차", over_5y: "5년차 이상",
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ` +
    `${String(d.getUTCHours()).padStart(2, "0")}:` +
    `${String(d.getUTCMinutes()).padStart(2, "0")}:` +
    `${String(d.getUTCSeconds()).padStart(2, "0")} (UTC)`
  );
}

// ─── HTML 문자열 생성 (Puppeteer용) ──────────────────────────────────────────

export function toCertificateHTML(cert: CertData): string {
  const hashShort = cert.content_hash.slice(0, 16) + "...";
  const catLabel = CATEGORY_LABELS[cert.category_snapshot] ?? cert.category_snapshot;
  const careerLabel = CAREER_LABELS[cert.career_tag_snapshot] ?? cert.career_tag_snapshot;

  const rows = [
    ["등록번호", `#${cert.registration_number}`],
    ["SHA-256 해시", hashShort],
    ["등록자", cert.nickname_snapshot],
    ["카테고리", catLabel],
    ["창업 경력", careerLabel],
  ];

  const rowsHTML = rows
    .map(
      ([k, v]) => `
      <div class="row">
        <span class="key">${k}</span>
        <span class="val">${v}</span>
      </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link
    rel="stylesheet"
    crossorigin
    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
  />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif;
      background: #1A1A1A;
      width: 210mm;
      min-height: 297mm;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20mm;
    }
    .card {
      background: #1A1A1A;
      color: #FBF6ED;
      width: 100%;
      max-width: 160mm;
      position: relative;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 36px;
    }
    .brand-icon {
      width: 36px; height: 36px;
      background: #F04D2E;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 900; color: #FBF6ED;
    }
    .brand-name {
      font-size: 16px; font-weight: 800; color: #FBF6ED;
    }
    .badge {
      font-size: 9px; font-weight: 700;
      letter-spacing: 0.15em; text-transform: uppercase;
      color: #F04D2E; margin-bottom: 10px;
    }
    .title {
      font-size: 28px; font-weight: 800;
      line-height: 1.3; margin-bottom: 8px;
      color: #FFFFFF; letter-spacing: -0.02em;
    }
    .tagline {
      font-size: 13px; color: #9a958a;
      line-height: 1.6; margin-bottom: 32px;
    }
    .timestamp {
      font-size: 13px; font-weight: 700;
      color: #FFFFFF;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 20px; margin-bottom: 16px;
    }
    .row {
      display: flex; justify-content: space-between;
      padding: 9px 0;
      border-top: 1px solid rgba(255,255,255,0.07);
      font-size: 11px;
    }
    .key { color: #9a958a; }
    .val { font-weight: 700; color: #FFFFFF; text-align: right; }
    .notice {
      margin-top: 28px;
      padding: 14px;
      background: rgba(255,255,255,0.06);
      border-radius: 8px;
      font-size: 10px; color: #9a958a; line-height: 1.7;
    }
    .verify-url {
      font-size: 10px; color: #F04D2E;
      margin-top: 12px; word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">
      <div class="brand-icon">M</div>
      <span class="brand-name">마이프로덕트</span>
    </div>
    <p class="badge">타임스탬프 등록 증명서</p>
    <h1 class="title">${escapeHtml(cert.product_name_snapshot)}</h1>
    <p class="tagline">${escapeHtml(cert.tagline_snapshot)}</p>
    <p class="timestamp">등록 일시: ${formatDateTime(cert.issued_at)}</p>
    ${rowsHTML}
    <div class="notice">
      본 증명서는 특정 시각에 해당 내용이 마이프로덕트에 등록되었음을 기록한 문서입니다.
      법적 효력은 제한적이며 참고 자료로만 활용해주세요.
    </div>
    <p class="verify-url">${escapeHtml(cert.verify_url)}</p>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── React 컴포넌트 (Next.js 페이지용) ───────────────────────────────────────

export function CertificateCard({ cert }: { cert: CertData }) {
  const hashShort = cert.content_hash.slice(0, 16) + "...";
  const catLabel = CATEGORY_LABELS[cert.category_snapshot] ?? cert.category_snapshot;
  const careerLabel = CAREER_LABELS[cert.career_tag_snapshot] ?? cert.career_tag_snapshot;
  const issuedDate = new Date(cert.issued_at).toLocaleString("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZone: "UTC",
  }) + " (UTC)";

  const rows: [string, string][] = [
    ["등록번호", `#${cert.registration_number}`],
    ["SHA-256 해시", hashShort],
    ["등록자", cert.nickname_snapshot],
    ["카테고리", catLabel],
    ["창업 경력", careerLabel],
  ];

  return (
    <div className="relative overflow-hidden rounded-[14px] bg-ink px-5 py-5 text-cream">
      <span className="pointer-events-none absolute -bottom-5 -right-5 text-[90px] opacity-[0.06]">🛡️</span>

      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-accent text-lg font-black text-cream">M</div>
        <span className="text-[15px] font-extrabold">마이프로덕트</span>
      </div>

      <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-accent">타임스탬프 등록 증명서</p>
      <h2 className="mb-1.5 text-[22px] font-extrabold leading-tight tracking-tight">{cert.product_name_snapshot}</h2>
      <p className="mb-6 text-[12px] text-[#9a958a]">{cert.tagline_snapshot}</p>

      <p className="mb-4 border-t border-white/10 pt-4 text-[12px] font-bold">
        등록 일시: {issuedDate}
      </p>

      <dl className="divide-y divide-white/[0.07] text-[11px]">
        {rows.map(([key, val]) => (
          <div key={key} className="flex justify-between py-2">
            <dt className="text-[#9a958a]">{key}</dt>
            <dd className="font-bold">{val}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 rounded-[8px] bg-white/[0.06] p-3 text-[10px] leading-relaxed text-[#9a958a]">
        본 증명서는 특정 시각에 해당 내용이 마이프로덕트에 등록되었음을 기록한 문서입니다.
        법적 효력은 제한적이며 참고 자료로만 활용해주세요.
      </p>
      <p className="mt-2.5 break-all text-[10px] text-accent">{cert.verify_url}</p>
    </div>
  );
}
