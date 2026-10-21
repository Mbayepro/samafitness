"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSiteData } from "@/lib/site-context";

export default function FAQ() {
  const SITE_DATA = useSiteData();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((curr) => (curr === index ? null : index));
  };

  return (
    <section id="faq" className="border-t border-white/10 bg-[#0a0a0a] px-6 py-28">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-lime-400">
            Des Réponses à vos Questions
          </p>
          <h2 className="mt-4 font-sport text-4xl uppercase tracking-wider text-white md:text-5xl">
            Foire Aux Questions
          </h2>
          <p className="mt-4 text-sm text-white/50">
            Tout ce que vous devez savoir avant de débuter votre entraînement chez {SITE_DATA.brand.name}.
          </p>
        </motion.div>

        <div className="mt-14 space-y-4">
          {SITE_DATA.faq.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between p-6 text-left transition"
                >
                  <span className="text-base font-bold text-white sm:text-lg">
                    {item.question}
                  </span>
                  <motion.span
                    animate={{
                      rotate: isOpen ? 180 : 0,
                      backgroundColor: isOpen ? "#a3e635" : "rgba(0, 0, 0, 0)",
                      color: isOpen ? "#000000" : "#ffffff",
                      borderColor: isOpen ? "#a3e635" : "rgba(255, 255, 255, 0.2)",
                    }}
                    transition={{ duration: 0.25 }}
                    className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold"
                  >
                    ↓
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/5 p-6 pt-3 text-sm leading-relaxed text-white/70">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Support helper */}
        <div className="mt-12 text-center text-xs text-white/40">
          Une autre question ? Contactez notre équipe au{" "}
          <a
            href={`tel:${SITE_DATA.contact.phoneTel}`}
            className="text-lime-400 underline hover:text-lime-300 font-semibold"
          >
            {SITE_DATA.contact.phone}
          </a>{" "}
          ou par email à{" "}
          <a
            href={`mailto:${SITE_DATA.contact.email}`}
            className="text-lime-400 underline hover:text-lime-300 font-semibold"
          >
            {SITE_DATA.contact.email}
          </a>
        </div>
      </div>
    </section>
  );
}
