import { getAuthState } from "@/lib/auth/server";
import { DEFAULT_NICKNAME } from "@/lib/constants/user";
import { WelcomeModal } from "./WelcomeModal";

export async function WelcomeModalGate() {
  const { authUser, needsOnboarding } = await getAuthState();
  if (!needsOnboarding || !authUser) return null;

  const googleName =
    (authUser.user_metadata?.full_name as string | undefined) ??
    (authUser.user_metadata?.name as string | undefined);

  const suggested = (googleName ?? DEFAULT_NICKNAME).slice(0, 20);

  return <WelcomeModal suggestedNickname={suggested} />;
}
