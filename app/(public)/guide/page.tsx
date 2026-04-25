import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildFAQSchema } from "@/lib/seo/json-ld";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo/config";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "좋은 피드백 쓰는 법 · 마이프로덕트 가이드",
    description:
      "마이프로덕트에서 진짜 도움이 되는 피드백을 쓰는 방법. 나쁜 예시 vs 좋은 예시, 10문항별 팁, 창업자의 마음까지. 솔직하게, 그리고 부드럽게.",
    path: "/guide",
  }),
};

const FAQ_ITEMS = [
  {
    question: "Q1. 랜딩페이지를 3초 봤을 때 무엇을 하는 제품인지 이해했나요?",
    answer:
      "3초 테스트입니다. 화면을 보자마자 '아, 이게 X를 해결해주는 거구나' 싶으면 예. 뭔가 있는 것 같은데 정확히 무엇인지 모르면 '애매함'. 전혀 감이 안 잡히면 '아니오'. 솔직하게 첫인상을 쓰는 게 가장 도움됩니다.",
  },
  {
    question: "Q2. 이 제품의 타겟 고객은 누구일 것 같나요?",
    answer:
      "창업자가 상정한 타겟과 외부인이 느끼는 타겟이 다를 때 가장 유용한 피드백입니다. '자영업자를 위한 것 같다', '20대 대학생이 쓸 것 같다'처럼 구체적으로 적어주세요. 10자 이상 써주셔야 해요.",
  },
  {
    question: "Q4. 이 제품이 해결하려는 문제가 실제로 존재한다고 보시나요? (1~5점)",
    answer:
      "1점: '이런 문제 있나? 나만 모르는 건가' 수준. 5점: '나도 이 문제 겪고 있다, 진짜 실재하는 문제다' 수준. 점수와 함께 왜 그렇게 생각하는지 한 줄 이유를 달아주면 훨씬 유용합니다.",
  },
  {
    question: "Q8. 이 제품의 가장 큰 약점은 무엇인가요? (필수, 30자 이상)",
    answer:
      "가장 중요한 질문입니다. 창업자가 가장 듣고 싶어하는 피드백이기도 해요. '모르겠어요'는 피해주세요. 보완점, 경쟁력 부족한 부분, 사용성 이슈, 메시지 불명확성 등 무엇이든 솔직하게 써주세요. 단, 표현은 부드럽게.",
  },
  {
    question: "Q9. 이 제품이 딱 하나만 개선한다면 뭐가 좋을까요?",
    answer:
      "우선순위를 잡기 어려운 창업자에게 외부 시각을 제공하는 질문입니다. 'UI를 더 단순하게', '타겟을 좁혀서 집중해라', '가격을 먼저 검증해라' 같은 구체적인 방향이 가장 도움됩니다.",
  },
];

const BAD_EXAMPLES = [
  {
    label: "너무 짧음",
    text: "좋은 것 같아요. 잘 될 것 같습니다. 화이팅!",
    why: "창업자에게 아무 정보도 주지 않아요. 친구 응원이지 피드백이 아닙니다.",
  },
  {
    label: "일반론",
    text: "요즘 시장이 좋아서 기회가 있을 것 같아요. 마케팅을 잘 하면 될 것 같습니다.",
    why: "이 제품에만 해당하는 내용이 하나도 없어요. 어떤 제품에나 붙일 수 있는 말은 피드백이 아닙니다.",
  },
  {
    label: "공격적",
    text: "솔직히 이 아이디어는 별로입니다. 이미 비슷한 게 많고 차별점이 없어요.",
    why: "비판은 좋은데 이유·구체성·대안이 없습니다. 창업자에게 상처만 줄 수 있어요.",
  },
];

const GOOD_EXAMPLES = [
  {
    label: "구체적",
    text: "3초 안에 '프랜차이즈 점주 전용 익명 커뮤니티'라는 게 보여서 바로 이해됐어요. 타겟은 치킨·커피 프랜차이즈 점주 분들 같고, 이 분들이 솔직하게 고민을 나눌 공간이 없다는 문제를 잘 짚었다고 봅니다.",
    why: "제품의 특성을 정확히 반영하고, 타겟과 문제를 구체적으로 짚었어요.",
  },
  {
    label: "건설적",
    text: "가장 큰 약점은 점주들이 '익명이 정말 보장되는지' 믿기 어렵다는 점이에요. 랜딩에서 익명 보장 방식을 더 명확히 설명하면 가입 전환율이 올라갈 것 같습니다.",
    why: "약점을 지적하면서 개선 방향까지 제안했어요. 창업자가 즉시 행동할 수 있는 피드백입니다.",
  },
  {
    label: "공감 + 개선",
    text: "저도 비슷한 고민을 해본 적 있어서 아이디어에 공감해요. 개선한다면 '첫 가입 후 첫 글 올리기'까지의 마찰을 줄이는 게 좋을 것 같아요. 커뮤니티는 초반에 글이 없으면 허전해서 이탈이 많거든요.",
    why: "공감을 먼저 표현하고, 본인 경험 기반의 구체적 개선점을 제안했어요.",
  },
];

