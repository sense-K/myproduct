import { CAREER_TAGS } from "@/lib/constants/user";

type Props = {
  quote: string;
  nickname: string;
  careerTag: string;
};

export function MakerQuote({ quote, nickname, careerTag }: Props) {
  const careerLabel = CAREER_TAGS.find((t) => t.value === careerTag)?.label ?? careerTag;

  return (
    <section className="border-b border-ink-10 bg-paper py-6">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-ink-40">
        <span className="mr-1 text-accent">✎</span> 만든 사람 한마디
      </p>

      <blockquote className="relative rounded-[14px] border-l-[3px] border-accent bg-cream px-4 py-4 text-[13px] leading-[1.75]">
        <span
          className="absolute -top-3 left-2 font-serif text-4xl leading-none text-accent"
          aria-hidden="true"
        >
          &ldquo;
        </span>
        {quote}
      </blockquote>

      <p className="mt-3 text-[11px] font-medium text-ink-60">
        {nickname} · 창업 {careerLabel} 메이커
      </p>
      </div>
    </section>
  );
}
