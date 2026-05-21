/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { consumeCredits, canPerformAction } from "@/lib/subscription-utils";
import { CREDIT_COSTS } from "@/lib/subscription-constants";
export const revalidate = 0; // Désactiver le cache pour POST (génération)

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HUGGINGFACE_API_KEY,
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const bilans = await db.bilan.findMany({
    where: { by_email: session.user.email },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ bilans });
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { analyseData, question, score } = await req.json();

    const hasCredits = await canPerformAction(session.user.email, CREDIT_COSTS.BILAN);
    if (!hasCredits) {
      return NextResponse.json(
        { error: "Crédits insuffisants pour générer ce bilan." },
        { status: 402 }
      );
    }

    // Récupère les 3 dernières analyses avec scores
    const previousQuestions = await db.question.findMany({
      where: { by_email: session.user.email },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { question: true, score: true, createdAt: true },
    });

    const contextHistorique = previousQuestions
      .map((q) => `${q.question} (Score: ${q.score}/100)`)
      .join("\n");

    const chatCompletion = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V4-Pro:novita",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en synthèse stratégique et mentorat décisionnel. Tu dois créer un bilan concis et actionnable basé sur les analyses récentes de l'utilisateur. Sois encourageant mais honnête. Fais quelque chose de simple qui a du sens (2-3 phrases max).Donne quelque chose de simple et comprehensible."
        },
        {
          role: "user",
          content: `
            HISTORIQUE RÉCENT DE L'UTILISATEUR :
            ${contextHistorique || "Aucun historique disponible."}

            NOUVELLE ANALYSE :
            Question: ${question}
            Analyse: ${analyseData}
            Score: ${score}/100

            Fais un bilan synthétique qui lit le tout et donne une direction claire pour son tableau de bord :
          `,
        },
      ],
      max_tokens: 300,
    });

    const bilanContent = chatCompletion.choices[0].message.content;

    // Sauvegarde le bilan avec la date et l'email
    const newBilan = await db.bilan.create({
      data: {
        bilan: bilanContent ?? "",
        by_email: session.user.email,
        isbilan: true,
      },
    });

    await consumeCredits(session.user.email, CREDIT_COSTS.BILAN);

    return NextResponse.json({
      bilan: bilanContent ?? "Impossible de générer le bilan.",
      bilanId: newBilan.id,
    });

  } catch (error: any) {
    console.error("[API /bilan] Erreur complète:", {
      message: error?.message,
      stack: error?.stack,
    });

    const message = String(error?.message ?? "").toLowerCase();
    const isQuotaError =
      error?.status === 402 ||
      message.includes("depleted") ||
      message.includes("included credits") ||
      message.includes("quota");

    if (isQuotaError) {
      return NextResponse.json(
        {
          error:
            "Le quota de l'API est épuisé. Merci de réessayer plus tard ou de soutenir le projet via /donate.",
          detail: error?.message,
        },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la génération du bilan.", detail: error?.message },
      { status: 500 }
    );
  }
}