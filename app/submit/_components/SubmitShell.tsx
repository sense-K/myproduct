"use client";

import Link from "next/link";
import { SITE_NAME } from "@/lib/seo/config";

const STEP_LABELS = ["핵심 정보", "가치 정의", "시각 자료", "선택 항목", "최종 확인"];

type Props = {
  step: 1 | 2 | 3 | 4 | 5;
  onBack?: () => void;
  backHref?: string;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isPending?: boolean;
  onSkip?: () => void;
  children: React.ReactNode;
};

export function SubmitShell({
  step,
  onBack,
  backHref = "/submit/intro",
  onNext,
  nextLabel = "다음 →",
  nextDisabled,
  isPending,
  onSkip,
  children,
}: Props) {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-sm font-semibold text-ink-60 hover:text-ink"
          >
            ← 이전
          </button>
        ) : (
          <Link
            href={backHref}
            className="text-sm font-semibold text-ink-60 hover:text-ink"
          >
            ← 이전
          </Link>
        )}
        <span className="text-[15px] font-extrabold tracking-tight">
          <span className="mr-1 text-accent">●</span>
          {SITE_NAME}
        </span>
        <div className="w-12" />
      </div>

      {/* 진행률 바 */}
      <div className="mb-6">
        <div className="mb-1.5 flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${
                s <= step ? "bg-accent" : "bg-ink-10"
              }`}
            />
          ))}
        </div>
        <p className="text-[11px] text-ink-40">
          {step} / 5단계 · {STEP_LABELS[step - 1]}
        </p>
      </div>

      {/* 본문 */}
      <div className="flex flex-1 flex-col">{children}</div>

      {/* 하단 버튼 */}
      <div className="mt-6 flex flex-col gap-2.5 pb-safe">
        <button
          onClick={onNext}
          disabled={nextDisabled || isPending}
          className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-ink text-[14px] font-bold text-cream transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              처리 중...
            </>
          ) : (
            nextLabel
          )}
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex h-[44px] items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink"
          >
            건너뛰기 (나중에 추가)
          </button>
        )}
      </div>
    </div>
  );
}
