import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { mergeById, createJsonFileStore, runSupabase } from "./sync-store";

vi.mock("@/lib/supabase/config", () => ({
  isSupabaseConfigured: vi.fn(() => false),
}));

describe("mergeById", () => {
  it("place le distant en premier et conserve le local non dupliqué", () => {
    const remote = [{ id: "a", v: 1 }];
    const local = [
      { id: "a", v: 0 },
      { id: "b", v: 2 },
    ];
    expect(mergeById(remote, local)).toEqual([
      { id: "a", v: 1 },
      { id: "b", v: 2 },
    ]);
  });
});

describe("createJsonFileStore", () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sf-store-"));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("écrit puis relit le JSON", () => {
    const relativePath = path.relative(process.cwd(), path.join(dir, "data.json"));
    const store = createJsonFileStore<{ n: number }>({
      relativePath,
      empty: { n: 0 },
      useLocalFile: true,
    });
    store.write({ n: 7 });
    expect(store.read()).toEqual({ n: 7 });
  });

  it("utilise seed si le fichier est absent", () => {
    const relativePath = path.relative(process.cwd(), path.join(dir, "seed.json"));
    const store = createJsonFileStore<{ n: number }>({
      relativePath,
      empty: { n: 0 },
      seed: () => ({ n: 42 }),
      useLocalFile: true,
    });
    expect(store.read()).toEqual({ n: 42 });
  });
});

describe("runSupabase", () => {
  it("retourne null si Supabase n'est pas configuré", async () => {
    const result = await runSupabase("test", async () => 1);
    expect(result).toBeNull();
  });
});
