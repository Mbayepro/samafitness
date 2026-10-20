import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#080808] px-4 text-center text-white relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-1.5 text-xs font-black tracking-widest text-lime-400 uppercase">
          Erreur 404
        </div>

        <h1 className="text-6xl font-black tracking-tight sm:text-7xl text-white">
          4<span className="text-lime-400">0</span>4
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Page introuvable</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Oups ! La page que vous cherchez n&apos;existe pas ou a été déplacée. Revenez sur le droit chemin de l&apos;entraînement !
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-sm font-black text-black transition hover:bg-lime-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l&apos;accueil
          </Link>

          <a
            href="https://wa.me/221789573553?text=Bonjour%20Samba%20Fitness%2C%20j'ai%20une%20question"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-6 py-3 text-sm font-bold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            Nous contacter sur WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
