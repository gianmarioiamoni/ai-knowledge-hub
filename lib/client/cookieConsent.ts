"use client";

const CONSENT_KEY = "cookie_consent";

const getCookieConsent = (): "accepted" | "declined" | null => {
  if (typeof window === "undefined") return null;
  const local = window.localStorage.getItem(CONSENT_KEY) as "accepted" | "declined" | null;
  if (local) return local;
  const match = document.cookie.match(new RegExp(`(^| )${CONSENT_KEY}=([^;]+)`));
  return (match?.[2] as "accepted" | "declined" | undefined) ?? null;
};

export { getCookieConsent, CONSENT_KEY };




