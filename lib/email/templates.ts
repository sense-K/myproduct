import { SITE_URL, SITE_NAME } from "@/lib/seo/config";

// 공통 CSS (인라인 스타일로 이메일 클라이언트 호환)
const baseStyle = `
  font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
  color: #1A1A1A;
  background: #FBF6ED;
  margin: 0; padding: 0;
`;

function wrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>마이프로덕트</title>
</head>
<body style="${baseStyle}">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <!-- 헤더 -->
    <div style="margin-bottom:28px;">
      <span style="display:inline-flex;align-items:center;gap:8px;font-size:15px;font-weight:800;letter-spacing:-0.02em;">
        <span style="display:inline-block;width:28px;height:28px;background:#F04D2E;border-radius:6px;text-align:center;line-height:28px;color:#FBF6ED;font-size:14px;font-weight:900;">M</span>
        ${SITE_NAME}
      </span>
    </div>
    <!-- 콘텐츠 -->
    ${content}
    <!-- 푸터 -->
    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #E8E4DB;font-size:11px;color:#858585;line-height:1.7;">
      <p>본 이메일은 마이프로덕트 가입 시 동의한 이메일 알림입니다.</p>
      <p>수신 거부: <a href="${SITE_URL}/me/settings" style="color:#F04D2E;">마이페이지 → 설정</a>에서 알림을 끌 수 있어요.</p>
      <p style="margin-top:8px;">${SITE_URL}</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── A. 버전 업데이트 알림 (PRD 6.3.4-A) ────────────────────────────────────

export function versionUpdateTemplate({
  recipientNickname,
  productName,
  productSlug,
  versionLabel,
  changeNote,
}: {
  recipientNickname: string;
  productName: string;
  productSlug: string;
  versionLabel: string;
  changeNote: string;
}): { subject: string; html: string } {
  const productUrl = `${SITE_URL}/p/${productSlug}`;

  return {
    subject: `🌱 "${productName}"이 업데이트됐어요`,
    html: wrapper(`
      <h1 style="font-size:20px;font-weight:800;margin:0 0 8px;letter-spacing:-0.02em;">🌱 새 버전이 나왔어요</h1>
      <p style="font-size:14px;color:#5A5A5A;margin:0 0 24px;line-height:1.6;">
        ${recipientNickname}님이 피드백을 남겼던 <strong style="color:#1A1A1A;">${productName}</strong>이 업데이트됐어요.
      </p>

      <div style="background:#FFFFFF;border-radius:14px;padding:20px;margin-bottom:20px;border:1px solid #E8E4DB;">
        <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#858585;margin:0 0 8px;">업데이트 내용</p>
        <p style="font-size:15px;font-weight:800;margin:0 0 8px;">${versionLabel}</p>
        <p style="font-size:13px;color:#5A5A5A;line-height:1.6;margin:0;">${changeNote}</p>
      </div>

      <a href="${productUrl}" style="display:block;background:#1A1A1A;color:#FBF6ED;text-decoration:none;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:700;text-align:center;margin-bottom:12px;">
        제품 업데이트 보러 가기 →
      </a>
      <a href="${productUrl}#feedback" style="display:block;background:transparent;color:#1A1A1A;text-decoration:none;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:600;text-align:center;border:1.5px solid #E8E4DB;">
        이 버전에 피드백 남기기
      </a>

      <p style="font-size:12px;color:#858585;margin-top:16px;line-height:1.5;">
        새 버전이 나오면 피드백을 다시 남길 수 있어요. 이번에도 솔직한 한마디 어떤가요?
      </p>
    `),
  };
}

// ─── B. 피드백 임시저장 리마인드 (PRD 6.3.4-C) ──────────────────────────────

export function feedbackReminderTemplate({
  recipientNickname,
  productName,
  productSlug,
}: {
  recipientNickname: string;
  productName: string;
  productSlug: string;
}): { subject: string; html: string } {
  const feedbackUrl = `${SITE_URL}/feedback/${productSlug}`;

  return {
    subject: `💬 "${productName}" 피드백, 아직 완료하지 않으셨어요`,
    html: wrapper(`
      <h1 style="font-size:20px;font-weight:800;margin:0 0 8px;letter-spacing:-0.02em;">미완성 피드백이 있어요</h1>
      <p style="font-size:14px;color:#5A5A5A;margin:0 0 24px;line-height:1.6;">
        ${recipientNickname}님, <strong style="color:#1A1A1A;">${productName}</strong>에 피드백을 시작하셨는데 완료하지 않으셨어요.
        작성 중인 내용이 저장되어 있으니 이어서 완료해보세요.
      </p>

      <div style="background:#FFE8E0;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
        <p style="font-size:13px;color:#93301a;margin:0;line-height:1.6;">
          💡 피드백 1개 완료 = 등록권 1개 획득.<br>
          내 제품을 올릴 준비가 되셨다면 지금 완료해보세요.
        </p>
      </div>

      <a href="${feedbackUrl}" style="display:block;background:#F04D2E;color:#FFFFFF;text-decoration:none;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:700;text-align:center;">
        피드백 이어서 완료하기 →
      </a>

      <p style="font-size:12px;color:#858585;margin-top:16px;line-height:1.5;">
        이 메시지는 피드백을 시작 후 24시간이 지나 자동 발송됩니다. 완료하셨다면 무시해주세요.
      </p>
    `),
  };
}

// ─── C. 증명서 발급 완료 (PRD 6.3.4-C) ──────────────────────────────────────

