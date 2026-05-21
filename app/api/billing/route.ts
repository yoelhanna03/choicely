import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    // Get the authenticated session
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json(
        { error: "Vous devez être connecté pour faire un don" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount } = body;

    // Validate amount
    if (!amount || amount < 1) {
      return Response.json(
        { error: "Le montant doit être au moins 1$" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Crédits Choicely",
              description: `Crédits pour l'analyse IA avec Choicely`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: session.user.email,
      success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/donate?payment=cancelled`,
      metadata: {
        user_email: session.user.email,
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
