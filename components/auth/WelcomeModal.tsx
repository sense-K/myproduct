"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { CAREER_TAGS, CATEGORIES } from "@/lib/constants/user";
import {
  completeOnboarding,
  type OnboardingState,
} from "./welcome-actions";

type Props = {
  suggestedNickname: string;
};

export function WelcomeModal({ suggestedNickname }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<OnboardingState | null, FormData>(
    async (prev, fd) => {
      const result = await completeOnboarding(prev, fd);
      if (result.ok) router.refresh();
      return result;
    },
    null,
  );

  const [nickname, setNickname] = useState(suggestedNickname);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
    >
      <form
        action={formAction}
        className="w-full max-w-md rounded-[28px] bg-paper p-6 shadow-xl sm:p-8"
      >
        <header>
          <h2 id="welcome-heading" className="text-xl font-extrabold">
            🎉 환영해요
          </h2>
          <p className="mt-1 text-sm text-ink-60">
            시작하기 전에 몇 가지만 알려주세요. (30초)
          </p>
        </header>

        {/* 닉네임 */}
        <section className="mt-6">
          <label htmlFor="nickname" className="block text-sm font-semibold">
            닉네임
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            value={nickname}
            maxLength={20}
            onChange={(e) => setNickname(e.target.value)}
            className="mt-2 h-11 w-full rounded-[8px] border border-ink-10 bg-paper px-3 text-sm outline-none focus:border-ink"
          />
          <p className="mt-1 text-xs text-ink-40">나중에 바꿀 수 있어요.</p>
        </section>

        {/* 창업 경력 (필수) */}
        <section className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold">
              창업 경력 <span className="text-accent">*</span>
            </span>
          </div>
          <div className="mt-2 grid gap-2">
            {CAREER_TAGS.map((t) => (
              <label
                key={t.value}
                className="flex cursor-pointer items-start gap-3 rounded-[8px] border border-ink-10 bg-cream px-3 py-2 text-sm has-[:checked]:border-ink has-[:checked]:bg-sage-soft"
              >
                <input
                  type="radio"
                  name="career_tag"
                  value={t.value}
                  required
                  className="mt-0.5 accent-sage"
                />
                <span>
                  <span className="font-semibold">{t.label}</span>
                  <span className="ml-1 text-xs text-ink-60">
                    — {t.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* 관심 카테고리 (선택) */}
        <section className="mt-5">
          <span className="text-sm font-semibold">
            관심 카테고리{" "}
            <span className="text-xs font-normal text-ink-40">(선택)</span>
          </span>
          <p className="mt-1 text-xs text-ink-60">
            뉴스레터·추천 피드에 활용돼요.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <label
                key={c.value}
                className="cursor-pointer rounded-full border border-ink-10 bg-cream px-3 py-1.5 text-xs has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent"
              >
                <input
                  type="checkbox"
                  name="interested_categories"
                  value={c.value}
                  className="sr-only"
                />
                {c.label}
              </label>
            ))}
          </div>
        </section>

        {state && !state.ok && (
          <div
            role="alert"
            className="mt-5 rounded-[14px] bg-accent-soft p-3 text-sm text-accent"
          >
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-[8px] bg-ink text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "저장 중..." : "시작하기"}
        </button>
      </form>
    </div>
  );
}
