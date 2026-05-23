import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getUserIdByEmail } from "@/lib/collab-utils";
import { OpenAI } from "openai";

const aiClient = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HUGGINGFACE_API_KEY,
});

function normalizeSocketUrl(raw: string) {
  try {
    const url = new URL(raw);
    const isLocalhost = ["localhost", "127.0.0.1"].includes(url.hostname);
    if (!isLocalhost && url.protocol === "https:") {
      url.port = "";
      return url.toString().replace(/\/$/, "");
    }
    return raw;
  } catch {
    return raw;
  }
}

function getSocketUrl() {
  const raw =
    process.env.SOCKET_URL ||
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    "http://localhost:4000";
  return normalizeSocketUrl(raw);
}

export async function POST(req: NextRequest, { params }: { params: any }) {
  const routeParams = await params;
  const roomId = routeParams?.id;
  if (!roomId)
    return NextResponse.json(
      { error: "Identifiant de salle manquant" },
      { status: 400 },
    );

  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = await getUserIdByEmail(session.user.email as string);
  const room = await (db as any).collaborationRoom.findUnique({
    where: { id: roomId },
    include: { members: true },
  });
  if (!room)
    return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });

  const isMember =
    room.createdBy === userId ||
    room.createdBy === session.user.email ||
    room.members.some((m: any) => m.userId === userId);
  if (!isMember)
    return NextResponse.json(
      { error: "Accès refusé : vous devez être membre de la salle." },
      { status: 403 },
    );

  if (!process.env.HUGGINGFACE_API_KEY)
    return NextResponse.json(
      { error: "Clé d'API IA manquante" },
      { status: 500 },
    );

  try {
    const prompt = `Tu es un assistant de collaboration. Résume rapidement l'objectif de la salle \"${room.name}\" et propose 3 actions concrètes que les participants peuvent réaliser ensemble.`;
    const response = await aiClient.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V4-Pro:novita",
      messages: [
        {
          role: "system",
          content:
            "Vous êtes un assistant de collaboration qui aide une équipe à clarifier ses objectifs et ses prochaines actions.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 240,
    });
    const aiText =
      response.choices?.[0]?.message?.content ??
      "Assistant IA : résumé indisponible.";

    const message = await (db as any).collaborationMessage.create({
      data: {
        roomId,
        senderName: "Assistant IA",
        content: aiText,
        isAi: true,
      },
    });

    try {
      const socketUrl = getSocketUrl();
      await fetch(`${socketUrl}/emit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          payload: {
            id: message.id,
            content: message.content,
            senderName: "Assistant IA",
            isAi: true,
            createdAt: message.createdAt,
          },
        }),
      });
    } catch (e) {
      console.warn("Failed to notify socket server for AI summary", e);
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("AI summary failed", error);
    return NextResponse.json(
      { error: "Impossible de générer le résumé IA." },
      { status: 500 },
    );
  }
}
