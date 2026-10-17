import Image from "next/image";
import Navbar from "./components/Navbar";

const services = [
  {
    title: "Musculation",
    description:
      "Un espace complet avec équipements professionnels pour développer votre force et sculpler votre silhouette.",
  },
  {
    title: "Cardio",
    description:
      "Tapis de course, vélos, rameurs et elliptiques dernière génération pour booster votre endurance.",
  },
  {
    title: "Coaching Privé",
    description:
      "Un accompagnement 100 % personnalisé avec nos coachs certifiés pour atteindre vos objectifs plus vite.",
  },
  {
    title: "Cours Collectifs",
    description:
      "HIIT, crossfit, zumba, yoga et bien plus encore — plus de 50 cours par semaine dans nos 3 salles.",
  },
];

const stats = [
  { value: "10+", label: "années d'expérience" },
  { value: "5 000+", label: "membres" },
  { value: "20+", label: "coachs certifiés" },
  { value: "3", label: "salles à Paris" },
];

const salles = [
  {
    name: "Samba Centre-Ville",
    address: "12 rue du Commerce, Paris 75001",
    hours: "Lun – Ven : 6h – 23h\nSam : 8h – 22h · Dim : 9h – 20h",
    amenities: ["Musculation", "Cardio", "Cours collectifs", "Coaching", "Vestiaires"],
    badge: "Flagship",
  },
  {
    name: "Samba République",
    address: "45 bd de la République, Paris 75011",
    hours: "Lun – Ven : 7h – 22h\nSam : 8h – 21h · Dim : 10h – 19h",
    amenities: ["Musculation", "Cardio", "Cours collectifs", "Sauna"],
    badge: null,
  },
  {
    name: "Samba Nation",
    address: "8 avenue des Champs, Paris 75008",
    hours: "Lun – Ven : 6h – 23h\nSam : 7h – 22h · Dim : 9h – 20h",
    amenities: ["Musculation", "Cardio", "Coaching", "Piscine", "Sauna"],
    badge: "Premium",
  },
];

