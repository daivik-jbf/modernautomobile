import type { Metadata } from "next";
import { ErrorScreen } from "@/components/error-screen";
import { MaintenanceControls } from "@/components/maintenance-controls";

export const metadata: Metadata = {
  title: "We’ll be back shortly",
  robots: { index: false, follow: false },
};

/**
 * 503 — maintenance. Shown to everyone while MAINTENANCE_MODE=1 (see src/proxy.ts),
 * and can be previewed any time at /maintenance?preview.
 */
export default function MaintenancePage() {
  return (
    <ErrorScreen
      code="503"
      label="Service unavailable."
      title="We’ll be back shortly"
      body="The website is temporarily unavailable for maintenance. Please check again later."
      image="/images/errors/503.webp"
      focus="58% 50%"
      live
    >
      <MaintenanceControls />
    </ErrorScreen>
  );
}
