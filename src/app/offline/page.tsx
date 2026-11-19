import type { Metadata } from "next";
import { ErrorScreen } from "@/components/error-screen";
import { OfflineControls } from "@/components/offline-controls";

export const metadata: Metadata = {
  title: "You’re offline",
  robots: { index: false, follow: false },
};

/** Shown by the service worker (public/sw.js) when a page can't be loaded without a connection. */
export default function OfflinePage() {
  return (
    <ErrorScreen
      code="OFFLINE"
      label=""
      title="You’re offline"
      body="Check your internet connection, then try loading this page again."
      image="/images/errors/offline.webp"
      focus="58% 50%"
    >
      <OfflineControls />
    </ErrorScreen>
  );
}
