import { PrismaClient } from "@prisma/client";

export const prisma = globalThis.__askheroPrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__askheroPrisma = prisma;
}
