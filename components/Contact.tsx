"use client";

import { useActionState } from "react";
import { motion } from "motion/react";
import { useSiteData } from "@/lib/site-context";
import { submitTrialAction, type TrialFormState } from "@/app/actions/submit-trial";

const initialState: TrialFormState = {
  success: false,
};

export default function Contact() {
  const SITE_DATA = useSiteData();
  const [state, formAction, isPending] = useActionState(
    submitTrialAction,
    initialState
  );

  return (
    <section
      id="rejoindre"
      className="relative border-t border-white/10 bg-[#080808] px-6 py-28"
    >
      <div id="essai-gratuit" className="absolute -top-24" />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Direct Info & Value Proposition */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-lime-400">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              <span>Inscription & Contact</span>
            </div>

            <h2 className="mt-5 font-sport text-4xl uppercase tracking-wider text-white sm:text-5xl">
              Rejoignez SAMBAFITNESS dès aujourd&apos;hui.
            </h2>

            <p className="mt-6 text-base leading-relaxed text-white/60">
              Envie de vous remettre en forme, de perdre du poids ou de vous muscler à Ndioum ?
              Remplissez le formulaire, contactez-nous par WhatsApp ou appelez directement :
              notre équipe vous accueille avec plaisir !
            </p>

            {/* Direct Contact Cards */}
            <div className="mt-10 space-y-4">
              <a
                href={`tel:${SITE_DATA.contact.phoneTel}`}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-lime-400/50 hover:bg-white/[0.05]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                    Téléphone direct
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-white hover:text-lime-400 transition">
                    {SITE_DATA.contact.phone}
                  </p>
                </div>
              </a>

              <a
                href={`https://wa.me/${SITE_DATA.contact.whatsapp.number}?text=${encodeURIComponent(
                  SITE_DATA.contact.whatsapp.defaultMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-lime-400/50 hover:bg-white/[0.05]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                    WhatsApp direct
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-white hover:text-lime-400 transition">
                    {SITE_DATA.contact.whatsapp.displayNumber}
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${SITE_DATA.contact.email}`}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-lime-400/50 hover:bg-white/[0.05]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                    Email
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-white hover:text-lime-400 transition">
                    {SITE_DATA.contact.email}
                  </p>
                </div>
              </a>

              <a
                href={SITE_DATA.salles[0]?.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-lime-400/50 hover:bg-white/[0.05]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                    Adresse
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-white hover:text-lime-400 transition">
                    {SITE_DATA.contact.address}, {SITE_DATA.contact.mainCity}
                  </p>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Free Trial Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.03] p-8 backdrop-blur-xl sm:p-10 shadow-2xl">
              <div className="mb-8">
                <h3 className="font-sport text-3xl uppercase tracking-wide text-white">
                  Rejoindre la salle
                </h3>
                <p className="mt-1 text-sm text-white/50">
                  Remplissez vos coordonnées • Notre équipe vous recontacte rapidement
                </p>
              </div>

              {state.success ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-lime-400/40 bg-lime-400/10 p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-black shadow-lg shadow-lime-400/30"
                  >
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h4 className="mt-4 text-xl font-black uppercase text-white">
                    Demande d&apos;inscription envoyée avec succès !
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">
                    {state.message}
                  </p>
                  <a
                    href="#accueil"
                    className="mt-6 inline-block rounded-full bg-lime-400 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-lime-300"
                  >
                    Retour à l&apos;accueil
                  </a>
                </motion.div>
              ) : (
                <form action={formAction} className="space-y-5" noValidate>
                  {state.message && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs font-semibold text-red-400">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{state.message}</span>
                    </div>
                  )}
                  {/* Protection anti-spam honeypot invisible */}
                  <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
                    <label htmlFor="website_hp">Ne pas remplir</label>
                    <input
                      id="website_hp"
                      name="website_hp"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* Nom complet */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-bold uppercase tracking-wider text-white/70"
                    >
                      Nom complet <span className="text-lime-400">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Ex: Moussa Ndiaye"
                      className={`mt-2 w-full rounded-xl border bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/25 transition focus:border-lime-400 focus:outline-none ${
                        state.errors?.name ? "border-red-500" : "border-white/10"
                      }`}
                    />
                    {state.errors?.name && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {state.errors.name}
                      </p>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold uppercase tracking-wider text-white/70"
                    >
                      Numéro de téléphone <span className="text-lime-400">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="Ex: 77 123 45 67"
                      className={`mt-2 w-full rounded-xl border bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/25 transition focus:border-lime-400 focus:outline-none ${
                        state.errors?.phone ? "border-red-500" : "border-white/10"
                      }`}
                    />
                    {state.errors?.phone && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {state.errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Club sélectionné */}
                  <div>
                    <label
                      htmlFor="salle"
                      className="block text-xs font-bold uppercase tracking-wider text-white/70"
                    >
                      Salle <span className="text-lime-400">*</span>
                    </label>
                    <select
                      id="salle"
                      name="salle"
                      required
                      defaultValue={SITE_DATA.salles[0]?.name || ""}
                      className={`mt-2 w-full rounded-xl border bg-neutral-900 px-4 py-3.5 text-sm text-white transition focus:border-lime-400 focus:outline-none ${
                        state.errors?.salle ? "border-red-500" : "border-white/10"
                      }`}
                    >
                      {SITE_DATA.salles.map((salle) => (
                        <option
                          key={salle.id}
                          value={salle.name}
                          className="bg-neutral-900 text-white"
                        >
                          {salle.name} — {salle.address}
                        </option>
                      ))}
                    </select>
                    {state.errors?.salle && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {state.errors.salle}
                      </p>
                    )}
                  </div>

                  {/* Message ou Objectif */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-bold uppercase tracking-wider text-white/70"
                    >
                      Votre objectif ou question (facultatif)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      placeholder="Ex: Prise de masse, perte de poids, reprise du sport, test d'un cours spécifique..."
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-white/25 transition focus:border-lime-400 focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isPending}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 py-4 text-center text-sm font-black uppercase tracking-wider text-black shadow-lg shadow-lime-400/20 transition hover:bg-lime-300 disabled:opacity-50"
                    >
                      {isPending ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                          <span>Validation en cours...</span>
                        </>
                      ) : (
                        <span>Rejoindre SAMBAFITNESS</span>
                      )}
                    </motion.button>
                  </div>

                  <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-white/40">
                    <svg className="h-3.5 w-3.5 text-lime-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Vos données sont strictement confidentielles et ne seront jamais partagées à des tiers.</span>
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
