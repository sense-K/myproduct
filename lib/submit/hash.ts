import { createHash, randomBytes } from "crypto";

type HashInput = {
  name: string;
  tagline: string;
  maker_quote: string | null;
  category: string;
  nickname: string;
  registered_at: string; // ISO 8601 UTC
};

// PRD 6.2.2 — 정렬된 JSON 직렬화 후 SHA-256
export function generateContentHash(input: HashInput): string {
  const canonical = JSON.stringify({
    category: input.category,
    maker_quote: input.maker_quote ?? null,
    name: input.name,
    nickname: input.nickname,
    registered_at: input.registered_at,
    tagline: input.tagline,
  });
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

// PRD 6.2.4 — 6자리 대문자+숫자 등록번호
export function generateRegistrationNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () =>
    chars[randomBytes(1)[0] % chars.length],
  ).join("");
}
