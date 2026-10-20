import { spawnSync } from "child_process";

process.env.ANALYZE = "true";
const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, ANALYZE: "true" },
});

process.exit(result.status ?? 0);
