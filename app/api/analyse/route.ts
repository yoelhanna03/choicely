// app/api/analyse/route.ts
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export const revalidate = 60; // Cache 60 secondes pour les questions

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
      select: { id: true, question: true, score: true, createdAt: true },
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

    const modelName = "deepseek-ai/DeepSeek-V4-Pro:novita";

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
        max_tokens: 1200,
      }),

      // 2️⃣ Résumé court
      client.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: "system",
            content: "Résume cette question en maximum 6 mots. Donne juste un titre court. Pas de phrases complètes (quelque chose de simple). Donne des titres général: pas de verbe conjugué, pas de pronom personnel. "
          },
          {
            role: "user",
            content: situation,
          },
        ],
        max_tokens: 50,
      }),

      // 3️⃣ Score d'importance
      client.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: "system",
            content: "Tu dois retourner UNIQUEMENT un nombre entre 0 et 100 (0=très mauvais, 50=moyen, 100=excellent). Ne retourne que le nombre, rien d'autre. Pas de texte, pas d'explication, pas de markdown. Juste le chiffre.Si par exemple ton score est de 50 retourne quelque chose comme 49, 51, 52, 48."
          },
          {
            role: "user",
            content: `Situation : ${situation}\nChoix : ${choice || "Aucun"}\n\nDonne un score entre 0 et 100:`,
          },
        ],
        max_tokens: 300,
      })
    ]);

    // Extraction des données de manière sécurisée
    const result = chatCompletion.choices[0]?.message?.content ?? "";
    
    // 🧽 NETTOYAGE SUMMARY - Enlever les balises <think> de DeepSeek
    let summaryRaw = summaryCompletion.choices[0]?.message?.content?.trim() ?? "";
    console.log("[API /analyse] Summary RAW:", { raw: summaryRaw.slice(0, 100) });
    
    if (summaryRaw.includes("</think>")) {
      const parts = summaryRaw.split("</think>");
      summaryRaw = parts[parts.length - 1].trim();
    }
    
    // Nettoyage et fallback intelligent
    let summary = summaryRaw.replace(/["']/g, "").trim();
    if (!summary || summary.length < 2) {
      // Fallback: prendre les 6 premiers mots de la situation
      summary = situation.split(" ").slice(0, 6).join(" ") || "Question sans titre";
    }
    console.log("[API /analyse] Summary FINAL:", { summary });
    
    // 🧽 NETTOYAGE SÉCURISÉ DU SCORE (Gestion de la chaîne de pensée / <think> de DeepSeek)
    let scoreText = scoreCompletion.choices[0]?.message?.content?.trim() ?? "50";

    // Si DeepSeek a inclus ses balises de réflexion, on ne garde que ce qui est APRES
    if (scoreText.includes("</think>")) {
      const parts = scoreText.split("</think>");
      scoreText = parts[parts.length - 1].trim();
    }

    // On extrait le tout premier groupe de chiffres trouvé dans le texte restant
    const match = scoreText.match(/\d+/); 
    
    let score = 50; // Score par défaut en cas de réponse totalement vide/invalide de l'IA
    if (match) {
      const parsedScore = parseInt(match[0], 10);
      // On bride le score pour qu'il soit impérativement compris entre 0 et 100
      score = Math.min(100, Math.max(0, parsedScore));
    }

    console.log("[API /analyse] Données créées:", { summary, score });

    // 4️⃣ Sauvegardes en Base de données
    await db.proposition.create({
      data: {
        ia_prop: result,
        for_email: session.user.email,
        question: summary, 
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