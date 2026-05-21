import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const tier = user.subscription?.tier || "free";

    // Define history limits per tier
    const limits: { [key: string]: number | null } = {
      free: 5, // Last 5 analyses
      pro: 30, // Last 30 days of analyses
      premium: null, // Unlimited
    };

    const limit = limits[tier];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let propositions = await db.proposition.findMany({
      where: {
        for_email: session.user.email,
        ...(limit && tier === "pro" ? { createdAt: { gte: thirtyDaysAgo } } : {}),
      },
      orderBy: { createdAt: "desc" },
      ...(tier === "free" && limit ? { take: limit } : {}),
    });

    return Response.json({
      propositions,
      tier,
      historyLimit:
        tier === "free"
          ? `${limit} dernières analyses`
          : tier === "pro"
            ? "30 jours"
            : "Illimité",
      total: propositions.length,
    });
  } catch (error) {
    console.error("[API /analytics/history] Error:", error);
    return Response.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
