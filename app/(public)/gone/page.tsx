import { headers } from "next/headers";
import Link from "next/link";

// 410 Gone — 창업자가 완전 삭제한 제품에 사용.
// 제품 상세 페이지에서 hard-deleted 감지 시 redirect('/gone') 로 보낸다.
export default async function GonePage() {
  // 410 상태 코드를 응답에 명시
  const headersList = await headers();
  void headersList; // Next.js가 동적으로 처리하도록 headers 호출

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl">🌱</p>
      <h1 className="mt-4 text-2xl font-extrabold">이 제품은 떠났어요</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-60">
        창업자가 이 제품을 완전히 삭제했어요.
        <br />
        그의 결정을 존중해주세요.
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
          다른 제품 보기
        </Link>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: "삭제된 제품 | 마이프로덕트",
  };
}
