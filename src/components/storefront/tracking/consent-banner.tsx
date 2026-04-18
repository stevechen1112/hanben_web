"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  TRACKING_CONSENT_COOKIE,
  TRACKING_CONSENT_EVENT,
  getResolvedTrackingConsent,
  serializeTrackingConsent,
  type TrackingConsentState,
} from "@/lib/tracking-consent";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

function persistConsent(consent: TrackingConsentState) {
  const serialized = encodeURIComponent(serializeTrackingConsent(consent));
  document.cookie = `${TRACKING_CONSENT_COOKIE}=${serialized}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;

  try {
    localStorage.setItem(TRACKING_CONSENT_COOKIE, serializeTrackingConsent(consent));
  } catch {
    // Ignore storage failures in private browsing modes.
  }

  window.dispatchEvent(new CustomEvent(TRACKING_CONSENT_EVENT, { detail: consent }));
}

function ConsentToggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-[#8f1212] bg-[#8f1212] text-white"
          : "border-[#d9c9b2] bg-white text-stone-600 hover:border-[#8f1212] hover:text-[#8f1212]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export function ConsentBanner({
  initialConsent,
  privacyPath,
}: {
  initialConsent: TrackingConsentState | null;
  privacyPath: string;
}) {
  const resolvedInitial = useMemo(
    () => getResolvedTrackingConsent(initialConsent),
    [initialConsent],
  );
  const [consent, setConsent] = useState<TrackingConsentState>(resolvedInitial);
  const [isOpen, setIsOpen] = useState(initialConsent == null);

  function applyConsent(nextConsent: TrackingConsentState) {
    setConsent(nextConsent);
    setIsOpen(false);
    persistConsent(nextConsent);
  }

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-[28rem] rounded-[28px] border border-[#e4d8c7] bg-[rgba(255,252,247,0.96)] p-5 shadow-[0_24px_80px_rgba(39,27,19,0.22)] backdrop-blur xl:left-6 xl:right-auto xl:mx-0">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#8f1212]">Cookie Preferences</p>
          <h2 className="mt-2 text-[1.2rem] font-semibold text-[#2b211b]">保留必要 Cookie，其餘由您決定</h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            我們使用分析與廣告 Cookie 來衡量成效、串接 Meta / Google 追蹤，並優化站內購物流程。您可以隨時再調整。
          </p>

          <div className="mt-4 space-y-3 rounded-[22px] border border-[#eadfce] bg-white/90 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#2b211b]">網站分析</p>
                <p className="mt-1 text-xs leading-6 text-stone-500">GA4 / GTM 量測站內瀏覽、加車與結帳流程。</p>
              </div>
              <ConsentToggle
                active={consent.analytics}
                label={consent.analytics ? "已接受" : "已關閉"}
                onClick={() => setConsent((current) => ({ ...current, analytics: !current.analytics }))}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#2b211b]">廣告衡量</p>
                <p className="mt-1 text-xs leading-6 text-stone-500">Meta Pixel / CAPI 與 Google Ads 轉換衡量。</p>
              </div>
              <ConsentToggle
                active={consent.ads}
                label={consent.ads ? "已接受" : "已關閉"}
                onClick={() => setConsent((current) => ({ ...current, ads: !current.ads }))}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyConsent({ analytics: false, ads: false })}
              className="rounded-full border border-[#d9c9b2] px-4 py-2 text-sm font-medium text-stone-600 transition hover:border-[#8f1212] hover:text-[#8f1212]"
            >
              僅必要 Cookie
            </button>
            <button
              type="button"
              onClick={() => applyConsent(consent)}
              className="rounded-full border border-[#8f1212] bg-[#8f1212] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#761010]"
            >
              儲存偏好
            </button>
            <button
              type="button"
              onClick={() => applyConsent({ analytics: true, ads: true })}
              className="rounded-full border border-[#d6b47b] bg-[#f3e4c7] px-4 py-2 text-sm font-medium text-[#5b3814] transition hover:bg-[#ecd8b1]"
            >
              全部接受
            </button>
          </div>

          <p className="mt-4 text-xs leading-6 text-stone-500">
            詳細說明請見 <Link href={privacyPath} className="font-medium text-[#8f1212] underline underline-offset-4">隱私權政策</Link>。
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[70] rounded-full border border-[#d9c9b2] bg-white/95 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-stone-600 shadow-[0_10px_30px_rgba(39,27,19,0.12)] backdrop-blur transition hover:border-[#8f1212] hover:text-[#8f1212]"
      >
        Cookie 設定
      </button>
    </>
  );
}