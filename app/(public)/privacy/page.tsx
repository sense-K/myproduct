import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "개인정보처리방침 · 마이프로덕트",
  description: "마이프로덕트 개인정보처리방침. 수집 항목, 처리 목적, 보관 기간, Microsoft Clarity 세션 기록 고지 등을 안내합니다.",
  path: "/privacy",
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-[17px] font-extrabold tracking-tight">{title}</h2>
      <div className="text-[14px] leading-relaxed text-ink-60 space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <header className="mb-10 border-b border-ink-10 pb-6">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-ink-40">법적 고지</p>
        <h1 className="text-[26px] font-extrabold tracking-tight">개인정보처리방침</h1>
        <p className="mt-2 text-[13px] text-ink-40">시행일: 2026년 4월 23일 | 버전 1.0</p>
      </header>

      <Section title="1. 수집하는 개인정보 항목">
        <p>마이프로덕트는 서비스 제공에 필요한 최소한의 개인정보만 수집합니다:</p>
        <table className="w-full text-[13px] border-collapse mt-2">
          <thead>
            <tr className="bg-cream">
              <th className="border border-ink-10 px-3 py-2 text-left font-semibold text-ink">구분</th>
              <th className="border border-ink-10 px-3 py-2 text-left font-semibold text-ink">항목</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["필수", "이메일 주소, 닉네임, 창업 경력 태그"],
              ["자동 수집", "서비스 이용 기록, 접속 IP, 쿠키, 브라우저 세션 데이터"],
              ["Google OAuth 연동 시", "구글 계정 이메일, 프로필 이미지 URL"],
              ["수집하지 않는 것", "실명, 전화번호, 주소, 결제 정보"],
            ].map(([k, v]) => (
              <tr key={k}>
                <td className="border border-ink-10 px-3 py-2 font-medium text-ink">{k}</td>
                <td className="border border-ink-10 px-3 py-2">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="2. 개인정보의 처리 목적">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-ink">서비스 제공:</strong> 회원 식별, 피드백 작성·수신, 제품 등록</li>
          <li><strong className="text-ink">등록 증명서 발급:</strong> 등록자 닉네임·창업 경력을 증명서에 기록</li>
          <li><strong className="text-ink">알림 발송:</strong> 매직링크 로그인, 피드백 수신 알림, 뉴스레터</li>
          <li><strong className="text-ink">서비스 개선:</strong> 이용 패턴 분석, 오류 파악</li>
          <li><strong className="text-ink">부정 이용 방지:</strong> 어뷰징·스팸 탐지</li>
        </ul>
      </Section>

      <Section title="3. 개인정보 보관 기간">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-ink">회원 정보:</strong> 탈퇴 즉시 삭제 (이메일 → NULL, 닉네임 → "탈퇴한 메이커", deleted_at 기록)</li>
          <li><strong className="text-ink">피드백 내용:</strong> 탈퇴 후에도 익명화하여 유지 (창업자의 피드백 기록 보호)</li>
          <li><strong className="text-ink">등록 증명서:</strong> 공개 레지스트리 기록은 제품 완전 삭제 시 삭제 (certificates snapshot 제외)</li>
          <li><strong className="text-ink">접속 로그:</strong> 3개월</li>
        </ul>
      </Section>

      <Section title="4. 개인정보의 제3자 제공">
        <p>마이프로덕트는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만 아래 예외가 있습니다:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-ink">Google OAuth:</strong> 구글 계정으로 로그인 시, Google이 이메일·프로필 정보를 공유합니다. Google의 개인정보처리방침이 적용됩니다.</li>
          <li><strong className="text-ink">법적 의무:</strong> 수사기관 등의 적법한 요청이 있는 경우</li>
        </ul>
      </Section>

      <Section title="5. 등록 증명 데이터의 특수성">
        <p>공개 레지스트리에 기록되는 데이터(등록번호, 등록 시각, 제품명, 닉네임, 해시값)는 이용자가 <strong className="text-ink">공개 의도로 제공한 정보</strong>입니다.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>공개 레지스트리 기록은 누구나 열람할 수 있으며, 검색엔진에 인덱싱될 수 있습니다.</li>
          <li>제품 완전 삭제 시 레지스트리에서도 삭제됩니다.</li>
          <li>단, 증명서 PDF는 본인 보관용으로 유지됩니다 (snapshot 방식).</li>
        </ul>
      </Section>

      <Section title="6. 쿠키 및 세션 데이터">
        <p>서비스는 로그인 유지, 서비스 개선 목적으로 쿠키를 사용합니다. 브라우저 설정에서 쿠키를 거부할 수 있으나, 일부 기능(로그인 유지 등)이 제한될 수 있습니다.</p>
      </Section>

      <Section title="7. Microsoft Clarity 세션 기록 고지">
        <div className="rounded-[8px] border border-ink-10 bg-cream p-4">
          <p className="font-semibold text-ink">⚠ Microsoft Clarity 사용 고지</p>
          <p className="mt-2">
            본 서비스는 UX 개선을 위해 <strong className="text-ink">Microsoft Clarity</strong>를 사용합니다. Clarity는 마우스 움직임, 클릭, 스크롤, 세션 리플레이 등을 기록합니다.
          </p>
          <p className="mt-2">
            이 과정에서 개인 식별이 가능한 정보(이름, 이메일 등)는 수집되지 않으며, Microsoft의 개인정보처리방침이 적용됩니다.
          </p>
          <a
            href="https://privacy.microsoft.com/ko-kr/privacystatement"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-[12px] text-accent hover:underline"
          >
            Microsoft 개인정보처리방침 →
          </a>
        </div>
      </Section>

      <Section title="8. Google Analytics 4 사용 고지">
        <p>서비스는 방문자 분석을 위해 Google Analytics 4를 사용합니다. 개인 식별이 불가능한 익명화 통계 데이터만 수집하며, Google의 개인정보처리방침이 적용됩니다.</p>
      </Section>

      <Section title="9. 뉴스레터 수신 및 수신거부">
        <p>마이프로덕트 가입 시 주간 뉴스레터가 자동 구독됩니다. 수신을 원하지 않으시면 다음 방법으로 언제든지 해지할 수 있습니다:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>마이페이지 → 설정 → 알림 설정에서 해제</li>
          <li>이메일 하단의 수신거부 링크 클릭</li>
          <li>zzabhm@gmail.com으로 수신거부 요청</li>
        </ul>
      </Section>

      <Section title="10. 이용자의 권리">
        <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-ink">열람권:</strong> 본인의 개인정보 처리 내역 확인</li>
          <li><strong className="text-ink">정정권:</strong> 마이페이지 → 설정에서 직접 수정</li>
          <li><strong className="text-ink">삭제권:</strong> 마이페이지 → 설정 → 회원 탈퇴로 삭제 요청</li>
          <li><strong className="text-ink">처리 정지권:</strong> 마케팅 수신 거부 등</li>
        </ul>
      </Section>

      <Section title="11. 개인정보 보호책임자">
        <p>개인정보 관련 문의·불만·피해구제 요청은 아래로 연락해 주세요:</p>
        <div className="rounded-[8px] bg-cream px-4 py-3 font-mono text-[13px] text-ink">
          <p>이메일: zzabhm@gmail.com</p>
          <p>처리 기간: 수신 후 7일 이내</p>
        </div>
      </Section>

      <Section title="12. 개인정보처리방침 변경">
        <p>본 방침은 법령·서비스 변경에 따라 개정될 수 있습니다. 중요 변경 시 이메일 또는 서비스 내 공지로 사전 안내합니다.</p>
      </Section>

      <div className="mt-10 rounded-[14px] bg-cream p-5 text-[12px] text-ink-60">
        <p>시행일: 2026년 4월 23일</p>
        <p className="mt-1">문의: <a href="mailto:zzabhm@gmail.com" className="text-accent hover:underline">zzabhm@gmail.com</a></p>
      </div>
    </article>
  );
}
