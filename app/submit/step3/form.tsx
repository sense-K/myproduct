"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadDraft, saveDraft } from "../_components/types";

export function Step3Form() {
  const router = useRouter();
  const [demoUrl, setDemoUrl] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    const d = loadDraft();
    if (!d.name) { router.replace("/submit/step1"); return; }
    if (d.demo_video_url) setDemoUrl(d.demo_video_url);
    if (d.thumbnail_url) setThumbnailPreview(d.thumbnail_url);
  }, [router]);

  function handleNext() {
    const trimmed = demoUrl.trim();
    const normalizedUrl = trimmed
      ? trimmed.includes("://") ? trimmed : `https://${trimmed}`
      : null;
    saveDraft({
      demo_video_url: normalizedUrl,
      screenshot_urls: loadDraft().screenshot_urls ?? [],
    });
    router.push("/submit/step4");
  }

  function handleSkip() {
    saveDraft({ demo_video_url: null, screenshot_urls: [] });
    router.push("/submit/step4");
  }

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
      <p className="mb-6 text-[13px] text-ink-60">모두 선택 사항입니다. 나중에 추가도 가능해요.</p>

      {/* 썸네일 업로드 (placeholder — 3단계 작업에서 연결) */}
      <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
        대표 이미지 <span className="text-ink-40">(선택, JPG·PNG·WEBP · 최대 2MB)</span>
      </label>
      <div className="mb-6 flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-ink-10 bg-paper text-center transition-colors hover:border-ink-40">
        {thumbnailPreview ? (
          <img src={thumbnailPreview} alt="thumbnail preview" className="h-full w-full rounded-[12px] object-cover" />
        ) : (
          <>
            <span className="text-2xl">🖼️</span>
            <p className="text-[13px] font-semibold text-ink-60">이미지 업로드</p>
            <p className="text-[11px] text-ink-40">업로드 기능은 곧 활성화됩니다</p>
          </>
        )}
      </div>

      {/* 스크린샷 업로드 (placeholder) */}
      <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
        스크린샷 <span className="text-ink-40">(선택, 최대 5장 · 각 5MB)</span>
      </label>
      <div className="mb-6 grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="flex aspect-video items-center justify-center rounded-[8px] border-2 border-dashed border-ink-10 text-ink-20"
          >
            <span className="text-[20px]">+</span>
          </div>
        ))}
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
          onClick={handleSkip}
          className="flex h-[44px] items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink"
        >
          건너뛰기 (나중에 추가)
        </button>
      </div>
    </div>
  );
}
