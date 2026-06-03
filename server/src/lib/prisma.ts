
import { PrismaClient } from "@prisma/client";

console.log("Prisma file loaded");

export const prisma = new PrismaClient();

console.log("Prisma client created");