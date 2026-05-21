import { auth } from "@/auth";
import { db } from "@/lib/db";

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
    const { propositionIds } = body;

    if (!Array.isArray(propositionIds) || propositionIds.length === 0) {
      return Response.json(
        { error: "Invalid propositionIds" },
        { status: 400 }
      );
    }

    // Fetch user and their tier
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user || user.subscription?.tier !== "premium") {
      return Response.json(
        { error: "Feature available for Premium tier only" },
        { status: 403 }
      );
    }

    // Fetch propositions for comparison
    const propositions = await db.proposition.findMany({
      where: {
        id: { in: propositionIds },
        for_email: session.user.email,
      },
    });

    if (propositions.length === 0) {
      return Response.json(
        { error: "No propositions found" },
        { status: 404 }
      );
    }

    // Build comparison data
    const comparison = {
      title: "Analyse Comparative",
      generatedAt: new Date().toISOString(),
      propositions: propositions.map((p) => ({
        id: p.id,
        question: p.question || "Sans titre",
        analysis: p.ia_prop,
        score: p.score,
        createdAt: p.createdAt,
      })),
      insights: generateInsights(propositions),
    };

    return Response.json(comparison);
  } catch (error) {
    console.error("[API /analytics/compare] Error:", error);
    return Response.json(
      { error: "Failed to generate comparison" },
      { status: 500 }
    );
  }
}

function generateInsights(propositions: any[]) {
  const scores = propositions.map((p) => p.score);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  return {
    averageScore: Math.round(avgScore),
    bestScore: maxScore,
    worstScore: minScore,
    recommendation:
      avgScore > 70
        ? "Vos choix tendent globalement vers des décisions positives"
        : avgScore > 50
          ? "Vous balancez entre prudence et prise de risque"
          : "Vos choix semblent plutôt conservateurs",
  };
}
