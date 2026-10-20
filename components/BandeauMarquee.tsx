"use client";

export default function BandeauMarquee() {
  const items = [
    "MUSCULATION",
    "CARDIO",
    "BOXE & COMBAT",
    "CROSS-TRAINING",
    "COURS COLLECTIFS",
    "NDIOUM",
    "ROUTE NATIONALE",
    "SAMBA DIOP COACH",
  ];

  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden border-y border-lime-400/20 bg-gradient-to-r from-lime-950/40 via-black to-lime-950/40 py-4 select-none backdrop-blur-md"
    >
      <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
        {/* Double repeat to make infinite marquee loop seamless */}
        {[...items, ...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-8">
            <span className="font-sport text-xl tracking-wider text-white/90 sm:text-2xl">
              {item}
            </span>
            <span className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
