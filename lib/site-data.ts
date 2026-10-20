/**
 * =============================================================================
 * SAMBAFITNESS - FICHIER CENTRAL DE DONNÉES (SITE DATA)
 * =============================================================================
 *
 * Salle de sport à Ndioum (Sénégal).
 * Modifiez les valeurs ci-dessous pour mettre à jour l'ensemble du site.
 * Aucun texte ni information de contact ne doit être codé en dur dans les composants.
 *
 * RÈGLE : uniquement des informations réelles. Pas de chiffres ni de
 * statistiques inventés (membres, années, nombre de cours, etc.).
 */

export interface NavLink {
  href: string;
  label: string;
}

export interface StatItem {
  value: string;
  label: string;
  description?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  category?: string;
  tag?: string;
  description: string;
  iconName: string;
  highlights: string[];
  imageUrl?: string;
}

export interface SalleItem {
  id: string;
  name: string;
  badge?: string | null;
  address: string;
  postalCode?: string;
  city: string;
  phone: string;
  email: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  amenities: string[];
  googleMapsUrl: string;
  mapEmbedUrl: string;
  imageUrl: string;
}

export interface PlanItem {
  id: string;
  name: string;
  statusBadge?: string;
  statusNote: string;
  commitment: string;
  description: string;
  features: string[];
  ctaText: string;
  highlighted: boolean;
  popularBadge?: string;
}

export interface CoachItem {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  bio: string;
  experience: string;
  imageUrl: string;
  instagram?: string;
}

