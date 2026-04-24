"use client";

import { useState, useTransition } from "react";
import { CAREER_TAGS, CATEGORIES } from "@/lib/constants/user";
import type { CareerTag, Category } from "@/lib/constants/user";
import { updateProfile, updateNotificationSettings, deleteAccount } from "@/lib/me/actions";

type Props = {
  initialNickname: string;
  initialCareerTag: string;
  initialCategories: string[];
  initialEmail: string;
  notifWeekly: boolean;
  notifVersion: boolean;
  notifDraft: boolean;
};

export function SettingsForm({
  initialNickname, initialCareerTag, initialCategories, initialEmail,
  notifWeekly, notifVersion, notifDraft,
}: Props) {
  const [profileMsg, setProfileMsg] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [notifMsg, setNotifMsg] = useState<{ ok?: boolean } | null>(null);
  const [deleteModal, setDeleteModal] = useState<"none" | "choose" | "confirm">("none");
  const [deleteOpt, setDeleteOpt] = useState<"private" | "delete_all">("private");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(fd);
      setProfileMsg(result as any);
    });
  }

  function handleNotifSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateNotificationSettings(fd);
      setNotifMsg(result as any);
    });
  }

  function handleDeleteAccount() {
    if (deleteConfirm !== "탈퇴") return;
    startTransition(async () => {
      await deleteAccount(deleteOpt);
    });
  }

  return (
    <div className="flex flex-col gap-5">

      {/* 프로필 설정 */}
      <form onSubmit={handleProfileSubmit} className="rounded-[14px] bg-paper p-5 shadow-sm">
        <h2 className="mb-4 text-[15px] font-extrabold">프로필</h2>

        <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">닉네임</label>
        <input
          name="nickname"
          defaultValue={initialNickname}
          maxLength={20}
          className="mb-4 h-10 w-full rounded-[8px] border border-ink-10 bg-cream px-3 text-[13px] outline-none focus:border-ink"
        />

        <label className="mb-2 block text-[12px] font-semibold text-ink-60">창업 경력</label>
        <div className="mb-4 flex flex-col gap-2">
          {CAREER_TAGS.map((t) => (
            <label key={t.value} className="flex items-center gap-2 text-[13px]">
              <input type="radio" name="career_tag" value={t.value} defaultChecked={t.value === initialCareerTag} className="accent-ink" />
              <span className="font-semibold">{t.label}</span>
              <span className="text-ink-60">— {t.description}</span>
            </label>
          ))}
        </div>

        <label className="mb-2 block text-[12px] font-semibold text-ink-60">관심 카테고리</label>
        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <label key={c.value} className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-semibold has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-cream ${initialCategories.includes(c.value) ? "border-ink bg-ink text-cream" : "border-ink-10 text-ink-60"}`}>
              <input type="checkbox" name="interested_categories" value={c.value} defaultChecked={initialCategories.includes(c.value)} className="sr-only" />
              {c.label}
            </label>
          ))}
        </div>

        {profileMsg?.error && <p className="mb-2 text-[12px] text-accent">{profileMsg.error}</p>}
        {profileMsg?.ok && <p className="mb-2 text-[12px] text-sage">저장됐어요 ✓</p>}

        <button type="submit" disabled={isPending} className="flex h-10 w-full items-center justify-center rounded-[8px] bg-ink text-[13px] font-bold text-cream disabled:opacity-50">
          {isPending ? "저장 중..." : "저장하기"}
        </button>
      </form>

      {/* 알림 설정 */}
      <form onSubmit={handleNotifSubmit} className="rounded-[14px] bg-paper p-5 shadow-sm">
        <h2 className="mb-4 text-[15px] font-extrabold">알림 설정</h2>

        {[
          { name: "weekly_newsletter", label: "주간 뉴스레터", defaultChecked: notifWeekly },
          { name: "version_update_alerts", label: "제품 업데이트 알림", defaultChecked: notifVersion },
          { name: "draft_reminder", label: "피드백 리마인드 (비활성화 불가)", defaultChecked: notifDraft, disabled: true },
        ].map((item) => (
          <label key={item.name} className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink">{item.label}</span>
            <input
              type="checkbox"
              name={item.name}
              defaultChecked={item.defaultChecked}
              disabled={item.disabled}
              className="h-4 w-4 accent-ink"
            />
          </label>
        ))}

        {notifMsg?.ok && <p className="mb-2 text-[12px] text-sage">저장됐어요 ✓</p>}
        <button type="submit" disabled={isPending} className="flex h-10 w-full items-center justify-center rounded-[8px] bg-ink text-[13px] font-bold text-cream disabled:opacity-50">
          저장하기
        </button>
      </form>

      {/* 계정 탈퇴 */}
      <div className="rounded-[14px] bg-paper p-5 shadow-sm">
        <h2 className="mb-2 text-[15px] font-extrabold">계정</h2>
        <p className="mb-4 text-[12px] text-ink-60">이메일: {initialEmail}</p>
        <button
          onClick={() => setDeleteModal("choose")}
          className="text-[13px] font-semibold text-accent underline hover:opacity-80"
        >
          회원 탈퇴
        </button>
      </div>

      {/* 탈퇴 모달 */}
      {deleteModal !== "none" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center" onClick={() => { setDeleteModal("none"); setDeleteConfirm(""); }}>
          <div className="w-full max-w-sm rounded-t-[28px] bg-paper p-6 shadow-xl sm:rounded-[28px]" onClick={(e) => e.stopPropagation()}>

            {deleteModal === "choose" && (
              <>
                <h2 className="mb-3 text-[16px] font-extrabold">탈퇴 전에 내 제품을 어떻게 할까요?</h2>
                <div className="mb-4 flex flex-col gap-2">
                  {[
                    { value: "private" as const, label: "비공개로 전환", desc: "레지스트리 기록은 유지됩니다" },
                    { value: "delete_all" as const, label: "모두 완전 삭제", desc: "레지스트리에서도 사라져요. 증명서 PDF는 본인 보관" },
                  ].map((opt) => (
                    <label key={opt.value} className={`flex cursor-pointer items-start gap-3 rounded-[8px] border p-3 ${deleteOpt === opt.value ? "border-ink" : "border-ink-10"}`}>
                      <input type="radio" checked={deleteOpt === opt.value} onChange={() => setDeleteOpt(opt.value)} className="mt-0.5 accent-ink" />
                      <div>
                        <p className="text-[13px] font-bold">{opt.label}</p>
                        <p className="text-[11px] text-ink-60">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="mb-4 text-[12px] text-ink-60">
                  피드백 내용은 창업자 기록 보호를 위해 익명화되어 유지됩니다.
                </p>
                <div className="flex gap-2.5">
                  <button onClick={() => setDeleteModal("none")} className="flex-1 rounded-[8px] border border-ink-10 py-2.5 text-[13px] font-semibold">취소</button>
                  <button onClick={() => setDeleteModal("confirm")} className="flex-1 rounded-[8px] bg-accent py-2.5 text-[13px] font-bold text-cream">다음</button>
                </div>
              </>
            )}

            {deleteModal === "confirm" && (
              <>
                <h2 className="mb-2 text-[16px] font-extrabold text-accent">정말 탈퇴할까요?</h2>
                <p className="mb-3 text-[13px] text-ink-60">
                  아래에 <strong className="text-ink">"탈퇴"</strong>를 입력해주세요. 이 작업은 되돌릴 수 없어요.
                </p>
                <input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder='"탈퇴" 입력'
                  className="mb-3 h-10 w-full rounded-[8px] border border-ink-10 px-3 text-[13px] outline-none focus:border-accent"
                  autoFocus
                />
                <div className="flex gap-2.5">
                  <button onClick={() => { setDeleteModal("none"); setDeleteConfirm(""); }} className="flex-1 rounded-[8px] border border-ink-10 py-2.5 text-[13px] font-semibold">취소</button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== "탈퇴" || isPending}
                    className="flex-1 rounded-[8px] bg-accent py-2.5 text-[13px] font-bold text-cream disabled:opacity-40"
                  >
                    {isPending ? "처리 중..." : "탈퇴 확인"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
