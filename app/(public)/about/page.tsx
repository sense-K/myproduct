import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildArticleSchema, buildFAQSchema } from "@/lib/seo/json-ld";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo/config";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "마이프로덕트 소개 · 메이커를 위한 피드백과 증명의 공간",
    description:
      "마이프로덕트는 사이드프로젝트의 아이디어 선점과 피드백 교환을 위한 공간입니다. 공개해도 안전하도록 등록 증명서로 만든 시점을 영구 기록합니다.",
    path: "/about",
  }),
};

const FAQS = [
  {
    question: "마이프로덕트는 무료인가요?",
    answer:
      "네, Phase 1에서는 완전 무료입니다. 구독·결제 없이 피드백을 주고받고 증명서를 발급받을 수 있어요. 나중에 광고 기반 수익 모델을 검토할 수 있지만, 제품 등록·피드백 기능 자체는 무료를 유지할 계획입니다.",
  },
  {
    question: "피드백 1:1 교환이란 정확히 어떤 의미인가요?",
    answer:
      "다른 메이커의 제품에 10문항짜리 피드백을 완료하면 '등록권' 1개를 얻습니다. 이 등록권 1개로 내 제품 1개를 플랫폼에 올릴 수 있어요. 피드백 없이 제품만 올리거나, 제품 올리기 없이 피드백만 주는 것도 가능합니다. 의무가 아닌 선택이에요.",
  },
  {
    question: "증명서는 법적 효력이 있나요?",
    answer:
      "제한적입니다. 본 증명서는 특정 시각에 해당 내용이 마이프로덕트에 등록되었음을 기록한 문서입니다. 법적 특허·저작권 보호 수단은 아니며, 분쟁 발생 시 '내가 먼저 만들었다'는 참고 자료로 활용할 수 있습니다. 법적 보호가 필요한 경우 특허청 출원을 권장합니다.",
  },
  {
    question: "피드백 내용은 누가 볼 수 있나요?",
    answer:
      "피드백을 받은 제품의 창업자 본인만 전체 내용을 열람할 수 있습니다. 다른 유저에게는 피드백 개수와 리뷰어의 창업 경력 분포만 공개됩니다. 피드백을 작성한 리뷰어는 마이페이지에서 자신이 쓴 피드백만 다시 볼 수 있습니다.",
  },
  {
    question: "Product Hunt나 디스퀴엇과 어떻게 다른가요?",
    answer:
      "Product Hunt와 디스퀴엇은 '런치 이벤트' 플랫폼입니다. 미리 팔로워와 네트워크를 갖춰야 하루 주목을 받을 수 있고, 이후엔 빠르게 잊혀집니다. 마이프로덕트는 '연재형 플랫폼'입니다. 제품이 업데이트될 때마다 타임라인에 기록이 쌓이고, 동료 메이커와 1:1로 진지한 피드백을 교환합니다. 팔로워 없이도 시작할 수 있고, 홍보보다 성장에 집중합니다.",
  },
  {
    question: "내 제품을 비공개로 전환하거나 삭제할 수 있나요?",
    answer:
      "네. 마이페이지 > 내 제품에서 언제든 비공개 전환이 가능합니다. 비공개 전환 시 제품 페이지만 비공개가 되고, 공개 레지스트리 기록은 유지됩니다. 완전 삭제를 원하면 레지스트리에서도 삭제되지만, 발급된 증명서 PDF는 본인 보관 가능합니다.",
  },
];

