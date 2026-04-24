import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "이용약관 · 마이프로덕트",
  description: "마이프로덕트 서비스 이용약관. 서비스 정의, 증명서 법적 효력 범위, 피드백 저작권, 금지 행위, 계정 제재 기준을 안내합니다.",
  path: "/terms",
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-[17px] font-extrabold tracking-tight">{title}</h2>
      <div className="text-[14px] leading-relaxed text-ink-60 space-y-2">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <header className="mb-10 border-b border-ink-10 pb-6">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-ink-40">법적 고지</p>
        <h1 className="text-[26px] font-extrabold tracking-tight">이용약관</h1>
        <p className="mt-2 text-[13px] text-ink-40">시행일: 2026년 4월 23일 | 버전 1.0</p>
      </header>

      <Section title="제1조 목적">
        <p>본 약관은 마이프로덕트(이하 "서비스")가 제공하는 인터넷 서비스의 이용과 관련하여 서비스 운영자와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        <p>마이프로덕트는 한국 인디 메이커가 제품을 등록하고 서로 피드백을 교환하는 플랫폼으로, 등록 증명서를 자동 발급합니다.</p>
      </Section>

      <Section title="제2조 서비스 정의">
        <p>서비스는 다음 기능을 제공합니다:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>제품 등록 및 공개 (URL 기반 AI 자동 채움 포함)</li>
          <li>피드백 작성 및 수신 (10문항 익명 피드백 교환)</li>
          <li>타임스탬프 등록 증명서 자동 발급</li>
          <li>공개 레지스트리 열람</li>
          <li>성장 타임라인 기록</li>
        </ul>
      </Section>

      <Section title="제3조 증명서의 법적 효력 범위">
        <p className="font-semibold text-ink">⚠ 이 섹션을 반드시 읽어주세요.</p>
        <p>마이프로덕트의 등록 증명서는 특정 시각에 해당 내용이 본 플랫폼에 등록되었음을 기록한 문서입니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-ink">법적 보호 수단이 아닙니다.</strong> 특허권, 저작권, 상표권 등 지식재산권 보호 효력이 없습니다.</li>
          <li>분쟁 발생 시 '내가 먼저 만들었다'는 참고 자료로 활용될 수 있습니다.</li>
          <li>법적 효력은 제한적이며, 법적 보호가 필요한 경우 특허청 출원 등 별도 절차를 밟으시기 바랍니다.</li>
        </ul>
        <p>서비스는 절대 "법적 보호", "저작권 보장", "특허 효력" 등의 표현을 사용하지 않습니다.</p>
      </Section>

      <Section title="제4조 피드백 콘텐츠 저작권">
        <p>피드백 작성자에게 저작권이 있으며, 플랫폼은 서비스 제공 목적으로 표시·저장할 권리만 가집니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>피드백 내용은 해당 제품의 창업자와 작성자 본인만 열람할 수 있습니다.</li>
          <li>서비스는 피드백 내용을 제3자에게 판매하거나 마케팅에 활용하지 않습니다.</li>
          <li>제출된 피드백은 수정·삭제가 불가합니다 (창업자 기록 보호 목적).</li>
        </ul>
      </Section>

      <Section title="제5조 제품 정보 저작권">
        <p>등록된 제품 정보(제품명, 설명, 스크린샷 등)의 저작권은 등록자에게 있으며, 플랫폼은 서비스 제공 목적으로 표시·저장할 권리만 가집니다.</p>
        <p>서비스는 등록자의 동의 없이 제품 정보를 제3자에게 제공하거나 상업적으로 활용하지 않습니다.</p>
      </Section>

      <Section title="제6조 금지 행위">
        <p>이용자는 다음 행위를 해서는 안 됩니다:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>타인을 사칭하거나 허위 정보를 등록하는 행위</li>
          <li>피드백 시스템을 어뷰징하는 행위 (짧은 시간 내 다수 피드백, 무의미한 답변 반복 등)</li>
          <li>스팸성 제품 등록 또는 광고·홍보 목적의 피드백 작성</li>
          <li>타인의 제품 정보나 피드백을 무단 복제·배포하는 행위</li>
          <li>서비스의 정상적인 운영을 방해하는 모든 행위</li>
          <li>관련 법령을 위반하는 행위</li>
        </ul>
      </Section>

      <Section title="제7조 계정 제재 기준">
        <p>서비스는 다음 기준에 따라 계정을 제재할 수 있습니다:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-ink">경고:</strong> 약관 위반 1회 적발 시</li>
          <li><strong className="text-ink">일시 정지:</strong> 경고 후 재범 또는 중대 위반 시</li>
          <li><strong className="text-ink">영구 정지:</strong> 반복 위반, 고의적 어뷰징, 법령 위반 시</li>
        </ul>
        <p>제재 시 사전 통보를 원칙으로 하나, 긴급한 경우 즉시 조치 후 통보할 수 있습니다.</p>
      </Section>

      <Section title="제8조 서비스 변경 및 중단">
        <p>서비스는 필요에 따라 기능을 변경하거나 서비스를 중단할 수 있습니다. 중요한 변경 시 30일 전 공지를 원칙으로 합니다.</p>
        <p>서비스 중단 시 등록된 제품 정보 및 증명서 데이터는 이용자가 백업할 수 있도록 충분한 기간을 제공합니다.</p>
      </Section>

      <Section title="제9조 면책 조항">
        <p>서비스는 다음 사항에 대해 책임을 지지 않습니다:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>증명서의 법적 효력에 의존한 결과 발생하는 손해</li>
          <li>이용자 간 분쟁으로 인한 손해</li>
          <li>천재지변, 서비스 장애 등 불가항력으로 인한 손해</li>
          <li>이용자가 게재한 정보의 정확성, 완결성에 관한 사항</li>
        </ul>
      </Section>

      <Section title="제10조 분쟁 해결">
        <p>본 약관과 관련된 분쟁은 대한민국 법을 준거법으로 하며, 분쟁 발생 시 운영자 이메일(zzabhm@gmail.com)로 먼저 협의를 시도해 주세요.</p>
        <p>협의로 해결되지 않는 경우, 관할 법원은 민사소송법에 따라 결정합니다.</p>
      </Section>

      <Section title="제11조 약관 개정">
        <p>본 약관은 서비스 내 공지 또는 이메일 통보를 통해 개정될 수 있습니다. 개정 약관은 공지 후 7일이 지나면 효력이 발생합니다.</p>
      </Section>

      <div className="mt-10 rounded-[14px] bg-cream p-5 text-[12px] text-ink-60">
        <p>시행일: 2026년 4월 23일</p>
        <p className="mt-1">문의: <a href="mailto:zzabhm@gmail.com" className="text-accent hover:underline">zzabhm@gmail.com</a></p>
      </div>
    </article>
  );
}
