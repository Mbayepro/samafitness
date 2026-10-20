import { SITE_DATA } from "@/lib/site-data";

export default function Stats() {
  return (
    <section className="relative border-y border-white/10 bg-[#0d0d0d]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-y divide-white/10 sm:divide-y-0 sm:divide-x md:grid-cols-4">
        {SITE_DATA.stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center p-8 text-center transition hover:bg-white/[0.02]"
          >
            <div className="text-4xl font-black tracking-tight text-lime-400 sm:text-5xl">
              {stat.value}
            </div>
            <div className="mt-2 text-sm font-bold uppercase tracking-wider text-white">
              {stat.label}
            </div>
            {stat.description && (
              <div className="mt-1 text-xs text-white/40">
                {stat.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
