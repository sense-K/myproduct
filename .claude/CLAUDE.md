# 마이프로덕트 (MyProduct) — Claude Code 작업 가이드

## 문서 구조

- **VISION.md** — 마스터 비전. 9개 기능, 6단계 라이프사이클, 의사결정 원칙. **모든 작업 전 필수 참조.**
- **PRD.md** — Phase 1 (발견·피드백·증명서) 초기 기획 문서. 이미 구현 완료. **참고용 아카이브**, 매번 읽지 않음. 특정 페이지의 원래 의도를 확인할 때만 참조.
- **CLAUDE.md** (이 문서) — 현재 작업 가이드.

**작업 시 우선순위**: VISION.md → CLAUDE.md → 코드. PRD.md는 필요할 때만.

VISION과 PRD가 충돌하면 VISION을 따른다. PRD는 갱신하지 않음 (역사 기록으로 보존).

---

## 이 프로젝트에 대하여

이 프로젝트는 **VISION.md**에 정의된 "마이프로덕트" 웹 서비스를 구현합니다.

- **서비스 성격**: 한국 인디 메이커들이 제품을 등록하고 서로 피드백을 교환하는 플랫폼. 등록 증명서 자동 발급.
- **운영자**: 비개발자 (바이브코더). Claude Code와 협업하여 제작.
- **권장 모델**: Opus (기본). 단순 반복 작업 시 `/model sonnet`으로 전환 가능.
  - 시작: `claude --model opus`
  - 세션 중 전환: `/model sonnet` 또는 `/model opus`
  - (옵션) Claude Code 최신 버전에서는 `opusplan` alias 사용 가능 — 기획은 Opus, 실행은 Sonnet 자동 전환

## 절대 원칙

1. **모든 구현 결정은 VISION.md를 먼저 참조한다.** PRD.md는 필요할 때만 아카이브로 참조.
2. **SEO가 최우선 전략이다.** 모든 페이지에 타협 없이 적용.
3. **모바일 퍼스트로 설계한다.** 모든 페이지 모바일 먼저 구현 후 데스크톱 확장.
4. **운영자는 비개발자임을 전제한다.** 코드는 나중에 수정하기 쉬운 구조로 작성.
5. **증명서의 법적 효력을 과장하지 않는다.** "법적 보호", "저작권 보장" 등 표현 금지.
6. **창작자 주권을 침범하지 않는다.** AI 자동 보조 설명 생성 같은 건 하지 않음.

## 기술 스택 (확정)

- **프론트엔드**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **백엔드·DB**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **배포**: Cloudflare Pages
- **인증**: Supabase Auth (Google OAuth + 매직링크)
- **외부 API**: Claude API (AI 자동 채움)
- **PDF**: @react-pdf/renderer 또는 Puppeteer
- **이메일**: Resend 또는 Postmark
- **분석**: Google Search Console + GA4 + Microsoft Clarity

## 핵심 규칙 요약

1. 피드백 1개 작성 = 등록권 1개 획득
2. 내가 받은 피드백은 나만 열람 (다른 유저는 개수·경력 분포만)
3. 등록 시 자동으로 타임스탬프 + 해시 + PDF 증명서 발급
4. 제품은 버전 업데이트로 누적 (성장 타임라인)
5. 로그인은 매직링크 or 구글 OAuth
6. 모든 피드백은 익명, 창업 N년차 태그만 표시

## 개발 단계 현황

Phase 1 (발견·피드백·증명서)은 구현 완료. 이후 작업은 VISION.md를 기준으로 결정.

## 작업 지시 템플릿

운영자가 Claude Code에게 지시할 때 다음 형식을 권장:

```
VISION.md [관련 섹션/기능]을 참고해서 [기능명]을 구현해줘.

[추가 요청 사항]

구현 전에 다음을 확인해줘:
- [ ] SEO 요구사항 충족 여부
- [ ] 모바일 퍼스트 설계
- [ ] RLS 정책 적용 필요 여부
```

## 파일 구조 (권장)

```
/
├── app/                     # Next.js App Router
│   ├── (public)/            # 공개 페이지 (홈, 제품 상세, 피드, 레지스트리, about, guide)
│   ├── (auth)/              # 인증 (login, verify)
│   ├── (app)/               # 로그인 필요 (submit, feedback, me)
│   ├── api/                 # API 라우트
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                  # 기본 UI
│   ├── layout/
│   ├── product/
│   ├── feedback/
│   └── certificate/
├── lib/
│   ├── supabase/
│   ├── utils/
│   ├── hash.ts              # SHA-256 해시
│   └── pdf.ts               # PDF 생성
├── types/
├── public/
├── supabase/
│   └── migrations/
├── PRD.md
└── CLAUDE.md
```

## 디자인 시스템 요약

- **폰트**: Pretendard Variable
- **주요 색상**:
  - 배경: `#FBF6ED` (크림)
  - 텍스트: `#1A1A1A` (잉크)
  - 포인트: `#F04D2E` (주황)
  - 보조: `#7A8871` (세이지)
- **라운딩**: 8px (작은 요소), 14px (카드), 28px (큰 컨테이너)
- **아이콘**: Lucide Icons + 이모지 보조 (🛡️, 💬, 🌱, 🎉)

자세한 내용은 PRD 섹션 10.2 참조.

## 자주 오는 질문에 대한 기본 답변

**Q: 이 기능 A로 할까요 B로 할까요?**
→ VISION.md 먼저 확인. VISION에 없으면 운영자에게 확인.

**Q: 성능 vs 정확도 트레이드오프는?**
→ SEO 관련: 정확도 우선. 그 외: 상황에 따라. 판단 애매하면 운영자에게 확인.

**Q: 외부 라이브러리 추가해도 될까요?**
→ VISION.md에 명시된 기술 스택 기준. 추가 필요 시 운영자에게 확인.

**Q: UI 컴포넌트 시안이 없어요.**
→ VISION.md 디자인 가이드에 맞춰 구현. 와이어프레임 파일이 있으면 참조.

## 변경 이력 관리

- VISION 수정이 필요하면 운영자에게 먼저 알린다.
- PRD.md는 갱신하지 않음 — 역사 기록으로 보존.
- 커밋 메시지는 한국어 OK. 컨벤션: `feat:`, `fix:`, `chore:`, `docs:` 등.

## 참고 문서 링크

- 마스터 비전: `./VISION.md`
- Phase 1 아카이브: `./PRD.md` (필요할 때만)
- Next.js App Router: https://nextjs.org/docs/app
- Supabase: https://supabase.com/docs
- Tailwind: https://tailwindcss.com
- Pretendard: https://github.com/orioncactus/pretendard

---

마지막 업데이트: 2026-04-30
