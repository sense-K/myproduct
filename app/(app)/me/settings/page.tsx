import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let profile: any = null;
  let notifSettings: any = null;

  try {
    const admin = createAdminClient();
    const [p, n] = await Promise.all([
      admin.from("users").select("nickname, career_tag, email, interested_categories").eq("id", user.id).maybeSingle(),
      admin.from("newsletter_subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    profile = p.data;
    notifSettings = n.data;
  } catch { /* DB 미연동 */ }

  return (
    <div>
      <h1 className="mb-5 text-[18px] font-extrabold">설정</h1>
      <SettingsForm
        initialNickname={profile?.nickname ?? "익명 메이커"}
        initialCareerTag={profile?.career_tag ?? "pre_founder"}
        initialCategories={profile?.interested_categories ?? []}
        initialEmail={profile?.email ?? user.email ?? ""}
        notifWeekly={notifSettings?.weekly_newsletter_enabled ?? true}
        notifVersion={notifSettings?.version_update_alerts_enabled ?? true}
        notifDraft={notifSettings?.draft_reminder_enabled ?? true}
      />
    </div>
  );
}
