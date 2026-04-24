module.exports=[9873,a=>{"use strict";var b=a.i(87924),c=a.i(72131);a.s(["HashVerify",0,function({fullHash:a,registrationNumber:d}){let[e,f]=(0,c.useState)(null);async function g(a,b){await navigator.clipboard.writeText(a),f(b),setTimeout(()=>f(null),2e3)}return(0,b.jsxs)("section",{className:"rounded-[14px] bg-paper p-5 shadow-sm",children:[(0,b.jsx)("h2",{className:"mb-3 text-[15px] font-extrabold",children:"해시 검증"}),(0,b.jsx)("p",{className:"mb-4 text-[12px] leading-relaxed text-ink-60",children:"아래 SHA-256 해시는 등록 당시의 제품 정보(이름·소개·카테고리·닉네임·시각)를 정렬된 JSON으로 직렬화한 값입니다. 동일한 데이터로 직접 해시를 생성해 비교할 수 있어요."}),(0,b.jsxs)("div",{className:"mb-3",children:[(0,b.jsx)("p",{className:"mb-1.5 text-[11px] font-bold uppercase tracking-widest text-ink-40",children:"SHA-256 해시"}),(0,b.jsxs)("div",{className:"flex items-center gap-2 rounded-[8px] border border-ink-10 bg-cream px-3 py-2.5",children:[(0,b.jsx)("span",{className:"min-w-0 flex-1 overflow-hidden text-ellipsis font-mono text-[11px] text-ink-60",children:a}),(0,b.jsx)("button",{onClick:()=>g(a,"hash"),className:"flex-shrink-0 rounded-[6px] border border-ink-10 px-2.5 py-1 text-[10px] font-semibold text-ink-60 hover:border-ink",children:"hash"===e?"복사됨 ✓":"복사"})]})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"mb-1.5 text-[11px] font-bold uppercase tracking-widest text-ink-40",children:"등록번호"}),(0,b.jsxs)("div",{className:"flex items-center gap-2 rounded-[8px] border border-ink-10 bg-cream px-3 py-2.5",children:[(0,b.jsxs)("span",{className:"flex-1 font-mono text-[13px] font-bold",children:["#",d]}),(0,b.jsx)("button",{onClick:()=>g(d,"regnum"),className:"flex-shrink-0 rounded-[6px] border border-ink-10 px-2.5 py-1 text-[10px] font-semibold text-ink-60 hover:border-ink",children:"regnum"===e?"복사됨 ✓":"복사"})]})]}),(0,b.jsxs)("details",{className:"mt-4",children:[(0,b.jsx)("summary",{className:"cursor-pointer text-[11px] font-semibold text-sage",children:"직접 검증하는 방법 →"}),(0,b.jsx)("pre",{className:"mt-2 overflow-x-auto rounded-[8px] bg-cream p-3 text-[10px] leading-relaxed text-ink-60",children:`// Node.js / JavaScript
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
console.log(hash); // 위 해시와 동일`})]})]})}])}];

//# sourceMappingURL=app_%28public%29_registry_%5Bregnum%5D_HashVerify_tsx_09ddqz.._.js.map