// PRD 6.1.4 — 10문항 (확정안)

export type QuestionType =
  | "choice"      // 객관식만
  | "choice_text" // 객관식 + 이유 텍스트 (선택)
  | "scale_text"  // 5단계 척도 + 이유 텍스트 (선택)
  | "text"        // 서술형 (필수, minLength 존재)
  | "text_opt";   // 서술형 선택 (optional)

export type Question = {
  num: number;
  section: string;
  type: QuestionType;
  question: string;
  options?: readonly string[];
  minLength?: number;      // answer_text 최소 글자수
  required: boolean;       // 다음 버튼 활성화를 위한 필수 여부
  placeholder: string;
  subPlaceholder?: string; // choice_text / scale_text 이유 필드 placeholder
  hint?: string;
};

export const QUESTIONS: readonly Question[] = [
  // ── A. 첫인상 ──────────────────────────────────────────────────────────────
  {
    num: 1,
    section: "A. 첫인상",
    type: "choice",
    question: "랜딩페이지·스크린샷을 3초 봤을 때\n이 제품이 뭘 하는지 이해됐나요?",
    options: ["예, 바로 이해됐어요", "애매해요", "아니오, 잘 모르겠어요"],
    required: true,
    placeholder: "",
  },
  {
    num: 2,
    section: "A. 첫인상",
    type: "text",
    question: "이 제품의 타겟 고객은\n누구일 것 같나요?",
    minLength: 10,
    required: true,
    placeholder: "예: 자영업 3년차 사장님들, 글쓰기를 즐기는 직장인들...",
    hint: "최소 10자 이상 (필수)",
  },
  {
    num: 3,
    section: "A. 첫인상",
    type: "text_opt",
    question: "제품명·소개문에서\n개선하고 싶은 부분이 있나요?",
    required: false,
    placeholder: "없으면 그냥 넘어가도 돼요 (선택)",
  },
  // ── B. 가치 제안 ─────────────────────────────────────────────────────────
  {
    num: 4,
    section: "B. 가치 제안",
    type: "scale_text",
    question: "이 제품이 해결하려는 문제가\n실제로 존재한다고 보시나요?",
    required: true,
    placeholder: "",
    subPlaceholder: "왜 그렇게 생각하시나요? (선택)",
    hint: "1 = 거의 없음 · 5 = 매우 실제적임",
  },
  {
    num: 5,
    section: "B. 가치 제안",
    type: "choice_text",
    question: "당신이 타겟이라면\n돈 내고 쓸 것 같나요?",
    options: ["예, 쓸 것 같아요", "아마도요", "아니오"],
    required: true,
    placeholder: "",
    subPlaceholder: "이유를 간단히 적어주세요 (선택)",
  },
  {
    num: 6,
    section: "B. 가치 제안",
    type: "text_opt",
    question: "비슷한 기존 서비스가 떠오르나요?\n있다면 뭐가 다른가요?",
    minLength: 10,
    required: false,
    placeholder: "없으면 '없음'이라고 적어도 돼요 (선택)",
    hint: "입력 시 10자 이상",
  },
  // ── C. 실행 품질 ─────────────────────────────────────────────────────────
  {
    num: 7,
    section: "C. 실행 품질",
    type: "scale_text",
    question: "UI/디자인의 첫인상은\n어떤가요?",
    required: true,
    placeholder: "",
    subPlaceholder: "한 줄 의견을 남겨주세요 (선택)",
    hint: "1 = 많이 아쉬움 · 5 = 매우 좋음",
  },
  {
    num: 8,
    section: "C. 실행 품질",
    type: "text",
    question: "이 제품의 가장 큰 약점은\n무엇이라고 보시나요?",
    minLength: 30,
    required: true,
    placeholder:
      "솔직하게 말해주세요. 다만 창업자가 밤새 만든 걸 봐주는 거예요.\n문제는 정확히, 표현은 부드럽게.",
    hint: "최소 30자 이상 (필수)",
  },
  // ── D. 격려와 방향 ────────────────────────────────────────────────────────
  {
    num: 9,
    section: "D. 격려와 방향",
    type: "text",
    question: "이 제품이 딱 하나만 개선한다면\n뭐가 좋을까요?",
    minLength: 10,
    required: true,
    placeholder: "구체적일수록 더 도움이 돼요",
    hint: "최소 10자 이상 (필수)",
  },
  {
    num: 10,
    section: "D. 격려와 방향",
    type: "text_opt",
    question: "창업자에게\n응원 한마디",
    required: false,
    placeholder: "응원 메시지를 남겨보세요 (선택)",
  },
] as const;

// ─── 유효성 헬퍼 ──────────────────────────────────────────────────────────────

export type AnswerData = {
  choice?: string;
  scale?: number;
  text?: string;
};

export function isAnswerValid(q: Question, ans: AnswerData | undefined): boolean {
  if (!q.required) {
    // 선택 문항이라도 입력된 경우 minLength 체크
    if (ans?.text && q.minLength && ans.text.length < q.minLength) return false;
    return true;
  }

  if (!ans) return false;

  switch (q.type) {
    case "choice":
      return !!ans.choice;
    case "choice_text":
      return !!ans.choice;
    case "scale_text":
      return !!ans.scale;
    case "text":
      return !!(ans.text && ans.text.trim().length >= (q.minLength ?? 1));
    case "text_opt":
      return true;
  }
}

export function getAnswerError(q: Question, ans: AnswerData | undefined): string | null {
  if (!ans) return null;

  if ((q.type === "text" || q.type === "text_opt") && ans.text) {
    if (q.minLength && ans.text.trim().length < q.minLength) {
      return `${q.minLength}자 이상 입력해주세요 (현재 ${ans.text.trim().length}자)`;
    }
  }
  return null;
}
