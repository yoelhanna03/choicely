import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { TIER_PRICES } from "@/lib/subscription-constants";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tier } = body;
    if (!tier || !["pro", "premium"].includes(tier)) {
      return Response.json({ error: "Tier invalide" }, { status: 400 });
    }

    const amount = TIER_PRICES[tier as keyof typeof TIER_PRICES];
    if (!amount || typeof amount !== "number") {
      return Response.json({ error: "Prix du tier invalide" }, { status: 500 });
    }

    const stripe = getStripe();
    const successUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/subscription?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/subscription?payment=cancelled`;

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Choicely ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
              description: `Abonnement ${tier} mensuel`,
            },
            recurring: { interval: "month" },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: session.user.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tier,
        userEmail: session.user.email,
      },
    });

    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[API /subscription/checkout] Error:", error);
    return Response.json(
      { error: "Erreur lors de la création de la session d'abonnement" },
      { status: 500 }
    );
  }
}
