"use client";

import { useState, useTransition } from "react";
import { toggleProductPrivacy, deleteProduct } from "@/lib/me/actions";

type Props = {
  productId: string;
  productName: string;
  isPrivate: boolean;
};

export function ProductActions({ productId, productName, isPrivate }: Props) {
  const [modal, setModal] = useState<"none" | "privacy" | "delete1" | "delete2">("none");
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handlePrivacyToggle() {
    startTransition(async () => {
      const result = await toggleProductPrivacy(productId, !isPrivate);
      if (!result.ok) setError(result.error ?? "오류");
      setModal("none");
    });
  }

  function handleDelete() {
    if (confirmText !== "삭제") return;
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (!result.ok) setError(result.error ?? "오류");
      setModal("none");
      setConfirmText("");
    });
  }

  return (
    <>
      <button
        onClick={() => setModal("privacy")}
        className="flex-1 rounded-[8px] border border-ink-10 py-1.5 text-center text-[12px] font-semibold text-ink-60 hover:border-ink hover:text-ink"
      >
        {isPrivate ? "공개로" : "비공개로"}
      </button>
      <button
        onClick={() => setModal("delete1")}
        className="rounded-[8px] border border-accent/30 py-1.5 px-3 text-[12px] font-semibold text-accent hover:border-accent"
      >
        삭제
      </button>

      {/* 오버레이 모달 */}
      {modal !== "none" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center" onClick={() => { setModal("none"); setConfirmText(""); }}>
          <div className="w-full max-w-sm rounded-t-[28px] bg-paper p-6 shadow-xl sm:rounded-[28px]" onClick={(e) => e.stopPropagation()}>

            {/* 비공개 전환 모달 */}
            {modal === "privacy" && (
              <>
                <h2 className="text-[16px] font-extrabold">{isPrivate ? "공개로 전환할까요?" : "비공개로 전환할까요?"}</h2>
                <p className="mt-2 text-[13px] text-ink-60">
                  {isPrivate
                    ? "제품 페이지가 다시 공개돼요. 레지스트리 기록은 그대로 유지돼요."
                    : "제품 페이지가 다른 사람에게 보이지 않아요. 공개 레지스트리 기록은 유지돼요."}
                </p>
                {error && <p className="mt-2 text-[12px] text-accent">{error}</p>}
                <div className="mt-5 flex gap-2.5">
                  <button onClick={() => setModal("none")} className="flex-1 rounded-[8px] border border-ink-10 py-2.5 text-[13px] font-semibold">취소</button>
                  <button onClick={handlePrivacyToggle} disabled={isPending} className="flex-1 rounded-[8px] bg-ink py-2.5 text-[13px] font-bold text-cream disabled:opacity-50">
                    {isPending ? "처리 중..." : "확인"}
                  </button>
                </div>
              </>
            )}

            {/* 삭제 1차 경고 */}
            {modal === "delete1" && (
              <>
                <h2 className="text-[16px] font-extrabold text-accent">완전 삭제 — 정말요?</h2>
                <p className="mt-2 text-[13px] text-ink-60">
                  완전 삭제 시 <strong className="text-ink">공개 레지스트리에서도 기록이 지워져요.</strong>{" "}
                  이미 받으신 증명서 PDF는 그대로 보관되며, 본인만 열람 가능한 등록 기록은 남아있어요.
                  <br /><br />
                  되돌릴 수 없는 작업입니다.
                </p>
                <div className="mt-5 flex gap-2.5">
                  <button onClick={() => setModal("none")} className="flex-1 rounded-[8px] border border-ink-10 py-2.5 text-[13px] font-semibold">취소</button>
                  <button onClick={() => setModal("delete2")} className="flex-1 rounded-[8px] bg-accent py-2.5 text-[13px] font-bold text-cream">
                    그래도 삭제
                  </button>
                </div>
              </>
            )}

            {/* 삭제 2차 확인 */}
            {modal === "delete2" && (
              <>
                <h2 className="text-[16px] font-extrabold text-accent">최종 확인</h2>
                <p className="mt-2 text-[13px] text-ink-60">
                  아래에 <strong className="text-ink">"삭제"</strong>를 입력하면 <strong className="text-ink">{productName}</strong>이(가) 완전히 삭제돼요.
                </p>
                <input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder='여기에 "삭제" 입력'
                  className="mt-3 h-10 w-full rounded-[8px] border border-ink-10 px-3 text-[13px] outline-none focus:border-accent"
                  autoFocus
                />
                {error && <p className="mt-1 text-[12px] text-accent">{error}</p>}
                <div className="mt-4 flex gap-2.5">
                  <button onClick={() => { setModal("none"); setConfirmText(""); }} className="flex-1 rounded-[8px] border border-ink-10 py-2.5 text-[13px] font-semibold">취소</button>
                  <button
                    onClick={handleDelete}
                    disabled={confirmText !== "삭제" || isPending}
                    className="flex-1 rounded-[8px] bg-accent py-2.5 text-[13px] font-bold text-cream disabled:opacity-40"
                  >
                    {isPending ? "삭제 중..." : "완전 삭제"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
