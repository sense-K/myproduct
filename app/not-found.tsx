import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl">🌿</p>
      <h1 className="mt-4 text-2xl font-extrabold">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-60">
        이 페이지는 사라졌거나 비공개로 전환됐어요.
        <br />
        다른 제품들을 구경해보세요.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-[8px] border border-ink-10 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          홈으로
        </Link>
        <Link
          href="/feed"
          className="rounded-[8px] bg-ink px-4 py-2 text-sm font-semibold text-cream transition-opacity hover:opacity-90"
        >
          제품 구경하기
        </Link>
      </div>
    </div>
  );
}
