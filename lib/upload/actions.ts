"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const BUCKET = "product-images";

export type UploadKind = "thumbnail" | "screenshot";

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

// ─── 이미지 업로드 ────────────────────────────────────────────────────────────

export async function uploadProductImage(
  formData: FormData,
  uploadId: string,
  kind: UploadKind,
): Promise<UploadResult> {
  // 1. 인증 확인
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요해요" };

  // 2. 파일 검증
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "파일이 없어요" };
  if (!ALLOWED_MIME.includes(file.type as typeof ALLOWED_MIME[number])) {
    return { ok: false, error: "JPG, PNG, WEBP 형식만 업로드 가능해요" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `파일은 5MB 이하여야 해요 (현재 ${(file.size / 1024 / 1024).toFixed(1)}MB)` };
  }

  // 3. 경로 결정
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename =
    kind === "thumbnail"
      ? `thumbnail.${ext}`
      : `screenshot-${Date.now()}.${ext}`;
  const path = `products/${uploadId}/${filename}`;

  // 4. service_role로 업로드 (RLS 우회)
  try {
    const admin = createAdminClient();
    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[upload] storage error:", uploadError.message);
      return { ok: false, error: "업로드에 실패했어요. 잠시 후 다시 시도해주세요" };
    }

    // 5. public URL 반환
    const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);
    return { ok: true, url: publicUrl, path };
  } catch (e: unknown) {
    const err = e as { name?: string; message?: string; stack?: string; cause?: unknown };
    console.error("[UPLOAD ERROR]", {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
      cause: err?.cause,
    });
    throw e;
  }
}

// ─── 이미지 삭제 ────────────────────────────────────────────────────────────

export async function deleteProductImage(
  path: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요해요" };

  const admin = createAdminClient();
  const { error } = await admin.storage.from(BUCKET).remove([path]);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
