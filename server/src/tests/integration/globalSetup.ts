import { runMigrations, prisma } from "./setup";

export default async function setup() {
  runMigrations();
  await prisma.$disconnect();
}
