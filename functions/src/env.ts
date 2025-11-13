import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const candidates = [
  resolve(__dirname, "../.env.local"),
  resolve(__dirname, "../.env"),
  resolve(__dirname, "../../.env.local"),
  resolve(__dirname, "../../.env"),
];

const loaded = new Set<string>();

for (const path of candidates) {
  if (!loaded.has(path) && existsSync(path)) {
    loadEnv({ path, override: false });
    loaded.add(path);
  }
}
