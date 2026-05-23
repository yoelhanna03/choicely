import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getUserIdByEmail } from "@/lib/collab-utils";

export async function DELETE(req: NextRequest, { params }: { params: any }) {
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
  });

  if (!room)
    return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });

  const isCreator =
    room.createdBy === userId || room.createdBy === session.user.email;
  if (!isCreator)
    return NextResponse.json(
      { error: "Accès refusé : seul le créateur peut supprimer la salle." },
      { status: 403 },
    );

  await (db as any).collaborationRoom.delete({
    where: { id: roomId },
  });

  return NextResponse.json({ ok: true });
}
