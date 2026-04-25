import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/submit/step1");

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        {children}
      </div>
    </div>
  );
}
