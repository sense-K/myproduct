"use client";

import { useState } from "react";

type Props = {
  fullHash: string;
  registrationNumber: string;
};

export function HashVerify({ fullHash, registrationNumber }: Props) {
  const [copied, setCopied] = useState<"hash" | "regnum" | null>(null);

  async function copy(text: string, type: "hash" | "regnum") {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <section className="rounded-[14px] bg-paper p-5 shadow-sm">
      <h2 className="mb-3 text-[15px] font-extrabold">해시 검증</h2>
      <p className="mb-4 text-[12px] leading-relaxed text-ink-60">
        아래 SHA-256 해시는 등록 당시의 제품 정보(이름·소개·카테고리·닉네임·시각)를
        정렬된 JSON으로 직렬화한 값입니다. 동일한 데이터로 직접 해시를 생성해 비교할 수 있어요.
      </p>

      {/* 해시 전체 */}
      <div className="mb-3">
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-ink-40">
          SHA-256 해시
        </p>
        <div className="flex items-center gap-2 rounded-[8px] border border-ink-10 bg-cream px-3 py-2.5">
          <span className="min-w-0 flex-1 overflow-hidden text-ellipsis font-mono text-[11px] text-ink-60">
            {fullHash}
          </span>
          <button
            onClick={() => copy(fullHash, "hash")}
            className="flex-shrink-0 rounded-[6px] border border-ink-10 px-2.5 py-1 text-[10px] font-semibold text-ink-60 hover:border-ink"
          >
            {copied === "hash" ? "복사됨 ✓" : "복사"}
          </button>
        </div>
      </div>

      {/* 등록번호 */}
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-ink-40">
          등록번호
        </p>
        <div className="flex items-center gap-2 rounded-[8px] border border-ink-10 bg-cream px-3 py-2.5">
          <span className="flex-1 font-mono text-[13px] font-bold">#{registrationNumber}</span>
          <button
            onClick={() => copy(registrationNumber, "regnum")}
            className="flex-shrink-0 rounded-[6px] border border-ink-10 px-2.5 py-1 text-[10px] font-semibold text-ink-60 hover:border-ink"
          >
            {copied === "regnum" ? "복사됨 ✓" : "복사"}
          </button>
        </div>
      </div>

      {/* 해시 알고리즘 설명 */}
      <details className="mt-4">
        <summary className="cursor-pointer text-[11px] font-semibold text-sage">
          직접 검증하는 방법 →
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-[8px] bg-cream p-3 text-[10px] leading-relaxed text-ink-60">
{`// Node.js / JavaScript
const crypto = require('crypto');
const data = {
  category: "[카테고리]",
  maker_quote: null,   // 또는 한마디 내용
  name: "[제품명]",
  nickname: "[닉네임]",
  registered_at: "[ISO 시각]",
  tagline: "[소개]"
};
const hash = crypto
  .createHash('sha256')
  .update(JSON.stringify(data))
  .digest('hex');
console.log(hash); // 위 해시와 동일`}
        </pre>
      </details>
    </section>
  );
}
