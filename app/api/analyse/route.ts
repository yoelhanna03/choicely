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

    const modelName = "meta-llama/Meta-Llama-3.1-405B-Instruct";

    // 🔥 OPTIMISATION : On lance les 3 appels IA en PARALLÈLE pour éviter le timeout
    const [chatCompletion, summaryCompletion, scoreCompletion] = await Promise.all([
      // 1️⃣ Analyse complète
      client.chat.completions.create({
        model: modelName,
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
      }),

      // 2️⃣ Résumé court
      client.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: "system",
            content: "Résume cette question en maximum 6 mots. Donne juste un titre court. Pas de phrases complètes (quelque chose de simple)."
          },
          {
            role: "user",
            content: situation,
          },
        ],
        max_tokens: 20,
      }),

      // 3️⃣ Score d'importance
      client.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: "system",
            content: "Analyse cette question et retourne un score entre 0 et 100 indiquant à quel point c'est une bonne chose ou une bonne habitude. Retourne UNIQUEMENT le nombre brut, sans texte autour, sans markdown.PS : si par exemple le score est de 50 retourne quelque chose de autor comme 49 ou 51 ou encore 48 ou 52."
          },
          {
            role: "user",
            content: `Situation : ${situation}\nChoix : ${choice || "Aucun"}`,
          },
        ],
        max_tokens: 10,
      })
    ]);

    // Extraction des données de manière sécurisée
    const result = chatCompletion.choices[0]?.message?.content ?? "";
    const summary = summaryCompletion.choices[0]?.message?.content?.trim().replace(/["']/g, "") ?? "Résumé indisponible";
    
    // Nettoyage robuste du score
    const scoreText = scoreCompletion.choices[0]?.message?.content ?? "50";
    const scoreMatch = scoreText.match(/\d+/);
    const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[0], 10))) : 50;

    // 4️⃣ Sauvegardes en Base de données (exécutées l'une après l'autre pour garantir la cohérence)
    await db.proposition.create({
      data: {
        ia_prop: result,
        for_email: session.user.email,
        question: summary, // Tu as un champ question vide par défaut dans ton schéma Proposition, profites-en !
        score: score
      },
    });

    const newQuestion = await db.question.create({
      data: {
        by_email: session.user.email,
        question: summary,
        score: score,
      },
    });

    // On retourne les données, incluant la question fraîchement créée
    return NextResponse.json({ result, summary, score, questionId: newQuestion.id });

  } catch (error: any) {
    console.error("Erreur critique API Analyse:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement.", details: error?.message },
      { status: 500 }
    );
  }
}