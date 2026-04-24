import { randomBytes } from "crypto";

// 영문 슬러그 정규화
function toSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function randomSuffix(): string {
  return randomBytes(3).toString("hex"); // 6자 hex
}

export function buildSlugCandidate(name: string): string {
  const slug = toSlug(name);
  // 한국어 등 비ASCII가 많아 빈 slug가 되면 random suffix만 사용
  if (!slug || slug.length < 2) return randomSuffix();
  return slug;
}

// DB에서 중복 체크 후 suffix 추가
export async function generateUniqueSlug(
  name: string,
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = buildSlugCandidate(name);
  if (!(await checkExists(base))) return base;

  // 최대 10번 suffix 시도
  for (let i = 0; i < 10; i++) {
    const candidate = `${base}-${randomSuffix()}`;
    if (!(await checkExists(candidate))) return candidate;
  }
  // 만에 하나 모두 충돌시 완전 랜덤
  return randomSuffix() + randomSuffix();
}
