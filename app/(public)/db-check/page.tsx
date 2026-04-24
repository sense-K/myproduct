import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CheckResult =
  | { status: "env_missing"; missing: string[] }
  | { status: "schema_missing"; message: string }
  | { status: "error"; message: string }
  | { status: "ok"; counts: { products: number; users: number; certificates: number } };

async function runCheck(): Promise<CheckResult> {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (missing.length > 0) return { status: "env_missing", missing };

  try {
    const supabase = await createClient();
    const [p, u, c] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("certificates").select("*", { count: "exact", head: true }),
    ]);

    const firstError = p.error ?? u.error ?? c.error;
    if (firstError) {
      const isSchemaMissing = /relation .* does not exist|schema cache|Could not find the table/i.test(
        firstError.message,
      );
      return isSchemaMissing
        ? { status: "schema_missing", message: firstError.message }
        : { status: "error", message: firstError.message };
    }

    // head:true 쿼리에서 테이블 누락 시 Supabase가 {error:null, count:null, status:204}를 돌려주는 경우가 있어
    // count가 null이면 "스키마 없음"으로 처리한다.
    if (p.count === null || u.count === null || c.count === null) {
      return {
        status: "schema_missing",
        message:
          "테이블이 아직 없어요. supabase/migrations/ 의 3개 SQL 파일을 SQL Editor에서 순서대로 실행하세요.",
      };
    }

    return {
      status: "ok",
      counts: {
        products: p.count,
        users: u.count,
        certificates: c.count,
      },
    };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : String(err) };
  }
}

export default async function DbCheckPage() {
  const result = await runCheck();

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 p-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Supabase 연결 확인</h1>
        <p className="mt-1 text-sm text-ink-60">
          서버 컴포넌트에서 anon 키로 3개 테이블을 head 카운트 조회합니다.
        </p>
      </header>

      {result.status === "env_missing" && (
        <section className="rounded-[14px] bg-accent-soft p-5 text-accent">
          <p className="font-semibold">환경 변수 누락</p>
          <p className="mt-1 text-sm">
            <code className="font-mono">.env.local</code>에 다음 변수를 채우고 dev 서버를 재시작하세요:
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {result.missing.map((k) => (
              <li key={k}>
                <code className="font-mono">{k}</code>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.status === "schema_missing" && (
        <section className="rounded-[14px] bg-accent-soft p-5 text-accent">
          <p className="font-semibold">연결은 되지만 테이블이 없습니다</p>
          <p className="mt-2 text-sm">
            Supabase 대시보드 SQL Editor에서{" "}
            <code className="font-mono">supabase/migrations/</code>의 3개 파일을 순서대로 실행하세요.
          </p>
          <p className="mt-2 font-mono text-xs break-all opacity-80">{result.message}</p>
        </section>
      )}

      {result.status === "error" && (
        <section className="rounded-[14px] bg-accent-soft p-5 text-accent">
          <p className="font-semibold">연결 오류</p>
          <p className="mt-2 font-mono text-xs break-all">{result.message}</p>
          <p className="mt-2 text-sm">
            URL과 ANON 키가 정확한지, 프로젝트가 활성 상태인지 확인하세요.
          </p>
        </section>
      )}

      {result.status === "ok" && (
        <section className="rounded-[14px] bg-sage-soft p-5 text-sage">
          <p className="font-semibold">✅ 연결 정상</p>
          <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-ink-60">products</dt>
              <dd className="text-lg font-bold text-ink">{result.counts.products}</dd>
            </div>
            <div>
              <dt className="text-ink-60">users</dt>
              <dd className="text-lg font-bold text-ink">{result.counts.users}</dd>
            </div>
            <div>
              <dt className="text-ink-60">certificates</dt>
              <dd className="text-lg font-bold text-ink">{result.counts.certificates}</dd>
            </div>
          </dl>
        </section>
      )}

      <footer className="text-xs text-ink-40">
        이 페이지는 개발 중 연결 확인용입니다. 배포 전 제거하세요.
      </footer>
    </main>
  );
}
