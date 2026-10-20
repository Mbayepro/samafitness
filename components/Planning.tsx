"use client";

import { useState } from "react";
import { SITE_DATA, CourseScheduleItem } from "@/lib/site-data";

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] as const;

export default function Planning() {
  const [selectedDay, setSelectedDay] = useState<string>("Lundi");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");

  const categories = ["Tous", "Intense", "Renforcement", "Bien-être", "Cardio"];

  // Filter schedules by selected day and optionally category
  const daySchedules = SITE_DATA.schedules.filter((item) => {
    const matchDay = item.day === selectedDay;
    const matchCat = selectedCategory === "Tous" || item.category === selectedCategory;
    return matchDay && matchCat;
  });

  return (
    <section id="planning" className="relative border-t border-white/10 bg-[#090909] py-24 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-lime-400">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              <span>Planning & Horaires</span>
            </div>
            <h2 className="mt-4 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl md:text-6xl">
              COURS COLLECTIFS
            </h2>
            <p className="mt-4 text-base text-white/70">
              Plus de 50 sessions hebdomadaires animées par nos coachs certifiés. Sélectionne un jour pour consulter les créneaux disponibles.
            </p>
          </div>

          {/* Quick Hours Summary Card */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-black">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                Horaires d&apos;ouverture des clubs
              </p>
              <p className="font-mono text-sm font-black text-lime-400">
                06:00 – 23:00 • 7j/7 non-stop
              </p>
            </div>
          </div>
        </div>

        {/* Navigation by Days: Sleek Athletic Tabs */}
        <div className="mt-12 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {days.map((day) => {
            const countForDay = SITE_DATA.schedules.filter((s) => s.day === day).length;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`group flex shrink-0 items-center gap-2.5 rounded-2xl border px-5 py-3 text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  isSelected
                    ? "border-lime-400 bg-lime-400 text-black shadow-lg shadow-lime-400/20"
                    : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white"
                }`}
              >
                <span>{day}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isSelected ? "bg-black/20 text-black" : "bg-white/10 text-white/50"
                  }`}
                >
                  {countForDay}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Category Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 mr-2">
            Discipline :
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                selectedCategory === cat
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/[0.02] text-white/60 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Timetable List for Selected Day */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#121212]/90 backdrop-blur-md">
          {daySchedules.length > 0 ? (
            <div className="divide-y divide-white/5">
              {daySchedules.map((item: CourseScheduleItem) => (
                <div
                  key={item.id}
                  className="group flex flex-col gap-4 p-5 transition-colors duration-200 hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between sm:p-6"
                >
                  {/* Left: Time & Class details */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                    {/* Time Pill */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-xl border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 font-mono text-xs font-black text-lime-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{item.time}</span>
                      </div>
                      <span className="text-xs text-white/40 sm:hidden">{item.duration}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-black uppercase text-white group-hover:text-lime-300 transition-colors">
                          {item.title}
                        </h3>
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/60">
                          {item.category}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/50">
                        Coach <span className="font-semibold text-white/80">{item.coach}</span> • Durée {item.duration} • Intensité <span className="text-lime-400">{item.intensity}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Salle Badge & Action */}
                  <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-3 sm:border-0 sm:pt-0">
                    <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-white/70">
                      {item.salle}
                    </span>

                    <a
                      href="#essai-gratuit"
                      className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/40 bg-lime-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-lime-400 transition hover:bg-lime-400 hover:text-black"
                    >
                      <span>Réserver</span>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm text-white/50">
                Aucun cours dans cette catégorie pour le {selectedDay.toLowerCase()}.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory("Tous")}
                className="mt-3 text-xs font-bold text-lime-400 hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          {/* Footer of the timetable */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 bg-black/40 px-6 py-4 sm:flex-row">
            <p className="text-xs text-white/50">
              Réservation instantanée disponible sur l&apos;application mobile SAMBAFITNESS.
            </p>
            <a
              href="#essai-gratuit"
              className="text-xs font-bold uppercase tracking-wider text-lime-400 hover:underline"
            >
              Réserver ma séance d&apos;essai gratuite →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
