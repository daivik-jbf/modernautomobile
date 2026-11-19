import { AboutSection } from "@/components/about-section";
import { AppSection } from "@/components/app-section";
import { Hero } from "@/components/hero";
import { HowItWorksSection } from "@/components/how-it-works";
import { RevealFallback } from "@/components/reveal-fallback";
import { PartsSection } from "@/components/parts-section";
import { PlansSection } from "@/components/plans-section";
import { ServicesSection } from "@/components/services-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <RevealFallback />
      <main className="flex flex-1 flex-col">
        <Hero />
        <ServicesSection />
        <PlansSection />
        <HowItWorksSection />
        <PartsSection />
        <AboutSection />
        <AppSection />
      </main>
      <SiteFooter />
    </>
  );
}
