import fs from "fs";
import path from "path";
import { logger } from "@/lib/logger";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface JsonFileStore<T> {
  read: () => T;
  write: (data: T) => void;
  useLocalFile: boolean;
}

export function createJsonFileStore<T>(options: {
  relativePath: string;
  empty: T;
  seed?: () => T;
  /** En production, le JSON local n'est pas utilisé (données dans Supabase). */
  useLocalFile?: boolean;
}): JsonFileStore<T> {
  const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), options.relativePath);
  const useLocalFile = options.useLocalFile ?? process.env.NODE_ENV !== "production";

  function read(): T {
    if (!useLocalFile) return options.empty;
    try {
      if (!fs.existsSync(filePath)) {
        const initial = options.seed ? options.seed() : options.empty;
        write(initial);
        return initial;
      }
      const raw = fs.readFileSync(filePath, "utf8");
      return JSON.parse(raw) as T;
    } catch (err) {
      logger.error({ err, filePath }, `Erreur lecture ${options.relativePath}`);
      return options.seed ? options.seed() : options.empty;
    }
  }

  function write(data: T): void {
    if (!useLocalFile) return;
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
      logger.error({ err, filePath }, `Erreur écriture ${options.relativePath}`);
    }
  }

  return { read, write, useLocalFile };
}

export function mergeById<T extends { id: string }>(remote: T[], local: T[]): T[] {
  const remoteIds = new Set(remote.map((item) => item.id));
  return [...remote, ...local.filter((item) => !remoteIds.has(item.id))];
}

export async function runSupabase<T>(
  label: string,
  fn: () => Promise<T | null | undefined>
): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const result = await fn();
    return result ?? null;
  } catch (err) {
    logger.warn({ err }, `Erreur ${label} Supabase, repli local`);
    return null;
  }
}
