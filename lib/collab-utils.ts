import { db } from "@/lib/db";

export async function getUserTier(email: string | undefined) {
  if (!email) return "free";
  const sub = await db.subscription.findUnique({
    where: {
      userId: (await db.user.findUnique({ where: { email } }))?.id,
    } as any,
  });
  return sub?.tier ?? "free";
}

export function maxMembersForTier(tier: string) {
  if (tier === "premium") return 20;
  if (tier === "pro") return 5;
  return 0;
}

export async function canCreateCollab(email: string | undefined) {
  const tier = await getUserTier(email);
  return tier === "pro" || tier === "premium";
}

export async function allowedMembersCount(email: string | undefined) {
  const tier = await getUserTier(email);
  return maxMembersForTier(tier);
}

export async function getUserIdByEmail(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  return user?.id ?? null;
}
