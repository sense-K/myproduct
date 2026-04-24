# 마이프로덕트 (MyProduct) — Product Requirements Document

**Version**: 1.0
**Last Updated**: 2026-04-23
**Author**: (운영자 / 1인 메이커)
**Target Implementer**: Claude Code (opusplan 모드 권장)

---

## 📘 Claude Code 사용 가이드 (읽기 시작 전에)

> 이 PRD는 Claude Code에 전달되어 실제 구현에 쓰이는 것을 전제로 작성됐습니다.
> 개발자가 아닌 운영자(바이브코더)가 Claude Code와 협업하여 제작합니다.

### 권장 모델 설정

**기본 (가장 안전)**:
```bash
claude --model opus
```

세션 중 단순 반복 작업 시:
```
/model sonnet
```

다시 복잡한 작업으로 돌아갈 때:
```
/model opus
```

**옵션 (Claude Code 최신 버전)**:
```bash
claude --model opusplan
```

- `opusplan`은 기획·설계 단계에선 Opus가, 실제 코딩 단계에선 Sonnet이 자동 전환되는 하이브리드 모드.
- 단, `opusplan`은 Claude Code v2.1.111+ 에서 지원. 실행 시 "invalid model" 에러 뜨면 `claude update`로 최신 버전 업데이트 후 재시도.
- 안 되면 `claude --model opus`로 진행.

### PRD 전달 방식

1. 이 파일 전체를 프로젝트 루트에 `PRD.md`로 저장합니다.
2. Claude Code 시작 시 `CLAUDE.md`에 다음을 포함하세요:
   ```markdown
   # 이 프로젝트에 대하여
   이 프로젝트는 PRD.md에 정의된 "마이프로덕트" 서비스를 구현합니다.
   모든 구현 결정은 PRD.md를 먼저 참조하세요.
   섹션 번호로 참조할 수 있습니다 (예: "섹션 6.1 피드백 교환 규칙").
   ```
3. 작업 지시 시 구체적인 섹션을 참조하세요:
   - ❌ "피드백 기능 만들어줘"
   - ✅ "PRD.md 섹션 6.1과 섹션 7.10을 참고해서 피드백 작성 페이지를 만들어줘"

### 단계적 구현 순서 추천

다음 순서로 지시하면 종속성이 깔끔합니다:

1. 프로젝트 초기 셋업 (Next.js + Supabase + Tailwind)
2. 데이터베이스 스키마 (섹션 8)
3. 인증 시스템 (섹션 6.4)
4. 기본 레이아웃·네비·공통 컴포넌트
5. 홈·제품 상세·카테고리 피드 (SEO 핵심 페이지 우선)
6. 등록 플로우 (섹션 7.4~7.8)
7. 피드백 플로우 (섹션 7.9~7.11)
8. 마이페이지 (섹션 7.12~7.16)
9. 레지스트리·증명서 (섹션 7.17~7.18)
10. 정적 페이지 (about / guide / terms / privacy)
11. 뉴스레터·알림 시스템
12. 분석 도구 삽입 (GA4 / Search Console / Clarity)

---

## 목차

