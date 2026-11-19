"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { BTN_PRIMARY, Sweep } from "./error-screen";

/** full page load of the home page (absolute URL: a fresh start is the point) */
const goHome = () => window.location.assign(new URL("/", window.location.href).href);

function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/**
 * Offline screen automation: when the connection returns, the page reloads by itself
 * (back to the page the visitor was on; from /offline itself it goes to the home page).
 */
export function OfflineControls() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => false,
  );
  const [reloading, setReloading] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    let timer = 0;
    const onOnline = () => {
      setReloading(true);
      timer = window.setTimeout(() => {
        if (window.location.pathname === "/offline") goHome();
        else window.location.reload();
      }, 1000);
    };
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.clearTimeout(timer);
    };
  }, []);

  const retry = () => {
    if (navigator.onLine) {
      if (window.location.pathname === "/offline") goHome();
      else window.location.reload();
    } else {
      setTried(true);
    }
  };

  return (
    <>
      <button type="button" onClick={retry} className={BTN_PRIMARY}>
        <Sweep />
        <span className="relative">Try again</span>
      </button>
      <p role="status" aria-live="polite" className="basis-full text-[15px] text-cream/70">
        {reloading ? (
          <span className="font-medium text-cream">Back online — reloading…</span>
        ) : tried || !online ? (
          "Still offline. This page reloads by itself as soon as you're connected."
        ) : (
          "Your connection looks fine now — tap Try again."
        )}
      </p>
    </>
  );
}
