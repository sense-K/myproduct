"use client";

import { useRef, useState, useTransition } from "react";
import { uploadProductImage, deleteProductImage } from "@/lib/upload/actions";
import type { UploadKind } from "@/lib/upload/actions";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp"];

export type ImageUploadProps = {
  kind: UploadKind;
  uploadId: string;
  currentUrl?: string | null;
  currentPath?: string | null;
  ogImageUrl?: string | null;       // 썸네일용 OG 이미지 fallback
  onChange: (url: string | null, path: string | null) => void;
  disabled?: boolean;
};

export function ImageUpload({
  kind,
  uploadId,
  currentUrl,
  currentPath,
  ogImageUrl,
  onChange,
  disabled,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const previewUrl = currentUrl || (kind === "thumbnail" ? ogImageUrl : null);
  const isOgFallback = !currentUrl && !!ogImageUrl && kind === "thumbnail";

  function validateFile(file: File): string | null {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTS.includes(ext)) return "JPG, PNG, WEBP 형식만 가능해요";
    if (file.size > MAX_BYTES) {
      return `파일은 5MB 이하여야 해요 (현재 ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
    }
    return null;
  }

  function handleFile(file: File) {
    const validationError = validateFile(file);
    if (validationError) { setError(validationError); return; }
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    const previousPath = currentPath; // 교체 전 경로 캡처

    startTransition(async () => {
      const result = await uploadProductImage(formData, uploadId, kind);
      if (!result.ok) { setError(result.error); return; }

      // 교체 시 구파일 삭제 (다른 경로인 경우만 — 같은 경로는 upsert로 덮어씀)
      if (previousPath && previousPath !== result.path) {
        await deleteProductImage(previousPath);
      }

      onChange(result.url, result.path);
    });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isPending) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  async function handleDelete() {
    if (!currentUrl) return;
    setError(null);
    if (currentPath) {
      startTransition(async () => {
        await deleteProductImage(currentPath);
      });
    }
    onChange(null, null);
  }

  const zoneBase =
    "relative flex flex-col items-center justify-center rounded-[14px] border-2 transition-colors cursor-pointer select-none overflow-hidden";
  const zoneIdle = isDragging
    ? "border-accent bg-accent-soft"
    : "border-dashed border-ink-10 bg-paper hover:border-ink-40";

  // ── 현재 이미지 미리보기 ──────────────────────────────────────────────────
  if (previewUrl && !isPending) {
    return (
      <div className="relative">
        <div
          className={`relative aspect-video overflow-hidden rounded-[14px] bg-ink-10`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={kind === "thumbnail" ? "썸네일" : "스크린샷"}
            className={`h-full w-full object-cover ${isOgFallback ? "opacity-60" : ""}`}
          />
          {isOgFallback && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                OG 이미지 (교체 가능)
              </span>
            </div>
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="flex-1 rounded-[8px] border border-ink-10 py-1.5 text-[12px] font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
          >
            {kind === "thumbnail" ? "썸네일 변경" : "교체"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={disabled}
            className="rounded-[8px] border border-ink-10 px-3 py-1.5 text-[12px] font-semibold text-ink-40 transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
          >
            삭제
          </button>
        </div>
        <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={handleInputChange} />
      </div>
    );
  }

  // ── 업로드 영역 ───────────────────────────────────────────────────────────
  return (
    <div>
      <div
        className={`${zoneBase} ${zoneIdle} ${kind === "thumbnail" ? "aspect-video" : "aspect-square"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => { if (!disabled && !isPending) inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isPending ? (
          <>
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-ink-10 border-t-accent" />
            <p className="mt-2 text-[12px] text-ink-60">업로드 중...</p>
          </>
        ) : (
          <>
            <span className="text-2xl">{kind === "thumbnail" ? "🖼️" : "📷"}</span>
            <p className="mt-1.5 text-[13px] font-semibold text-ink-60">
              {isDragging ? "여기에 놓으세요" : "클릭 또는 드래그로 업로드"}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-40">JPG · PNG · WEBP · 최대 5MB</p>
          </>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-[11px] text-accent">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled || isPending}
      />
    </div>
  );
}