const plans = [
  {
    name: "Découverte",
    price: "39",
    description: "Sans engagement — résiliable à tout moment",
    features: [
      "Accès à 1 salle au choix",
      "Équipements musculation & cardio",
      "2 cours collectifs / semaine",
      "Application SAMBAFITNESS",
    ],
    cta: "Commencer",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "49",
    description: "Engagement 12 mois — le plus populaire",
    features: [
      "Accès aux 3 salles",
      "Cours collectifs illimités",
      "1 séance coaching / mois",
      "Application SAMBAFITNESS",
      "Accès heures creuses prioritaire",
    ],
    cta: "Choisir Premium",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "69",
    description: "Engagement 12 mois — accès total",
    features: [
      "Accès aux 3 salles",
      "Cours collectifs illimités",
      "4 séances coaching / mois",
      "Piscine & sauna inclus",
      "Programme nutrition offert",
      "Priorité de réservation",
    ],
    cta: "Choisir Elite",
    highlighted: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section
        id="accueil"
        className="relative flex min-h-screen items-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2200&q=90"
            alt="Salle de sport SAMBAFITNESS"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24">
          <div className="max-w-4xl">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.35em] text-lime-400">
              Bienvenue chez SAMBAFITNESS
            </p>

            <h1 className="text-6xl font-black uppercase leading-[0.9] tracking-tight md:text-8xl">
              Dépassez
              <br />
              <span className="text-lime-400">vos limites.</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-white/70">
              Des équipements modernes, des coachs passionnés et un environnement
              conçu pour vous aider à devenir la meilleure version de vous-même.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#tarifs"
                className="rounded-full bg-lime-400 px-8 py-4 font-bold text-black transition duration-200 hover:scale-105 hover:bg-lime-300"
              >
                Commencer maintenant
              </a>

              <a
                href="#salles"
                className="rounded-full border border-white/30 px-8 py-4 font-bold backdrop-blur transition duration-200 hover:border-lime-400 hover:text-lime-400"
              >
                Découvrir nos salles
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="border-y border-white/10 bg-[#0d0d0d]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-r border-white/10 px-6 py-10 last:border-r-0"
            >
              <div className="text-4xl font-black text-lime-400">{stat.value}</div>
              <div className="mt-2 text-sm text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────── */}
      <section id="services" className="mx-auto max-w-7xl px-6 py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-lime-400">
            Nos services
          </p>
          <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
            Tout ce qu&apos;il vous faut
          </h2>
          <p className="mt-6 text-white/50">
            Un environnement complet pour votre entraînement, votre progression
            et votre bien-être.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {services.map((service, index) => (
            <article
              key={service.title}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition duration-300 hover:-translate-y-1 hover:border-lime-400/50"
            >
              <div className="mb-10 text-sm font-bold text-lime-400">
                0{index + 1}
              </div>
              <h3 className="text-3xl font-black">{service.title}</h3>
              <p className="mt-4 max-w-lg leading-7 text-white/50">
                {service.description}
              </p>
              <div className="mt-8 text-sm font-bold text-white/80 transition-colors group-hover:text-lime-400">
                Découvrir →
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── NOS SALLES ────────────────────────────────────── */}
      <section id="salles" className="bg-[#0d0d0d] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-lime-400">
              Nos clubs
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
              3 salles à Paris
            </h2>
            <p className="mt-6 text-white/50">
              Trouvez la salle la plus proche et profitez d&apos;équipements de
              pointe dans un cadre premium.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {salles.map((salle) => (
              <div
                key={salle.name}
                className="group relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition duration-300 hover:-translate-y-1 hover:border-lime-400/30"
              >
                {/* Badge */}
                <div className="mb-6 h-7">
                  {salle.badge && (
                    <span className="inline-block rounded-full bg-lime-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-lime-400">
                      {salle.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black">{salle.name}</h3>
                <p className="mt-1 text-sm text-white/50">{salle.address}</p>

                <div className="my-5 h-px bg-white/10" />

                <p className="text-xs font-bold uppercase tracking-widest text-white/30">
                  Horaires
                </p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-white/60">
                  {salle.hours}
                </p>

                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">
                    Équipements
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {salle.amenities.map((a) => (
                      <span
                        key={a}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href="#tarifs"
                  className="mt-7 flex items-center gap-1 text-sm font-bold text-white/40 transition-colors group-hover:text-lime-400"
                >
                  S&apos;inscrire dans cette salle →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TARIFS ────────────────────────────────────────── */}
      <section id="tarifs" className="mx-auto max-w-7xl px-6 py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-lime-400">
            Abonnements
          </p>
          <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
            Des tarifs clairs
          </h2>
          <p className="mt-6 text-white/50">
            Choisissez la formule adaptée à vos objectifs. Sans frais cachés.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition duration-300 ${
                plan.highlighted
                  ? "bg-lime-400 text-black"
                  : "border border-white/10 bg-white/[0.03] text-white"
              }`}
            >
              {plan.highlighted && (
                <span className="mb-4 inline-block rounded-full bg-black/15 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                  Le plus populaire
                </span>
              )}

              <h3 className="text-2xl font-black">{plan.name}</h3>
              <p
                className={`mt-1 text-sm ${
                  plan.highlighted ? "text-black/60" : "text-white/50"
                }`}
              >
                {plan.description}
              </p>

              <div className="my-6">
                <span className="text-5xl font-black">{plan.price}€</span>
                <span
                  className={`ml-1 text-sm ${
                    plan.highlighted ? "text-black/60" : "text-white/50"
                  }`}
                >
                  /mois
                </span>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <span
                      className={`mt-0.5 font-bold ${
                        plan.highlighted ? "text-black" : "text-lime-400"
                      }`}
                    >
                      ✓
                    </span>
                    <span
                      className={
                        plan.highlighted ? "text-black/80" : "text-white/70"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="mailto:contact@sambafitness.fr"
                className={`mt-8 block rounded-full px-6 py-3 text-center text-sm font-bold transition duration-200 hover:scale-105 ${
                  plan.highlighted
                    ? "bg-black text-white hover:bg-black/80"
                    : "border border-white/20 hover:border-lime-400 hover:text-lime-400"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-white/25">
          * Tous les abonnements incluent l&apos;accès à l&apos;application SAMBAFITNESS. Engagement = tarif préférentiel.
        </p>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="relative mx-6 mb-20 overflow-hidden rounded-[2rem] bg-lime-400 px-8 py-20 text-black md:px-16">
        <div className="relative z-10 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.3em]">
            SAMBAFITNESS
          </p>
          <h2 className="mt-5 text-5xl font-black uppercase leading-none md:text-7xl">
            Votre transformation commence maintenant.
          </h2>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#tarifs"
              className="rounded-full bg-black px-8 py-4 font-bold text-white transition duration-200 hover:scale-105"
            >
              Choisir mon abonnement
            </a>
            <a
              href="tel:+33100000000"
              className="rounded-full border-2 border-black/20 px-8 py-4 font-bold transition duration-200 hover:bg-black/10"
            >
              Nous appeler
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-white/10 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div>
              <div className="text-2xl font-black">
                SAMBA<span className="text-lime-400">FITNESS</span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/40">
                Des équipements de pointe, des coachs certifiés et une communauté
                passionnée pour vous aider à atteindre vos objectifs.
              </p>
            </div>

            <div className="flex flex-wrap gap-12">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">
                  Navigation
                </p>
                <ul className="space-y-2">
                  {[
                    { href: "#accueil", label: "Accueil" },
                    { href: "#services", label: "Services" },
                    { href: "#salles", label: "Nos salles" },
                    { href: "#tarifs", label: "Tarifs" },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <a
                        href={href}
                        className="text-sm text-white/50 transition-colors hover:text-lime-400"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">
                  Contact
                </p>
                <ul className="space-y-2 text-sm text-white/50">
                  <li>contact@sambafitness.fr</li>
                  <li>+33 1 00 00 00 00</li>
                  <li>Paris, France</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
            <p className="text-sm text-white/30">
              © 2026 SAMBAFITNESS. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-sm text-white/30">
              <a href="#" className="transition-colors hover:text-white/60">
                Mentions légales
              </a>
              <a href="#" className="transition-colors hover:text-white/60">
                Confidentialité
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}