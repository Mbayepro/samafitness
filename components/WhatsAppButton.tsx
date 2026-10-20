"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSiteData } from "@/lib/site-context";

export default function WhatsAppButton() {
  const SITE_DATA = useSiteData();
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { whatsapp } = SITE_DATA.contact;
  const whatsappUrl = `https://wa.me/${whatsapp.number}?text=${encodeURIComponent(
    whatsapp.defaultMessage
  )}`;

  return (
    <aside aria-label="Support WhatsApp">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3"
          >
            {/* Floating Speech Bubble */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.9 }}
                  transition={{ delay: 0.5 }}
                  className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/10 bg-black/90 px-4 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur-md"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#25D366]" />
                  </span>
                  <span>Une question ? Samba vous répond !</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTooltip(false);
                    }}
                    className="ml-1 text-white/40 hover:text-white"
                    aria-label="Fermer le message d'aide"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contacter SAMBAFITNESS sur WhatsApp"
              className="group relative flex items-center gap-2.5 rounded-full bg-[#25D366] p-4 text-white shadow-2xl shadow-[#25D366]/40 transition-colors hover:bg-[#20ba59]"
            >
              {/* Animated Ripple Ping */}
              <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping group-hover:opacity-50" />

              {/* WhatsApp Official SVG Icon */}
              <svg
                className="relative h-6 w-6 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>

              {/* Hover label for desktop */}
              <span className="hidden pr-1 text-xs font-black uppercase tracking-wider sm:inline">
                WhatsApp
              </span>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