- [섹션 1. 문서 개요](#섹션-1-문서-개요)
- [섹션 2. 서비스 정의](#섹션-2-서비스-정의)
- [섹션 3. 문제 정의와 솔루션](#섹션-3-문제-정의와-솔루션)
- [섹션 4. 유저 페르소나](#섹션-4-유저-페르소나)
- [섹션 5. 핵심 사용 시나리오](#섹션-5-핵심-사용-시나리오)
- [섹션 6. 핵심 메커니즘](#섹션-6-핵심-메커니즘)
- [섹션 7. 페이지 구조 및 상세 스펙](#섹션-7-페이지-구조-및-상세-스펙)
- [섹션 8. 데이터 모델](#섹션-8-데이터-모델)
- [섹션 9. SEO 전략](#섹션-9-seo-전략-최우선)
- [섹션 10. 기술 스택 및 디자인 가이드](#섹션-10-기술-스택-및-디자인-가이드)
- [섹션 11. 비기능 요구사항](#섹션-11-비기능-요구사항)
- [섹션 12. Phase 계획](#섹션-12-phase-계획)
- [섹션 13. 성공 지표](#섹션-13-성공-지표)
- [섹션 14. 리스크 및 대응](#섹션-14-리스크-및-대응)
- [섹션 15. 부록](#섹션-15-부록)

---

# 섹션 1. 문서 개요

> 이 섹션은 이 PRD를 읽는 사람이 "이 문서가 뭐고 어떻게 다뤄야 하는지" 먼저 이해하도록 돕습니다.

## 1.1 문서 목적

이 PRD는 **마이프로덕트(MyProduct)** 라는 이름의 웹 서비스의 전체 설계를 담습니다. 운영자는 비개발자(바이브코더)이며, Claude Code 등 AI 코딩 도구와 협업하여 제작합니다.

## 1.2 대상 독자

- **1차**: Claude Code (구현 수행)
- **2차**: 운영자 본인 (수정·의사결정 시 참조)
- **3차**: 향후 협업자 (디자이너·동료 메이커·외주 개발자 등)

## 1.3 문서 관리 원칙

- 이 문서는 **살아 있는 문서(living document)**. 서비스 발전과 함께 업데이트됩니다.
- 버전은 문서 상단에 명시. 변경 시 Last Updated 갱신.
- 큰 방향 변경은 하단의 변경 이력에 기록.
- 실제 구현과 문서가 충돌하면 **문서가 기준**. 문서를 바꿔서 맞추거나, 구현을 바꿉니다.

## 1.4 문서 읽기 가이드

- 각 섹션은 독립적으로 참조 가능합니다.
- 형이 특정 기능만 수정하고 싶으면 해당 섹션만 읽으면 됩니다.
- Claude Code는 전체를 한 번 읽고, 이후 작업 시에는 관련 섹션만 다시 참조하도록 지시하세요.

## 1.5 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0 | 2026-04-23 | 최초 작성 |

---

# 섹션 2. 서비스 정의

> 이 섹션은 PRD의 기준점입니다. 모든 기능·UI·카피 결정은 여기서 정의한 가치에 복무해야 합니다.

## 2.1 한 줄 정의

> **"혼자 만든 제품에, 동료 메이커의 진짜 피드백을 받는 곳. 그리고 당신의 아이디어는 등록 증명서로 안전하게 공개됩니다."**

## 2.2 서비스명 / 도메인

- **서비스명**: 마이프로덕트 (MyProduct)
- **도메인 (확정 필요)**: myproduct.kr / myproduct.co.kr / myproduct.io 중 Phase 1 개발 시작 전 결정

## 2.3 타겟 유저

한국의 1인 메이커 — 바이브코더, 사이드 프로젝터, 예비 창업자 등 혼자서 무언가를 만들어 세상에 내놓고 싶은 사람.

**공통된 감정**:
- "만들었는데 아무도 안 써요"의 외로움
- "뺏길까 봐 자세히 공개하기 무서워요"의 불안

**유저가 체류하는 주변 공간**:
- 디스퀴엇, 프로덕트헌트
- X(트위터) 인디 해시태그
- 아프니까 사장이다
- 인디해커스 한국

## 2.4 핵심 가치 (두 가지)

이 두 가지가 플랫폼의 존재 이유. **모든 기능·UI·카피가 이 둘 중 하나를 강화해야 함**.

### 가치 1: 💬 동료의 진짜 피드백

- **해결하는 감정**: "만들었는데 아무도 안 써요. 맞게 만든 건지, 뭐가 부족한지조차 모르겠어요."
- **제공 방식**: 10문항으로 구조화된 진지한 검토. 익명성 보장. 동료 메이커 간 교환.
- **차별점**: Product Hunt·디스퀴엇의 "좋아요 / awesome!" 같은 가벼운 반응이 아니라 **5분 이상 투자된 실질적 검토**.

### 가치 2: 🛡️ 안전한 공개 증명

- **해결하는 감정**: "뺏길까 봐 공개하기 무서워요. 내 아이디어를 기록으로 남기고 싶어요."
- **제공 방식**: 등록 즉시 타임스탬프 + 해시 기록 + PDF 증명서. 공개 레지스트리 영구 보존.
- **차별점**: 기존 런치 플랫폼은 "이벤트"지만, 우리는 "**기록의 영속성**"을 먼저 제공.
- **중요**: 법적 효력은 제한적. 심리적 안정 및 객관 증거 수단으로 포지셔닝. **과장 금지**.

## 2.5 차별화 포지셔닝

| 서비스 | 포지셔닝 | 차이점 |
|---|---|---|
| Product Hunt | 하루 런치 이벤트 | 1회성, 미리 만든 네트워크 필수 |
| 디스퀴엇 | 메이커 교류 SNS | 피드백 질 얕음, 증명 기능 없음 |
| Betalist | 얼리 유저 수집 | 피드백 상호작용 약함 |
| **마이프로덕트** | **성장 기록 + 증명** | **연재형, 구조화된 피드백 교환, 등록 증명서** |

**한 줄 차별화**: "다른 곳은 **런치**, 마이프로덕트는 **연재**."

## 2.6 스케일 원칙

- **목표 규모**: MAU 100~500명 수준에서 가치 있게 작동
- **성공 지표 상한**: MAU 1,000명 이상 도달 시 대성공
- **철학**: 수익 없이도 운영자가 재미있게 유지할 수 있는 규모. 취미 프로젝트이자 동시에 SEO 자산 축적 수단.
- **거부하는 패턴**: 바이럴 계수 강제 증폭, 복잡한 추천 알고리즘, 과도한 게임화

## 2.7 운영 원칙

- **수익 (Phase 1)**: 완전 무료. 구독·결제 없음
- **광고**: Phase 2부터 기본 노출 배너(Google AdSense 등) 검토 가능. 단:
  - 본문·피드백 작성 페이지는 광고 금지
  - 제품 상세 페이지에 광고 시 제품 정보와 명확히 구분
  - 타겟 광고·추적 광고 지양
- **개인정보 최소 수집**: 이메일, 닉네임, 창업 경력 태그만. 주소·이름·전화번호 수집 안 함 (Phase 1)
- **운영자 투입**: 초기 3~6개월 주당 5~10시간, 이후 주 2~3시간
- **투명성**: 증명서 법적 효력 등 과장 금지. 한계 명시가 신뢰 구축

## 2.8 핵심 규칙 요약

1. **피드백 1개 작성 = 등록권 1개 획득**
2. **내가 받은 피드백은 나만 열람** (다른 유저에겐 개수·경력 분포만 공개)
3. **등록 시 자동으로 타임스탬프 + 해시 + PDF 증명서 발급**
4. **제품은 업데이트 기능으로 버전이 누적됨** ("연재" 구조)
5. **로그인은 이메일 매직링크 또는 구글 OAuth**
6. **모든 피드백은 익명**, 창업 N년차 태그만 표시

---

# 섹션 3. 문제 정의와 솔루션

## 3.1 우리가 풀려는 문제

### 문제 1: 바이브코더의 고립

AI 코딩 도구 확산으로 1인이 제품 만드는 비용은 급감했지만, **만든 뒤의 경로**는 여전히 험난. 구체적 고통:

- 지표가 0이라 "맞게 만든 건지"조차 판단 불가
- 혼자 만든 시야의 맹점을 짚어줄 거울이 없음
- 다음 액션(누구에게 어떻게 알릴지)을 모름

### 문제 2: 공개 불안

아이디어가 뺏길까 봐 자세히 공개 못 하는 현상. 실제로 뺏기는 경우는 드물지만, **심리적 장벽**이 공개를 막음. 결과: 피드백도 못 받고, 초기 유저도 못 만남.

### 문제 3: 기존 플랫폼의 결핍

- Product Hunt: 한국 메이커에겐 진입 장벽. 영어·타이밍·네트워크가 필수
- 디스퀴엇: 교류는 되나 **진지한 피드백 문화** 약함
- 크라우드 펀딩: 검증 아니라 예약 판매. 단계가 다름

## 3.2 솔루션 접근

### 3.2.1 피드백 교환 경제

메이커가 메이커에게 피드백 주는 **상호부조 경제**. "1개 작성 → 1개 등록권"의 비대칭 없는 교환.

**왜 작동하나**:
- 수요자·공급자가 동일인 → 양면 시장 문제 우회
- 10문항 구조화로 피드백 품질 하한 확보
- 익명 + 경력 태그로 심리 안전

### 3.2.2 등록 증명 시스템

"올리는 순간 시각·내용이 공개 기록에 남는다"는 **심리적 안정 장치**.

**왜 작동하나**:
- 법적 효력이 절대적이지 않아도 **심리적 저항 해소**가 주 목적
- 공개 레지스트리 자체가 SEO 자산
- PDF 증명서가 공유·자랑 소재로 기능

### 3.2.3 성장 연재 구조

제품이 버전 업데이트되는 과정을 **타임라인**으로 보존. 단발 이벤트가 아닌 **서사적 기록**.

**왜 작동하나**:
- 재방문 동력 생성 (피드백 준 제품의 다음 버전 궁금함)
- SEO 자산이 시간 지날수록 두꺼워짐
- 기존 경쟁자(PH, Betalist)에 없는 포지션

---

# 섹션 4. 유저 페르소나

세 명의 대표 페르소나. 기능 설계 시 "이 중 누가 쓸지" 질문하는 기준이 됩니다.

## 4.1 페르소나 A: 바이브코딩 메이커 (주요)

- **이름**: 민수 (31세)
- **직업**: 소규모 커머스 운영자. 부업으로 SaaS 2~3개 운영 중
- **도구**: Claude Code, Cursor, Supabase, Vercel
- **제품 상황**: 프랜차이즈 점주용 익명 커뮤니티 서비스 운영 중. 유저 50명 정체
- **고통**:
  - "UI가 별로인지, 카피가 별로인지, 수요 자체가 없는 건지 몰라"
  - "트위터에 올려도 좋아요 3개 받고 끝"
- **이 플랫폼에서 원하는 것**:
  - 동료 메이커가 **왜 안 쓰는지** 진지하게 분석해주는 피드백
  - 가능하면 첫 유저 몇 명 유입
- **자주 쓸 기능**: 제품 등록, 받은 피드백 열람, 버전 업데이트
- **거부하는 것**: 광고 같은 노골적 홍보, 영어 강제

## 4.2 페르소나 B: 사이드 프로젝터 (보조)

- **이름**: 지은 (27세)
- **직업**: IT 대기업 주니어 개발자. 주말에 사이드 프로젝트
- **제품 상황**: 취미로 만든 Chrome 확장 프로그램. 설치 수 12명
- **고통**:
  - 회사에선 기술 얘기만 하고, 제품 관점 피드백 줄 사람 없음
  - 사이드프로젝트 자랑하기 부끄러움
- **이 플랫폼에서 원하는 것**:
  - 가벼운 부담으로 피드백 교환
  - 익명성 (회사에 알리기 싫음)
- **자주 쓸 기능**: 익명 피드백 주기, 다른 사이드프로젝트 구경
- **거부하는 것**: 실명 노출, 과한 참여 의무

## 4.3 페르소나 C: 예비 창업자 (확장)

- **이름**: 태윤 (35세)
- **직업**: 퇴사 예정자. 정부 창업 지원사업 준비 중
- **제품 상황**: 아직 개발 전. 랜딩페이지만 있음
- **고통**:
  - "아이디어를 얼마나 공개해야 할까"
  - "시장 수요 검증 방법을 모름"
- **이 플랫폼에서 원하는 것**:
  - 아이디어 공개에 대한 심리적 안전장치 (증명서)
  - 다른 창업자들이 이 아이디어를 어떻게 볼지
- **자주 쓸 기능**: URL 없이 직접 등록, 증명서 발급·보관
- **거부하는 것**: 지나치게 기술 중심 분위기

---

# 섹션 5. 핵심 사용 시나리오

## 5.1 시나리오 A: 첫 방문자 → 첫 등록

**상황**: 민수가 트위터에서 마이프로덕트 링크를 보고 방문

1. 홈(`/`) 도착 — 히어로 카피 "만드느라 혼자였잖아요" 보고 공감
2. 다른 제품들 구경 (`/feed`) → "진지한 피드백 문화가 진짜네" 확인
3. "제품 등록하기" 버튼 탭 → `/submit/intro`로 이동
4. "주고받는 곳" 규칙 확인 → "피드백 먼저" 이해 후 수락
5. `/feedback/pick`에서 추천 제품 3개 중 1개 선택
6. `/feedback/[slug]`에서 10문항 작성 (5분 소요)
7. `/feedback/done` — 등록권 +1 획득 확인
8. "내 제품 올리러 가기" 탭 → `/submit/url`
9. undercov.kr URL 입력 → AI 자동 채움 로딩
10. `/submit/confirm`에서 제품명·소개·카테고리 확인, 만든 사람 한마디 추가
11. 증명서 안내 문구 읽고 "올리기" 탭
12. `/submit/done` — 🎉 증명서 PDF 다운로드, X에 공유
13. 내 제품 페이지(`/p/undercov`) 방문 → 조회수 1 카운트

## 5.2 시나리오 B: 재방문 유저 (알림 트리거)

**상황**: 민수가 2주 전 피드백 준 제품이 업데이트됨

1. 이메일 알림 수신: "당신이 피드백 준 '사장님 상담'이 v1.1로 업데이트됐어요"
2. 링크 탭 → `/p/saja-sangdam` 제품 상세로
3. 성장 타임라인에서 v1.1 변경 내용 확인: "피드백 반영해서 UI 단순화했어요"
4. "v1.1에 다시 피드백 주기" 버튼 탭
5. 10문항 작성 → 등록권 +1
6. "내 제품 언더커버에도 새 버전 올리기" 떠올림
7. 마이페이지(`/me/products`) → 업데이트 버튼 탭
8. 변경 내용 작성 → v1.1 등록 완료
9. 이전 v1.0 피드백 준 메이커들에게 자동 알림 발송

## 5.3 시나리오 C: 검색 유입 (SEO의 완성)

**상황**: 프랜차이즈 점주가 "매출 벤치마킹 서비스"를 구글 검색

1. 구글 검색 → 마이프로덕트의 언더커버 제품 페이지가 2페이지 상단 노출
2. 페이지 타이틀 "언더커버 · 프랜차이즈 점주 익명 커뮤니티" 클릭
3. `/p/undercov` 도착 → 제품 설명, 성장 타임라인, 등록 증명 확인
4. "원본 사이트로 가기" 큰 버튼 탭 → undercov.kr로 이동
5. 마이프로덕트 입장: 창업자에게 **실제 타겟 유저 유입** 증거 축적
6. 민수(창업자) 입장: "우리 플랫폼은 SEO로 진짜 유저 전달한다" 체험 → 재사용 동기 강화

---

# 섹션 6. 핵심 메커니즘

## 6.1 피드백 교환 시스템

### 6.1.1 기본 규칙

- **1 피드백 = 1 등록권** (1:1 교환)
- 등록권은 **누적** 가능. 피드백 3개 하면 제품 3개 올릴 수 있음
- 등록권은 **만료 없음**
- 등록권은 **양도·판매 불가**
- 피드백은 **완료 제출 시점**에 등록권으로 전환 (임시저장은 미반영)

### 6.1.2 피드백 대상 선택

- **첫 피드백**: 시스템이 추천하는 제품 3개 중 선택 (알고리즘 6.1.3)
- **이후 피드백**: 전체 목록에서 자유 선택
- **자기 제품은 피드백 불가** (동일 이메일로 등록된 제품)
- **동일 버전에 중복 피드백 불가** (새 버전 출시 시 재피드백 허용)

### 6.1.3 추천 제품 큐레이션 알고리즘 (MVP)

우선순위 순:

1. 피드백 0~1개 받은 제품 우선
2. 최근 7일 내 등록된 제품 우선
3. 자기 제품 제외
4. 이미 피드백한 제품 제외
5. 카테고리 중복 없이 3개 선택 (랜덤 셔플)

단순 SQL 쿼리로 구현. ML 없음.

### 6.1.4 피드백 문항 (10문항, 확정안)

**섹션 A: 첫인상 (3문항)**

1. (객관식) 랜딩페이지·스크린샷을 3초 봤을 때 이 제품이 뭘 하는지 이해됐나요? → [예 / 애매함 / 아니오]
2. (서술형, 10자 이상) 이 제품의 타겟 고객은 누구일 것 같나요?
3. (서술형, 선택) 제품명·소개문에서 개선하고 싶은 부분이 있나요?

**섹션 B: 가치 제안 (3문항)**

4. (5단계 척도 + 주관식 이유) 이 제품이 해결하려는 문제가 실제로 존재한다고 보시나요?
5. (객관식 + 이유) 당신이 타겟이라면 돈 내고 쓸 것 같나요? → [예 / 아마도 / 아니오]
6. (서술형, 10자 이상) 비슷한 기존 서비스가 떠오르나요? 있다면 뭐가 다른가요?

**섹션 C: 실행 품질 (2문항)**

7. (5단계 척도 + 한 줄 의견) UI/디자인의 첫인상은 어떤가요?
8. (서술형, **필수, 30자 이상**) 이 제품의 가장 큰 약점은 무엇이라고 보시나요?

**섹션 D: 격려와 방향 (2문항)**

9. (서술형, 10자 이상) 이 제품이 딱 하나만 개선한다면 뭐가 좋을까요?
10. (서술형, 선택) 창업자에게 응원 한마디

### 6.1.5 작성 UX 규칙

- **한 번에 한 문항씩** 표시. 전체를 한 페이지에 펼치지 않음
- 진행률 바 상단 고정 (N/10 + 등록권 상태)
- **임시저장**: 클라이언트 localStorage + 매 답변 입력 시 자동 저장
- 이전 문항 수정 가능
- 중도 이탈 시 24시간 후 이메일 리마인드 1회
- **최소 요구사항**:
  - 필수 문항(1, 2, 4, 5, 7, 8, 9) 응답 필요
  - 8번은 30자 이상
  - 2, 6, 9번은 10자 이상
  - 3, 10번은 선택 (글자수 제한 없음)
- 제출 직후: "등록권 +1" 축하 화면

### 6.1.6 리뷰어 익명성 · 공개 정보

**비공개**:
- 실명
- 이메일
- 다른 유저가 쓴 피드백 내용

**공개**:
- 닉네임 (기본값 "익명 메이커")
- **창업 N년차 태그**: 예비 창업자 / 1년 미만 / 1~3년차 / 3~5년차 / 5년차 이상
- 피드백 작성 시각 (시·분 단위)

### 6.1.7 피드백 열람 규칙

- **창업자 본인**: 자기 제품 피드백 전체 열람
- **다른 유저**: 피드백 **개수**와 **리뷰어 경력 분포**만 열람. 내용 미공개
- **리뷰어 본인**: 자기가 쓴 피드백 마이페이지에서 재열람 (수정 불가)

### 6.1.8 톤 관리

- 피드백 폼 상단·하단에 가이드 문구 고정:
  > "솔직하게 말해주세요. 다만 창업자가 밤새 만든 걸 봐주는 거예요. 문제는 정확히, 표현은 부드럽게."
- `/guide` 페이지 상시 링크
- 신고 기능 (Phase 2에서 별도 테이블, Phase 1은 이메일 신고)

### 6.1.9 어뷰징 방지 (최소 장치)

- 한 이메일로 하루 최대 10개 피드백
- 동일 제품 중복 피드백 불가
- 전체 작성 시간 60초 미만 시 플래그 (사람이 30자 서술 작성 불가능한 시간)
- 100명 스케일에선 봇 경제가 안 성립하므로 추가 방어 불필요

## 6.2 등록 증명서 시스템

### 6.2.1 목적 및 포지셔닝

> **"심리적 안정을 제공하는 객관 기록 장치." 법적 보호 장치가 아님을 유저에게 명시.**

제공 효과:
- **심리적**: "내가 먼저"라는 감각적 안정
- **실용적**: 분쟁 발생 시 선·후 관계 참고 자료
- **마케팅**: 증명서 자체가 공유·자랑 소재

### 6.2.2 해시 생성 대상

등록 시 다음 정보를 정렬된 JSON으로 직렬화 → SHA-256 해시:

- 제품명
- 한 줄 소개
- 만든 사람 한마디 (있을 경우)
- 카테고리
- 썸네일 이미지의 해시 (이미지 자체 아님)
- 등록자 닉네임
- 등록 시각 (UTC 기준 ISO 8601)

### 6.2.3 저장 위치

- **자사 DB**: 해시값 + 원본 데이터 + 등록 시각 (영구 보존)
- **공개 레지스트리 페이지**: `/registry`, `/registry/[번호]` 자동 생성
- **Phase 1**: 외부 블록체인 연동 없음
- **Phase 2 검토**: OpenTimestamps 연동

### 6.2.4 등록번호 생성 규칙

- 형식: `#XXXXXX` (6자리 대문자+숫자)
- 규칙: 랜덤 UUID의 앞 6자리 (대문자 변환)
- 중복 시 재생성
- 공개 URL: `/registry/XXXXXX`

### 6.2.5 PDF 증명서

**발급 시점**: 최초 등록 시 1회만. 버전 업데이트는 타임라인 기록만 남김.

**포함 항목**:
- 플랫폼 로고 + "등록 증명서"
- 제품명
- 등록 시각 (년월일시분초)
- 등록번호
- 해시값 (앞 16자리 표시)
- 등록자 닉네임
- 검증 URL
- 고지 문구 (아래 참조)

**고지 문구**:
> "본 증명서는 특정 시각에 해당 내용이 마이프로덕트에 등록되었음을 기록한 문서입니다. 법적 효력은 제한적이며 참고 자료로만 활용해주세요."

**디자인 톤**:
- 신뢰감 있되 친근함
- 도장·격식 느낌 최소화
- 플랫폼 색상(크림/검정/주황) 일관

**재발급**: 마이페이지에서 언제든 재다운로드 가능. 내용은 발급 시점 snapshot 유지.

### 6.2.6 공개 레지스트리 페이지

**`/registry` 메인**:
- 등록 순서대로 무한 스크롤
- 각 항목: 등록번호 / 시각 / 제품명 / 닉네임 / 해시 앞자리 / 제품 페이지 링크
- 검색: 등록번호, 해시값, 제품명으로 검색
- 수정·삭제 불가 UI

**`/registry/[등록번호]` 개별 페이지**:
- 상세 정보
- 원본 제품 페이지 링크
- PDF 재다운로드
- 전체 해시값 노출
- SEO 인덱싱 대상

### 6.2.7 삭제 정책

**두 가지 옵션 제공**:

- **비공개 전환**: 제품 페이지만 비공개, 공개 레지스트리는 유지
- **완전 삭제** (Hard Delete): 제품 + 공개 레지스트리 모두 삭제. 단 PDF 증명서와 creator snapshot은 보존 → 창업자가 "나 이거 등록했었음" 증명 가능

**UI 안내 (완전 삭제 시)**:
> "완전 삭제 시 공개 레지스트리에서도 기록이 지워져요. 이미 받으신 증명서 PDF는 그대로 보관되며, 본인만 열람 가능한 등록 기록은 남아있어요. 되돌릴 수 없는 작업입니다."

### 6.2.8 고지 문구 일관성

증명서 관련 모든 UI에서 동일 톤:

> "등록 시각과 내용이 공개 기록·해시로 남아, '내가 먼저 올렸다'는 객관적 증거가 됩니다. 법적 효력은 제한적이지만 만약의 상황에 도움이 돼요."

**절대 금지**:
- "법적 보호"
- "저작권 보장"
- "특허 효력"
- "법적 효력 있음"

## 6.3 성장 타임라인

### 6.3.1 개념

- 하나의 제품은 여러 버전을 가질 수 있음
- 버전마다 등록 시각과 피드백 기록이 누적
- 제품 상세 페이지에 타임라인 형태로 시각화
- **Product Hunt, Betalist와의 핵심 차별점** (일회성 vs 연재형)

### 6.3.2 버전 업데이트 구조

**버전 필드**:
- 버전명 (자유 입력, 예: "v1.1", "2차 수정", "피봇 이후")
- 업데이트 시각
- 변경 설명 (50~500자)
- 선택: 새 스크린샷, 새 URL

**버전 간 관계**:
- 최초 등록 = v1.0 (자동, `is_initial=true`)
- 이후 업데이트는 창업자가 추가
- **증명서는 최초 버전에만 발급**. 이후 버전은 DB에 해시 저장만 (Phase 2에서 업데이트 증명서 발급 검토)
- 이전 버전 히스토리 영구 보존

### 6.3.3 피드백과의 상호작용

- 피드백은 **특정 버전에 귀속**
- v1.0 피드백 작성자는 v1.1 출시 시 이메일 알림 수신
- v1.1에 다시 피드백 가능 (같은 사람이라도 버전 다르면 허용)
- 재방문 동력의 핵심 장치

### 6.3.4 이메일 알림 규칙

#### A. 트리거 알림 (이벤트 기반)

- 조건: 내가 피드백 남긴 제품이 새 버전 업데이트
- 빈도: 월 1회 이하 (같은 제품 연속 업데이트 시 1번만)
- 즉시 발송

#### B. 주간 뉴스레터

- 주기: 주 1회 (일요일 저녁 or 월요일 아침)
- 구독 기준: **기본 ON (옵트아웃 방식)**. 이메일 가입 시 자동 구독, 설정에서 끄기 가능
- 첫 가입 시 고지: "주 1회 뉴스레터 발송, 설정에서 끌 수 있어요"

**큐레이션 구성**:

- **개인화 영역 (상단, 40%)**:
  - 내 관심 카테고리 기반 신규 제품 3개
  - 관심 카테고리 = (a) 등록 제품 카테고리 + (b) 피드백 남긴 제품 카테고리
  - 신규 유저는 "에디터 픽"으로 대체
- **전체 공유 영역 (하단, 60%)**:
  - 이번 주 신규 등록 Top 5 (피드백 많이 받은 순)
  - 이번 주 가장 성장한 제품 (버전 업데이트 활발) 1개
  - 피드백 기다리는 제품 2개

**디자인 원칙**:
- 모바일 뷰 우선
- 플레인 텍스트 가까운 디자인
- UTM 파라미터로 유입 측정

**Phase 배치**:
- Phase 1 말기 or Phase 2 초기 (유저 50명 돌파 시 시작)

#### C. 거래성 알림 (필수, 옵트아웃 불가)

- 로그인 매직링크
- 피드백 임시저장 리마인드 (24시간 후 1회)
- 증명서 PDF 발급 완료

## 6.4 인증·로그인 시스템

### 6.4.1 지원 방식 (2가지)

**방식 1: 구글 로그인 (OAuth 2.0)**
- 클릭 한 번
- 이메일·이름·프로필 이미지 자동 획득
- 대부분 유저의 기본 경로

**방식 2: 이메일 매직링크**
- 이메일 입력 → 링크 클릭 → 로그인
- 비밀번호 없음
- 구글 없는 유저용

### 6.4.2 로그인 화면 UX

1. [G] 구글로 계속하기 (최상단, 큰 버튼)
2. 구분선: "또는"
3. 이메일 입력 + "로그인 링크 받기"
4. 하단: "비밀번호는 없어요. 클릭 한 번이면 시작돼요."

### 6.4.3 계정 통합 규칙

- 이메일 unique → 같은 이메일이면 같은 계정
- 구글 가입 후 매직링크 로그인 → 기존 계정으로 통합
- 매직링크 가입 후 구글 로그인 → 자동 연결
- 구글 이름은 **닉네임 기본값 후보**로만 제시. 유저가 최종 결정 (기본값 "익명 메이커")

### 6.4.4 첫 로그인 플로우

1. 구글 or 매직링크로 로그인
2. 첫 로그인 감지 → "환영 설정" 모달
   - 닉네임 확인 (변경 가능)
   - 창업 경력 선택 (필수, 5개 중 1개)
   - 관심 카테고리 선택 (선택, 뉴스레터용, 복수 선택)
3. 설정 완료 → 원래 가려던 페이지로 이동

### 6.4.5 세션 관리

- 세션 유효기간: 30일
- 쿠키: HttpOnly, Secure, SameSite=Lax
- 로그아웃 시 서버 세션 무효화

### 6.4.6 Supabase Auth 활용

- Supabase Auth가 구글 OAuth + 매직링크 기본 제공
- Google Cloud Console에서 OAuth 2.0 클라이언트 ID 발급 후 Supabase에 연결

---

# 섹션 7. 페이지 구조 및 상세 스펙

## 7.0 페이지 목록 개요

총 24개 URL, 약 20개 페이지 컴포넌트 (피드백 10문항은 1개 컴포넌트).

| # | URL | 페이지명 | SEO 인덱싱 |
|---|---|---|---|
| 1 | `/` | 홈 | ✅ |
| 2 | `/p/[slug]` | 제품 상세 | ✅ |
| 3 | `/feed` | 카테고리 피드 | ✅ |
| 4 | `/submit/intro` | 등록 규칙 안내 | ❌ |
| 5 | `/submit/url` | URL 입력 | ❌ |
| 6 | `/submit/manual` | 직접 입력 | ❌ |
| 7 | `/submit/confirm` | 확인·수정 | ❌ |
| 8 | `/submit/done` | 등록 완료 | ❌ |
| 9 | `/feedback/pick` | 피드백 대상 선택 | ❌ |
| 10 | `/feedback/[slug]` | 피드백 작성 | ❌ |
| 11 | `/feedback/done` | 피드백 완료 | ❌ |
| 12 | `/me` | 마이페이지 | ❌ |
| 13 | `/me/products` | 내가 올린 제품 | ❌ |
| 14 | `/me/feedbacks-given` | 내가 준 피드백 | ❌ |
| 15 | `/me/feedbacks-received` | 내가 받은 피드백 | ❌ |
| 16 | `/me/settings` | 내 설정 | ❌ |
| 17 | `/registry` | 공개 레지스트리 | ✅ |
| 18 | `/registry/[regnum]` | 개별 증명서 | ✅ |
| 19 | `/about` | 서비스 소개 | ✅ |
| 20 | `/guide` | 피드백 작성 가이드 | ✅ |
| 21 | `/login` | 로그인 | ❌ |
| 22 | `/verify` | 이메일 인증 처리 | ❌ |
| 23 | `/terms` | 이용약관 | ✅ |
| 24 | `/privacy` | 개인정보처리방침 | ✅ |

## 7.1 홈 (`/`)

### 목적
- 첫 방문자: 두 가지 핵심 가치 즉시 전달 → 시작 행동 유도
- 재방문자: "오늘 뭐 올라왔나" 탐색

### 주요 구성 (상단 → 하단)
1. 네비게이션 바 (로고 / 구경하기 / 레지스트리 / 가이드 / 소개 / 시작하기)
2. **히어로 섹션**
   - H1: "만드느라 혼자였잖아요."
   - 본문: "이제 여기서 같이 봐줄게요. 사용자는 없어도, 피드백을 받을 동료는 있어요. 아이디어가 걱정되면, 증명서로 기록을 남기세요."
   - 두 가치 아이콘 (💬 / 🛡️)
   - CTA 2개: "제품 올리기" / "피드백 주러 가기"
3. **최근 올라온 제품** — 카테고리 탭 + 카드 그리드 4~6개 + "전체 보기"
4. **이번 주 피드백 많이 받은** — 가로 스크롤 3개
5. **피드백 기다리는 제품** — 대시드 보더. 2개 (피드백 0~1개 신규)
6. **검정 배경 가치 섹션** — 3가지 가치 (피드백 / 증명서 / 성장 기록)
7. **푸터 CTA** — "첫 등록 전 피드백 1개" 규칙 명시
8. **푸터** — 빠른 링크 / 저작권 / 연락처

### 데이터 요구사항
- 카테고리별 최신 제품 쿼리
- 이번 주 피드백 Top 3 (최근 7일 내)
- 피드백 기다리는 제품 Top 2 (피드백 0~1, 등록 최근순)

### SEO
- 메타 타이틀: `마이프로덕트 · 메이커의 제품에 진짜 피드백, 아이디어는 증명서로 안전하게`
- 메타 설명: (160자) "만들었는데 아무도 안 써요? 한국 인디 메이커의 진짜 피드백을 받고, 타임스탬프 증명서로 '내가 먼저' 기록을 남기세요. 1인 개발자와 바이브코더를 위한 공간."
- H1: "만드느라 혼자였잖아요"
- 내부 링크: 제품 카드 → 상세, 카테고리 → 피드
- JSON-LD: `WebSite` + `Organization` 스키마

### 인터랙션
- 로그인 상태에 따라 "시작하기" 버튼이 "제품 올리기"로 변경
- 카테고리 탭 전환 AJAX
- 카드 탭 → 상세로 이동

## 7.2 제품 상세 (`/p/[slug]`)

### 목적
- SEO 유입 핵심 (전체 SEO 자산의 90%)
- 구경꾼 → 원본 사이트 전달 또는 피드백 작성 전환

### 주요 구성 (상단 → 하단)
1. 슬림 네비 (뒤로 / 브랜드 / 공유)
2. **히어로**: 썸네일 (카테고리 라벨) / 제품명 / 태그라인
3. **두 가치 배지 2개**: 🛡️ 등록 증명 (날짜) / 💬 피드백 개수
4. **"원본 사이트로 가기" 큰 CTA** (검정 버튼)
5. **"피드백 주기" 보조 CTA**
6. **통계 바**: 조회수 / 피드백 / (본인 전용) 원본 이동 수
7. **만든 사람 한마디** (인용 디자인 + 창업 N년차)
8. **성장 타임라인** (버전별 카드)
9. **피드백 요약**: "N명이 검토 / 경력 분포 / 작성하기 CTA"
10. **등록 증명 카드** (검정 배경 + 레지스트리 링크)
11. **관련 제품 2개** (같은 카테고리)
12. **Sticky 하단 CTA**: "피드백 작성하기"

### 열람 권한 분기
- **익명·타 유저**: 공개 영역만. 원본 이동 수 숨김
- **로그인한 본인**:
  - 피드백 작성 → "피드백 전체 읽기"로 교체
  - 타임라인에 "새 버전 추가하기" 버튼
  - 통계 바에 원본 이동 수 노출
  - 우상단 "관리" 아이콘

### 데이터 요구사항
- 제품 정보 전체
- 작성자 닉네임 + 경력 태그
- 피드백 수 + 리뷰어 경력 분포
- 버전 이력
- 조회수 (페이지 로드 시 +1, fingerprint 기반 24h 중복 제외)
- 원본 이동 클릭 카운터
- 관련 제품 2개 (같은 카테고리 + 랜덤)

### SEO
- 메타 타이틀: `[제품명] · [태그라인 앞 25자] | 마이프로덕트`
- 메타 설명: 태그라인 + "2026-04-23 등록 · 메이커 N명의 피드백"
- OG 태그: 썸네일·제품명·태그라인
- JSON-LD: `SoftwareApplication` + `BreadcrumbList` + `datePublished` + `dateModified`
- canonical: self-referencing
- 본문 600자 이상 확보 (태그라인 + 한마디 + 타임라인 + 피드백 요약)

### 인터랙션
- "원본 사이트 가기" → `rel="noopener"` 새 탭 + 클릭 로깅
- 공유 → 카톡/X/URL 복사
- 타임라인 미래 버전은 접혀있음

## 7.3 카테고리 피드 (`/feed`)

### 목적
- 카테고리별 제품 탐색
- SEO 롱테일 공략 ("한국 인디 SaaS 제품 모음" 등)

### 주요 구성
1. 네비
2. 카테고리 탭 (가로 스크롤): 전체 / SaaS / 모바일앱 / 웹툰·창작 / 엉뚱함 / 기타
3. 정렬 옵션: 최신순 / 피드백 많은순 / 조회 많은순
4. 카드 그리드 (2열 모바일 / 3열 데스크톱) 무한 스크롤
5. 푸터

### URL 파라미터
- `?cat=saas` — 카테고리
- `?sort=latest|feedback|views`
- `?page=2` — SEO용 페이지네이션

### 데이터 요구사항
- 카테고리별 제품 목록 (cursor 기반 페이지네이션)
- 정렬 기준별 쿼리
- 카테고리별 총 수

### SEO
- 동적 메타 타이틀: `한국 인디 [카테고리명] 제품 모음 · 마이프로덕트`
- 동적 H1
- canonical: 정렬 파라미터는 제외, 카테고리만 포함
- `rel="prev/next"` 페이지네이션

## 7.4 등록 규칙 안내 (`/submit/intro`)

### 목적
- "주고받는 곳" 문화 첫 소개
- 첫 방문자만 거치는 게이트

### 주요 구성
1. 네비 (뒤로)
2. 제목: "여긴 주고받는 곳이에요"
3. 본문: "다른 메이커의 제품에 피드백 1개를 남기면, 내 제품 1개를 올릴 수 있는 등록권이 생겨요."
4. 3단계 규칙 카드:
   - ① 먼저 피드백 1개 남기기 (5분 소요)
   - ② 내 제품 올리기 + 증명서 자동 발급
   - ③ 동료들의 피드백 받기
5. CTA: "피드백 주러 가기" → `/feedback/pick`
6. 보조: "왜 이런 규칙인가요?" → `/about`

### 리다이렉트 규칙
- 로그인 & 등록권 ≥ 1 → `/submit/url`로 자동
- 로그인 & 등록권 = 0 → 이 페이지
- 비로그인 → 이 페이지 (CTA 시 로그인 먼저)

## 7.5 URL 입력 (`/submit/url`)

### 목적
- 등록 본 플로우 시작
- URL 하나로 AI 자동 채움 트리거

### 주요 구성
1. 네비 (뒤로)
2. 진행률 바: `✓ 등록권 1/1 확보` (초록)
3. 제목: "어떤 걸 만들었어요?"
4. URL 입력 필드
5. 예시 안내 ("이런 URL 모두 가능해요: 랜딩페이지 / 앱스토어 / 깃허브 README / 디스퀴엇 / 블로그")
6. CTA: 다음 →
7. 보조: "URL이 없어요. 직접 입력할게요" → `/submit/manual`

### 유효성 검증
- 빈 문자열 차단
- URL 형식 검증 (프로토콜 자동 보완: https:// 기본)
- 중복 등록 감지: 같은 URL로 등록된 제품 있으면 경고 + 기존 페이지 링크

### 다음 단계
- "다음" → AI 자동 채움 로딩 (3~5초) → `/submit/confirm`

### AI 자동 채움 로직
- URL fetch → HTML parsing
- 추출: og:title, og:description, og:image, 페이지 title, meta description
- Claude API 호출: 추출 정보 기반 제품명·태그라인·카테고리 추천
- 썸네일 다운로드 → Supabase Storage 저장

## 7.6 직접 입력 (`/submit/manual`)

### 목적
- URL 없는 메이커용 대안

### 주요 구성
1. 네비 (뒤로)
2. 진행률 바
3. 제목: "직접 입력해주세요"
4. 입력 폼:
   - 제품명 (필수, 2~40자)
   - 한 줄 소개 (필수, 10~150자)
   - 스크린샷 업로드 (필수, 1장 이상, 최대 3장)
   - 카테고리 선택 (필수, 단일)
5. CTA: "다음 (미리보기 확인) →" → `/submit/confirm`

### 스크린샷 요구사항
- 형식: JPG / PNG / WebP
- 크기: 장당 최대 5MB
- 자동 리사이즈: 최대 1200px 가로
- 저장: Supabase Storage

## 7.7 확인·수정 (`/submit/confirm`)

### 목적
- AI 자동 채움 결과 검증
- 증명서 발급 안내 (핵심 순간)
- 최종 등록 직전

### 주요 구성
1. 네비 (뒤로)
2. 제목: "이렇게 보일 거예요"
3. 프리뷰 카드:
   - 썸네일 (탭하면 변경)
   - 제품명 (인라인 수정)
   - 한 줄 소개 (인라인 수정)
   - 카테고리 칩 (탭하여 변경)
4. "만든 사람 한마디" 입력 (선택, 최대 200자)
5. **증명서 안내 박스 (검정 배경)**:
   - 아이콘 🛡️
   - 제목: "등록 즉시 타임스탬프 증명서가 발급돼요"
   - 본문: "등록 시각과 내용이 공개 기록·해시로 남아, '내가 먼저 올렸다'는 객관적 증거가 됩니다. 법적 효력은 제한적이지만 만약의 상황에 도움이 돼요."
6. 연락용 이메일 (필수, 로그인 유저는 자동)
7. 닉네임 (선택, 기본값 "익명 메이커", 2~20자)
8. CTA: "올리기 · 증명서 받기"

### 유효성
- 제품명, 한 줄 소개 비어있으면 차단
- 이메일 형식 검증
- 닉네임 길이 제한

### 처리 로직 ("올리기" 클릭 시)
1. 트랜잭션 시작
2. DB `products` insert (status='public')
3. `product_versions` insert (is_initial=true, version_number=1)
4. 해시 생성 (섹션 6.2.2)
5. 등록번호 생성 (UUID 앞 6자리)
6. `certificates` insert
7. PDF 증명서 생성 (서버사이드 라이브러리)
8. `registry_entries` insert
9. `credits` 테이블에 -1 기록 (spent_on_submission)
10. 트랜잭션 커밋
11. `/submit/done` 이동

## 7.8 등록 완료 (`/submit/done`)

### 목적
- 완료 축하 + 가치 시각화
- 공유 유도 (바이럴 트리거)

### 주요 구성
1. 네비 (브랜드만)
2. 🎉 + "올라갔어요!"
3. 서브: "'[제품명]'이 레지스트리에 기록됐어요"
4. **증명서 카드** (검정 배경, 큼직하게):
   - 등록번호 / 해시(앞자리) / 등록자
   - "📄 증명서 PDF 다운로드"
5. 내 제품 페이지 URL + 복사 버튼
6. 공유 버튼 2개: X / 카톡
7. 메인 CTA: "내 제품 페이지 보기 →"

### 공유 규칙
- X: `"[제품명]을/를 마이프로덕트에 올렸어요! [URL] #마이프로덕트 #인디메이커"`
- 카톡: 썸네일 + 제품명 + "마이프로덕트에서 확인해주세요"

## 7.9 피드백 대상 선택 (`/feedback/pick`)

### 목적
- 첫 피드백 유저에게 3개 추천 제공

### 주요 구성
1. 네비 (뒤로)
2. 진행률 바: `등록권 0/1 · 피드백 0개 완료`
3. 제목: "어떤 제품부터 볼까요?"
4. 본문: "아직 피드백이 적어 누군가의 의견을 기다리는 제품들이에요."
5. 3개 추천 카드 (썸네일 / 제품명 / 한 줄 / "피드백 N · M일 전" / 시작 버튼)
6. 보조: "전체 목록에서 고르기" → `/feed?filter=needs-feedback`

### 추천 알고리즘 (6.1.3)

## 7.10 피드백 작성 (`/feedback/[slug]`)

### 목적
- 10문항 피드백 작성
- 중도 이탈 최소화

### 주요 구성
1. 네비 (뒤로)
2. 진행률 바: `[N]/10 문항 · 등록권 0/1`
3. 현재 문항 번호 + 텍스트
4. 답변 입력 영역
5. 글자수 카운터 (최소 요구사항 표시)
6. 하단: 이전 / 다음 버튼

### 문항별 UI
- 객관식: 라디오 버튼 카드 형태
- 5단계 척도: 세그먼트 컨트롤 + 이유 텍스트영역
- 서술형: 텍스트영역 + 글자수 카운터

### 임시저장
- 클라이언트 localStorage 기반
- 매 답변 입력 시 debounce 500ms 후 자동 저장
- 저장 상태 표시 ("저장됨")
- 브라우저 재접속 시 복원

### 유효성
- 필수 문항 미응답 → "다음" 비활성화
- 최소 글자수 미달 → 에러 메시지

### 완료 처리 (10번 제출 시)
1. 트랜잭션 시작
2. `feedbacks` insert
3. `feedback_answers` 10개 insert
4. `credits` +1 (earned_from_feedback)
5. `products.feedback_count` +1 (트리거)
6. 트랜잭션 커밋
7. localStorage 피드백 초안 삭제
8. `/feedback/done` 이동

## 7.11 피드백 완료 (`/feedback/done`)

### 주요 구성
1. 등록권 카운터 카드 (애니메이션): `1/1` 초록 체크
2. 🌱 + "좋은 피드백 고마워요"
3. 서브: "[대상 제품명] 팀이 당신의 피드백을 확인하게 돼요. 등록권이 1개 생겼어요."
4. 메인 CTA: "내 제품 올리러 가기 →" (등록권 있을 시)
5. 보조: "한 번 더 피드백 하기" → `/feedback/pick`
6. (등록권 없을 시) "나중에 하기"

## 7.12 마이페이지 (`/me`)

### 주요 구성
1. 네비
2. 프로필 헤더: 닉네임 / 창업 N년차 / 가입일
3. 등록권 카드: 현재 보유 수 + "+ 더 얻기" 버튼
4. 요약 숫자 4개: 올린 제품 / 준 피드백 / 받은 피드백 / 받은 증명서
5. 바로가기 메뉴 4개

## 7.13 내가 올린 제품 (`/me/products`)

### 주요 구성
- 리스트 형태
- 각 항목: 썸네일 / 제품명 / 등록일 / 조회수·피드백·원본이동 / 상태 배지 / 액션 드롭다운
- 액션: 보기 / 업데이트 / 관리 (비공개 전환 / 완전 삭제 / 증명서 재다운로드)

### 관리 액션
- **비공개 전환**: 확인 모달 1회 → 즉시 적용
- **완전 삭제**: 확인 모달 2회 (경고 강화) → products + registry_entries 행 삭제 + tagline/maker_quote NULL 처리. certificates snapshot 보존
- **증명서 재다운로드**: 즉시 PDF 제공

## 7.14 내가 준 피드백 (`/me/feedbacks-given`)

### 주요 구성
- 리스트 형태
- 각 항목:
  - 대상 제품 썸네일 + 제품명
  - 작성일
  - 대상 제품 업데이트 여부 🌱 배지
  - 클릭 → 해당 제품 상세로
- 정렬: 최신순 / 업데이트 알림순

## 7.15 내가 받은 피드백 (`/me/feedbacks-received`)

### 주요 구성
- 제품별로 묶음 (아코디언)
- 각 제품: 제품명 / 총 피드백 수 / 최근 날짜
- 펼치면 10문항별 답변 모음
- 각 피드백 카드: 리뷰어 경력 태그 / 작성일 / 답변
- 필터: 최신순 / 경력순 / 제품별

## 7.16 설정 (`/me/settings`)

### 주요 구성
- **프로필**: 닉네임 / 창업 경력
- **이메일**: 변경 (확인 링크 재발송)
- **알림 설정**:
  - 버전 업데이트 알림 ON/OFF
  - 주간 뉴스레터 ON/OFF
  - 리마인드 알림 (비활성화 불가, 안내만)
- **관심 카테고리**: 뉴스레터 개인화용
- **계정**: 회원 탈퇴

### 탈퇴 처리
- 내 제품 전체 삭제 or 비공개 선택
- 내 피드백은 **유지** (창업자 기록 보호)
- users 테이블: email·google_profile_image_url → NULL, nickname → "탈퇴한 메이커", deleted_at 기록
- credits·notifications·드래프트 → 즉시 삭제

## 7.17 공개 레지스트리 (`/registry`)

### 주요 구성
1. 네비
2. 페이지 제목: "등록 레지스트리"
3. 안내: "마이프로덕트에 등록된 모든 제품의 공개 기록입니다. 각 등록은 해시와 타임스탬프로 보존됩니다."
4. 검색 바
5. 전체 등록 수
6. 리스트 (무한 스크롤, 최신순)
   - 등록번호 / 시각 / 제품명 / 닉네임 / 해시(앞자리) / 상세 →

### SEO
- 메타 타이틀: `공개 레지스트리 · 마이프로덕트에 등록된 모든 제품 공개 기록`
- 신규 등록 시 sitemap lastmod 갱신
- SEO 페이지네이션 + 무한 스크롤 병행

## 7.18 개별 증명서 상세 (`/registry/[regnum]`)

### 주요 구성
1. 네비
2. 제목: "등록번호 #A3F8D9"
3. 상세 정보:
   - 등록 시각 (초 단위)
   - 제품명 / 한 줄 소개 / 카테고리
   - 등록자 닉네임 / 창업 경력
   - 해시값 (전체, 복사 가능)
   - 원본 제품 페이지 링크 (존재 시)
4. PDF 재다운로드 (누구나)
5. 고지 문구

### SEO
- 각 증명서 독립 인덱싱 (롱테일)
- 메타 타이틀: `[제품명] 등록 증명서 #A3F8D9 · 마이프로덕트`

### 삭제된 제품 처리
- **비공개 전환**: 증명서 접근 가능, 원본 제품 페이지 404
- **완전 삭제**: 이 페이지 410 Gone (본인만 PDF 보관)

## 7.19 서비스 소개 (`/about`)

### 주요 구성
1. 네비
2. 오프닝: "만드느라 혼자였잖아요" (홈 히어로와 연결)
3. 문제 정의 섹션: "바이브코더의 두 가지 고독"
4. 솔루션: 두 가치 상세
5. 메커니즘: 피드백 1:1 교환 / 증명서 / 타임라인 (그림으로)
6. 만든 사람 소개 (운영자 원하는 범위까지)
7. FAQ (5~7개)
8. 푸터 CTA

### SEO
- 메타 타이틀: `마이프로덕트 소개 · 메이커를 위한 피드백과 증명의 공간`
- 본문 3000자+ 확보

## 7.20 피드백 작성 가이드 (`/guide`)

### 주요 구성
1. "좋은 피드백이란?"
2. "이렇게 쓰지 마세요" 예시 3개 (짧음 / 일반론 / 공격적)
3. "이렇게 써주세요" 예시 3개 (구체적 / 건설적 / 공감+개선)
4. 문항별 팁
5. "받는 메이커의 마음"
6. 푸터 CTA: "지금 피드백 주러 가기"

### SEO
- 메타 타이틀: `좋은 피드백 쓰는 법 · 마이프로덕트 가이드`
- 문항별 팁은 앵커 링크
- 본문 2000자+ 확보
- JSON-LD: `FAQPage` 스키마

## 7.21 로그인 (`/login`)

### 주요 구성
1. 간결 레이아웃
2. **[G] 구글로 계속하기** (최상단, 큰 버튼)
3. 구분선 "또는"
4. 이메일 입력 + "로그인 링크 받기"
5. 하단: "비밀번호는 없어요. 클릭 한 번이면 시작돼요."

### 처리 로직
- 구글 OAuth: Supabase Auth 호출 → 리다이렉트
- 매직링크: 이메일 → 서버 → 24시간 유효 토큰 + 이메일 발송 → 유저 클릭 → `/verify?token=...` → 검증 → 세션 생성

### 첫 로그인
- 신규 이메일 자동 회원 생성
- 닉네임 기본값 "익명 메이커"
- `/me/settings` 리다이렉트 (환영 설정)

## 7.22 이메일 인증 처리 (`/verify`)

### 주요 구성
- 로딩 스피너
- "로그인 처리 중..."

### 처리 로직
- URL의 token 검증
- 유효 → 세션 쿠키 발행 → 목적지 리다이렉트
- 무효/만료 → 에러 + 재발송 링크

## 7.23 이용약관 (`/terms`)

### 포함 섹션
- 서비스 정의
- **증명서 법적 효력 범위** (제한적 명시)
- **피드백 콘텐츠 저작권** (작성자 소유, 플랫폼은 표시권만)
- **제품 정보 저작권** (등록자 소유)
- 금지 행위 (스팸, 어뷰징, 허위 정보 등)
- 계정 제재 기준
- 분쟁 해결

## 7.24 개인정보처리방침 (`/privacy`)

### 포함 섹션
- 수집 항목: 이메일, 닉네임, 창업 경력, IP(로그), 쿠키
- 수집 목적: 서비스 제공, 증명서 발급, 알림
- 보관 기간: 탈퇴 시 즉시 삭제 (피드백은 익명화 유지)
- 제3자 제공: 없음 (단, Google OAuth 연동 시 구글 계정 정보 처리 고지)
- **등록 증명 데이터의 특수성**: 공개 레지스트리 기록은 "공개 의도로 제공된 정보"
- 뉴스레터 수신거부 권리
- **Microsoft Clarity 세션 기록 고지**
- 개인정보 담당자 연락처

## 7.X 공통 요소

### 네비게이션 바
- 로고 (좌) / 메뉴 (중앙 또는 우) / 로그인·프로필 (우)
- 메뉴: 구경하기(`/feed`) / 레지스트리(`/registry`) / 가이드(`/guide`) / 소개(`/about`)
- 로그인 상태: 프로필 아이콘 → 드롭다운 (마이페이지 / 설정 / 로그아웃)

### 푸터
- 빠른 링크: about / guide / registry / terms / privacy
- 저작권 표시
- 운영자 연락처 (이메일 or X 계정)

### 에러 페이지 (따뜻한 톤)
- **404**: "이 페이지는 사라졌거나 비공개로 전환됐어요. 다른 제품들을 구경해보세요." + 홈/피드 링크
- **500**: "잠시 문제가 생겼어요. 이런 일이 자주 있진 않아요. 잠시 후 다시 시도해주세요."
- **410 (완전 삭제)**: "이 제품은 창업자가 완전 삭제했어요. 그의 결정을 존중해주세요."

---

# 섹션 8. 데이터 모델

> Supabase (PostgreSQL) 기반. RLS(Row Level Security)로 DB 레벨 권한 제어.

## 8.0 설계 원칙

1. Supabase PostgreSQL
2. RLS 적극 활용 — 권한 분리를 DB 레벨에서 처리
3. Soft delete 우선, 완전 삭제 요청 시 hard delete
4. 모든 테이블에 `created_at`, `updated_at` 기본
5. 외부 노출 식별자는 UUID

## 8.1 테이블 목록 (12개)

| # | 테이블명 | 역할 |
|---|---|---|
| 1 | `users` | 유저 계정 |
| 2 | `products` | 등록 제품 |
| 3 | `product_versions` | 버전 이력 |
| 4 | `feedbacks` | 피드백 |
| 5 | `feedback_answers` | 문항별 답변 |
| 6 | `credits` | 등록권 거래 로그 |
| 7 | `certificates` | 발급된 증명서 |
| 8 | `registry_entries` | 공개 레지스트리 |
| 9 | `product_views` | 조회 로그 |
| 10 | `product_clicks` | 원본 링크 클릭 |
| 11 | `notifications` | 알림 큐 |
| 12 | `newsletter_subscriptions` | 뉴스레터 구독 상태 |

*`feedback_drafts`는 클라이언트 localStorage로 대체.*
*`reports`는 Phase 2 도입 예정 (Phase 1은 이메일 신고).*

## 8.2 상세 스키마

### 8.2.1 `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  auth_provider TEXT NOT NULL CHECK (auth_provider IN ('google', 'magic_link')),
  nickname TEXT NOT NULL DEFAULT '익명 메이커',
  career_tag TEXT NOT NULL CHECK (career_tag IN (
    'pre_founder', 'under_1y', '1_to_3y', '3_to_5y', 'over_5y'
  )),
  google_profile_image_url TEXT,
  interested_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
```

### 8.2.2 `products`

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  maker_quote TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'saas', 'mobile_app', 'webtoon_creative', 'quirky', 'etc'
  )),
  thumbnail_url TEXT,
  external_url TEXT,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('url', 'manual')),
  status TEXT NOT NULL DEFAULT 'public' CHECK (status IN (
    'public', 'private', 'deleted'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  view_count INT NOT NULL DEFAULT 0,
  click_count INT NOT NULL DEFAULT 0,
  feedback_count INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_owner ON products(owner_id);
CREATE INDEX idx_products_category_status ON products(category, status) WHERE status = 'public';
CREATE INDEX idx_products_created ON products(created_at DESC) WHERE status = 'public';
```

**완전 삭제 시**:
- DELETE from products (hard delete)
- DELETE from registry_entries (hard delete)
- certificates 테이블은 snapshot 유지 (본인 PDF 재발급용)

### 8.2.3 `product_versions`

```sql
CREATE TABLE product_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL,
  change_note TEXT,
  new_thumbnail_url TEXT,
  new_external_url TEXT,
  content_hash TEXT NOT NULL,
  is_initial BOOLEAN NOT NULL DEFAULT FALSE,
  version_number INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_versions_product ON product_versions(product_id, version_number DESC);
```

### 8.2.4 `feedbacks`

```sql
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  product_version_id UUID NOT NULL REFERENCES product_versions(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewer_career_tag_snapshot TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ NOT NULL,
  total_writing_seconds INT,
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (product_version_id, reviewer_id)
);

CREATE INDEX idx_feedbacks_product ON feedbacks(product_id);
CREATE INDEX idx_feedbacks_reviewer ON feedbacks(reviewer_id);
CREATE INDEX idx_feedbacks_submitted ON feedbacks(submitted_at DESC);
```

### 8.2.5 `feedback_answers`

```sql
CREATE TABLE feedback_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedbacks(id) ON DELETE CASCADE,
  question_number SMALLINT NOT NULL CHECK (question_number BETWEEN 1 AND 10),
  answer_text TEXT,
  answer_choice TEXT,
  answer_scale SMALLINT,
  UNIQUE (feedback_id, question_number)
);

CREATE INDEX idx_answers_feedback ON feedback_answers(feedback_id);
```

### 8.2.6 `credits`

```sql
CREATE TABLE credits (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'earned_from_feedback', 'spent_on_submission', 'admin_grant', 'admin_revoke'
  )),
  amount INT NOT NULL,
  related_feedback_id UUID REFERENCES feedbacks(id),
  related_product_id UUID REFERENCES products(id),
  balance_after INT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credits_user_created ON credits(user_id, created_at DESC);
```

### 8.2.7 `certificates`

```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  registration_number TEXT NOT NULL UNIQUE,
  content_hash TEXT NOT NULL,
  product_name_snapshot TEXT NOT NULL,
  tagline_snapshot TEXT NOT NULL,
  category_snapshot TEXT NOT NULL,
  nickname_snapshot TEXT NOT NULL,
  career_tag_snapshot TEXT NOT NULL,
  pdf_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cert_regnum ON certificates(registration_number);
CREATE INDEX idx_cert_product ON certificates(product_id);
```

`ON DELETE SET NULL`로 완전 삭제된 제품의 증명서도 snapshot 유지.

### 8.2.8 `registry_entries`

```sql
CREATE TABLE registry_entries (
  id BIGSERIAL PRIMARY KEY,
  certificate_id UUID NOT NULL UNIQUE REFERENCES certificates(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL UNIQUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_registry_visible ON registry_entries(is_visible, created_at DESC);
```

완전 삭제 시 행 삭제 (공개 레지스트리에서 사라짐).

### 8.2.9 `product_views`

```sql
CREATE TABLE product_views (
  id BIGSERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewer_user_id UUID REFERENCES users(id),
  viewer_fingerprint TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

CREATE INDEX idx_views_product_time ON product_views(product_id, viewed_at DESC);
CREATE INDEX idx_views_fingerprint_product ON product_views(viewer_fingerprint, product_id, viewed_at);
```

### 8.2.10 `product_clicks`

```sql
CREATE TABLE product_clicks (
  id BIGSERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  clicker_user_id UUID REFERENCES users(id),
  clicker_fingerprint TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clicks_product ON product_clicks(product_id, clicked_at DESC);
```

### 8.2.11 `notifications`

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'magic_link', 'product_version_update', 'weekly_newsletter',
    'feedback_draft_reminder', 'certificate_issued'
  )),
  subject TEXT,
  body_html TEXT,
  related_product_id UUID REFERENCES products(id),
  related_feedback_id UUID REFERENCES feedbacks(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'failed', 'cancelled'
  )),
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_pending ON notifications(status, scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id, created_at DESC);
```

### 8.2.12 `newsletter_subscriptions`

```sql
CREATE TABLE newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  weekly_newsletter_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  version_update_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  draft_reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  unsubscribed_all_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 8.3 주요 관계

```
users (1) ──< (N) products ──< (N) product_versions
                   │                    │
                   │                    └──< (N) feedbacks ──< (10) feedback_answers
                   │                                │
                   │                                └── reviewer_id (N) >── users
                   │
                   └── (1) certificates (1) ── (1) registry_entries
                   │
                   └──< (N) product_views
                   └──< (N) product_clicks

users (1) ──< (N) credits
users (1) ──< (N) notifications
users (1) ── (1) newsletter_subscriptions
```

## 8.4 RLS 정책 (Row Level Security)

> Supabase가 DB 레벨에서 자동으로 권한 체크해주는 기능. 테이블별로 누가 어떤 행을 보고/수정할 수 있는지 정의합니다.

### 8.4.1 products

- SELECT 공개: 누구나, `status='public'`인 행만
- SELECT 본인: `owner_id=auth.uid()`인 행은 status 무관 전체
- INSERT: 인증 유저, `owner_id=auth.uid()` 강제
- UPDATE: `owner_id=auth.uid()`인 행만
- DELETE: `owner_id=auth.uid()`인 행만

### 8.4.2 feedbacks

- SELECT:
  - 해당 제품 `owner_id=auth.uid()` (창업자)
  - 또는 `reviewer_id=auth.uid()` (피드백 작성자)
- **다른 유저는 내용 접근 불가** (핵심 규칙)
- INSERT: 인증 유저, `reviewer_id=auth.uid()` 강제
- UPDATE/DELETE: 불가 (제출 후 불변)

### 8.4.3 feedback_answers
- 상위 `feedbacks` RLS 계승

### 8.4.4 credits
- SELECT: 본인 것만
- INSERT/UPDATE/DELETE: 서버 사이드만 (유저 직접 조작 불가)

### 8.4.5 certificates, registry_entries
- SELECT: 누구나 (`is_visible=true` 레지스트리만)
- CUD: 서버 사이드만

### 8.4.6 notifications, newsletter_subscriptions
- 본인 것만 접근

### 8.4.7 users
- SELECT 공개 필드: `nickname`, `career_tag`, `id` (다른 유저 조회 시)
- SELECT 본인: 전체 필드
- UPDATE: 본인만

## 8.5 성능 최적화

### 8.5.1 캐시 필드
- `products.view_count`, `click_count`, `feedback_count`
- 트리거로 자동 증가 (feedbacks/views/clicks INSERT 시)

### 8.5.2 페이지네이션
- Cursor 기반 (offset 금지)
- `created_at` 또는 `id` 기준 커서

### 8.5.3 머티리얼라이즈드 뷰 (Phase 2)
- "이번 주 피드백 많은 Top 10" — 매 시간 갱신

## 8.6 백업·보존

- Supabase 자동 백업 (Pro 이상)
- 보존: 7일 (초기) → 30일 (확장 시)
- 월 1회 복구 테스트

## 8.7 개인정보 보호

### 탈퇴 처리
- `users.email`, `google_profile_image_url` → NULL
- `users.nickname` → "탈퇴한 메이커"
- `users.deleted_at` 기록
- 본인 제품: 유저 선택 (비공개 or 삭제)
- 본인 피드백: 유지 (받은 창업자 기록 보호, 익명화)
- `credits`, `notifications`, `newsletter_subscriptions`: 즉시 삭제

---

# 섹션 9. SEO 전략 (최우선)

> **이 섹션은 PRD의 다른 모든 섹션과 동등한 중요도. 페이지 설계·데이터 모델·기술 스택이 모두 SEO 요구사항과 충돌하지 않아야 함.**

## 9.0 전략 개요

운영자는 개인 홍보 수단 없음. 유료 광고 예산 없음. **유일한 성장 채널은 Google 검색 유입**. 플랫폼 생존이 SEO에 달림.

**3대 원칙**:
1. 모든 페이지가 SEO 자산
2. 롱테일 점령 (한국 인디 메이커 키워드 선점)
3. 구조화 데이터 극대화

## 9.1 타겟 키워드

### Tier 1: 브랜드 (방어용)
- `마이프로덕트`, `myproduct.kr`

### Tier 2: 직접 경쟁 (주요 전장)
**제품 발견**: `한국 인디 제품`, `한국 인디 메이커`, `한국 사이드프로젝트`, `바이브코딩 제품`, `1인 개발자 제품`, `인디해커 한국`

**피드백**: `내 제품 피드백`, `사이드프로젝트 피드백`, `스타트업 아이디어 피드백`, `서비스 피드백 받는 곳`, `MVP 피드백`

**아이디어 보호**: `아이디어 등록 증명`, `서비스 아이디어 보호`, `스타트업 아이디어 타임스탬프`, `제품 런치 증명`

### Tier 3: 롱테일 (제품 페이지 자동 공략)
**패턴**: [제품 기능] + [카테고리] + [한국]
- 예: `프랜차이즈 점주 커뮤니티 앱`, `자영업자 매출 벤치마킹`, `AI 레시피 추천 봇`
- 각 제품 페이지가 자동으로 수십 개 키워드 풀 생성

### Tier 4: 정보성
- `좋은 피드백 쓰는 법` → `/guide`
- `제품 피드백 문항`, `스타트업 피드백 양식`
- `사이드프로젝트 런치 플랫폼` → `/about`
- `인디 메이커 커뮤니티 한국`

### Tier 5: 경쟁 브랜드 연관 (가로채기)
- `디스퀴엇 대안`, `프로덕트헌트 한국`, `Betalist 한국`
- `/about`에 비교 섹션

## 9.2 URL 구조

### 9.2.1 사람이 읽을 수 있게
- ❌ `/p/12345`
- ✅ `/p/undercov`

### 9.2.2 슬러그 생성
- 우선순위: (1) 유저가 직접 입력한 영문 slug → (2) 제품명 영문이면 그대로 → (3) 한글이면 로마자 변환
- 중복 시: `-2`, `-3` 접미사 자동 추가
- 한글 slug 지양 (URL 인코딩 복잡)
- 특수문자·공백 제거, 소문자, 하이픈 구분

### 9.2.3 URL 계층
- 얕게 유지 (2단계 이내)
- `/p/[slug]`, `/registry/[num]` 최대 1단계

### 9.2.4 URL 영속성
- 발급된 slug는 절대 바뀌지 않음
- 제품명 수정해도 slug 유지
- 비공개 전환 시 URL 유지 (접근 제어만)
- 완전 삭제 시 410 Gone

## 9.3 메타 태그

### 9.3.1 Title
- 패턴: `[핵심 키워드] · [차별점] | 마이프로덕트`
- 50~60자 (모바일 잘리지 않게)
- 페이지별 고유. 중복 금지

### 9.3.2 Description
- 120~160자
- CTR 최적화 관점
- 키워드 1~2개 자연스럽게

### 9.3.3 Open Graph & Twitter Card

**모든 페이지 필수**:
- `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- `twitter:card=summary_large_image`

**이미지 스펙**:
- 1200×630px 권장
- 제품 상세: 제품 썸네일 1200×630 자동 리사이즈 + 로고 워터마크 + 배지 오버레이
- 홈/about/guide: 수동 제작

### 9.3.4 Canonical
- 모든 페이지 self-referencing 기본
- 쿼리 파라미터 페이지: `/feed?cat=saas&sort=latest` → canonical은 `/feed?cat=saas`
- 페이지네이션: self + `rel="prev/next"`

### 9.3.5 robots 메타
- 기본: `index, follow`
- `/me/*`, `/submit/*`, `/feedback/*`: `noindex, follow`

## 9.4 구조화 데이터 (JSON-LD)

### 9.4.1 전 페이지 공통
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "마이프로덕트",
  "url": "https://myproduct.kr",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://myproduct.kr/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### 9.4.2 홈 추가
`Organization` 스키마

### 9.4.3 제품 상세
```json
{
  "@type": "SoftwareApplication",
  "name": "[제품명]",
  "description": "[태그라인]",
  "applicationCategory": "[카테고리]",
  "datePublished": "[등록일 ISO]",
  "dateModified": "[최근 업데이트]",
  "author": {
    "@type": "Person",
    "name": "[닉네임]"
  },
  "image": "[썸네일 URL]",
  "url": "[원본 URL]"
}
```

**aggregateRating은 Phase 1에서 제외**. Phase 2에서 검토.

### 9.4.4 BreadcrumbList
모든 제품·증명서 페이지:
```
홈 > 카테고리 > 제품명
```

### 9.4.5 가이드/소개
- `FAQPage` 스키마 (`/guide`)
- `Article` 스키마 (`/about`)

## 9.5 사이트맵

### 9.5.1 자동 생성
- `/sitemap.xml` 동적
- 신규 등록 시 즉시 갱신
- Google Search Console 제출

### 9.5.2 분할
- `sitemap-static.xml`: 정적 페이지
- `sitemap-products.xml`: 제품 상세
- `sitemap-registry.xml`: 증명서
- `sitemap-feed.xml`: 카테고리
- `sitemap-index.xml`: 인덱스

### 9.5.3 우선순위
| 페이지 | priority | changefreq |
|---|---|---|
| 홈 | 1.0 | daily |
| 제품 상세 | 0.8 | weekly |
| 카테고리 | 0.7 | daily |
| 레지스트리 개별 | 0.5 | never |
| about/guide | 0.6 | monthly |

### 9.5.4 robots.txt
```
User-agent: *
Allow: /
Disallow: /me/
Disallow: /submit/
Disallow: /feedback/
Disallow: /api/
Disallow: /verify
Sitemap: https://myproduct.kr/sitemap-index.xml
```

## 9.6 콘텐츠 SEO

### 9.6.1 본문 길이 최소
- 제품 상세: 600자 (태그라인 + 한마디 + 타임라인 + 피드백 요약)
- about: 3000자
- guide: 2000자
- 카테고리: 500자

### 9.6.2 콘텐츠 확보 방법
- **AI 자동 보조 설명 생성 금지** (창작자 주권 존중)
- 플랫폼이 생성하는 메타 정보로 길이 확보: 등록 시각, 카테고리, 피드백 요약 블록
- 버전 업데이트마다 타임라인 텍스트 추가로 길이 자동 증가

### 9.6.3 내부 링크 전략
- 허브 → 스포크: 홈·카테고리 → 제품 상세
- 스포크 → 스포크: 제품 상세 하단 "관련 제품 2개"
- 스포크 → 허브: 제품 상세 → 카테고리 (앵커 키워드)
- 전 페이지 → 중요 페이지: 푸터에서 about/guide/registry

### 9.6.4 앵커 텍스트
- "더 보기" 지양
- 키워드 포함 (예: "한국 SaaS 제품 더 보기")

### 9.6.5 이미지 SEO
- 모든 이미지 alt 속성 (제품명 + 카테고리 자동)
- 파일명 의미 있게 (`product-undercov-thumbnail.jpg`)
- WebP 우선, JPG fallback
- Lazy loading (위 영역 제외)

## 9.7 기술 SEO

### 9.7.1 Core Web Vitals
- LCP < 2.5초
- FID < 100ms
- CLS < 0.1
- PageSpeed Insights 90점+ 목표

필수:
- WebP + 반응형 srcset
- CSS/JS 최소화
- 폰트 최적화 (font-display: swap, subset)
- Cloudflare CDN

### 9.7.2 모바일 친화성
- 모바일 퍼스트 반응형
- 터치 타겟 44×44px 이상
- 본문 16px 이상

### 9.7.3 HTTPS
- 전 페이지 강제
- HTTP → HTTPS 자동 리다이렉트

### 9.7.4 렌더링 전략
- 대부분: **SSG 또는 ISR** (Incremental Static Regeneration)
- 제품 상세: ISR 필수 (버전 업데이트 시 재생성)
- 마이페이지: CSR 허용
- **Next.js App Router + Cloudflare Pages + Supabase 확정**

**SPA 절대 금지**: 초기 HTML에 메타·구조화 데이터·본문 포함 필수

### 9.7.5 상태 코드
- 비공개 전환: 404 (200으로 "페이지 없음" 띄우면 SEO 치명상)
- 완전 삭제: 410 Gone

### 9.7.6 hreflang
- 현재 한국어만 → 불필요
- 향후 영문 지원 시 `hreflang="ko"` 명시

## 9.8 외부 SEO (백링크)

### 9.8.1 자연 발생
- 창업자가 제품 페이지를 SNS·블로그 공유 → 도메인 오소리티 상승
- 등록 완료 화면의 공유 버튼은 **핵심 SEO 전략**

### 9.8.2 OG 프리뷰 최적화
- 자동 생성: 썸네일 + 로고 워터마크 + 배지 오버레이
- 공유 시 자동 브랜드 노출

### 9.8.3 PR 앵커
- 디스퀴엇, 아프니까사장이다 커뮤니티 소개글 (운영자 수동)

## 9.9 분석 도구

### 9.9.1 필수 설치
- **Google Search Console**: 검색 퍼포먼스, 인덱싱
- **Google Analytics 4**: 유입 분석, 전환 경로
- **Microsoft Clarity**: 히트맵, 세션 리플레이 (무료)

### 9.9.2 커스텀 이벤트
- 제품 상세 진입
- "원본 사이트 가기" 클릭 (핵심 전환 지표)
- 피드백 시작
- 피드백 완료
- 제품 등록 완료
- 증명서 PDF 다운로드
- SNS 공유

### 9.9.3 주간 SEO 리포트
- 유입 변화
- 신규 인덱싱 페이지
- 상위 유입 키워드
- CTR 낮은 페이지

## 9.10 SEO 타임라인

| 시점 | 기대치 |
|---|---|
| 월 1~2 | 인덱싱 시작. 브랜드 키워드 1위. 실제 유입 거의 없음 |
| 월 3~4 | 롱테일 일부 노출. 주당 10~30 유입 |
| 월 6 | 주요 카테고리 키워드 5~20위권. 주당 50~100 유입 |
| 월 12 | 일부 키워드 1페이지 진입. 일 100~500 유입 가능 |
| 월 24 | 안정적 오가닉. 일 500~2,000 유입 가능 |

단기 성과 기대 금지. 1년 후 차이가 크므로 지금부터 정확히 세팅.

---

# 섹션 10. 기술 스택 및 디자인 가이드

## 10.1 기술 스택

### 10.1.1 프론트엔드
- **Next.js 14+ (App Router)**: SSR/SSG/ISR 지원, SEO 최적
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 빠른 스타일링, 형 기존 스택 호환
- **React Server Components**: 초기 페이지 로드 최적
- **Shadcn UI**: 컴포넌트 라이브러리 (선택적)

### 10.1.2 백엔드·DB
- **Supabase**: PostgreSQL DB + Auth + Storage + Realtime
- **Supabase Auth**: Google OAuth + 매직링크 기본 제공
- **Supabase Storage**: 썸네일·PDF 저장
- **Supabase RLS**: 권한 제어

### 10.1.3 배포·인프라
- **Cloudflare Pages**: 호스팅, CDN, SSL
- **Cloudflare Workers** (필요 시): 엣지 로직
- **GitHub**: 버전 관리, 자동 배포

### 10.1.4 외부 API
- **Claude API**: 제품 정보 AI 자동 채움 (URL → 제품명·태그라인·카테고리 추천)
- **OG Image Generation**: Next.js `@vercel/og` 또는 유사 라이브러리

### 10.1.5 PDF 생성
- **React PDF** (`@react-pdf/renderer`) 또는 **Puppeteer**
- 서버사이드 실행, Supabase Storage 업로드

### 10.1.6 이메일
- **Resend** 또는 **Postmark** 추천 (한국 지원 양호)
- Supabase 자체 이메일은 매직링크용으로만
- 거래성 이메일 + 뉴스레터용

### 10.1.7 분석
- Google Search Console
- Google Analytics 4
- Microsoft Clarity

### 10.1.8 개발 도구
- VS Code
- GitHub Desktop 또는 CLI
- Claude Code (`opusplan` 모드)

## 10.2 디자인 가이드

### 10.2.1 색상 시스템

| 역할 | 토큰명 | HEX |
|---|---|---|
| 배경 (메인) | `--cream` | `#FBF6ED` |
| 텍스트 (진함) | `--ink` | `#1A1A1A` |
| 텍스트 (중간) | `--ink-60` | `#5A5A5A` |
| 텍스트 (흐림) | `--ink-40` | `#858585` |
| 선·보더 (연함) | `--ink-10` | `#E8E4DB` |
| 포인트 (주황) | `--accent` | `#F04D2E` |
| 포인트 배경 | `--accent-soft` | `#FFE8E0` |
| 보조 (녹색) | `--sage` | `#7A8871` |
| 보조 배경 | `--sage-soft` | `#E8EDE4` |
| 흰색 | `--paper` | `#FFFFFF` |

**용도별 매핑**:
- 주요 CTA 배경: `--ink` 또는 `--accent`
- 핵심 가치 배지 (증명): `--sage-soft` + `--sage` 텍스트
- 핵심 가치 배지 (피드백): `--accent-soft` + `--accent` 텍스트
- 중요 안내 박스: `--ink` 배경 + `--cream` 텍스트

### 10.2.2 타이포그래피

**폰트**: Pretendard Variable (한글 최적화, 무료)
```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
```

**크기 스케일**:
| 용도 | 크기 | weight |
|---|---|---|
| 본문 | 14~16px | 400 |
| 서브 텍스트 | 12~13px | 400~500 |
| 소제목 | 14~16px | 600~700 |
| 섹션 제목 | 18~20px | 700~800 |
| 히어로 | 24~28px | 800 |
| 특대 | 32px+ | 800 |

**라인 높이**: 1.4~1.6 (본문), 1.2~1.3 (제목)

### 10.2.3 라운딩
- 작은 요소 (버튼, 칩): 8px
- 카드·중간 요소: 14px
- 큰 카드·컨테이너: 28px

### 10.2.4 간격
- Tailwind spacing scale 활용
- 섹션 간: `py-8` ~ `py-16`
- 카드 내부: `p-4` ~ `p-6`
- 요소 간: `gap-2` ~ `gap-4`

### 10.2.5 그림자
- 일반 카드: `shadow-sm`
- 부상 요소: `shadow-md`
- 모달·튜토리얼: `shadow-xl`
- 블랙 플로팅 CTA: `shadow-2xl shadow-black/10`

### 10.2.6 애니메이션
- 기본 transition: `transition-all duration-150`
- 상태 변경: `duration-200`
- 페이지 전환: `duration-300`

### 10.2.7 아이콘
- **Lucide Icons** (기본)
- 이모지 보조 사용 (🛡️, 💬, 🌱, 🎉)
- 크기: 16px (인라인), 20~24px (독립)

### 10.2.8 컴포넌트 원칙
- **모바일 퍼스트**: 모든 컴포넌트 모바일 우선 설계 후 데스크톱 확장
- **접근성**: 키보드 내비게이션 + 스크린리더 지원
- **상태 표현**: hover, focus, active, disabled 모두 정의
- **일관성**: 동일 역할 요소는 동일 스타일

## 10.3 폴더 구조 제안

```
/
├── app/                     # Next.js App Router
│   ├── (public)/            # 공개 페이지
│   │   ├── page.tsx         # 홈
│   │   ├── p/[slug]/        # 제품 상세
│   │   ├── feed/
│   │   ├── registry/
│   │   ├── about/
│   │   └── guide/
│   ├── (auth)/              # 인증 관련
│   │   ├── login/
│   │   └── verify/
│   ├── (app)/               # 로그인 필요
│   │   ├── submit/
│   │   ├── feedback/
│   │   └── me/
│   ├── api/                 # API 라우트
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                  # 기본 UI 요소 (shadcn 스타일)
│   ├── layout/              # 헤더, 푸터
│   ├── product/             # 제품 관련 컴포넌트
│   ├── feedback/            # 피드백 관련
│   └── certificate/         # 증명서 관련
├── lib/
│   ├── supabase/            # Supabase 클라이언트
│   ├── utils/               # 유틸 함수
│   ├── hash.ts              # 해시 생성
│   └── pdf.ts               # PDF 생성
├── types/                   # TypeScript 타입 정의
├── public/                  # 정적 파일
├── supabase/
│   ├── migrations/          # DB 마이그레이션
│   └── seed.sql             # 초기 데이터
├── PRD.md                   # 이 문서
└── CLAUDE.md                # Claude Code용 프로젝트 가이드
```

---

# 섹션 11. 비기능 요구사항

## 11.1 성능
- **Core Web Vitals** 섹션 9.7.1 준수
- 첫 화면 로드: 모바일 4G에서 3초 이내
- API 응답: 평균 200ms 이내

## 11.2 보안
- 전 페이지 HTTPS
- Supabase RLS로 DB 레벨 권한
- CSRF 방어 (Next.js 기본)
- XSS 방어 (React 기본 + 사용자 입력 이스케이프)
- SQL Injection 방어 (Supabase Query Builder 사용)
- 매직링크 토큰 24시간 만료
- 세션 쿠키: HttpOnly, Secure, SameSite=Lax

## 11.3 접근성
- WCAG 2.1 Level AA 목표
- 키보드 네비게이션 지원
- 스크린리더 호환 (semantic HTML + aria)
- 충분한 색 대비 (4.5:1 이상)
- 폰트 크기 확대 가능

## 11.4 국제화
- 한국어 우선
- 영문 지원은 Phase 3+ 검토

## 11.5 브라우저 지원
- 최신 2버전: Chrome, Safari, Firefox, Edge
- iOS Safari 14+
- 모바일 우선

## 11.6 데이터 보호
- 개인정보보호법 준수
- 정보통신망법 준수 (이메일 수신거부)
- 쿠키 사용 동의 (필요 시)
- 탈퇴 시 즉시 처리

## 11.7 확장성
- Phase 1 MAU 500 수준은 Supabase Free/Pro 티어로 충분
- Phase 2에서 트래픽 증가 시 Supabase Pro + Cloudflare Pro 업그레이드

## 11.8 가용성
- 목표: 99% uptime
- Cloudflare Pages + Supabase 인프라에 의존
- 장애 시 사용자에게 친화적 에러 페이지 노출

---

# 섹션 12. Phase 계획

## Phase 1 (MVP, 2~3주 개발)

### 범위
- 인증 시스템 (구글 + 매직링크)
- 제품 등록 (URL + 수동)
- 피드백 교환 시스템 (10문항)
- 등록권 시스템
- 증명서 자동 발급 + PDF
- 공개 레지스트리
- 성장 타임라인 + 버전 업데이트
- 마이페이지 (4개 하위)
- 홈, 제품 상세, 카테고리 피드
- About, Guide, Terms, Privacy
- SEO 기본 세팅 (메타, sitemap, JSON-LD, robots.txt)
- 분석 도구 3종

### 범위 밖 (Phase 2로 미룸)
- 주간 뉴스레터 자동 발송
- 신고 기능 (`reports` 테이블)
- aggregateRating 노출
- 머티리얼라이즈드 뷰
- 광고 배너
- 외부 블록체인 연동 (OpenTimestamps)

## Phase 2 (유저 50~100명 시점)

- 주간 뉴스레터 자동 큐레이션 + 발송
- `reports` 테이블 + 신고 UI
- 피드백 가이드 강화
- 카테고리 추가 가능성 검토
- OpenTimestamps 연동 검토
- aggregateRating 검토
- Google AdSense 배너 검토
- 성능 최적화 (머티리얼라이즈드 뷰)

## Phase 3+ (유저 500명 시점)

- 커뮤니티 기능 (제품 간 댓글·태그)
- VC/멘토 매칭 검토
- 지원사업 매칭 검토
- 프리미엄 기능 (실명 증명서 등) 검토
- 영문 지원 검토
- 모바일 앱 검토

---

# 섹션 13. 성공 지표

## 13.1 Phase 1 성공 기준 (3개월 목표)

| 지표 | 목표 |
|---|---|
| 가입 유저 | 100명 |
| 등록 제품 | 50개 |
| 작성된 피드백 | 100개 |
| MAU | 30~50명 |
| Google 인덱싱 페이지 | 50+ |
| SEO 주간 유입 | 30~100 |

## 13.2 Phase 2 성공 기준 (6개월 목표)

| 지표 | 목표 |
|---|---|
| 가입 유저 | 300명 |
| 등록 제품 | 150개 |
| 작성된 피드백 | 400개 |
| MAU | 100~200명 |
| Google 인덱싱 페이지 | 200+ |
| SEO 주간 유입 | 200~500 |
| 재방문율 | 30%+ |

## 13.3 장기 목표 (12개월)

| 지표 | 목표 |
|---|---|
| 가입 유저 | 1,000명 |
| MAU | 300~500명 |
| SEO 일일 유입 | 500~2,000 |

## 13.4 운영자 기준

- 운영 투입: 주 2~3시간 유지
- 재미: 운영 자체가 즐거워야 함
- 수익: 필요 없음 (서버비 정도 충당하면 성공)

**주의**: 위 숫자는 목표. 달성 못 해도 "실패 아님". MAU 30명에서 멈춰도 그 30명에게 가치 주면 성공.

---

# 섹션 14. 리스크 및 대응

## 14.1 핵심 리스크

### 14.1.1 지속 사용 동기 부족 (형이 확인한 핵심 약점)
- **리스크**: 제품 등록 이벤트 후 재방문 없음
- **대응**:
  - 피드백 받은 사람에게 버전 업데이트 알림
  - 주간 뉴스레터 (Phase 2)
  - 내가 피드백 준 제품의 성장 추적 UI
  - 타임라인 연재 구조

### 14.1.2 피드백 질 하락 (메아리 방 문제)
- **리스크**: 같은 창업자끼리 형식적 피드백만 주고받음
- **대응**:
  - 10문항 최소 글자수 강제
  - 8번 약점 문항 30자 이상 필수
  - `/guide` 페이지로 문화 관리
  - 운영자 주기적 피드백 품질 샘플링 (주 1회)
  - 어뷰징 플래그 모니터링

### 14.1.3 일회성 이벤트 한계
- **리스크**: "한 번 올리고 끝"
- **대응**:
  - 성장 타임라인 구조로 연재화
  - 버전 업데이트 알림
  - 뉴스레터를 통한 주기적 재유입

### 14.1.4 봇·조작 공격
- **리스크**: AI 생성 피드백, 가짜 계정
- **대응 (Phase 1)**:
  - 작성 시간 60초 미만 플래그
  - 이메일당 일일 피드백 제한 (10개)
  - 구글 OAuth 비중 높이기 (가짜 계정 어려움)
- **대응 (Phase 2)**:
  - 신고 기능 활성화
  - 운영자 수동 검수

### 14.1.5 개인정보 이슈
- **리스크**: 유저 개인정보 유출, 법적 분쟁
- **대응**:
  - 개인정보 최소 수집 원칙
  - 탈퇴 시 즉시 삭제
  - RLS로 DB 레벨 격리
  - 정기 백업 + 복구 테스트

### 14.1.6 증명서 법적 분쟁
- **리스크**: "법적 보호 받는 줄 알았는데 아니었다" 소송
- **대응**:
  - UI 전반에 "법적 효력 제한적" 명시
  - 이용약관·개인정보처리방침에 명시
  - "법적 보호" 같은 과장 표현 금지

### 14.1.7 운영자 번아웃
- **리스크**: 혼자 운영하다 지쳐서 방치
- **대응**:
  - 자동화 우선 (수동 큐레이션 피함)
  - 주 2~3시간 투입 목표 고정
  - 재미 요소 의식적으로 유지
  - 취미 프로젝트 정체성 유지 (수익·성장 압박 배제)

## 14.2 위기 시나리오 대응

### 시나리오 1: 1개월 동안 가입 0명
- 운영자가 디스퀴엇·X·아프니까사장이다에 직접 소개
- 지인 20명에게 수동 초대
- SEO 인덱싱 확인

### 시나리오 2: 피드백 질 급격히 하락
- 운영자가 직접 고품질 피드백 시범 10개 작성
- 가이드 페이지 재강조 배너
- 플래그된 피드백 수동 검토

### 시나리오 3: 서비스 중단 위험
- 최소 6개월 운영 유지 목표
- 중단 시 공지 30일 전
- 유저에게 본인 데이터 다운로드 기회 제공

---

# 섹션 15. 부록

## 15.1 카테고리 정의

| 값 | 표시명 | 설명 |
|---|---|---|
| `saas` | SaaS | 웹 기반 구독/서비스 제품 |
| `mobile_app` | 모바일앱 | iOS/Android 앱 |
| `webtoon_creative` | 웹툰·창작 | 웹툰, 소설, 음악, 아트 등 창작물 |
| `quirky` | 엉뚱함 | 쓸모는 모르겠지만 웃기거나 신기한 것 |
| `etc` | 기타 | 위 분류에 안 맞는 것 |

## 15.2 창업 경력 태그 정의

| 값 | 표시명 | 설명 |
|---|---|---|
| `pre_founder` | 예비 창업자 | 아직 개발·창업 전, 기획 단계 |
| `under_1y` | 1년 미만 | 창업 또는 제품 출시 1년 미만 |
| `1_to_3y` | 1~3년차 | 1~3년차 메이커 |
| `3_to_5y` | 3~5년차 | 3~5년차 메이커 |
| `over_5y` | 5년차 이상 | 5년 이상 경력 |

## 15.3 주요 카피 문구 모음

### 15.3.1 홈 히어로
- **제목**: "만드느라 혼자였잖아요."
- **본문**: "이제 여기서 같이 봐줄게요. 사용자는 없어도, 피드백을 받을 동료는 있어요. 아이디어가 걱정되면, 증명서로 기록을 남기세요."

### 15.3.2 규칙 안내
- **제목**: "여긴 주고받는 곳이에요."
- **본문**: "다른 메이커의 제품에 피드백 1개를 남기면, 내 제품 1개를 올릴 수 있는 등록권이 생겨요."

### 15.3.3 증명서 안내 (검정 박스)
- **제목**: "등록 즉시 타임스탬프 증명서가 발급돼요"
- **본문**: "등록 시각과 내용이 공개 기록·해시로 남아, '내가 먼저 올렸다'는 객관적 증거가 됩니다. 법적 효력은 제한적이지만 만약의 상황에 도움이 돼요."

### 15.3.4 피드백 톤 가이드
- "솔직하게 말해주세요. 다만 창업자가 밤새 만든 걸 봐주는 거예요. 문제는 정확히, 표현은 부드럽게."

### 15.3.5 완료 축하
- **등록 완료**: "🎉 올라갔어요!"
- **피드백 완료**: "🌱 좋은 피드백 고마워요"

### 15.3.6 에러 페이지
- **404**: "이 페이지는 사라졌거나 비공개로 전환됐어요. 다른 제품들을 구경해보세요."
- **500**: "잠시 문제가 생겼어요. 이런 일이 자주 있진 않아요. 잠시 후 다시 시도해주세요."
- **410**: "이 제품은 창업자가 완전 삭제했어요. 그의 결정을 존중해주세요."

## 15.4 법적 고지 문구

### 15.4.1 증명서 관련
- UI: "등록 시각과 내용이 공개 기록·해시로 남아, '내가 먼저 올렸다'는 객관적 증거가 됩니다. 법적 효력은 제한적이지만 만약의 상황에 도움이 돼요."
- PDF: "본 증명서는 특정 시각에 해당 내용이 마이프로덕트에 등록되었음을 기록한 문서입니다. 법적 효력은 제한적이며 참고 자료로만 활용해주세요."

### 15.4.2 피드백 저작권
- "피드백 작성자에게 저작권이 있으며, 플랫폼은 서비스 제공 목적으로 표시·저장할 권리만 가집니다."

### 15.4.3 제품 정보 저작권
- "등록된 제품 정보(제품명, 설명, 스크린샷 등)의 저작권은 등록자에게 있으며, 플랫폼은 서비스 제공 목적으로 표시·저장할 권리만 가집니다."

### 15.4.4 뉴스레터 수신
- "이 뉴스레터는 마이프로덕트 회원가입 시 자동으로 구독됩니다. 수신을 원하지 않으시면 [여기]를 클릭하거나 마이페이지 > 설정에서 언제든 해지할 수 있습니다."

## 15.5 용어집

| 용어 | 정의 |
|---|---|
| **등록권** | 제품 1개를 플랫폼에 올릴 수 있는 권리. 피드백 1개 작성으로 획득 |
| **레지스트리** | 플랫폼에 등록된 모든 제품의 공개 기록 저장소 |
| **증명서** | 제품 등록 시각·내용을 기록한 PDF 문서 |
| **성장 타임라인** | 한 제품의 버전 업데이트 이력을 시각화한 구조 |
| **메이커** | 이 플랫폼 유저의 총칭. 1인 개발자, 바이브코더, 창업자 포함 |
| **바이브코딩** | AI 도구를 활용해 비개발자가 코드를 작성·배포하는 방식 |
| **매직링크** | 비밀번호 없이 이메일 링크 클릭으로 로그인하는 방식 |
| **RLS** | Row Level Security. DB 레벨에서 행 단위 접근 권한을 제어하는 Supabase 기능 |

## 15.6 개발 시 참조 링크

- **Next.js App Router 문서**: https://nextjs.org/docs/app
- **Supabase 문서**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com
- **Pretendard 폰트**: https://github.com/orioncactus/pretendard
- **Lucide Icons**: https://lucide.dev
- **Google Search Console**: https://search.google.com/search-console
- **Microsoft Clarity**: https://clarity.microsoft.com
- **Schema.org**: https://schema.org

## 15.7 운영자 체크리스트 (런칭 전)

### 개발 완료 확인
- [ ] 24개 페이지 모두 구현
- [ ] RLS 정책 모든 테이블 적용
- [ ] 구글 OAuth 연동 테스트
- [ ] 매직링크 발송 테스트
- [ ] 증명서 PDF 생성 테스트
- [ ] URL 기반 AI 자동 채움 테스트
- [ ] 모바일 반응형 전 페이지 확인
- [ ] 404/410/500 에러 페이지 확인

### SEO 세팅
- [ ] sitemap.xml 생성 확인
- [ ] robots.txt 확인
- [ ] Google Search Console 등록
- [ ] Google Analytics 4 연동
- [ ] Microsoft Clarity 연동
- [ ] 모든 페이지 메타 태그 확인
- [ ] OG 이미지 생성 확인
- [ ] JSON-LD 스키마 검증 (schema.org 도구)
- [ ] PageSpeed Insights 90+ 확인

### 법적 준비
- [ ] 이용약관 검토
- [ ] 개인정보처리방침 검토
- [ ] 증명서 법적 고지 전 페이지 노출 확인
- [ ] 뉴스레터 수신거부 링크 확인

### 초기 콘텐츠
- [ ] 운영자 본인 제품 5~10개 시드 등록
- [ ] 운영자가 직접 고품질 피드백 10개 시범 작성
- [ ] 가이드 페이지 완성

### 운영 준비
- [ ] 에러 모니터링 설정 (Sentry 등 선택)
- [ ] 백업 스케줄 확인
- [ ] 이메일 발송 할당량 확인
- [ ] 장애 대응 연락처 정리

---

## 문서 끝

> **이 PRD는 "마이프로덕트" 서비스의 Phase 1 설계 전체를 담고 있습니다.**
> **모든 구현 결정은 이 문서를 기준으로 하며, 변경 시 문서를 먼저 업데이트한 후 구현합니다.**
> **Claude Code에게 전달할 때는 `opusplan` 모드를 권장하며, 섹션 번호로 참조하면 정확한 컨텍스트를 전달할 수 있습니다.**
>
> 마지막 업데이트: 2026-04-23
> 버전: 1.0
