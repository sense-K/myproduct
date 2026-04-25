import Link from "next/link";
import { redirect } from "next/navigation";
import { getCreditBalance, grantDevCredit } from "@/lib/submit/actions";
import { SITE_NAME } from "@/lib/seo/config";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    num: "1",
    title: "먼저 피드백 1개 남기기 (5분 소요)",
    body: "다른 메이커의 제품을 직접 살펴보고 10문항 피드백을 남겨요. 솔직하되 응원하는 마음으로.",
  },
  {
    num: "2",
    title: "내 제품 올리기 + 등록 증명서 자동 발급",
    body: "제품명·소개·카테고리를 직접 입력하면 돼요. 올리는 순간 타임스탬프 증명서가 발급돼요.",
  },
  {
    num: "3",
    title: "동료들의 피드백 받기",
    body: "등록 후 다른 메이커들이 내 제품을 검토해줘요. 솔직한 10문항 피드백을 마이페이지에서 확인하세요.",
  },
];

export default async function SubmitIntroPage() {
  const balance = await getCreditBalance();

  // 등록권 있으면 5단계 폼으로 (AI 자동 채움 일시 비활성화)
  if (balance >= 1) redirect("/submit/step1");

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
      {/* 슬림 헤더 */}
      <div className="flex items-center justify-between pb-6">
        <Link href="/" className="text-sm font-semibold text-ink-60 hover:text-ink">
          ← 홈
        </Link>
        <span className="text-[15px] font-extrabold tracking-tight">
          <span className="mr-1 text-accent">●</span>
          {SITE_NAME}
        </span>
        <div className="w-12" />
      </div>

      <h1 className="text-[22px] font-extrabold leading-snug tracking-tight">
        여긴 주고받는 곳이에요
      </h1>
      <p className="mt-2.5 text-[13px] leading-relaxed text-ink-60">
        다른 메이커의 제품에{" "}
        <strong className="font-bold text-ink">피드백 1개를 남기면</strong>,
        내 제품 1개를 올릴 수 있는 등록권이 생겨요.
      </p>

      {/* 3단계 카드 */}
      <div className="mt-6 flex flex-col gap-3">
        {STEPS.map((s) => (
          <div key={s.num} className="rounded-[14px] border border-ink-10 bg-paper p-4">
            <div className="mb-2 flex items-start gap-2.5">
              <span className="mt-0.5 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-extrabold text-white">
                {s.num}
              </span>
              <span className="text-[14px] font-bold leading-snug">{s.title}</span>
            </div>
            <p className="pl-[30px] text-[12px] leading-relaxed text-ink-60">{s.body}</p>
          </div>
        ))}
      </div>

      {/* 현재 등록권 잔고 */}
      <div className="mt-5 rounded-[8px] bg-accent-soft px-4 py-3 text-sm text-accent">
        현재 등록권:{" "}
        <strong className="font-bold">{balance}개</strong>
        {balance === 0 && " — 아래 버튼을 눌러 피드백부터 시작하세요"}
      </div>

      {/* CTA */}
      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/feedback/pick"
          className="flex h-[50px] items-center justify-center rounded-[14px] bg-accent text-[14px] font-bold text-white transition-opacity hover:opacity-90"
        >
          피드백 주러 가기 →
        </Link>
        <Link
          href="/about"
          className="flex h-[44px] items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink"
        >
          왜 이런 규칙인가요?
        </Link>
      </div>

      {/* 개발 환경 전용: 크레딧 지급 */}
      {process.env.NODE_ENV === "development" && (
        <form
          action={async () => {
            "use server";
            await grantDevCredit();
            redirect("/submit/url");
          }}
        >
          <button
            type="submit"
            className="mt-4 w-full rounded-[8px] border border-dashed border-sage py-2 text-[12px] font-semibold text-sage hover:bg-sage-soft"
          >
            🛠 [개발] 크레딧 1개 지급 후 등록 시작
          </button>
        </form>
      )}
    </div>
  );
}
