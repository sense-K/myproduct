"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl">🛠️</p>
      <h1 className="mt-4 text-2xl font-extrabold">잠시 문제가 생겼어요</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-60">
        이런 일이 자주 있진 않아요.
        <br />
        잠시 후 다시 시도해주세요.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-[8px] bg-ink px-4 py-2 text-sm font-semibold text-cream transition-opacity hover:opacity-90"
      >
        다시 시도
      </button>
    </div>
  );
}
