import fs from "fs";
import path from "path";

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function loadEnvFile(envPath: string): void {
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = stripQuotes(line.slice(idx + 1));
    if (!key) continue;
    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

export function loadRootEnv(): void {
  if (process.env.DATABASE_URL) {
    return;
  }

  const packageEnvPath = path.join(path.resolve(import.meta.dirname, ".."), ".env");
  if (fs.existsSync(packageEnvPath)) {
    loadEnvFile(packageEnvPath);
    return;
  }

  const findEnvPath = (): string | null => {
    let dir = process.cwd();
    for (let i = 0; i < 6; i++) {
      const candidate = path.join(dir, ".env");
      if (fs.existsSync(candidate)) return candidate;
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return null;
  };

  const envPath = findEnvPath();
  if (!envPath) return;

  loadEnvFile(envPath);
}
