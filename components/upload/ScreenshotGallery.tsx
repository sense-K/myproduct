"use client";

import { useTransition } from "react";
import { ImageUpload } from "./ImageUpload";
import { deleteProductImage } from "@/lib/upload/actions";

export type ScreenshotGalleryProps = {
  uploadId: string;
  urls: string[];
  paths: string[];
  onChange: (urls: string[], paths: string[]) => void;
  maxCount?: number;
  disabled?: boolean;
};

export function ScreenshotGallery({
  uploadId,
  urls,
  paths,
  onChange,
  maxCount = 5,
  disabled,
}: ScreenshotGalleryProps) {
  const [, startTransition] = useTransition();

  function handleAdd(url: string | null, path: string | null) {
    if (!url) return;
    onChange([...urls, url], [...paths, path ?? ""]);
  }

  function handleDelete(index: number) {
    const path = paths[index];
    const newUrls = urls.filter((_, i) => i !== index);
    const newPaths = paths.filter((_, i) => i !== index);
    onChange(newUrls, newPaths);
    if (path) {
      startTransition(async () => {
        await deleteProductImage(path);
      });
    }
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const newUrls = [...urls];
    const newPaths = [...paths];
    [newUrls[index - 1], newUrls[index]] = [newUrls[index], newUrls[index - 1]];
    [newPaths[index - 1], newPaths[index]] = [newPaths[index], newPaths[index - 1]];
    onChange(newUrls, newPaths);
  }

  function moveDown(index: number) {
    if (index === urls.length - 1) return;
    const newUrls = [...urls];
    const newPaths = [...paths];
    [newUrls[index + 1], newUrls[index]] = [newUrls[index], newUrls[index + 1]];
    [newPaths[index + 1], newPaths[index]] = [newPaths[index], newPaths[index + 1]];
    onChange(newUrls, newPaths);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 기존 스크린샷 목록 */}
      {urls.map((url, i) => (
        <div key={url} className="flex items-start gap-2">
          {/* 미리보기 */}
          <div className="relative flex-1 overflow-hidden rounded-[10px] bg-ink-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`스크린샷 ${i + 1}`} className="aspect-video w-full object-cover" />
          </div>
          {/* 컨트롤 */}
          <div className="flex flex-col gap-1 pt-1">
            <button
              type="button"
              onClick={() => moveUp(i)}
              disabled={disabled || i === 0}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-ink-10 text-[11px] text-ink-60 transition-colors hover:border-ink hover:text-ink disabled:opacity-30"
              title="위로"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveDown(i)}
              disabled={disabled || i === urls.length - 1}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-ink-10 text-[11px] text-ink-60 transition-colors hover:border-ink hover:text-ink disabled:opacity-30"
              title="아래로"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => handleDelete(i)}
              disabled={disabled}
              className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-ink-10 text-[11px] text-ink-40 transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
              title="삭제"
            >
              ×
            </button>
          </div>
        </div>
      ))}

      {/* 추가 슬롯 */}
      {urls.length < maxCount && (
        <div>
          <p className="mb-1.5 text-[11px] text-ink-40">
            {urls.length}/{maxCount}장
          </p>
          <ImageUpload
            kind="screenshot"
            uploadId={uploadId}
            onChange={handleAdd}
            disabled={disabled}
          />
        </div>
      )}

      {urls.length >= maxCount && (
        <p className="text-center text-[11px] text-ink-40">최대 {maxCount}장 업로드됨</p>
      )}
    </div>
  );
}
