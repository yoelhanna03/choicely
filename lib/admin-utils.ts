import { db } from "@/lib/db";

const ADMIN_EMAILS = ["yoelhanna03@gmail.com"];

/**
 * Vérifier si un email doit être admin et mettre à jour la base si nécessaire
 */
export async function ensureAdminStatus(email: string) {
  if (!ADMIN_EMAILS.includes(email)) {
    return false;
  }

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return false;
  }

  if (user.role !== "admin") {
    await db.user.update({
      where: { email },
      data: { role: "admin" },
    });
  }

  return true;
}

/**
 * Vérifier si l'utilisateur actuel est admin
 */
export async function isUserAdmin(email: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { email },
    select: { role: true },
  });

  return user?.role === "admin";
}

/**
 * Obtenir les statistiques globales pour l'admin
 */
export async function getAdminStats() {
  const [
    totalUsers,
    totalAnalyses,
    totalBilans,
    totalProSubscriptions,
    totalPremiumSubscriptions,
  ] = await Promise.all([
    db.user.count(),
    db.proposition.count(),
    db.bilan.count(),
    db.subscription.count({
      where: { tier: "pro" },
    }),
    db.subscription.count({
      where: { tier: "premium" },
    }),
  ]);

  return {
    totalUsers,
    totalAnalyses,
    totalBilans,
    totalProSubscriptions,
    totalPremiumSubscriptions,
    totalPaidSubscriptions: totalProSubscriptions + totalPremiumSubscriptions,
  };
}

/**
 * Obtenir la liste des utilisateurs avec leurs statistiques
 */
export async function getAdminUsersList(limit = 100) {
  const users = await db.user.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      subscription: {
        select: { tier: true },
      },
      credits: {
        select: { balance: true },
      },
    },
  });

  return users;
}
