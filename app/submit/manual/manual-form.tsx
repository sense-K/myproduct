"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants/user";
import type { Category } from "@/lib/constants/user";

export function ManualForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [category, setCategory] = useState<Category>("saas");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "제품명은 2자 이상 입력해주세요";
    if (name.trim().length > 40) e.name = "제품명은 40자 이하로 입력해주세요";
    if (tagline.trim().length < 10) e.tagline = "한 줄 소개는 10자 이상 입력해주세요";
    if (tagline.trim().length > 150) e.tagline = "한 줄 소개는 150자 이하로 입력해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    const trimmed = externalUrl.trim();
    const normalizedUrl = trimmed
      ? trimmed.includes("://") ? trimmed : `https://${trimmed}`
      : null;
    sessionStorage.setItem(
      "mp_submit",
      JSON.stringify({
        submission_type: "manual",
        external_url: normalizedUrl,
        name: name.trim(),
        tagline: tagline.trim(),
        category,
        thumbnail_url: null,
        ai_failed: false,
      }),
    );
    router.push("/submit/confirm");
  }

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight">직접 입력해주세요</h1>
      <p className="mb-6 text-[13px] text-ink-60">
        URL이 없어도 괜찮아요. 아래에 제품 정보를 직접 입력해주세요.
      </p>

      {/* 제품명 */}
      <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
        제품명 <span className="text-accent">*</span>
      </label>
      <input
        type="text"
        value={name}
        maxLength={40}
        onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
        placeholder="언더커버"
        className={`mb-1 h-11 w-full rounded-[8px] border bg-paper px-3 text-[13px] outline-none focus:border-ink ${errors.name ? "border-accent" : "border-ink-10"}`}
      />
      {errors.name && <p className="mb-3 text-[11px] text-accent">{errors.name}</p>}
      <p className="mb-4 text-right text-[11px] text-ink-40">{name.length}/40</p>

      {/* 한 줄 소개 */}
      <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
        한 줄 소개 <span className="text-accent">*</span>
      </label>
      <textarea
        value={tagline}
        maxLength={150}
        onChange={(e) => { setTagline(e.target.value); setErrors((p) => ({ ...p, tagline: "" })); }}
        placeholder="프랜차이즈 점주를 위한 익명 커뮤니티와 매출 벤치마킹 서비스"
        rows={3}
        className={`mb-1 w-full resize-none rounded-[8px] border bg-paper p-3 text-[13px] leading-relaxed outline-none focus:border-ink ${errors.tagline ? "border-accent" : "border-ink-10"}`}
      />
      {errors.tagline && <p className="mb-1 text-[11px] text-accent">{errors.tagline}</p>}
      <p className="mb-4 text-right text-[11px] text-ink-40">{tagline.length}/150</p>

      {/* 외부 링크 */}
      <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
        외부 링크 <span className="text-ink-40">(선택)</span>
      </label>
      <input
        type="url"
        value={externalUrl}
        onChange={(e) => setExternalUrl(e.target.value)}
        placeholder="https://example.com"
        className="mb-4 h-11 w-full rounded-[8px] border border-ink-10 bg-paper px-3 text-[13px] outline-none focus:border-ink"
      />

      {/* 카테고리 */}
      <label className="mb-2 block text-[12px] font-semibold text-ink-60">
        카테고리 <span className="text-accent">*</span>
      </label>
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              category === c.value
                ? "border-ink bg-ink text-cream"
                : "border-ink-10 text-ink-60 hover:border-ink-40"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-auto">
        <button
          onClick={handleNext}
          className="flex h-[50px] w-full items-center justify-center rounded-[14px] bg-ink text-[14px] font-bold text-cream transition-opacity hover:opacity-90"
        >
          다음 (미리보기 확인) →
        </button>
      </div>
    </div>
  );
}
