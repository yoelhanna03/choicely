import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { TIER_CREDITS, SUBSCRIPTION_TIERS } from "@/lib/subscription-constants";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      return Response.json({ error: "Missing session_id" }, { status: 400 });
    }

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (checkoutSession.mode !== "subscription") {
      return Response.json({ error: "Invalid session mode" }, { status: 400 });
    }

    if (checkoutSession.payment_status !== "paid" && checkoutSession.status !== "complete") {
      return Response.json({ error: "Payment not completed" }, { status: 400 });
    }

    const customerEmail = checkoutSession.customer_email;
    if (!customerEmail || customerEmail !== session.user.email) {
      return Response.json({ error: "Email mismatch" }, { status: 403 });
    }

    const tier = checkoutSession.metadata?.tier as string | undefined;
    if (!tier || ![SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.PREMIUM].includes(tier as any)) {
      return Response.json({ error: "Invalid subscription tier" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { credits: true, subscription: true },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const targetCredits = TIER_CREDITS[tier as keyof typeof TIER_CREDITS];

    await db.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tier,
      },
      update: {
        tier,
      },
    });

    if (user.credits) {
      await db.credit.update({
        where: { id: user.credits.id },
        data: {
          balance: Math.max(user.credits.balance, targetCredits),
        },
      });
    } else {
      await db.credit.create({
        data: {
          userId: user.id,
          balance: targetCredits,
        },
      });
    }

    return Response.json({ success: true, tier });
  } catch (error) {
    console.error("[API /subscription/confirm] Error:", error);
    return Response.json(
      { error: "Erreur de confirmation de l'abonnement" },
      { status: 500 }
    );
  }
}
