const VALUES = [
  {
    num: "1",
    head: "💬 진짜 피드백",
    desc: '"좋아요" 한 줄이 아니라, 10문항짜리 진지한 검토. 동료 메이커가 직접 작성해요.',
  },
  {
    num: "2",
    head: "🛡️ 등록 증명서",
    desc: "올리는 순간 시각과 내용이 공개 레지스트리에 기록돼요. '내가 먼저 만들었다'는 객관적 참고 자료가 됩니다.",
  },
  {
    num: "3",
    head: "🌱 성장 기록",
    desc: "버전 업데이트마다 기록이 남아요. 제품이 어떻게 자라는지 지켜보는 연재형 플랫폼.",
  },
];

import { Container } from "@/components/layout/Container";

export function ValueSection() {
  return (
    <section className="bg-ink py-8" aria-label="마이프로덕트 핵심 가치">
      <Container>
      <h2 className="text-[18px] font-extrabold leading-snug tracking-tight text-cream">
        여기서만 얻을 수 있는 것
      </h2>

      <ul className="mt-5 flex flex-col gap-5">
        {VALUES.map((v) => (
          <li key={v.num} className="flex items-start gap-3">
            <span
              className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-extrabold text-white"
              aria-hidden="true"
            >
              {v.num}
            </span>
            <div>
              <p className="text-[14px] font-bold text-cream">{v.head}</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#b5b0a5]">{v.desc}</p>
            </div>
          </li>
        ))}
      </ul>
      </Container>
    </section>
  );
}
