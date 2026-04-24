"use client";

import { useState } from "react";
import { QUESTIONS } from "@/lib/feedback/questions";
import { CAREER_TAGS } from "@/lib/constants/user";

type Answer = {
  question_number: number;
  answer_text: string | null;
  answer_choice: string | null;
  answer_scale: number | null;
};

type Feedback = {
  id: string;
  submitted_at: string;
  reviewer_career_tag_snapshot: string;
  feedback_answers: Answer[];
};

type Group = {
  productId: string;
  productName: string;
  productSlug: string;
  feedbacks: Feedback[];
};

function getCareerLabel(tag: string) {
  return CAREER_TAGS.find(t => t.value === tag)?.label ?? tag;
}

function AnswerCard({ answer }: { answer: Answer }) {
  const q = QUESTIONS.find(q => q.num === answer.question_number);
  if (!q) return null;

  const hasContent = answer.answer_text || answer.answer_choice || answer.answer_scale;
  if (!hasContent) return null;

  return (
    <div className="rounded-[8px] border border-ink-10 bg-cream p-3">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-ink-40">
        Q{answer.question_number}. {q.section}
      </p>
      <p className="mb-2 text-[12px] text-ink-60 whitespace-pre-line">{q.question}</p>
      {answer.answer_choice && (
        <span className="inline-block rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-bold text-cream">
          {answer.answer_choice}
        </span>
      )}
      {answer.answer_scale && (
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <div key={n} className={`h-2 w-6 rounded-full ${n <= answer.answer_scale! ? "bg-accent" : "bg-ink-10"}`} />
            ))}
          </div>
          <span className="text-[12px] font-bold text-accent">{answer.answer_scale}/5</span>
        </div>
      )}
      {answer.answer_text && (
        <p className="mt-1 text-[13px] leading-relaxed text-ink">{answer.answer_text}</p>
      )}
    </div>
  );
}

export function FeedbackAccordion({ group }: { group: Group }) {
  const [open, setOpen] = useState(false);
  const [openFb, setOpenFb] = useState<string | null>(null);

  return (
    <div className="rounded-[14px] bg-paper shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-3 px-4 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold">{group.productName}</p>
          <p className="text-[12px] text-ink-60">피드백 {group.feedbacks.length}개</p>
        </div>
        <span className={`text-ink-40 transition-transform ${open ? "rotate-90" : ""}`}>→</span>
      </button>

      {open && (
        <div className="border-t border-ink-10 px-4 pb-4 pt-3 flex flex-col gap-3">
          {group.feedbacks.map((fb) => (
            <div key={fb.id} className="rounded-[8px] border border-ink-10 overflow-hidden">
              <button
                onClick={() => setOpenFb(openFb === fb.id ? null : fb.id)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left"
              >
                <div className="flex-1">
                  <p className="text-[12px] font-semibold">
                    창업 {getCareerLabel(fb.reviewer_career_tag_snapshot)} 메이커
                  </p>
                  <p className="text-[11px] text-ink-40">
                    {new Date(fb.submitted_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <span className={`text-[11px] font-semibold text-ink-60 ${openFb === fb.id ? "" : ""}`}>
                  {openFb === fb.id ? "접기 ▲" : "펼치기 ▼"}
                </span>
              </button>

              {openFb === fb.id && (
                <div className="border-t border-ink-10 bg-cream/50 px-3 pb-3 pt-2 flex flex-col gap-2">
                  {fb.feedback_answers
                    .sort((a, b) => a.question_number - b.question_number)
                    .map((ans) => (
                      <AnswerCard key={ans.question_number} answer={ans} />
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
