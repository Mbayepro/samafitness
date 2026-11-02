"use client";

import { useState, useActionState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Dumbbell,
  Briefcase,
  Users,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MessageCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import {
  submitApplicationAction,
  type ApplicationFormState,
} from "@/app/actions/recruitment-actions";
import {
  JOB_POSITIONS,
  JOB_POSITION_LABELS,
  type JobPosition,
} from "@/lib/validations/gym";

const initialState: ApplicationFormState = {
  success: false,
};

const JOB_DETAILS: Record<
  JobPosition,
  {
    title: string;
    subtitle: string;
    icon: typeof Dumbbell;
    tag: string;
    missions: string[];
    profile: string[];
  }
> = {
  coach: {
    title: "Coach Sportif",
    subtitle: "Musculation, Cardio, Cross-training & Cours collectifs",
    icon: Dumbbell,
    tag: "Terrain & Sport",
    missions: [
      "Accueil et guidage des membres sur les machines et poids libres",
      "Élaboration et suivi de programmes adaptés aux objectifs des adhérents",
      "Animation de séances de cross-training, boxe ou cours collectifs",
      "Veille à la sécurité, à l'exécution correcte des mouvements et à la bonne ambiance",
    ],
    profile: [
      "Passionné(e) de fitness, musculation et préparation physique",
      "Pédagogue, dynamique, ponctuel(le) et excellent relationnel",
      "Expérience pratique ou diplôme/formation sportive apprécié",
    ],
  },
  gestionnaire: {
    title: "Gestionnaire de Salle",
    subtitle: "Supervision opérationnelle, accueil & gestion",
    icon: Briefcase,
    tag: "Management & Opérations",
    missions: [
      "Supervision du bon fonctionnement quotidien de la salle à Ndioum",
      "Suivi des encaissements, abonnements, caisse et registres",
      "Coordination de l'équipe (coachs, accueil, entretien) et gestion des plannings",
      "Suivi du stock (serviettes, boissons, suppléments) et relation avec la direction",
    ],
    profile: [
      "Sens aigu des responsabilités, rigueur et intégrité irréprochable",
      "Aisance avec les outils numériques et la gestion administrative",
      "Capacité à motiver une équipe et à fidéliser les membres",
    ],
  },
  secretaire: {
    title: "Secrétaire / Chargé(e) d'Accueil",
    subtitle: "Front-desk, inscriptions & relation membres",
    icon: Users,
    tag: "Accueil & Relation Client",
    missions: [
      "Accueil chaleureux des adhérents et visiteurs à l'entrée de la salle",
      "Gestion des inscriptions, renouvellements et remise des cartes de membre",
      "Réponse aux appels téléphoniques et aux demandes WhatsApp des prospects",
      "Pointage des présences et tenue des registres d'accès",
    ],
    profile: [
      "Excellente présentation, sens du service et politesse irréprochable",
      "Bonne élocution et expression (français et langues locales)",
      "Organisation, ponctualité et réactivité sur smartphone / ordinateur",
    ],
  },
  menage: {
    title: "Femme de Ménage / Entretien",
    subtitle: "Hygiène, propreté & confort des installations",
    icon: Sparkles,
    tag: "Hygiène & Propreté",
    missions: [
      "Nettoyage et désinfection quotidienne des bancs, machines et tapis",
      "Entretien impeccable des vestiaires, douches et sanitaires",
      "Gestion des poubelles, aération et réapprovisionnement en produits d'hygiène",
      "Signalement de toute anomalie ou besoin de maintenance",
    ],
    profile: [
      "Rigueur, sens du détail et respect strict des normes de propreté",
      "Discrétion, sérieux, dynamisme et autonomie",
      "Résidence à Ndioum ou proximité immédiate",
    ],
  },
};

export default function RecruitmentForm() {
  const [state, formAction, isPending] = useActionState(
    submitApplicationAction,
    initialState
  );
  const [selectedPosition, setSelectedPosition] = useState<JobPosition>("coach");
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
  };

  return (
    <div className="space-y-12">
      {/* ── BANDEAU DATE LIMITE & RAPPEL OFFICIEL ───────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-r from-amber-950/40 via-black to-lime-950/30 p-6 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-400/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-300">
              <Calendar size={13} className="text-amber-400" />
              <span>Campagne officielle de Recrutement</span>
            </div>
            <h2 className="font-sport text-3xl uppercase tracking-wider text-white sm:text-4xl">
              Période de candidature : du 1er au 20 novembre 2026
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-lime-400" />
                <span>Salle Samba Fitness • Route nationale, en face de la mairie de Ndioum</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-amber-400" />
                <span>Date limite stricte : 20 novembre 2026 à 23h59</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-amber-200/90 lg:max-w-xs">
            <ShieldAlert size={20} className="shrink-0 text-amber-400" />
            <p>
              Toute candidature reçue après la date limite ne pourra pas être examinée.
            </p>
          </div>
        </div>
      </div>

      {/* ── PRÉSENTATION DES 4 POSTES ───────────────────────────────── */}
      <div>
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">
            Étape 1 sur 2
          </h3>
          <p className="font-sport mt-1 text-3xl uppercase tracking-wider text-white sm:text-4xl">
            Choisissez le poste pour lequel vous postulez
          </p>
          <p className="mt-1 text-sm text-white/60">
            Cliquez sur l&apos;un des postes ci-dessous pour l&apos;activer dans votre formulaire.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {JOB_POSITIONS.map((pos) => {
            const detail = JOB_DETAILS[pos];
            const Icon = detail.icon;
            const isSelected = selectedPosition === pos;

            return (
              <button
                key={pos}
                type="button"
                onClick={() => setSelectedPosition(pos)}
                className={`relative flex flex-col justify-between rounded-2xl p-5 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-2 border-lime-400 bg-gradient-to-b from-[#18181b] to-[#0f0f11] shadow-xl shadow-lime-400/15 ring-2 ring-lime-400/20"
                    : "border border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                        isSelected
                          ? "bg-lime-400 text-black"
                          : "border border-white/10 bg-white/5 text-lime-400"
                      }`}
                    >
                      <Icon size={22} strokeWidth={2.2} />
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        isSelected
                          ? "bg-lime-400/20 text-lime-300 border border-lime-400/40"
                          : "bg-white/5 text-white/50 border border-white/10"
                      }`}
                    >
                      {detail.tag}
                    </span>
                  </div>

                  <h4 className="mt-4 font-sport text-2xl uppercase tracking-wide text-white">
                    {detail.title}
                  </h4>
                  <p className="mt-1 text-xs text-white/60 leading-relaxed">
                    {detail.subtitle}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-bold">
                  <span className={isSelected ? "text-lime-300" : "text-white/40"}>
                    {isSelected ? "✓ Poste sélectionné" : "Sélectionner ce poste"}
                  </span>
                  <span className={`text-base ${isSelected ? "text-lime-400" : "text-white/30"}`}>
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Détail du poste sélectionné (Missions & Profil) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPosition}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="mt-6 rounded-2xl border border-white/15 bg-black/60 p-6 backdrop-blur-md"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-lime-400">
                  Missions principales — {JOB_DETAILS[selectedPosition].title}
                </p>
                <ul className="mt-3 space-y-2 text-xs text-white/80">
                  {JOB_DETAILS[selectedPosition].missions.map((m) => (
                    <li key={m} className="flex items-start gap-2.5">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-400 font-bold text-[10px]">
                        ✓
                      </span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Profil recherché
                </p>
                <ul className="mt-3 space-y-2 text-xs text-white/80">
                  {JOB_DETAILS[selectedPosition].profile.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px]">
                        ★
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── FORMULAIRE OFFICIEL DE CANDIDATURE ────────────────────── */}
      <div id="formulaire-candidature" className="relative rounded-3xl border border-white/15 bg-[#101012] p-6 shadow-2xl sm:p-10">
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">
            Étape 2 sur 2
          </h3>
          <p className="font-sport mt-1 text-3xl uppercase tracking-wider text-white sm:text-4xl">
            Remplir votre dossier de candidature
          </p>
          <p className="mt-1 text-sm text-white/60">
            Poste visé :{" "}
            <span className="font-bold text-lime-400">
              {JOB_POSITION_LABELS[selectedPosition]}
            </span>
          </p>
        </div>

        {/* Message de succès */}
        {state.success ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-lime-400/40 bg-lime-400/10 p-8 text-center sm:p-12"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-400 text-black shadow-xl shadow-lime-400/30">
              <CheckCircle2 size={36} strokeWidth={2.5} />
            </div>

            <h4 className="mt-6 font-sport text-3xl uppercase text-white sm:text-4xl">
              Candidature enregistrée avec succès !
            </h4>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80">
              {state.message}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`https://wa.me/221789573553?text=${encodeURIComponent(
                  `Bonjour SAMBA FITNESS, je viens de soumettre ma candidature sur votre site pour le poste de ${JOB_POSITION_LABELS[selectedPosition]}. Je reste disponible pour toute information complémentaire.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-400 transition shadow-lg"
              >
                <MessageCircle size={16} />
                <span>Confirmer sur WhatsApp (facultatif)</span>
              </a>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition"
              >
                <span>Retour à l&apos;accueil</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          <form action={formAction} className="space-y-6" noValidate>
            {/* Erreur générale */}
            {state.message && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs font-semibold text-red-300">
                <AlertTriangle size={18} className="shrink-0 text-red-400" />
                <span>{state.message}</span>
              </div>
            )}

            {/* Honeypot invisible anti-spam */}
            <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
              <label htmlFor="website_hp">Ne pas remplir</label>
              <input id="website_hp" name="website_hp" tabIndex={-1} autoComplete="off" />
            </div>

            {/* Champ caché pour le poste sélectionné */}
            <input type="hidden" name="position" value={selectedPosition} />

            {/* ── COORDONNÉES PERSONNELLES ─────────────────────────── */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-xs font-bold uppercase tracking-wider text-white/80"
                >
                  Nom complet <span className="text-lime-400">*</span>
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  placeholder="Ex : Fatou Ndiaye ou Amadou Sow"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
                {state.errors?.full_name && (
                  <p className="mt-1.5 text-xs text-red-400">{state.errors.full_name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-bold uppercase tracking-wider text-white/80"
                >
                  Numéro de téléphone d&apos;appel <span className="text-lime-400">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="Ex : 77 123 45 67 ou 78 957 35 53"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
                {state.errors?.phone && (
                  <p className="mt-1.5 text-xs text-red-400">{state.errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="whatsapp"
                  className="block text-xs font-bold uppercase tracking-wider text-white/80"
                >
                  Numéro WhatsApp (si différent)
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  placeholder="Ex : 77 123 45 67 (ou laisser vide si identique)"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
                {state.errors?.whatsapp && (
                  <p className="mt-1.5 text-xs text-red-400">{state.errors.whatsapp}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-xs font-bold uppercase tracking-wider text-white/80"
                >
                  Ville / Quartier de résidence <span className="text-lime-400">*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  placeholder="Ex : Ndioum centre, Podor, Thilogne, etc."
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                />
                {state.errors?.city && (
                  <p className="mt-1.5 text-xs text-red-400">{state.errors.city}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-white/80"
              >
                Adresse email (facultatif)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="votre.email@gmail.com"
                className="mt-2 w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
              {state.errors?.email && (
                <p className="mt-1.5 text-xs text-red-400">{state.errors.email}</p>
              )}
            </div>

            {/* ── EXPÉRIENCE & DISPONIBILITÉ ───────────────────────── */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="experience"
                  className="block text-xs font-bold uppercase tracking-wider text-white/80"
                >
                  Expérience dans le domaine <span className="text-lime-400">*</span>
                </label>
                <select
                  id="experience"
                  name="experience"
                  required
                  defaultValue=""
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/80 px-4 py-3.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                >
                  <option value="" disabled>
                    Sélectionnez votre niveau d&apos;expérience
                  </option>
                  <option value="Débutant motivé (première expérience)">
                    Débutant motivé (première expérience)
                  </option>
                  <option value="1 à 2 ans d'expérience">1 à 2 ans d&apos;expérience</option>
                  <option value="3 à 5 ans d'expérience">3 à 5 ans d&apos;expérience</option>
                  <option value="Plus de 5 ans d'expérience">Plus de 5 ans d&apos;expérience</option>
                </select>
                {state.errors?.experience && (
                  <p className="mt-1.5 text-xs text-red-400">{state.errors.experience}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="availability"
                  className="block text-xs font-bold uppercase tracking-wider text-white/80"
                >
                  Disponibilité pour débuter <span className="text-lime-400">*</span>
                </label>
                <select
                  id="availability"
                  name="availability"
                  required
                  defaultValue=""
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/80 px-4 py-3.5 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
                >
                  <option value="" disabled>
                    Sélectionnez votre disponibilité
                  </option>
                  <option value="Immédiate">Immédiate</option>
                  <option value="Sous 15 jours">Sous 15 jours</option>
                  <option value="Sous 1 mois">Sous 1 mois</option>
                  <option value="À convenir">À convenir</option>
                </select>
                {state.errors?.availability && (
                  <p className="mt-1.5 text-xs text-red-400">{state.errors.availability}</p>
                )}
              </div>
            </div>

            {/* ── MOTIVATION & MESSAGE ─────────────────────────────── */}
            <div>
              <label
                htmlFor="message"
                className="block text-xs font-bold uppercase tracking-wider text-white/80"
              >
                Parlez-nous de vous, de votre motivation ou de vos compétences clés
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Pourquoi souhaitez-vous rejoindre l'équipe de Samba Fitness Ndioum ? Quelles sont vos forces pour ce poste ?"
                className="mt-2 w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />
              {state.errors?.message && (
                <p className="mt-1.5 text-xs text-red-400">{state.errors.message}</p>
              )}
            </div>

            {/* ── TÉLÉVERSEMENT DU CV ───────────────────────────────── */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80">
                Joindre votre Curriculum Vitae (CV)
              </label>
              <p className="mt-1 text-xs text-white/50">
                Formats acceptés : PDF, Word (.doc, .docx) ou photo / scan clair (JPG, PNG). Maximum 4 Mo.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] p-6 text-center transition hover:border-lime-400/60 hover:bg-white/[0.04]"
              >
                <input
                  ref={fileInputRef}
                  id="cv_file"
                  name="cv_file"
                  type="file"
                  accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-400/10 text-lime-400">
                  <UploadCloud size={24} />
                </div>

                {fileName ? (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-lime-400/20 px-3 py-1.5 text-xs font-bold text-lime-300">
                    <FileText size={14} />
                    <span>{fileName}</span>
                    <span className="text-[10px] text-white/60">(cliquer pour remplacer)</span>
                  </div>
                ) : (
                  <>
                    <p className="mt-3 text-xs font-bold text-white">
                      Cliquez pour choisir votre fichier CV sur votre téléphone ou ordinateur
                    </p>
                    <p className="mt-1 text-[11px] text-white/40">
                      Glisser-déposer ou sélection directe
                    </p>
                  </>
                )}
              </div>
              {state.errors?.cv_file && (
                <p className="mt-1.5 text-xs text-red-400">{state.errors.cv_file}</p>
              )}
            </div>

            {/* ── BOUTON D'ENVOI ───────────────────────────────────── */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-lime-400 py-4 text-center text-xs font-black uppercase tracking-wider text-black shadow-xl shadow-lime-400/25 transition hover:bg-lime-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
              >
                <span>{isPending ? "Transmission de votre candidature..." : "Envoyer ma candidature à SAMBA FITNESS"}</span>
                <ArrowRight size={16} />
              </button>
              <p className="mt-3 text-center text-[11px] text-white/40">
                En soumettant ce formulaire, vos informations sont directement transmises à la direction de Samba Fitness pour l&apos;appel à candidatures en cours.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

