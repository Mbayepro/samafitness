import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BandeauMarquee from "@/components/BandeauMarquee";
import Services from "@/components/Services";
import Salles from "@/components/Salles";
import Tarifs from "@/components/Tarifs";
import Coachs from "@/components/Coachs";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getSiteContent } from "@/lib/content-store";
import { SiteProvider } from "@/lib/site-context";

export const instant = false;

export default async function Home() {
  const content = await getSiteContent();

  return (
    <SiteProvider content={content}>
      <main className="min-h-screen bg-[#080808] text-white selection:bg-lime-400 selection:text-black">
        {/* Navigation Header */}
        <Navbar />

        {/* Hero Section with location bar */}
        <Hero />

        {/* Continuous athletic ticker band */}
        <BandeauMarquee />

        {/* Nos Services (Musculation, Cardio, Cross, Combat, Cours collectifs) */}
        <Services />

        {/* Notre salle à Ndioum + carte */}
        <Salles />

        {/* Nos Formules (tarifs sur demande) */}
        <Tarifs />

        {/* Coach fondateur */}
        <Coachs />

        {/* FAQ Accordion */}
        <FAQ />

        {/* Formulaire d'inscription & Contact */}
        <Suspense fallback={<div className="min-h-96 bg-[#080808]" />}>
          <Contact />
        </Suspense>

        {/* Footer */}
        <Footer />

        {/* Floating WhatsApp Quick Contact Button */}
        <WhatsAppButton />
      </main>
    </SiteProvider>
  );
}