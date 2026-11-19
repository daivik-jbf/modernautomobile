"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- error screens use plain <a>: a full page load is the most reliable way out of an error state (and global-error has no router). */

import { useEffect } from "react";
import { BTN_PRIMARY, BTN_SECONDARY, ErrorScreen, Sweep } from "@/components/error-screen";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * Last line of defence: an error in the root layout itself. This file REPLACES the root layout,
 * so it must render its own <html>/<body> and load fonts + global styles itself.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <title>Something went wrong | Modern Automobiles</title>
        <ErrorScreen
          code="500"
          label="Server error."
          title="Something went wrong"
          body="We couldn’t load this page. Please try again."
          image="/images/errors/500.webp"
          focus="72% 50%"
        >
          <button type="button" onClick={() => retry()} className={BTN_PRIMARY}>
            <Sweep />
            <span className="relative">Try again</span>
          </button>
          <a href="/" className={BTN_SECONDARY}>
            Back to home
          </a>
        </ErrorScreen>
      </body>
    </html>
  );
}
