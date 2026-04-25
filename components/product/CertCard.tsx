import Link from "next/link";

type Props = {
  certificate: {
    registration_number: string;
    content_hash: string;
    issued_at: string;
  };
  productName: string;
  nickname: string;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function CertCard({ certificate, productName, nickname }: Props) {
  const { registration_number, content_hash, issued_at } = certificate;
  const hashShort = content_hash.slice(0, 8) + "...";

  return (
    <section className="border-b border-ink-10 bg-cream py-6">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-ink-40">
        <span className="mr-1">🛡️</span> 등록 증명
      </p>

      <div className="relative overflow-hidden rounded-[14px] bg-ink px-5 py-5 text-cream">
        {/* 배경 이모지 */}
        <span
          className="pointer-events-none absolute -bottom-5 -right-5 text-[90px] opacity-[0.08]"
          aria-hidden="true"
        >
          🛡️
        </span>

        <p className="text-[10px] font-bold uppercase tracking-widest text-accent">타임스탬프 증명서</p>
        <p className="mt-2 text-[13px] font-bold leading-relaxed">
          이 제품은 {formatDateTime(issued_at)}에
          <br />
          마이프로덕트에 등록되었습니다.
        </p>

        <dl className="mt-3 divide-y divide-white/10 text-[11px]">
          {[
            ["등록번호", `#${registration_number}`],
            ["해시", hashShort],
            ["등록자", nickname],
            ["제품", productName],
          ].map(([key, val]) => (
            <div key={key} className="flex justify-between py-1.5">
              <dt className="text-[#9a958a]">{key}</dt>
              <dd className="font-mono font-semibold">{val}</dd>
            </div>
          ))}
        </dl>

        <Link
          href={`/registry/${registration_number}`}
          className="mt-3 block text-center text-[11px] font-bold text-accent hover:underline"
        >
          공개 레지스트리에서 검증 →
        </Link>
      </div>
      </div>
    </section>
  );
}
