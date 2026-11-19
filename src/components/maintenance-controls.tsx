"use client";

import { useCallback, useEffect, useState } from "react";
import { BTN_PRIMARY, Sweep } from "./error-screen";

const INTERVAL = 20; // seconds between automatic checks

type Phase = "waiting" | "checking" | "still" | "back";

/**
 * 503 screen automation: re-checks /api/health every 20s (and on "Check again") and sends the
 * visitor back to the site the moment maintenance is over. Add `?preview` to the URL to look at
 * this page without any redirecting.
 */
export function MaintenanceControls() {
  const [phase, setPhase] = useState<Phase>("waiting");
  const [secs, setSecs] = useState(INTERVAL);

  const check = useCallback(async (manual: boolean) => {
    if (new URLSearchParams(window.location.search).has("preview")) {
      setSecs(INTERVAL);
      setPhase(manual ? "still" : "waiting");
      return;
    }
    setPhase("checking");
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean };
      if (data.ok) {
        setPhase("back");
        window.setTimeout(() => window.location.assign(new URL("/", window.location.href).href), 1200);
        return;
      }
    } catch {
      /* network hiccup — treat as still down */
    }
    setSecs(INTERVAL);
    setPhase(manual ? "still" : "waiting");
  }, []);

  // countdown → automatic check
  useEffect(() => {
    if (phase === "checking" || phase === "back") return;
    const t = window.setTimeout(() => {
      if (secs <= 1) void check(false);
      else setSecs((s) => s - 1);
    }, 1000);
    return () => window.clearTimeout(t);
  }, [secs, phase, check]);

  const busy = phase === "checking" || phase === "back";

  return (
    <>
      <button
        type="button"
        onClick={() => void check(true)}
        disabled={busy}
        className={`${BTN_PRIMARY} disabled:opacity-70`}
      >
        <Sweep />
        <span className="relative">{phase === "checking" ? "Checking…" : "Check again"}</span>
      </button>
      <p role="status" aria-live="polite" className="basis-full text-[15px] text-cream/70">
        {phase === "back" && (
          <span className="font-medium text-cream">We&apos;re back! Taking you to the site…</span>
        )}
        {phase === "checking" && "Checking now…"}
        {phase === "still" && `Still unavailable — we'll keep trying. Next check in ${secs}s.`}
        {phase === "waiting" && `Checking automatically — next check in ${secs}s.`}
      </p>
    </>
  );
}
