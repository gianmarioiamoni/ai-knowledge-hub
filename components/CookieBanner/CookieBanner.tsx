"use client";

import { JSX, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type CookieBannerProps = {
  message: string;
  acceptLabel: string;
  declineLabel: string;
};

const CONSENT_KEY = "cookie_consent";
const CONSENT_MAX_AGE_DAYS = 180;

function CookieBanner({ message, acceptLabel, declineLabel }: CookieBannerProps): JSX.Element | null {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = window.localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const setConsent = (value: "accepted" | "declined") => {
    const expires = Date.now() + CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(CONSENT_KEY, value);
    document.cookie = `${CONSENT_KEY}=${value}; path=/; max-age=${CONSENT_MAX_AGE_DAYS * 24 * 60 * 60}; expires=${new Date(
      expires
    ).toUTCString()}`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto flex max-w-4xl items-center justify-between gap-4 rounded-2xl border border-border/80 bg-background/95 p-4 shadow-lg backdrop-blur">
      <p className="text-sm text-foreground">{message}</p>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => setConsent("declined")} variant="outline">
          {declineLabel}
        </Button>
        <Button size="sm" onClick={() => setConsent("accepted")}>
          {acceptLabel}
        </Button>
      </div>
    </div>
  );
}

export { CookieBanner };

