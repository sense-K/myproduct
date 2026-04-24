(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,44440,e=>{"use strict";var t=e.i(43476),s=e.i(71645);e.s(["HashVerify",0,function({fullHash:e,registrationNumber:r}){let[n,a]=(0,s.useState)(null);async function i(e,t){await navigator.clipboard.writeText(e),a(t),setTimeout(()=>a(null),2e3)}return(0,t.jsxs)("section",{className:"rounded-[14px] bg-paper p-5 shadow-sm",children:[(0,t.jsx)("h2",{className:"mb-3 text-[15px] font-extrabold",children:"해시 검증"}),(0,t.jsx)("p",{className:"mb-4 text-[12px] leading-relaxed text-ink-60",children:"아래 SHA-256 해시는 등록 당시의 제품 정보(이름·소개·카테고리·닉네임·시각)를 정렬된 JSON으로 직렬화한 값입니다. 동일한 데이터로 직접 해시를 생성해 비교할 수 있어요."}),(0,t.jsxs)("div",{className:"mb-3",children:[(0,t.jsx)("p",{className:"mb-1.5 text-[11px] font-bold uppercase tracking-widest text-ink-40",children:"SHA-256 해시"}),(0,t.jsxs)("div",{className:"flex items-center gap-2 rounded-[8px] border border-ink-10 bg-cream px-3 py-2.5",children:[(0,t.jsx)("span",{className:"min-w-0 flex-1 overflow-hidden text-ellipsis font-mono text-[11px] text-ink-60",children:e}),(0,t.jsx)("button",{onClick:()=>i(e,"hash"),className:"flex-shrink-0 rounded-[6px] border border-ink-10 px-2.5 py-1 text-[10px] font-semibold text-ink-60 hover:border-ink",children:"hash"===n?"복사됨 ✓":"복사"})]})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"mb-1.5 text-[11px] font-bold uppercase tracking-widest text-ink-40",children:"등록번호"}),(0,t.jsxs)("div",{className:"flex items-center gap-2 rounded-[8px] border border-ink-10 bg-cream px-3 py-2.5",children:[(0,t.jsxs)("span",{className:"flex-1 font-mono text-[13px] font-bold",children:["#",r]}),(0,t.jsx)("button",{onClick:()=>i(r,"regnum"),className:"flex-shrink-0 rounded-[6px] border border-ink-10 px-2.5 py-1 text-[10px] font-semibold text-ink-60 hover:border-ink",children:"regnum"===n?"복사됨 ✓":"복사"})]})]}),(0,t.jsxs)("details",{className:"mt-4",children:[(0,t.jsx)("summary",{className:"cursor-pointer text-[11px] font-semibold text-sage",children:"직접 검증하는 방법 →"}),(0,t.jsx)("pre",{className:"mt-2 overflow-x-auto rounded-[8px] bg-cream p-3 text-[10px] leading-relaxed text-ink-60",children:`// Node.js / JavaScript
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
console.log(hash); // 위 해시와 동일`})]})]})}])}]);