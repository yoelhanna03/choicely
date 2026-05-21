// Tiers d'abonnement
export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  PRO: "pro",
  PREMIUM: "premium",
} as const;

// Crédits pour chaque tier (par semaine)
export const TIER_CREDITS = {
  [SUBSCRIPTION_TIERS.FREE]: 50, // 50 crédits par semaine
  [SUBSCRIPTION_TIERS.PRO]: 500, // 500 crédits par semaine
  [SUBSCRIPTION_TIERS.PREMIUM]: 2000, // 2000 crédits par semaine (quasi illimité)
} as const;

// Consommation de crédits par action
export const CREDIT_COSTS = {
  ANALYSE: 5, // Analyse simple d'un choix
  SIMULATION: 7, // Simulation (coûte plus cher)
  BILAN: 3, // Synthèse bilan
} as const;

// Prix des tiers (en USD)
export const TIER_PRICES = {
  [SUBSCRIPTION_TIERS.PRO]: 4.99, // Par mois
  [SUBSCRIPTION_TIERS.PREMIUM]: 9.99, // Par mois
} as const;

// Durée du reset des crédits (en ms)
export const RESET_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
