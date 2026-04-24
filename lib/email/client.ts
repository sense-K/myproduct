import { Resend } from "resend";

// 싱글턴. API 키 없으면 null (개발 환경에서 이메일 스킵).
let _resend: Resend | null = null;

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

export const FROM_ADDRESS = "마이프로덕트 <noreply@myproduct.kr>";
