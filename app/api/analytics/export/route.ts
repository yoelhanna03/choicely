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

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has PDF export feature (Pro+ tiers)
    if (!["pro", "premium"].includes(user.subscription?.tier || "")) {
      return Response.json(
        {
          error: "Feature available for Pro and Premium tiers only",
        },
        { status: 403 }
      );
    }

    // Fetch propositions
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

    // Generate PDF data (content only, client-side will use html2pdf)
    const pdfContent = {
      title: "Rapport d'Analyse Choicely",
      generatedAt: new Date().toLocaleString("fr-FR"),
      analyses: propositions.map((p) => ({
        id: p.id,
        question: p.question || "Sans titre",
        analysis: p.ia_prop,
        score: p.score,
        createdAt: new Date(p.createdAt).toLocaleDateString("fr-FR"),
      })),
      stats: {
        totalAnalyses: propositions.length,
        averageScore: Math.round(
          propositions.reduce((sum, p) => sum + p.score, 0) /
            propositions.length
        ),
        bestScore: Math.max(...propositions.map((p) => p.score)),
      },
    };

    return Response.json(pdfContent);
  } catch (error) {
    console.error("[API /analytics/export] Error:", error);
    return Response.json(
      { error: "Failed to prepare export" },
      { status: 500 }
    );
  }
}
