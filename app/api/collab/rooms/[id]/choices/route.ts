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

export async function GET(req: NextRequest, { params }: { params: any }) {
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

  const room = await (db as any).collaborationRoom.findUnique({
    where: { id: roomId },
    include: { members: true },
  });
  if (!room)
    return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });

  const userId = await getUserIdByEmail(session.user.email as string);
  const isMember =
    room.createdBy === userId ||
    room.createdBy === session.user.email ||
    room.members.some((m: any) => m.userId === userId);
  if (!isMember)
    return NextResponse.json(
      { error: "Accès refusé : vous devez être membre de la salle." },
      { status: 403 },
    );

  const choices = await (db as any).collaborationChoice.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ choices });
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

  const body = await req.json();
  const choice = body?.choice?.toString()?.trim();
  const note = body?.note?.toString()?.trim();
  if (!choice)
    return NextResponse.json({ error: "Choix requis" }, { status: 400 });

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

  const userName = session.user.name ?? session.user.email;
  const choiceRecord = await (db as any).collaborationChoice.create({
    data: {
      roomId,
      userId: userId ?? undefined,
      userName: userName as string,
      choice,
      note,
    },
  });

  // Create an AI summary message for the room
  if (process.env.HUGGINGFACE_API_KEY) {
    try {
      const prompt = `Un membre a fait un choix pour la salle \"${room.name}\". Choix: ${choice}. ${note ? `Précisions: ${note}.` : ""} Fais un message clair et inspirant qui annonce cette décision à l'équipe et propose les prochaines étapes.`;
      const response = await aiClient.chat.completions.create({
        model: "deepseek-ai/DeepSeek-V4-Pro:novita",
        messages: [
          {
            role: "system",
            content:
              "Vous êtes un assistant de collaboration qui informe l'équipe de la décision prise et propose des actions concrètes.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 220,
      });
      const aiText =
        response.choices?.[0]?.message?.content ??
        `Le choix "${choice}" a été enregistré.`;
      const msg = await (db as any).collaborationMessage.create({
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
              id: msg.id,
              content: msg.content,
              senderName: msg.senderName,
              isAi: msg.isAi,
              createdAt: msg.createdAt,
            },
          }),
        });
      } catch (e) {
        console.warn("Failed to notify socket server for AI choice", e);
      }
    } catch (error) {
      console.warn("AI choice summary failed", error);
    }
  }

  return NextResponse.json({ choice: choiceRecord });
}
