import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

/**
 * Logger structuré (Pino).
 * - Serveur : JSON en production, plus verbeux en développement.
 * - Navigateur : les logs info/debug sont coupés en production.
 */
export const logger = pino({
  name: "sambafitness",
  level: isProd ? "info" : "debug",
  base: { app: "sambafitness" },
  timestamp: pino.stdTimeFunctions.isoTime,
  browser: {
    asObject: true,
    serialize: true,
    transmit: undefined,
    write: {
      debug: (o) => {
        if (!isProd) console.debug(o);
      },
      info: (o) => {
        if (!isProd) console.info(o);
      },
      warn: (o) => {
        console.warn(o);
      },
      error: (o) => {
        console.error(o);
      },
      fatal: (o) => {
        console.error(o);
      },
    },
  },
});
