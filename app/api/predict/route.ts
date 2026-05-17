import { NextResponse } from "next/server";
import { auth } from "@/auth";
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
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages: [
            {
              role: "system",
              content: "Tu es une IA d'analyse stratégique experte. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans backticks.",
            },
            {
              role: "user",
              content: `Analyse la situation suivante : "${situation}"

Retourne UNIQUEMENT ce JSON :
{
  "rows": [
    { "condition": "Condition claire", "analyse": "Analyse détaillée", "conclusion": "Conclusion actionnable" }
  ],
  "nodes": [
    { "id": "root", "label": "Situation centrale", "x": 400, "y": 50 },
    { "id": "c1", "parent": "root", "label": "Facteur clé 1", "x": 100, "y": 220 },
    { "id": "c2", "parent": "root", "label": "Facteur clé 2", "x": 400, "y": 220 },
    { "id": "c3", "parent": "root", "label": "Facteur clé 3", "x": 700, "y": 220 }
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

    return NextResponse.json({
      table: JSON.stringify({ rows: parsed.rows }),
      map: JSON.stringify({ nodes: parsed.nodes }),
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}