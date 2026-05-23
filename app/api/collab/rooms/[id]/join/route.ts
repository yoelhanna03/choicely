import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getUserIdByEmail, allowedMembersCount } from "@/lib/collab-utils";

export async function POST(req: NextRequest, { params }: { params: any }) {
  try {
    const session = await auth();
    if (!session?.user?.email)
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const routeParams = await params;
    const roomId = routeParams?.id;
    const room = await (db as any).collaborationRoom.findUnique({
      where: { id: roomId },
      include: { members: true },
    });
    if (!room)
      return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });

    const userId = await getUserIdByEmail(session.user.email as string);
    if (!userId)
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 },
      );

    const maxAllowed = room.maxMembers;
    if (room.members.length >= maxAllowed) {
      return NextResponse.json(
        { error: "La salle est pleine." },
        { status: 403 },
      );
    }

    const exists = await (db as any).collaborationMember.findFirst({
      where: { roomId, userId },
    });
    if (exists) return NextResponse.json({ ok: true, message: "Déjà membre" });

    const member = await (db as any).collaborationMember.create({
      data: { roomId, userId },
    });
    return NextResponse.json({ member });
  } catch (error) {
    console.error("Collab join failed", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur. Veuillez réessayer." },
      { status: 500 },
    );
  }
}
