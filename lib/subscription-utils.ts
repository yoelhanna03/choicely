import { db } from "@/lib/db";
import {
  SUBSCRIPTION_TIERS,
  TIER_CREDITS,
  RESET_INTERVAL_MS,
} from "@/lib/subscription-constants";

/**
 * Obtenir ou créer les crédits d'un utilisateur
 */
export async function getUserCredits(email: string) {
  const user = await db.user.findUnique({
    where: { email },
    include: {
      credits: true,
      subscription: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let credits = user.credits;

  // Créer les crédits par défaut s'ils n'existent pas
  if (!credits) {
    credits = await db.credit.create({
      data: {
        userId: user.id,
        balance: TIER_CREDITS[SUBSCRIPTION_TIERS.FREE],
      },
    });
  }

  // Créer l'abonnement par défaut s'il n'existe pas
  let subscription = user.subscription;
  if (!subscription) {
    subscription = await db.subscription.create({
      data: {
        userId: user.id,
        tier: SUBSCRIPTION_TIERS.FREE,
      },
    });
  }

  // Vérifier si un reset est nécessaire (pour les free tier seulement)
  if (subscription.tier === SUBSCRIPTION_TIERS.FREE) {
    const now = new Date();
    const timeSinceReset = now.getTime() - new Date(credits.lastResetAt).getTime();

    if (timeSinceReset > RESET_INTERVAL_MS) {
      // Faire un reset
      credits = await db.credit.update({
        where: { id: credits.id },
        data: {
          balance: TIER_CREDITS[SUBSCRIPTION_TIERS.FREE],
          lastResetAt: now,
        },
      });
    }
  }

  return { user, credits, subscription };
}

/**
 * Consommer des crédits
 */
export async function consumeCredits(email: string, amount: number) {
  const { user, credits } = await getUserCredits(email);

  if (credits.balance < amount) {
    throw new Error(
      `Insufficient credits. Required: ${amount}, Available: ${credits.balance}`
    );
  }

  const updatedCredits = await db.credit.update({
    where: { id: credits.id },
    data: {
      balance: credits.balance - amount,
    },
  });

  return updatedCredits;
}

/**
 * Ajouter des crédits (après un don)
 */
export async function addCredits(email: string, amount: number) {
  const { credits } = await getUserCredits(email);

  const updatedCredits = await db.credit.update({
    where: { id: credits.id },
    data: {
      balance: credits.balance + amount,
    },
  });

  return updatedCredits;
}

/**
 * Vérifier si l'utilisateur peut effectuer une action
 */
export async function canPerformAction(email: string, creditCost: number) {
  try {
    const { credits } = await getUserCredits(email);
    return credits.balance >= creditCost;
  } catch (error) {
    return false;
  }
}

/**
 * Obtenir le temps jusqu'au prochain reset (pour free tier)
 */
export function getTimeUntilReset(lastResetAt: Date): number {
  const now = new Date();
  const timeSinceReset = now.getTime() - new Date(lastResetAt).getTime();
  const timeUntilReset = Math.max(0, RESET_INTERVAL_MS - timeSinceReset);
  return timeUntilReset;
}

/**
 * Formater le temps restant de manière lisible
 */
export function formatTimeUntilReset(timeMs: number): string {
  const hours = Math.floor(timeMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}j ${hours % 24}h`;
  }
  return `${hours}h`;
}
