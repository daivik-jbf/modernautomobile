"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- error screens use plain <a>: a full page load is the most reliable way out of an error state (and global-error has no router). */

import { useEffect } from "react";
import { BTN_PRIMARY, BTN_SECONDARY, ErrorScreen, Sweep } from "@/components/error-screen";

/** 500 — an unexpected error inside a page. `retry()` re-fetches and re-renders the page. */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error); // TODO: send to error monitoring (e.g. Sentry)
  }, [error]);

  const digest =
    error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;

  return (
    <ErrorScreen
      code="500"
      label="Server error."
      title="Something went wrong"
      body="We couldn’t load this page. Please try again."
      image="/images/errors/500.webp"
      focus="72% 50%"
      footer={
        digest ? (
          <>
            Quote this reference if you contact us: <span className="font-medium text-cream">{digest}</span>
          </>
        ) : undefined
      }
    >
      <button type="button" onClick={() => retry()} className={BTN_PRIMARY}>
        <Sweep />
        <span className="relative">Try again</span>
      </button>
      <a href="/" className={BTN_SECONDARY}>
        Back to home
      </a>
    </ErrorScreen>
  );
}
