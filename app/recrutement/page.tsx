import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Phone, MapPin, Briefcase } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";
import { SiteProvider } from "@/lib/site-context";
import RecruitmentForm from "./RecruitmentForm";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Recrutement Samba Fitness Ndioum | Appel à candidatures officiel",
  description:
    "La salle de sport Samba Fitness à Ndioum recrute : Coach sportif, Gestionnaire de salle, Secrétaire / Accueil, et Femme de ménage. Période de candidature : du 1er au 20 novembre 2026.",
  openGraph: {
    title: "SAMBA FITNESS — Appel à candidatures officiel (1 au 20 nov. 2026)",
    description:
      "Recrutement de l'équipe Samba Fitness à Ndioum : Coach sportif, Gestionnaire, Secrétaire et Femme de ménage. Postulez en ligne dès maintenant.",
  },
};

export const instant = false;

export default async function RecrutementPage() {
  const content = await getSiteContent();

  return (
    <SiteProvider content={content}>
      <main className="min-h-screen bg-[#080808] text-white selection:bg-lime-400 selection:text-black">
        {/* Navigation / En-tête simplifié */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs font-bold text-white/70 transition hover:text-lime-400"
              >
                <ArrowLeft size={16} />
                <span>Retour au site</span>
              </Link>

              <span className="text-white/20">|</span>

              <Link href="/" className="flex items-center gap-1.5">
                <span className="font-sport text-2xl tracking-wider text-white">
                  SAMBA
                </span>
                <span className="font-sport text-2xl tracking-wider text-lime-400">
                  FITNESS
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`tel:${content.contact.phoneTel}`}
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white transition hover:border-lime-400 hover:text-lime-400 sm:flex"
              >
                <Phone size={13} className="text-lime-400" />
                <span>{content.contact.phone}</span>
              </a>

              <a
                href="#formulaire-candidature"
                className="rounded-full bg-lime-400 px-5 py-2 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-lime-400/20 transition hover:bg-lime-300"
              >
                Postuler
              </a>
            </div>
          </div>
        </header>

        {/* Hero Section de la page Recrutement */}
        <div className="relative overflow-hidden border-b border-white/10 px-6 py-20 lg:py-24">
          <div className="pointer-events-none absolute right-1/4 top-10 h-96 w-96 rounded-full bg-lime-400/5 blur-[160px]" />
          <div className="pointer-events-none absolute left-10 bottom-0 h-80 w-80 rounded-full bg-amber-400/5 blur-[140px]" />

          <div className="relative mx-auto max-w-7xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-lime-400">
              <Briefcase size={13} />
              <span>Samba Fitness • Ndioum, Sénégal</span>
            </div>

            <h1 className="font-sport mt-6 text-5xl uppercase tracking-wider text-white sm:text-7xl lg:text-8xl">
              APPEL À CANDIDATURES
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-white/70 sm:text-xl">
              Pour accompagner le développement de votre salle de sport à Ndioum,{" "}
              <strong className="text-white">SAMBA FITNESS</strong> recrute son équipe :{" "}
              <span className="text-lime-400 font-semibold">
                Coach sportif, Gestionnaire de salle, Secrétaire / Accueil et Femme de ménage
              </span>
              .
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/60">
              <span className="flex items-center gap-2">
                <MapPin size={15} className="text-lime-400" />
                <span>Route nationale, en face de la Mairie • Ndioum</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
                <span>Contrat & Missions locales</span>
              </span>
            </div>
          </div>
        </div>

        {/* Contenu principal : Fiches de poste + Formulaire interactif */}
        <div className="mx-auto max-w-7xl px-6 py-16">
          <RecruitmentForm />
        </div>

        {/* Pied de page */}
        <Footer />

        {/* Bouton WhatsApp flottant */}
        <WhatsAppButton />
      </main>
    </SiteProvider>
  );
}

