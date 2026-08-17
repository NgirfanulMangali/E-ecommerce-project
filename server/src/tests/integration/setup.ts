import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { execSync } from "child_process";
import { config } from "dotenv";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const setupDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(setupDir, "../../..");

const envCandidates = [
  path.resolve(setupDir, "../../.env.test"),
  path.resolve(serverRoot, ".env.test"),
  path.resolve(serverRoot, "src/.env.test"),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    config({ path: envPath, override: true, quiet: true });
  }
}

const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL or DATABASE_URL must be set for integration tests. " +
      "Create server/src/.env.test or run: npm run test:integration",
  );
}

// App code and Prisma CLI both read DATABASE_URL
process.env.DATABASE_URL = testDatabaseUrl;

const adapter = new PrismaPg({ connectionString: testDatabaseUrl });

export const prisma = new PrismaClient({ adapter });

export function runMigrations() {
  execSync("npx prisma migrate deploy --config=src/prisma.config.ts", {
    cwd: serverRoot,
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: "inherit",
  });
}

export async function clearDb() {
  await prisma.user.deleteMany();
}
