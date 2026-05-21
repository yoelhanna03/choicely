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

    // Determine history limit based on tier
    const tierLimits: { [key: string]: number } = {
      free: 5, // Last 5 analyses
      pro: 30, // Last 30 days
      premium: -1, // Unlimited
    };

    const limit = tierLimits[user.subscription?.tier || "free"] || 5;

    // Fetch propositions
    const propositions = await db.proposition.findMany({
      where: { for_email: session.user.email },
      orderBy: { createdAt: "desc" },
      ...(limit > 0 ? { take: limit } : {}),
    });

    if (propositions.length === 0) {
      return Response.json({
        insights: {
          message: "Commencez vos premières analyses pour recevoir des insights",
          patterns: [],
          recommendation: "Analysez vos premiers choix",
        },
      });
    }

    // Generate insights
    const scores = propositions.map((p) => p.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    const patterns = detectPatterns(propositions);
    const recommendation = generateRecommendation(avgScore, patterns);

    return Response.json({
      insights: {
        analysisCount: propositions.length,
        averageScore: Math.round(avgScore),
        patterns,
        recommendation,
        tier: user.subscription?.tier || "free",
        totalAnalyses: propositions.length,
      },
    });
  } catch (error) {
    console.error("[API /analytics/insights] Error:", error);
    return Response.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}

function detectPatterns(propositions: any[]) {
  const patterns = [];

  // High score pattern
  const highScores = propositions.filter((p) => p.score > 75).length;
  if (highScores > propositions.length / 2) {
    patterns.push("🟢 Vous prenez généralement de bonnes décisions");
  }

  // Low score pattern
  const lowScores = propositions.filter((p) => p.score < 40).length;
  if (lowScores > propositions.length / 2) {
    patterns.push("🔴 Vous hésitez souvent avant de décider");
  }

  // Consistent pattern
  const variance =
    propositions.length > 1
      ? Math.sqrt(
          propositions
            .map((p) => p.score)
            .reduce(
              (acc, score, _, arr) =>
                acc +
                Math.pow(
                  score - arr.reduce((a, b) => a + b, 0) / arr.length,
                  2
                ),
              0
            ) / propositions.length
        )
      : 0;

  if (variance < 15) {
    patterns.push("📊 Votre style de décision est très cohérent");
  } else if (variance > 30) {
    patterns.push("🎢 Vous adaptez votre approche selon les situations");
  }

  return patterns;
}

function generateRecommendation(avgScore: number, patterns: string[]) {
  if (avgScore > 75) {
    return "Continuez avec votre approche actuelle, vos analyses sont excellentes!";
  } else if (avgScore > 60) {
    return "Vous êtes sur la bonne voie. Pensez à prendre plus de temps pour certaines décisions.";
  } else if (avgScore > 40) {
    return "Essayez de peser plus les conséquences avant de décider.";
  } else {
    return "Prenez du recul lors de vos prochaines décisions importantes.";
  }
}
