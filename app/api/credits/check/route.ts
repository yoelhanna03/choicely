import { auth } from "@/auth";
import { canPerformAction } from "@/lib/subscription-utils";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { creditCost } = body;

    if (!creditCost || typeof creditCost !== "number" || creditCost <= 0) {
      return Response.json(
        { error: "Invalid creditCost" },
        { status: 400 }
      );
    }

    const canPerform = await canPerformAction(session.user.email, creditCost);

    return Response.json({
      canPerform,
      creditCost,
      message: canPerform
        ? "Credits available"
        : "Insufficient credits",
    });
  } catch (error) {
    console.error("[API /credits/check] Error:", error);
    return Response.json(
      { error: "Failed to check credits" },
      { status: 500 }
    );
  }
}
