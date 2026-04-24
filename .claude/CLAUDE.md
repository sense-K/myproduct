# 마이프로덕트 (MyProduct) — Claude Code 작업 가이드

## 이 프로젝트에 대하여

이 프로젝트는 **PRD.md**에 정의된 "마이프로덕트" 웹 서비스를 구현합니다.

- **서비스 성격**: 한국 인디 메이커들이 제품을 등록하고 서로 피드백을 교환하는 플랫폼. 등록 증명서 자동 발급.
- **운영자**: 비개발자 (바이브코더). Claude Code와 협업하여 제작.
- **권장 모델**: Opus (기본). 단순 반복 작업 시 `/model sonnet`으로 전환 가능.
  - 시작: `claude --model opus`
  - 세션 중 전환: `/model sonnet` 또는 `/model opus`
  - (옵션) Claude Code 최신 버전에서는 `opusplan` alias 사용 가능 — 기획은 Opus, 실행은 Sonnet 자동 전환

## 절대 원칙

1. **모든 구현 결정은 PRD.md를 먼저 참조한다.** 섹션 번호로 정확히 참조 가능.
2. **SEO가 최우선 전략이다.** 섹션 9의 모든 요구사항은 타협 없음.
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

## 개발 단계 순서

PRD 섹션별 구현 순서 (종속성 순):

1. **프로젝트 초기 셋업**: Next.js + TypeScript + Tailwind + Supabase 연결
2. **DB 스키마** (PRD 섹션 8): 12개 테이블 + RLS 정책
3. **인증 시스템** (PRD 섹션 6.4, 7.21, 7.22): Google + 매직링크
4. **공통 레이아웃**: 네비, 푸터, 에러 페이지 (404/410/500)
5. **SEO 기본 세팅** (PRD 섹션 9): 메타 태그, sitemap, robots.txt, JSON-LD
6. **홈 페이지** (PRD 섹션 7.1)
7. **제품 상세 페이지** (PRD 섹션 7.2) — 가장 중요한 SEO 페이지
8. **카테고리 피드** (PRD 섹션 7.3)
9. **등록 플로우** (PRD 섹션 7.4~7.8, 6.1~6.2): intro, url, manual, confirm, done
10. **피드백 플로우** (PRD 섹션 7.9~7.11, 6.1): pick, 작성, done
11. **마이페이지** (PRD 섹션 7.12~7.16)
12. **레지스트리·증명서** (PRD 섹션 7.17~7.18)
13. **정적 페이지**: about (7.19), guide (7.20), terms (7.23), privacy (7.24)
14. **이메일 알림 시스템** (PRD 섹션 6.3.4)
15. **분석 도구 연동**: GA4, Search Console, Clarity

## 작업 지시 템플릿

운영자가 Claude Code에게 지시할 때 다음 형식을 권장:

```
PRD.md 섹션 [번호]를 참고해서 [기능명]을 구현해줘.

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
→ PRD 먼저 확인. PRD에 없으면 운영자에게 확인.

**Q: 성능 vs 정확도 트레이드오프는?**
→ SEO 관련: 정확도 우선. 그 외: 상황에 따라. 판단 애매하면 운영자에게 확인.

**Q: 외부 라이브러리 추가해도 될까요?**
→ PRD 섹션 10.1에 명시된 것은 OK. 추가 필요 시 운영자에게 확인.

**Q: UI 컴포넌트 시안이 없어요.**
→ PRD에 기술된 구성 요소를 기반으로 섹션 10.2 디자인 가이드에 맞춰 구현. 와이어프레임 파일이 있으면 참조.

## 변경 이력 관리

- PRD 수정이 필요하면 운영자에게 먼저 알린다.
- 중요한 구현 결정은 PRD에 반영 제안한다.
- 커밋 메시지는 한국어 OK. 컨벤션: `feat:`, `fix:`, `chore:`, `docs:` 등.

## 참고 문서 링크

- PRD 전체: `./PRD.md`
- Next.js App Router: https://nextjs.org/docs/app
- Supabase: https://supabase.com/docs
- Tailwind: https://tailwindcss.com
- Pretendard: https://github.com/orioncactus/pretendard

---

마지막 업데이트: 2026-04-23
