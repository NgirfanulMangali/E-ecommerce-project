import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { execSync } from "child_process";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../../.env.test") });

const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: `${testDatabaseUrl}` });

export const prisma = new PrismaClient({ adapter });

export function runMigrations() {
  execSync("npx prisma migrate deploy --config=src/prisma.config.ts", {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
  });
}

export async function clearDb() {
  await prisma.user.deleteMany();
}