const TIPS = [
  { id: "q1-3", section: "A. 첫인상 (Q1~3)", tip: "3초 테스트처럼 생각하세요. 처음 봤을 때 느낀 그대로가 가장 정직한 피드백이에요. Q3(제품명·소개 개선)은 선택이지만, 생각나는 게 있으면 꼭 적어주세요." },
  { id: "q4-6", section: "B. 가치 제안 (Q4~6)", tip: "이 섹션은 창업자가 가장 불안해하는 부분입니다. '문제가 존재하냐', '돈 낼 의향이 있냐' 두 질문에 솔직하게 답해주세요. 이유를 달아주면 훨씬 유용합니다." },
  { id: "q7-8", section: "C. 실행 품질 (Q7~8)", tip: "Q8(가장 큰 약점)은 필수 30자 이상입니다. 어렵게 느껴지면 '내가 이 제품을 안 쓸 이유'를 생각해보세요. 그게 약점일 가능성이 높아요." },
  { id: "q9-10", section: "D. 격려와 방향 (Q9~10)", tip: "Q9(개선 방향)은 우선순위를 한 가지만 뽑아주세요. 여러 개 나열하면 창업자가 무엇부터 해야 할지 모릅니다. Q10(응원)은 선택이지만 창업자에게 큰 힘이 돼요." },
];

export default function GuidePage() {
  return (
    <>
      <JsonLd schema={buildFAQSchema(FAQ_ITEMS)} />

      <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <header className="mb-12">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-ink-40">피드백 가이드</p>
          <h1 className="text-[28px] font-extrabold tracking-tight sm:text-3xl">
            좋은 피드백이란 무엇인가요?
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-60">
            솔직하게 말해주세요. 다만 창업자가 밤새 만든 걸 봐주는 거예요.
            <br />
            <strong className="text-ink">문제는 정확히, 표현은 부드럽게.</strong>
          </p>
        </header>

        {/* ── 나쁜 예시 ── */}
        <section className="mb-12">
          <h2 className="mb-5 text-[20px] font-extrabold tracking-tight">
            ❌ 이렇게 쓰지 마세요
          </h2>
          <div className="flex flex-col gap-4">
            {BAD_EXAMPLES.map((ex) => (
              <div key={ex.label} className="rounded-[14px] border border-accent/30 bg-accent-soft p-5">
                <span className="mb-2 inline-block rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                  {ex.label}
                </span>
                <p className="mb-2 text-[13px] italic text-ink-60">"{ex.text}"</p>
                <p className="text-[12px] text-accent">→ {ex.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 좋은 예시 ── */}
        <section className="mb-12">
          <h2 className="mb-5 text-[20px] font-extrabold tracking-tight">
            ✅ 이렇게 써주세요
          </h2>
          <div className="flex flex-col gap-4">
            {GOOD_EXAMPLES.map((ex) => (
              <div key={ex.label} className="rounded-[14px] border border-sage/30 bg-sage-soft p-5">
                <span className="mb-2 inline-block rounded-full bg-sage px-2 py-0.5 text-[10px] font-bold text-cream">
                  {ex.label}
                </span>
                <p className="mb-2 text-[13px] italic text-ink-60">"{ex.text}"</p>
                <p className="text-[12px] text-sage">→ {ex.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 문항별 팁 ── */}
        <section className="mb-12">
          <h2 className="mb-5 text-[20px] font-extrabold tracking-tight">문항별 팁</h2>
          <div className="flex flex-col gap-3">
            {TIPS.map((t) => (
              <div key={t.id} id={t.id} className="rounded-[14px] bg-paper p-5">
                <h3 className="mb-2 text-[14px] font-bold">{t.section}</h3>
                <p className="text-[13px] leading-relaxed text-ink-60">{t.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mb-12">
          <h2 className="mb-5 text-[20px] font-extrabold tracking-tight">문항별 FAQ</h2>
          <div className="flex flex-col divide-y divide-ink-10 rounded-[14px] bg-paper">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-[14px] font-semibold">
                  {item.question}
                  <span className="mt-0.5 flex-shrink-0 text-ink-40 group-open:rotate-90">→</span>
                </summary>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-60">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── 받는 메이커의 마음 ── */}
        <section className="mb-12 rounded-[14px] border-l-4 border-accent bg-cream p-6">
          <h2 className="mb-3 text-[18px] font-extrabold">받는 메이커의 마음</h2>
          <p className="text-[14px] leading-relaxed text-ink-60">
            피드백을 받는 창업자는 며칠 혹은 몇 달을 혼자 매달린 제품을 처음 공개하는 겁니다. 두렵고 설렙니다. 비판도 응원도 모두 진지하게 받아들여요.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-60">
            "이거 별로인데"보다 "이 부분이 아쉬워서, 이렇게 개선하면 어떨까요?"가 훨씬 더 오래 기억에 남고 실제로 도움이 됩니다. 당신의 경험과 시각이 누군가의 제품을 한 단계 성장시킬 수 있어요.
          </p>
        </section>

        {/* ── 등록 증명서 안내 ── */}
        <section className="mb-12 rounded-[14px] border border-ink-10 bg-paper p-6">
          <h2 className="mb-3 text-[15px] font-extrabold">등록 증명서에 대해</h2>
          <p className="text-[13px] leading-relaxed text-ink-60">
            마이프로덕트의 등록 증명서는 SHA-256 해시와 타임스탬프로 작품의 만든 시점을 공개 기록합니다.
            아이디어 도용 시 정황 증거로 활용될 수 있는 비공식 증명입니다.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-60">
            다만 정식 특허·상표·저작권 등록을 대체하지 않으며, 공식적인 보호가 필요한 경우 변리사 상담을 권합니다.
          </p>
        </section>

        {/* ── 푸터 CTA ── */}
        <div className="text-center">
          <Link
            href="/feedback/pick"
            className="inline-flex h-12 items-center justify-center rounded-[14px] bg-accent px-8 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
          >
            지금 피드백 주러 가기 →
          </Link>
        </div>
      </article>
    </>
  );
}
