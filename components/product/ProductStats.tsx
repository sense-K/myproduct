type Props = {
  viewCount: number;
  feedbackCount: number;
  clickCount: number;
  isOwner: boolean;
};

export function ProductStats({ viewCount, feedbackCount, clickCount, isOwner }: Props) {
  return (
    <section className="border-b border-t border-ink-10 bg-cream" aria-label="제품 통계">
      <div className="mx-auto flex max-w-3xl items-stretch text-center">
      <div className="flex flex-1 flex-col items-center py-4">
        <span className="text-[18px] font-extrabold tracking-tight">{viewCount.toLocaleString()}</span>
        <span className="mt-1 text-[10px] font-medium text-ink-60">조회수</span>
      </div>

      <div className="w-px bg-ink-10" />

      <div className="flex flex-1 flex-col items-center py-4">
        <span className="text-[18px] font-extrabold tracking-tight text-accent">
          {feedbackCount}
        </span>
        <span className="mt-1 text-[10px] font-medium text-ink-60">피드백</span>
      </div>

      {isOwner && (
        <>
          <div className="w-px bg-ink-10" />
          <div className="flex flex-1 flex-col items-center py-4">
            <span className="text-[18px] font-extrabold tracking-tight">{clickCount}</span>
            <span className="mt-1 text-[10px] font-medium text-ink-60">원본 이동</span>
          </div>
        </>
      )}
      </div>
    </section>
  );
}
