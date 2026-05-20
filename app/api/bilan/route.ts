/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { auth } from "@/auth";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HUGGINGFACE_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { analyseData } = await req.json();

    const previousPropositions = await db.proposition.findMany({
      where: { for_email: session.user.email },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    const contextHistorique = previousPropositions
      .map((p, index) => `Analyse ${index + 1}: ${p.ia_prop}`)
      .join("\n\n");

    const chatCompletion = await client.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-405B-Instruct",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en synthèse stratégique. Ton rôle est de prendre l'analyse actuelle et l'historique des réflexions de l'utilisateur pour en extraire un bilan concis (2-3 phrases)(vaut mieux faire quelque chose de simple qui a du sens que quelque chose de compliqué qui n'a aucun sens). Identifie une tendance ou une direction claire."
        },
        {
          role: "user",
          content: `
            HISTORIQUE RÉCENT :
            ${contextHistorique || "Aucun historique disponible."}

            ANALYSE ACTUELLE :
            ${analyseData}

            Fais-en un bilan synthétique qui lie le tout pour mon tableau de bord :
          `,
        },
      ],
      max_tokens: 250,
    });

    const bilanContent = chatCompletion.choices[0].message.content;

    await db.bilan.create({
      data: {
        bilan: bilanContent ?? "",
        by_email: session.user.email,
      },
    });

    return NextResponse.json({
      bilan: bilanContent ?? "Impossible de générer le bilan.",
    });

  } catch (error: any) {
    console.error("Erreur API Bilan:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du bilan." },
      { status: 500 }
    );
  }
}