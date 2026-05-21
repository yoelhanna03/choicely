import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, email } = body;

    // Validate amount
    if (!amount || typeof amount !== "number" || amount < 1) {
      return Response.json(
        { error: "Le montant doit être au moins 1$" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Don pour Choicely",
              description: `Soutenir le développement de Choicely`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email || undefined,
      success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/donate?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/donate?payment=cancelled`,
      metadata: {
        amount: amount.toString(),
      },
    });

    return Response.json({
      url: checkoutSession.url,
      message: "Redirection vers le paiement sécurisé",
    });
  } catch (error) {
    console.error("[API /billing] Error:", error);
    return Response.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 }
    );
  }
}
