import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Modern Automobiles — Bike service, pickup & drop-off",
    template: "%s | Modern Automobiles",
  },
  description:
    "Book a bike service with pickup or drop-off, approve your quote before repairs begin, and track your repair status live.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