export interface CourseScheduleItem {
  id: string;
  day: string;
  time: string;
  title: string;
  category: "Intense" | "Renforcement" | "Bien-être" | "Cardio";
  duration: string;
  coach: string;
  salle: string;
  intensity: "Moyenne" | "Élevée" | "Tous niveaux";
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

const PHONE_DISPLAY = "+221 78 957 35 53";
const PHONE_TEL = "+221789573553";
const EMAIL = "smarieme589@gmail.com";
const ADDRESS = "Route nationale, en face de la mairie";
const CITY = "Ndioum";
const HOURS_TEXT = "Horaires : appelez-nous";

export const SITE_DATA = {
  // ── 1. IDENTITÉ DU CLUB ──────────────────────────────────────
  brand: {
    name: "SAMBAFITNESS",
    shortName: "SAMBA",
    accentName: "FITNESS",
    slogan: "Dépassez vos limites.",
    subSlogan:
      "Ta salle de sport à Ndioum, sur la route nationale en face de la mairie.",
    description:
      "Musculation, cardio, cross-training, boxe et cours collectifs à Ndioum. Une salle pour se remettre en forme, perdre du poids ou prendre du muscle, dans une bonne ambiance.",
  },

  // ── 2. COORDONNÉES & CONTACT ────────────────────────────────
  contact: {
    phone: PHONE_DISPLAY,
    phoneTel: PHONE_TEL,
    whatsapp: {
      number: "221789573553", // format international sans '+'
      displayNumber: PHONE_DISPLAY,
      defaultMessage:
        "Bonjour SAMBAFITNESS, je souhaite avoir des informations sur les inscriptions à la salle de Ndioum.",
    },
    email: EMAIL,
    address: ADDRESS,
    city: CITY,
    country: "Sénégal",
    mainCity: `${CITY}, Sénégal`,
    hoursText: HOURS_TEXT,
  },

  // ── 3. LIENS DE NAVIGATION ──────────────────────────────────
  navLinks: [
    { href: "#accueil", label: "Accueil" },
    { href: "#services", label: "Nos services" },
    { href: "#salles", label: "Nous trouver" },
    { href: "#tarifs", label: "Formules" },
    { href: "#rejoindre", label: "Nous rejoindre" },
  ] as NavLink[],

  // ── 4. RÉSEAUX SOCIAUX ──────────────────────────────────────
  // Ajoutez ici vos vrais comptes (Facebook, Instagram, TikTok...).
  // Laisser vide tant qu'ils n'existent pas : rien ne s'affichera.
  socials: [] as SocialLink[],

  // ── 5. CHIFFRES CLÉS (STATS) ─────────────────────────────────
  // Volontairement vide : n'ajoutez que des chiffres réels et vérifiables.
  stats: [] as StatItem[],

  // ── 6. SERVICES & ESPACES ───────────────────────────────────
  services: [
    {
      id: "musculation",
      title: "Musculation",
      category: "Force",
      tag: "Poids libres & machines",
      description:
        "Haltères, barres, bancs et machines guidées pour travailler tout le corps, que tu sois débutant ou confirmé.",
      iconName: "dumbbell",
      imageUrl:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80",
      highlights: ["Poids libres", "Machines guidées", "Prise de masse & tonification"],
    },
    {
      id: "cardio",
      title: "Cardio",
      category: "Cardio",
      tag: "Endurance",
      description:
        "Tapis de course, vélos et autres machines cardio pour améliorer ton souffle et brûler des calories.",
      iconName: "activity",
      imageUrl:
        "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=900&q=80",
      highlights: ["Tapis de course", "Vélos", "Perte de poids"],
    },
    {
      id: "cross-training",
      title: "Cross-training",
      category: "Hybride",
      tag: "Intensif",
      description:
        "Des circuits complets qui mélangent force, cardio et explosivité pour se dépasser à chaque séance.",
      iconName: "target",
      imageUrl:
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
      highlights: ["Circuits training", "Force & cardio", "Tous niveaux"],
    },
    {
      id: "boxe",
      title: "Boxe & sports de combat",
      category: "Combat",
      tag: "Défoulement",
      description:
        "Sacs de frappe et entraînements de boxe pour développer ton cardio, ta coordination et ta confiance.",
      iconName: "flame",
      imageUrl:
        "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=900&q=80",
      highlights: ["Sacs de frappe", "Technique & cardio", "Confiance en soi"],
    },
    {
      id: "cours-collectifs",
      title: "Cours collectifs & aérobic",
      category: "Collectif",
      tag: "En groupe",
      description:
        "Des séances en groupe, en musique, pour bouger ensemble et rester motivé. Renseigne-toi sur les créneaux par téléphone ou WhatsApp.",
      iconName: "users",
      imageUrl:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
      highlights: ["Aérobic", "Ambiance motivante", "Créneaux sur demande"],
    },
  ] as ServiceItem[],

  // ── 7. NOTRE SALLE ──────────────────────────────────────────
  salles: [
    {
      id: "samba-ndioum",
      name: "SAMBAFITNESS Ndioum",
      badge: "Notre salle",
      address: ADDRESS,
      city: CITY,
      phone: PHONE_DISPLAY,
      email: EMAIL,
      hours: {
        weekdays: HOURS_TEXT,
        saturday: HOURS_TEXT,
        sunday: HOURS_TEXT,
      },
      amenities: [
        "Musculation",
        "Cardio",
        "Cross-training",
        "Boxe & combat",
        "Cours collectifs / aérobic",
      ],
      googleMapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Mairie+de+Ndioum+S%C3%A9n%C3%A9gal",
      mapEmbedUrl:
        "https://maps.google.com/maps?q=Mairie%20de%20Ndioum%2C%20S%C3%A9n%C3%A9gal&z=16&output=embed",
      imageUrl:
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1000&q=80",
    },
  ] as SalleItem[],

  // ── 8. FORMULES ─────────────────────────────────────────────
  // Les tarifs sont communiqués directement par téléphone / WhatsApp.
  plans: [
    {
      id: "muscu-cardio",
      name: "Muscu & Cardio",
      statusBadge: "Essentiel",
      statusNote: "Tarif sur demande",
      commitment: "Accès à la salle de musculation et à l'espace cardio",
      description: "L'essentiel pour t'entraîner librement à ton rythme.",
      features: [
        "Accès à l'espace musculation (poids libres & machines)",
        "Accès à l'espace cardio (tapis, vélos…)",
        "Conseils de l'équipe sur place",
        "Accompagnement pour bien débuter",
      ],
      ctaText: "Demander le tarif",
      highlighted: false,
    },
    {
      id: "complete",
      name: "Formule Complète",
      statusBadge: "Tout inclus",
      statusNote: "Tarif sur demande",
      popularBadge: "Recommandée",
      commitment: "Tous les espaces et les cours collectifs",
      description: "Profite de toute la salle : musculation, cardio, cross-training, boxe et cours.",
      features: [
        "Accès musculation & cardio",
        "Cross-training",
        "Boxe & sports de combat",
        "Cours collectifs / aérobic",
        "Accès complet à tous les services",
      ],
      ctaText: "Demander le tarif",
      highlighted: true,
    },
    {
      id: "coaching",
      name: "Coaching personnalisé",
      statusBadge: "Suivi individuel",
      statusNote: "Tarif sur demande",
      commitment: "Accompagnement avec un coach selon ton objectif",
      description: "Pour être guidé pas à pas : perte de poids, prise de masse ou remise en forme.",
      features: [
        "Programme adapté à ton objectif",
        "Correction des mouvements",
        "Suivi de ta progression",
        "Accès à tous les espaces de la salle",
      ],
      ctaText: "Demander le tarif",
      highlighted: false,
    },
  ] as PlanItem[],

  // ── 9. COACH ────────────────────────────────────────────────
  // TODO : remplacer imageUrl par une vraie photo de Samba Diop.
  coaches: [
    {
      id: "samba-diop",
      name: "Samba Diop",
      role: "Fondateur & Coach",
      specialties: ["Musculation", "Cross-training", "Remise en forme"],
      experience: "Fondateur",
      bio: "Fondateur de SAMBAFITNESS à Ndioum, Samba t'accueille à la salle et t'accompagne vers ton objectif : perte de poids, prise de masse ou simplement retrouver la forme.",
      imageUrl:
        "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=800&q=80",
    },
  ] as CoachItem[],

  // ── 10. PLANNING DES COURS ──────────────────────────────────
  // Vide pour l'instant (section masquée). À remplir avec les vrais créneaux.
  schedules: [] as CourseScheduleItem[],

  // ── 11. FOIRE AUX QUESTIONS (FAQ) ───────────────────────────
  faq: [
    {
      question: "Où se trouve la salle ?",
      answer:
        "SAMBAFITNESS est à Ndioum, sur la route nationale, juste en face de la mairie. Tu peux aussi ouvrir l'itinéraire Google Maps depuis la section « Nous trouver ».",
    },
    {
      question: "Quels sont les horaires d'ouverture ?",
      answer: `Appelle-nous ou écris-nous sur WhatsApp au ${PHONE_DISPLAY} pour connaître les horaires du moment.`,
    },
    {
      question: "Comment s'inscrire ou rejoindre le club ?",
      answer:
        "Remplis le formulaire en bas de page, appelle-nous ou envoie-nous un message WhatsApp. Nous te recontactons rapidement pour finaliser ton inscription.",
    },
    {
      question: "Combien coûte l'abonnement ?",
      answer: `Les tarifs sont communiqués directement par téléphone ou WhatsApp au ${PHONE_DISPLAY}, ou sur place à la salle.`,
    },
    {
      question: "Je suis débutant, est-ce pour moi ?",
      answer:
        "Oui ! La salle est ouverte à tous les niveaux. L'équipe te montre comment utiliser les machines et t'aide à démarrer en toute sécurité.",
    },
    {
      question: "Que dois-je apporter pour ma première séance ?",
      answer:
        "Une tenue de sport confortable, des baskets propres, une serviette et une bouteille d'eau.",
    },
  ] as FAQItem[],
};
