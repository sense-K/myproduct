"use server";

import { getResend, FROM_ADDRESS } from "./client";
import {
  versionUpdateTemplate,
  feedbackReminderTemplate,
  certIssuedTemplate,
} from "./templates";
import { createAdminClient } from "@/lib/supabase/admin";

type Result = { ok: true } | { ok: false; error: string };

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<Result> {
  const resend = getResend();
  if (!resend) {
    // 개발 환경: 콘솔에만 출력
    console.log("[Email dev skip]", { to, subject });
    return { ok: true };
  }

  const { error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── 버전 업데이트 알림 (PRD 6.3.4-A) ───────────────────────────────────────

export async function notifyVersionUpdate({
  productId,
  productName,
  productSlug,
  versionLabel,
  changeNote,
}: {
  productId: string;
  productName: string;
  productSlug: string;
  versionLabel: string;
  changeNote: string;
}) {
  const admin = createAdminClient();

  // 이 제품에 피드백을 남긴 유저 목록 (중복 제거, 이메일 알림 ON인 유저만)
  const { data: reviewers } = await admin
    .from("feedbacks")
    .select("reviewer_id")
    .eq("product_id", productId);

  if (!reviewers?.length) return;

  const reviewerIds = [...new Set(reviewers.map((r) => r.reviewer_id))];

  const { data: users } = await admin
    .from("users")
    .select("id, email, nickname")
    .in("id", reviewerIds)
    .is("deleted_at", null);

  if (!users?.length) return;

  // 알림 설정 확인
  const { data: subscriptions } = await admin
    .from("newsletter_subscriptions")
    .select("user_id, version_update_alerts_enabled")
    .in("user_id", reviewerIds);

  const subscriptionMap = new Map(
    (subscriptions ?? []).map((s) => [s.user_id, s.version_update_alerts_enabled]),
  );

  // 발송 (rate limit 고려해서 순차 발송)
  for (const user of users) {
    const enabled = subscriptionMap.get(user.id) ?? true; // 기본 ON
    if (!enabled || !user.email) continue;

    const { subject, html } = versionUpdateTemplate({
      recipientNickname: user.nickname,
      productName,
      productSlug,
      versionLabel,
      changeNote,
    });

    await sendEmail({ to: user.email, subject, html });

    // notifications 테이블에 기록
    await admin.from("notifications").insert({
      recipient_user_id: user.id,
      notification_type: "product_version_update",
      subject,
      related_product_id: productId,
      status: "sent",
      sent_at: new Date().toISOString(),
    });
  }
}

// ─── 피드백 임시저장 리마인드 (PRD 6.3.4-C) ──────────────────────────────────

export async function sendFeedbackReminder({
  userId,
  productName,
  productSlug,
}: {
  userId: string;
  productName: string;
  productSlug: string;
}): Promise<Result> {
  const admin = createAdminClient();

  const { data: user } = await admin
    .from("users")
    .select("email, nickname")
    .eq("id", userId)
    .maybeSingle();

  if (!user?.email) return { ok: false, error: "유저 없음" };

  const { subject, html } = feedbackReminderTemplate({
    recipientNickname: user.nickname,
    productName,
    productSlug,
  });

  const result = await sendEmail({ to: user.email, subject, html });

  if (result.ok) {
    await admin.from("notifications").insert({
      recipient_user_id: userId,
      notification_type: "feedback_draft_reminder",
      subject,
      status: "sent",
      sent_at: new Date().toISOString(),
    });
  }

  return result;
}

// ─── 증명서 발급 완료 알림 (PRD 6.3.4-C) ─────────────────────────────────────

export async function sendCertIssuedNotification({
  userId,
  productName,
  productSlug,
  registrationNumber,
}: {
  userId: string;
  productName: string;
  productSlug: string;
  registrationNumber: string;
}): Promise<Result> {
  const admin = createAdminClient();

  const { data: user } = await admin
    .from("users")
    .select("email, nickname")
    .eq("id", userId)
    .maybeSingle();

  if (!user?.email) return { ok: false, error: "유저 없음" };

  const { subject, html } = certIssuedTemplate({
    recipientNickname: user.nickname,
    productName,
    productSlug,
    registrationNumber,
  });

  const result = await sendEmail({ to: user.email, subject, html });

  if (result.ok) {
    await admin.from("notifications").insert({
      recipient_user_id: userId,
      notification_type: "certificate_issued",
      subject,
      related_product_id: productSlug,
      status: "sent",
      sent_at: new Date().toISOString(),
    });
  }

  return result;
}
