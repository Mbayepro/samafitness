import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SAMBAFITNESS - Salle de Sport Ndioum",
    short_name: "SambaFitness",
    description:
      "Application officielle de la salle de sport SAMBAFITNESS à Ndioum (Sénégal) : musculation, cardio, cours collectifs et gestion des accès membres.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#080808",
    theme_color: "#080808",
    orientation: "portrait",
    lang: "fr",
    categories: ["fitness", "sports", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Espace Admin & Pointage",
        short_name: "Admin",
        description: "Tableau de bord, pointage QR code et suivi des paiements",
        url: "/admin",
        icons: [{ src: "/icon.svg", sizes: "any" }],
      },
      {
        name: "Demande d'essai gratuit",
        short_name: "Essai",
        description: "Formulaire de demande d'essai à Samba Fitness Ndioum",
        url: "/#contact",
        icons: [{ src: "/icon.svg", sizes: "any" }],
      },
      {
        name: "Nos Formules & Tarifs",
        short_name: "Tarifs",
        description: "Tarifs mensuels, trimestriels et annuels",
        url: "/#tarifs",
        icons: [{ src: "/icon.svg", sizes: "any" }],
      },
    ],
  };
}
