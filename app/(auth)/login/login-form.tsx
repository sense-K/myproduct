"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_link: "링크가 만료되었거나 이미 사용됐어요. 다시 받아주세요.",
  oauth_failed: "구글 로그인에 실패했어요. 다시 시도해주세요.",
};

type Props = {
  next?: string;
  error?: string;
};

export function LoginForm({ next, error }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(
    error ? (ERROR_MESSAGES[error] ?? "로그인 중 문제가 발생했어요.") : null,
  );

  async function handleGoogle() {
    setErrorMsg(null);
    const supabase = createClient();
    const redirectTo = new URL("/verify", window.location.origin);
    if (next) redirectTo.searchParams.set("next", next);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo.toString() },
    });
    if (error || !data?.url) {
      setErrorMsg("구글 로그인 시작에 실패했어요.");
      return;
    }
    window.location.href = data.url;
  }

  async function handleMagicLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setErrorMsg(null);

    const supabase = createClient();
    const redirectTo = new URL("/verify", window.location.origin);
    if (next) redirectTo.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo.toString() },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message || "메일 발송에 실패했어요.");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="w-full max-w-md rounded-[28px] bg-paper p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-soft text-2xl">
            📬
          </div>
          <h1 className="mt-4 text-xl font-extrabold">메일을 확인하세요</h1>
          <p className="mt-2 text-sm text-ink-60">
            <strong className="font-semibold text-ink">{email}</strong> 으로
            로그인 링크를 보냈어요.
            <br />
            24시간 안에 링크를 클릭하면 로그인됩니다.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setEmail("");
            }}
            className="mt-6 text-sm text-ink-60 underline hover:text-ink"
          >
            다른 이메일로 다시 보내기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-[28px] bg-paper p-8 shadow-sm">
      <h1 className="text-2xl font-extrabold tracking-tight">환영합니다</h1>
      <p className="mt-1 text-sm text-ink-60">
        혼자 만든 제품, 이제 같이 봐드릴게요.
      </p>

      {errorMsg && (
        <div
          role="alert"
          className="mt-5 rounded-[14px] bg-accent-soft p-3 text-sm text-accent"
        >
          {errorMsg}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[8px] border border-ink-10 bg-paper text-sm font-semibold text-ink transition-colors hover:bg-cream"
      >
        <GoogleLogo />
        구글로 계속하기
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-ink-40">
        <span className="h-px flex-1 bg-ink-10" />
        또는
        <span className="h-px flex-1 bg-ink-10" />
      </div>

      <form onSubmit={handleMagicLink} className="space-y-3">
        <label className="block">
          <span className="sr-only">이메일</span>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-[8px] border border-ink-10 bg-paper px-4 text-sm outline-none placeholder:text-ink-40 focus:border-ink"
          />
        </label>
        <button
          type="submit"
          disabled={status === "sending"}
          className="flex h-12 w-full items-center justify-center rounded-[8px] bg-ink text-sm font-semibold text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "sending" ? "보내는 중..." : "로그인 링크 받기"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-40">
        비밀번호는 없어요. 클릭 한 번이면 시작돼요.
      </p>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.96H.94A9 9 0 0 0 0 9c0 1.45.35 2.82.94 4.04l3.01-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.96L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