export default function AboutPage() {
  const articleSchema = buildArticleSchema({
    title: "마이프로덕트 소개 · 메이커를 위한 피드백과 증명의 공간",
    description:
      "한국 인디 메이커를 위한 피드백 교환과 타임스탬프 등록 증명 플랫폼. 혼자 만든 제품에 동료의 진짜 피드백을 받고, 아이디어를 안전하게 공개하세요.",
    url: `${SITE_URL}/about`,
    datePublished: "2026-04-23",
  });
  const faqSchema = buildFAQSchema(FAQS);

  return (
    <>
      <JsonLd schema={articleSchema} />
      <JsonLd schema={faqSchema} />

      <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6">

        {/* ── 오프닝 ── */}
        <header className="mb-14 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-ink-40">소개</p>
          <h1 className="text-[32px] font-extrabold leading-tight tracking-tight sm:text-4xl">
            만드느라 혼자였잖아요.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-60">
            이제 여기서 같이 봐줄게요.
            <br />
            사용자는 없어도, 피드백을 받을 동료는 있어요.
            <br />
            아이디어가 걱정되면, 증명서로 기록을 남기세요.
          </p>
        </header>

        {/* ── 왜 마이프로덕트인가요 ── */}
        <section className="mb-14">
          <h2 className="mb-5 text-[22px] font-extrabold tracking-tight">왜 마이프로덕트인가요?</h2>
          <p className="mb-4 text-[15px] leading-relaxed text-ink-60">
            많은 메이커가 사이드프로젝트 공개를 망설입니다. 가장 큰 이유는 '베껴가면 어쩌지?'라는 두려움입니다.
          </p>
          <p className="mb-4 text-[15px] leading-relaxed text-ink-60">
            마이프로덕트는 이 문제를 해결합니다. 작품을 공개하는 즉시 SHA-256 해시와 타임스탬프 기반의{" "}
            <strong className="font-bold text-ink">등록 증명서</strong>가 발급되어, 만든 시점이 공개 레지스트리에
            영구 기록됩니다. 이제 안심하고 공개할 수 있습니다.
          </p>
          <p className="text-[15px] leading-relaxed text-ink-60">
            그리고 안전해진 작품에 대해 동료 메이커의 진짜 피드백을 받을 수 있습니다.{" "}
            <strong className="font-bold text-ink">1인 개발자, 바이브코더, 인디 메이커</strong>가 만든
            사이드프로젝트가 솔직하게 검증받는 공간입니다.
          </p>
        </section>

        {/* ── 문제 정의 ── */}
        <section className="mb-14">
          <h2 className="mb-5 text-[22px] font-extrabold tracking-tight">바이브코더의 두 가지 고독</h2>
          <p className="mb-4 text-[15px] leading-relaxed text-ink-60">
            요즘은 코드를 몰라도 제품을 만들 수 있어요. AI 툴로 하루 만에 앱을 뚝딱 만들고, 랜딩페이지를 올리고, 링크를 공유합니다. 기술의 문턱은 낮아졌지만, 두 가지 고독은 여전합니다.
          </p>

          <div className="my-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[14px] border border-ink-10 bg-paper p-5">
              <p className="mb-2 text-2xl">😶</p>
              <h3 className="mb-2 text-[15px] font-bold">만들었는데 아무도 안 써요</h3>
              <p className="text-[13px] leading-relaxed text-ink-60">
                사용자를 끌어모을 마케팅 채널도, 팔로워도 없어요. 맞게 만든 건지, 뭐가 부족한지조차 모르겠어요. "좋아요" 한 줄짜리 응원은 넘치는데 진짜 피드백은 아무도 안 줘요.
              </p>
            </div>
            <div className="rounded-[14px] border border-ink-10 bg-paper p-5">
              <p className="mb-2 text-2xl">😰</p>
              <h3 className="mb-2 text-[15px] font-bold">뺏길까 봐 공개하기 무서워요</h3>
              <p className="text-[13px] leading-relaxed text-ink-60">
                아이디어를 열심히 정리해도 공개가 두렵습니다. 누군가 먼저 만들면 어쩌죠? '내가 먼저 생각했다'는 걸 어떻게 증명하나요? 그래서 아무것도 못 올리고 혼자 고민만 합니다.
              </p>
            </div>
          </div>

          <p className="text-[15px] leading-relaxed text-ink-60">
            마이프로덕트는 이 두 가지 문제를 정면으로 풉니다.
          </p>
        </section>

        {/* ── 솔루션: 두 가치 ── */}
        <section className="mb-14">
          <h2 className="mb-8 text-[22px] font-extrabold tracking-tight">두 가지로 답합니다</h2>

          {/* 가치 1 */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-accent-soft text-lg">💬</span>
              <h3 className="text-[18px] font-extrabold">동료 메이커의 진짜 피드백</h3>
            </div>
            <p className="text-[15px] leading-relaxed text-ink-60">
              단순 "좋아요"가 아닙니다. 마이프로덕트의 피드백은 <strong className="text-ink">10문항으로 구성된 진지한 검토</strong>입니다. 첫인상, 가치 제안, UI 품질, 개선 방향까지. 같은 처지의 동료 메이커가 최소 5분 이상 투자해 솔직하게 작성합니다.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-60">
              피드백은 <strong className="text-ink">익명으로 작성</strong>되고, 리뷰어의 창업 경력(1년 미만·1~3년차 등)만 표시됩니다. 처음 만난 사람에게 솔직하게 말하기가 더 쉬우니까요. 받는 창업자만 전체 내용을 열람할 수 있어 프라이버시가 지켜집니다.
            </p>
          </div>

          {/* 가치 2 */}
          <div className="mb-4">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-sage-soft text-lg">🛡️</span>
              <h3 className="text-[18px] font-extrabold">타임스탬프 등록 증명서</h3>
            </div>
            <p className="text-[15px] leading-relaxed text-ink-60">
              제품을 올리는 순간, 등록 시각·내용을 SHA-256 해시로 기록한 <strong className="text-ink">등록 증명서</strong>가 자동 발급됩니다. 이 기록은 공개 레지스트리에 영구 보존되어 누구나 검증할 수 있습니다.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-60">
              법적 효력은 제한적이지만, '내가 먼저 만들었다'는 <strong className="text-ink">객관적 참고 자료</strong>가 됩니다. 아이디어를 공개할 용기가 생기고, 나아가 증명서 자체가 SNS 공유 소재가 되어 자연스러운 바이럴이 일어납니다.
            </p>
          </div>
        </section>

        {/* ── 메커니즘 ── */}
        <section className="mb-14">
          <h2 className="mb-5 text-[22px] font-extrabold tracking-tight">어떻게 작동하나요?</h2>

          <ol className="flex flex-col gap-4">
            {[
              { num: "1", title: "피드백 주기", desc: "다른 메이커의 제품에 10문항 피드백을 완료하면 등록권 1개를 얻습니다. 5분이면 충분해요." },
              { num: "2", title: "내 제품 올리기", desc: "URL 입력 한 번이면 AI가 제품명·소개·카테고리를 자동으로 채웁니다. 올리는 순간 타임스탬프 증명서가 발급돼요." },
              { num: "3", title: "피드백 받기", desc: "다른 메이커들이 내 제품을 검토해줍니다. 창업자만 전체 피드백을 볼 수 있어요." },
              { num: "4", title: "업데이트 기록하기", desc: "피드백을 반영해 제품을 개선하면 버전 업데이트를 남기세요. 성장 타임라인이 쌓입니다." },
            ].map((s) => (
              <li key={s.num} className="flex items-start gap-4 rounded-[14px] bg-paper p-5">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-white">
                  {s.num}
                </span>
                <div>
                  <p className="font-bold text-[15px]">{s.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-60">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── 차별화 포지셔닝 ── */}
        <section className="mb-14">
          <h2 className="mb-5 text-[22px] font-extrabold tracking-tight">다른 곳은 런치, 마이프로덕트는 연재</h2>
          <p className="mb-5 text-[15px] leading-relaxed text-ink-60">
            Product Hunt는 하루 이벤트입니다. 그 하루를 위해 수백 명의 팔로워를 미리 구해야 하고, 순위에 들지 못하면 다음 날 잊혀집니다. 디스퀴엇도 비슷합니다. 얕은 "awesome!" 반응이 넘치지만, 진지한 피드백을 받기는 어렵고 증명 기능도 없습니다.
          </p>
          <p className="text-[15px] leading-relaxed text-ink-60">
            마이프로덕트는 만들고, 올리고, 피드백 받고, 개선하고, 다시 올리는 <strong className="text-ink">연재형 플랫폼</strong>입니다. 팔로워 없어도 시작할 수 있고, 제품이 자라는 과정이 타임라인으로 남습니다. MAU 100명짜리 플랫폼에서도 의미 있게 작동하는 것이 목표입니다.
          </p>
        </section>

        {/* ── 만든 사람 ── */}
        <section className="mb-14 rounded-[28px] bg-paper p-7">
          <h2 className="mb-4 text-[18px] font-extrabold">만든 사람</h2>
          <p className="text-[14px] leading-relaxed text-ink-60">
            저도 바이브코더입니다. 코드를 업으로 하지 않지만, AI 툴로 몇 가지 제품을 만들고 있어요. 만들 때마다 느꼈던 두 가지 고독 — 아무도 안 써주는 외로움과 뺏길까 봐 공개 못 하는 두려움 — 을 해결하고 싶어서 마이프로덕트를 시작했습니다.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-60">
            문의나 제안은 아래 이메일로 주세요. 직접 읽고 답장합니다.
          </p>
          <a
            href="mailto:zzabhm@gmail.com"
            className="mt-3 inline-block text-[13px] font-semibold text-accent hover:underline"
          >
            zzabhm@gmail.com →
          </a>
        </section>

        {/* ── FAQ ── */}
        <section className="mb-14">
          <h2 className="mb-6 text-[22px] font-extrabold tracking-tight">자주 묻는 질문</h2>
          <div className="flex flex-col divide-y divide-ink-10">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-[15px] font-semibold">
                  {faq.question}
                  <span className="mt-0.5 flex-shrink-0 text-ink-40 transition-transform group-open:rotate-90">→</span>
                </summary>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-60">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── 등록 증명서 안내 ── */}
        <section className="mb-14 rounded-[14px] border border-ink-10 bg-paper p-6">
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
        <section className="rounded-[28px] bg-ink px-7 py-8 text-center">
          <h2 className="mb-2 text-[20px] font-extrabold text-cream">지금 시작해볼까요?</h2>
          <p className="mb-6 text-[13px] text-[#9a958a]">
            첫 등록 전에 다른 메이커 제품에 피드백 1개만 남겨주세요
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/feedback/pick"
              className="flex h-12 items-center justify-center rounded-[14px] bg-accent px-6 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
            >
              피드백 주러 가기 →
            </Link>
            <Link
              href="/feed"
              className="flex h-12 items-center justify-center rounded-[14px] border border-white/20 px-6 text-[13px] font-semibold text-cream transition-colors hover:border-white/50"
            >
              제품 구경하기
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
