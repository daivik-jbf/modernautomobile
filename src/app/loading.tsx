import { LoadingScreen } from "@/components/loading-screen";

/** Shown while a page is loading (route transitions) — same screen as the first-visit splash. */
export default function Loading() {
  return (
    <div className="ld-route fixed inset-0 z-[90]">
      <LoadingScreen />
    </div>
  );
}
