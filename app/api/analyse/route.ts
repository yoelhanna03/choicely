import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { db } from "@/lib/db";
import { auth } from "@/auth";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HUGGINGFACE_API_KEY,
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ questions: [] });
    }

    const questions = await db.question.findMany({
      where: { by_email: session.user.email },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Erreur GET /api/analyse :", error);
    return NextResponse.json({ questions: [] });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { situation, choice } = await req.json();

    if (!situation) {
      return NextResponse.json({ error: "Situation manquante" }, { status: 400 });
    }

    // 1️⃣ Analyse IA complète
    const chatCompletion = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V4-Pro:novita",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant d'aide à la décision. Réponds de manière concise, encourage, sois sympa et prends tout en compte. Ne répète pas ce que l'utilisateur a dit."
        },
        {
          role: "user",
          content: `Situation : ${situation}\nChoix : ${choice || "Aucun"}\n\nAnalyse et conseils :`,
        },
      ],
      max_tokens: 800,
    });

    const result = chatCompletion.choices[0].message.content ?? "";

    // 2️⃣ Résumé ultra court (max 6 mots)
    const summaryCompletion = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V4-Pro:novita",
      messages: [
        {
          role: "system",
          content: "Résume cette question en maximum 6 mots. Donne juste un titre court. Pas de phrases complètes.(quelque chose de simple)"
        },
        {
          role: "user",
          content: situation,
        },
      ],
      max_tokens: 20,
    });

    const summary = summaryCompletion.choices[0].message.content?.trim() ?? "Résumé indisponible";

    // 3️⃣ Score d'importance 0–100
    const scoreCompletion = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V4-Pro:novita",
      messages: [
        {
          role: "system",
          content: "Analyse cette question et retourne un score entre 0 et 100 indiquant à quel point c'est une bonne chose ou une bonne habitude(sois sympa sur les score). Retourne uniquement un nombre, rien d'autre (évite les multiples de 5, ex: 73, 76, 78...)."
        },
        {
          role: "user",
          content: `Situation : ${situation}\nChoix : ${choice || "Aucun"}`,
        },
      ],
      max_tokens: 5,
    });

    const scoreText = scoreCompletion.choices[0].message.content ?? "0";
    const scoreMatch = scoreText.match(/\d+/);
    const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[0]))) : 50;
    // 4️⃣ Sauvegarde DB
    await db.proposition.create({
      data: {
        ia_prop: result,
        for_email: session.user.email,
      },
    });

    // ✅ db.question (pas db.questions)
    await db.question.create({
      data: {
        by_email: session.user.email,
        question: summary,
        score: score,
      },
    });

    return NextResponse.json({ result, summary, score });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Erreur API via HF Router:", error);
    return NextResponse.json(
      { error: "Le modèle est indisponible ou le quota est atteint.", details: error?.message },
      { status: error?.status || 500 }
    );
  }
}