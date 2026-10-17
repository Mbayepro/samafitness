import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SAMBAFITNESS | Salle de sport premium, coaching & cours collectifs à Paris",
  description:
    "Rejoignez SAMBAFITNESS : 3 clubs d'exception à Paris, équipements dernière génération, coachs certifiés, cours collectifs et programmes personnalisés. Réservez votre essai gratuit !",
  keywords: [
    "salle de sport paris",
    "fitness paris",
    "coaching sportif",
    "cours collectifs",
    "musculation",
    "cardio",
    "sambafitness",
  ],
  openGraph: {
    title: "SAMBAFITNESS | Dépassez vos limites dans nos salles de sport à Paris",
    description:
      "3 clubs d'exception à Paris, équipements haut de gamme, coachs certifiés et ambiance stimulante. Réservez votre séance découverte offerte.",
    url: "https://sambafitness.fr",
    siteName: "SAMBAFITNESS",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "SAMBAFITNESS - Salle de sport à Paris",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAMBAFITNESS | Salle de sport & Coaching à Paris",
    description:
      "3 clubs modernes à Paris, cours collectifs, coaching personnalisé et essai gratuit.",
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&h=630&q=80",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
