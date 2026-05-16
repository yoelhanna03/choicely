import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

// Pas besoin de dotenv ici dans Next.js, il gère déjà les .env.local
const connectionString = process.env.DATABASE_URL?.replace(
  "&channel_binding=require",
  ""
);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  if (!connectionString) {
    // On retourne un client standard ou on throw une erreur claire
    return new PrismaClient();
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);

  // Utilisation du constructeur propre à la v5 de Prisma
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}