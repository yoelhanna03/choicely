import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: any }) {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const roomId = params.id;
  const { email } = await req.json();
  if (!email)
    return NextResponse.json({ error: "Email requis" }, { status: 400 });

  const room = await (db as any).collaborationRoom.findUnique({
    where: { id: roomId },
    include: { members: true },
  });
  if (!room)
    return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });

  const currentUser = await db.user.findUnique({
    where: { email: session.user.email },
  });
  if (!currentUser)
    return NextResponse.json(
      { error: "Utilisateur introuvable" },
      { status: 404 },
    );

  const isMember =
    room.createdBy === currentUser.id ||
    room.members.some((m: any) => m.userId === currentUser.id);
  if (!isMember)
    return NextResponse.json(
      {
        error: "Accès refusé. Vous devez être membre de la salle pour inviter.",
      },
      { status: 403 },
    );

  const invitedUser = await db.user.findUnique({ where: { email } });
  if (!invitedUser)
    return NextResponse.json(
      { error: "Utilisateur non trouvé. Envoyez un lien d'invitation plutôt." },
      { status: 404 },
    );

  const exists = await (db as any).collaborationMember.findFirst({
    where: { roomId, userId: invitedUser.id },
  });
  if (exists)
    return NextResponse.json({ ok: true, message: "Utilisateur déjà invité" });

  const member = await (db as any).collaborationMember.create({
    data: { roomId, userId: invitedUser.id },
  });
  return NextResponse.json({ member });
}
