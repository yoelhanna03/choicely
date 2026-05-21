import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { consumeCredits, canPerformAction } from "@/lib/subscription-utils";
import { CREDIT_COSTS } from "@/lib/subscription-constants";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { situation } = await req.json();

    if (!situation?.trim()) {
      return NextResponse.json({ error: "Situation manquante" }, { status: 400 });
    }

    const hasCredits = await canPerformAction(session.user.email, CREDIT_COSTS.SIMULATION);
    if (!hasCredits) {
      return NextResponse.json(
        { error: "Crédits insuffisants pour cette simulation." },
        { status: 402 }
      );
    }

    const HF_KEY = process.env.HUGGINGFACE_API_KEY;
    if (!HF_KEY) {
      return NextResponse.json({ error: "Clé API manquante" }, { status: 500 });
    }

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-ai/DeepSeek-V4-Pro:novita",
          messages: [
            {
              role: "system",
              content: "Tu es une IA d'analyse stratégique experte. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans backticks.",
            },
            {
              role: "user",
              content: `Analyse PROFESSIONNELLEMENT la situation suivante : "${situation}"

Retourne UNIQUEMENT ce JSON valide :
{
  "title": "Titre concis de la situation",
  "summary": "Résumé exécutif en 1-2 phrases",
  "overallScore": 6.5,
  "rows": [
    { 
      "id": "1",
      "category": "Catégorie (ex: Marché, Interne, Externe)",
      "factor": "Facteur clé identifié",
      "impact": "Élevé|Moyen|Faible",
      "urgency": "Critique|Haute|Normale|Basse",
      "probability": 0.75,
      "analysis": "Analyse détaillée de ce facteur",
      "recommendation": "Action concrète recommandée",
      "score": 7.5
    }
  ],
  "nodes": [
    { "id": "root", "label": "Situation centrale", "x": 400, "y": 50, "category": "Situation" },
    { "id": "c1", "parent": "root", "label": "Facteur clé 1", "x": 100, "y": 220, "category": "Catégorie1", "impact": "Élevé" },
    { "id": "c2", "parent": "root", "label": "Facteur clé 2", "x": 400, "y": 220, "category": "Catégorie2", "impact": "Moyen" },
    { "id": "c3", "parent": "root", "label": "Facteur clé 3", "x": 700, "y": 220, "category": "Catégorie3", "impact": "Faible" }
  ]
}`,
            },
          ],
          max_tokens: 1500,
          temperature: 0.3,
        }),
      }
    );

    const result = await response.json();
    const raw = result.choices?.[0]?.message?.content;

    if (!raw) {
      return NextResponse.json(
        { error: "Réponse invalide du modèle", data: result },
        { status: 500 }
      );
    }

    const match = String(raw).match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json(
        { error: "Aucun JSON valide dans la réponse", raw },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(match[0]);

    await consumeCredits(session.user.email, CREDIT_COSTS.SIMULATION);

    return NextResponse.json({
      title: parsed.title || "Analyse stratégique",
      summary: parsed.summary || "",
      overallScore: parsed.overallScore || 0,
      table: JSON.stringify({ 
        rows: parsed.rows,
        title: parsed.title,
        summary: parsed.summary,
        overallScore: parsed.overallScore
      }),
      map: JSON.stringify({ nodes: parsed.nodes }),
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}