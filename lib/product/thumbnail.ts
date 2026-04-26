const BUCKET = "product-images";

/** 썸네일 표시 우선순위: 직접 업로드 → OG 이미지 → null(자동 생성 폴백) */
export function getThumbnailUrl(product: {
  thumbnail_url?: string | null;
  og_image_url?: string | null;
}): string | null {
  return product.thumbnail_url || product.og_image_url || null;
}

/**
 * Supabase Storage public URL에서 버킷 내 경로 추출.
 * URL 형식: https://{ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
 *
 * 수정 내역:
 * - 쿼리 스트링 제거 (Cache-busting ?t=xxx 등)
 * - supabase.co 도메인이 아니면 null 반환 (외부 URL 오삽입 방지)
 */
export function extractStoragePath(publicUrl: string): string | null {
  let parsed: URL;
  try { parsed = new URL(publicUrl); } catch { return null; }
  if (!parsed.hostname.endsWith(".supabase.co")) return null;

  const marker = `/object/public/${BUCKET}/`;
  const idx = parsed.pathname.indexOf(marker);
  if (idx === -1) return null;

  return decodeURIComponent(parsed.pathname.slice(idx + marker.length));
}
