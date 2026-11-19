/* eslint-disable @next/next/no-html-link-for-pages -- error screens use plain <a>: a full page load is the most reliable way out of an error state (and global-error has no router). */
import { BTN_PRIMARY, BTN_SECONDARY, ErrorScreen, Sweep } from "@/components/error-screen";

export const metadata = { title: "Page not found" };

/** 404 — shown for any unknown URL (and whenever notFound() is called). */
export default function NotFound() {
  return (
    <ErrorScreen
      code="404"
      label="Page not found."
      title="This page is missing"
      body="The link may have changed. You can find your way back below."
      image="/images/errors/404.webp"
      focus="68% 55%"
    >
      <a href="/" className={BTN_PRIMARY}>
        <Sweep />
        <span className="relative">Back to home</span>
      </a>
      <a href="/#services" className={BTN_SECONDARY}>
        Explore services
      </a>
    </ErrorScreen>
  );
}
