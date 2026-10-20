import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "SAMBAFITNESS | Salle de sport à Ndioum, Sénégal",
  description:
    "SAMBAFITNESS, salle de sport à Ndioum sur la route nationale, en face de la mairie : musculation, cardio, cross-training, boxe et cours collectifs. Rejoignez-nous ! Tél : +221 78 957 35 53.",
  keywords: [
    "salle de sport ndioum",
    "fitness ndioum",
    "musculation ndioum",
    "salle de sport sénégal",
    "salle de sport podor",
    "boxe ndioum",
    "sambafitness",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SambaFitness",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "SAMBAFITNESS | Salle de sport à Ndioum",
    description:
      "Musculation, cardio, cross-training, boxe et cours collectifs à Ndioum, en face de la mairie. Rejoignez-nous !",
    siteName: "SAMBAFITNESS",
    locale: "fr_SN",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "SAMBAFITNESS - Salle de sport à Ndioum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAMBAFITNESS | Salle de sport à Ndioum",
    description:
      "Musculation, cardio, cross-training, boxe et cours collectifs à Ndioum. Rejoignez-nous !",
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
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
