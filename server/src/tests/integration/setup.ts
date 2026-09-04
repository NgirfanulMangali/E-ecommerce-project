import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { execSync } from "child_process";
import { config } from "dotenv";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const setupDir = path.dirname(fileURLToPath(import.meta.url));

const serverRoot = path.resolve(setupDir, "../../..");

// Load server/.env.test
const envPath = path.resolve(serverRoot, ".env.test");

if (!existsSync(envPath)) {
  throw new Error(
    "server/.env.test not found. Create it before running integration tests."
  );
}

config({
  path: envPath,
  override: true,
  quiet: true,
});

// Pooled connection for Prisma Clients
const testDatabaseUrl = process.env.TEST_DATABASE_URL;



if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL must be set in server/.env.test."
  );
}


// Prisma Client uses the test database
const adapter = new PrismaPg({
  connectionString: testDatabaseUrl,
});

export const prisma = new PrismaClient({
  adapter,
});

// Prisma migrations use the direct connection
export function runMigrations() {
  execSync(
    "npx prisma migrate deploy --config=src/prisma.config.ts",
    {
      cwd: serverRoot,
      env: {
        ...process.env, PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: "true",

        DATABASE_URL: testDatabaseUrl,
      },
      stdio: "inherit",
    }
  );
}

export async function clearDb() {
  await prisma.user.deleteMany();
}