import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { execSync } from "child_process";
import { config } from "dotenv";
import { existsSync } from "fs";
import path from "path";

const envCandidates = [
  path.resolve(process.cwd(), ".env.test"),
  path.resolve(process.cwd(), "src/.env.test"),
  path.resolve(__dirname, "../../.env.test"),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}

const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL or DATABASE_URL must be set for integration tests. " +
      "Create server/src/.env.test or run: npm run test:integration",
  );
}

// App code reads DATABASE_URL via lib/prisma.ts
process.env.DATABASE_URL = testDatabaseUrl;

const adapter = new PrismaPg({ connectionString: testDatabaseUrl });

export const prisma = new PrismaClient({ adapter });

export function runMigrations() {
  execSync("npx prisma migrate deploy --config=src/prisma.config.ts", {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: "inherit",
  });
}

export async function clearDb() {
  await prisma.user.deleteMany();
}