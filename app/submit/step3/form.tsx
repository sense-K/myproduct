"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadDraft, saveDraft } from "../_components/types";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { ScreenshotGallery } from "@/components/upload/ScreenshotGallery";

export function Step3Form() {
  const router = useRouter();
  const [uploadId, setUploadId] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailPath, setThumbnailPath] = useState<string | null>(null);
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(null);
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [screenshotPaths, setScreenshotPaths] = useState<string[]>([]);
  const [demoUrl, setDemoUrl] = useState("");

  useEffect(() => {
    const d = loadDraft();
    if (!d.name) { router.replace("/submit/step1"); return; }

    // upload_id 없으면 신규 생성 (Storage 경로용)
    const id = d.upload_id ?? crypto.randomUUID();
    setUploadId(id);
    if (!d.upload_id) saveDraft({ upload_id: id });

    setThumbnailUrl(d.thumbnail_url ?? null);
    setThumbnailPath(d.thumbnail_path ?? null);
    setOgImageUrl(d.og_image_url ?? null);
    setScreenshotUrls(d.screenshot_urls ?? []);
    setScreenshotPaths(d.screenshot_paths ?? []);
    if (d.demo_video_url) setDemoUrl(d.demo_video_url);
  }, [router]);

  function handleThumbnailChange(url: string | null, path: string | null) {
    setThumbnailUrl(url);
    setThumbnailPath(path);
    saveDraft({ thumbnail_url: url, thumbnail_path: path });
  }

  function handleScreenshotsChange(urls: string[], paths: string[]) {
    setScreenshotUrls(urls);
    setScreenshotPaths(paths);
    saveDraft({ screenshot_urls: urls, screenshot_paths: paths });
  }

  function handleNext() {
    const trimmed = demoUrl.trim();
    saveDraft({
      demo_video_url: trimmed
        ? trimmed.includes("://") ? trimmed : `https://${trimmed}`
        : null,
    });
    router.push("/submit/step4");
  }

  if (!uploadId) return null; // useEffect 대기 중

  return (
    <div className="flex flex-1 flex-col">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push("/submit/step2")}
          className="text-sm font-semibold text-ink-60 hover:text-ink"
        >
          ← 이전
        </button>
        <span className="text-[15px] font-extrabold tracking-tight">
          <span className="mr-1 text-accent">●</span>마이프로덕트
        </span>
        <div className="w-12" />
      </div>

      {/* 진행률 */}
      <div className="mb-6">
        <div className="mb-1.5 flex gap-1">
          {[1,2,3,4,5].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= 3 ? "bg-accent" : "bg-ink-10"}`} />
          ))}
        </div>
        <p className="text-[11px] text-ink-40">3 / 5단계 · 시각 자료</p>
      </div>

      <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight">제품 모습을 보여주세요</h1>
      <p className="mb-6 text-[13px] text-ink-60">모두 선택 사항이에요. 나중에 추가도 가능해요.</p>

      {/* 썸네일 */}
      <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
        대표 이미지 <span className="text-ink-40">(선택, JPG·PNG·WEBP · 최대 5MB)</span>
        {ogImageUrl && !thumbnailUrl && (
          <span className="ml-2 text-[10px] font-normal text-amber-600">✨ AI가 찾은 OG 이미지</span>
        )}
      </label>
      <div className="mb-6">
        <ImageUpload
          kind="thumbnail"
          uploadId={uploadId}
          currentUrl={thumbnailUrl}
          currentPath={thumbnailPath}
          ogImageUrl={ogImageUrl}
          onChange={handleThumbnailChange}
        />
      </div>

      {/* 스크린샷 */}
      <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
        스크린샷 <span className="text-ink-40">(선택, 최대 5장 · 각 5MB)</span>
      </label>
      <div className="mb-6">
        <ScreenshotGallery
          uploadId={uploadId}
          urls={screenshotUrls}
          paths={screenshotPaths}
          onChange={handleScreenshotsChange}
        />
      </div>

      {/* 데모 영상 URL */}
      <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
        데모 영상 URL <span className="text-ink-40">(선택, YouTube·Vimeo)</span>
      </label>
      <input
        type="url"
        value={demoUrl}
        onChange={(e) => setDemoUrl(e.target.value)}
        placeholder="https://youtube.com/watch?v=..."
        className="mb-4 h-11 w-full rounded-[8px] border border-ink-10 bg-paper px-3 text-[13px] outline-none focus:border-ink"
      />

      <div className="mt-auto flex flex-col gap-2.5 pt-2">
        <button
          onClick={handleNext}
          className="flex h-[50px] w-full items-center justify-center rounded-[14px] bg-ink text-[14px] font-bold text-cream transition-opacity hover:opacity-90"
        >
          다음 →
        </button>
        <button
          onClick={handleNext}
          className="flex h-[44px] items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink"
        >
          건너뛰기 (나중에 추가)
        </button>
      </div>
    </div>
  );
}
