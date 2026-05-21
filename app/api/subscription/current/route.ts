import { auth } from "@/auth";
import { getUserCredits } from "@/lib/subscription-utils";
import { TIER_PRICES } from "@/lib/subscription-constants";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { user, credits, subscription } = await getUserCredits(
      session.user.email
    );

    // Calculer le prix du prochain tier
    const nextTier = subscription.tier === "free" ? "pro" : "premium";
    const nextPrice = TIER_PRICES[nextTier as keyof typeof TIER_PRICES];

    return Response.json({
      subscription: {
        tier: subscription.tier,
        createdAt: subscription.createdAt,
        expiresAt: subscription.expiresAt,
      },
      credits: {
        balance: credits.balance,
        lastResetAt: credits.lastResetAt,
      },
      nextTier,
      nextPrice,
    });
  } catch (error) {
    console.error("[API /subscription/current] Error:", error);
    return Response.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
