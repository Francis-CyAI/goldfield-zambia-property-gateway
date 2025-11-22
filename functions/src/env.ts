import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const candidates = [
  resolve(__dirname, "../.env.deploy"),
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

const ensureServiceAccountCredential = () => {
  const directPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (directPath) {
    return;
  }

  const serviceAccountHint = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountHint) {
    return;
  }

  const resolveHint = (hint: string): string[] => {
    if (isAbsolute(hint)) {
      return [hint];
    }

    const functionsDir = resolve(__dirname, "..");
    const projectRoot = resolve(functionsDir, "..");
    const cwd = process.cwd();

    return [
      resolve(functionsDir, hint),
      resolve(projectRoot, hint),
      resolve(cwd, hint),
    ];
  };

  for (const candidate of resolveHint(serviceAccountHint)) {
    if (existsSync(candidate)) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = candidate;
      return;
    }
  }

  console.warn(
    `FIREBASE_SERVICE_ACCOUNT is set but file was not found. ` +
      `Checked paths derived from "${serviceAccountHint}".`,
  );
};

ensureServiceAccountCredential();
