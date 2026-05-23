import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getUserIdByEmail } from "@/lib/collab-utils";
import { OpenAI } from "openai";

const client = new OpenAI({
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
  try {
    const session = await auth();
    if (!session?.user?.email)
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    // log incoming request for easier debugging in production (temporary)
    try {
      const headerObj: Record<string, string> = {};
      req.headers.forEach((v, k) => (headerObj[k] = v));
      console.log("Collab POST incoming", {
        url: req.url,
        method: req.method,
        params,
        headers: headerObj,
      });
    } catch (e) {
      console.warn("Failed to serialize headers for logging", e);
    }

    const routeParams = await params;
    const roomId = routeParams?.id;
    if (!roomId) {
      console.error("Collab message POST: missing roomId in params", {
        params: routeParams,
      });
      return NextResponse.json(
        { error: "Identifiant de salle manquant" },
        { status: 400 },
      );
    }

    // ensure room exists
    const body = await req.json();
    const content = body?.content;
    if (!content || typeof content !== "string") {
      console.error("Collab message POST: missing/invalid content", {
        params,
        body,
        session: { email: session.user?.email, name: session.user?.name },
      });
      return NextResponse.json({ error: "Contenu manquant" }, { status: 400 });
    }

    const roomExists = await (db as any).collaborationRoom.findUnique({
      where: { id: roomId },
    });
    if (!roomExists) {
      console.error("Collab message POST: room not found", { roomId, body });
      return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
    }

    const userId = await getUserIdByEmail(session.user.email as string);
    const senderName = session.user.name ?? session.user.email;

    const msg = await (db as any).collaborationMessage.create({
      data: {
        roomId,
        senderId: userId ?? undefined,
        senderName: senderName as string,
        content,
        isAi: false,
      },
    });

    // notify socket server to broadcast this message
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
      console.warn("Failed to notify socket server", e);
    }

    // Generate AI assistant reply (async, but we'll create and return immediately)
    (async () => {
      try {
        if (!process.env.HUGGINGFACE_API_KEY) return;
        const prompt = `Assistant de collaboration — résumé et proposition d'action pour la salle. Message utilisateur: ${content}`;
        const resp = await client.chat.completions.create({
          model: "deepseek-ai/DeepSeek-V4-Pro:novita",
          messages: [
            {
              role: "system",
              content:
                "Vous êtes un assistant de collaboration qui aide les participants.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 250,
        });
        const aiText = resp.choices?.[0]?.message?.content ?? "";
        const aiMsg = await (db as any).collaborationMessage.create({
          data: { roomId, content: aiText, isAi: true },
        });
        try {
          const socketUrl = getSocketUrl();
          await fetch(`${socketUrl}/emit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomId,
              payload: {
                id: aiMsg.id,
                content: aiMsg.content,
                senderName: "Assistant IA",
                isAi: true,
                createdAt: aiMsg.createdAt,
              },
            }),
          });
        } catch (e) {
          console.warn("Failed to notify socket server for AI message", e);
        }
      } catch (e) {
        console.error("AI reply failed", e);
      }
    })();

    return NextResponse.json({ msg });
  } catch (error) {
    console.error("Collab message POST failed", {
      params,
      error,
    });
    return NextResponse.json(
      { error: "Erreur interne du serveur. Veuillez réessayer." },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: any }) {
  try {
    const routeParams = await params;
    const roomId = routeParams?.id;
    const messages = await (db as any).collaborationMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Collab messages GET failed", error);
    return NextResponse.json(
      { error: "Impossible de charger les messages. Veuillez réessayer." },
      { status: 500 },
    );
  }
}