export function certIssuedTemplate({
  recipientNickname,
  productName,
  productSlug,
  registrationNumber,
}: {
  recipientNickname: string;
  productName: string;
  productSlug: string;
  registrationNumber: string;
}): { subject: string; html: string } {
  const certUrl = `${SITE_URL}/api/cert/${registrationNumber}/view`;
  const registryUrl = `${SITE_URL}/registry/${registrationNumber}`;

  return {
    subject: `🛡️ "${productName}" 등록 증명서가 발급됐어요`,
    html: wrapper(`
      <h1 style="font-size:20px;font-weight:800;margin:0 0 8px;letter-spacing:-0.02em;">🛡️ 등록 증명서가 발급됐어요</h1>
      <p style="font-size:14px;color:#5A5A5A;margin:0 0 24px;line-height:1.6;">
        ${recipientNickname}님의 <strong style="color:#1A1A1A;">${productName}</strong> 등록이 완료됐어요.
        타임스탬프와 SHA-256 해시가 공개 레지스트리에 기록됐습니다.
      </p>

      <div style="background:#1A1A1A;border-radius:14px;padding:20px;margin-bottom:20px;color:#FBF6ED;">
        <p style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#F04D2E;margin:0 0 8px;">타임스탬프 증명서</p>
        <p style="font-size:14px;font-weight:700;margin:0 0 12px;line-height:1.5;">
          ${productName}이(가) 마이프로덕트 공개 레지스트리에 등록되었습니다.
        </p>
        <p style="font-size:12px;color:#9a958a;margin:0;">등록번호: <span style="font-family:monospace;color:#FBF6ED;">#${registrationNumber}</span></p>
        <p style="font-size:11px;color:#9a958a;margin:4px 0 0;">법적 효력은 제한적이며 참고 자료로만 활용해주세요.</p>
      </div>

      <a href="${certUrl}" style="display:block;background:#1A1A1A;color:#FBF6ED;text-decoration:none;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:700;text-align:center;margin-bottom:10px;">
        📄 증명서 보기 / 인쇄
      </a>
      <a href="${registryUrl}" style="display:block;background:transparent;color:#1A1A1A;text-decoration:none;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:600;text-align:center;border:1.5px solid #E8E4DB;">
        공개 레지스트리에서 확인 →
      </a>
    `),
  };
}

// ─── D. 주간 뉴스레터 — Phase 2 (PRD 6.3.4-B) ──────────────────────────────
// 인프라 준비만. 실제 발송 로직은 Phase 2에서 구현.

export function weeklyNewsletterTemplate({
  recipientNickname,
  newProducts,
  topProduct,
  needsFeedbackProducts,
}: {
  recipientNickname: string;
  newProducts: { name: string; slug: string; tagline: string }[];
  topProduct?: { name: string; slug: string; versionLabel: string };
  needsFeedbackProducts: { name: string; slug: string }[];
}): { subject: string; html: string } {
  const productItems = newProducts
    .map(
      (p) =>
        `<li style="padding:12px 0;border-bottom:1px solid #E8E4DB;">
          <a href="${SITE_URL}/p/${p.slug}" style="font-weight:700;color:#1A1A1A;text-decoration:none;">${p.name}</a>
          <p style="margin:4px 0 0;font-size:12px;color:#5A5A5A;">${p.tagline}</p>
        </li>`,
    )
    .join("");

  return {
    subject: `🌱 이번 주 마이프로덕트 — 새 제품 ${newProducts.length}개 등록`,
    html: wrapper(`
      <h1 style="font-size:20px;font-weight:800;margin:0 0 6px;letter-spacing:-0.02em;">이번 주 마이프로덕트</h1>
      <p style="font-size:14px;color:#5A5A5A;margin:0 0 24px;">${recipientNickname}님, 이번 주에 올라온 제품들이에요.</p>

      ${newProducts.length > 0 ? `
      <h2 style="font-size:15px;font-weight:800;margin:0 0 12px;">✨ 이번 주 신규 제품</h2>
      <ul style="list-style:none;padding:0;margin:0 0 24px;border-top:1px solid #E8E4DB;">${productItems}</ul>
      ` : ""}

      ${topProduct ? `
      <div style="background:#E8EDE4;border-radius:14px;padding:16px 20px;margin-bottom:24px;">
        <p style="font-size:11px;font-weight:700;color:#7A8871;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.08em;">🌱 이번 주 가장 성장한 제품</p>
        <a href="${SITE_URL}/p/${topProduct.slug}" style="font-size:15px;font-weight:800;color:#1A1A1A;text-decoration:none;">${topProduct.name}</a>
        <p style="font-size:12px;color:#5A5A5A;margin:4px 0 0;">${topProduct.versionLabel} 업데이트</p>
      </div>
      ` : ""}

      ${needsFeedbackProducts.length > 0 ? `
      <h2 style="font-size:15px;font-weight:800;margin:0 0 12px;">💬 피드백 기다리는 제품</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px;">
        ${needsFeedbackProducts.map(p => `
          <a href="${SITE_URL}/feedback/${p.slug}" style="display:block;background:#FBF6ED;border:1.5px dashed #F04D2E;border-radius:12px;padding:12px 16px;text-decoration:none;color:#1A1A1A;font-weight:700;font-size:13px;">
            ${p.name} — 피드백 남기기 →
          </a>
        `).join("")}
      </div>
      ` : ""}

      <a href="${SITE_URL}/feed" style="display:block;background:#1A1A1A;color:#FBF6ED;text-decoration:none;padding:14px 20px;border-radius:12px;font-size:14px;font-weight:700;text-align:center;">
        전체 제품 보러 가기 →
      </a>
    `),
  };
}
