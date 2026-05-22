import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  canCreateCollab,
  allowedMembersCount,
  getUserIdByEmail,
  getUserTier,
} from "@/lib/collab-utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ rooms: [] });

  const rooms = await (db as any).collaborationRoom.findMany({
    where: {
      OR: [{ createdBy: user.id }, { members: { some: { userId: user.id } } }],
    },
    include: {
      members: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  // mark which rooms the current user created
  const enriched = rooms.map((r: any) => ({
    ...r,
    isCreator: r.createdBy === user.id,
  }));

  return NextResponse.json({ rooms: enriched });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const allowed = await canCreateCollab(session.user.email);
  if (!allowed)
    return NextResponse.json(
      { error: "Fonctionnalité réservée aux abonnements Pro et Premium." },
      { status: 403 },
    );

  const body = await req.json();
  const name = body.name?.toString()?.trim() ?? "Salle de collaboration";

  const max = await allowedMembersCount(session.user.email);
  const userId = await getUserIdByEmail(session.user.email as string);
  const userTier = await getUserTier(session.user.email);

  // limit number of rooms created by a Pro to 3 active rooms
  if (userId && userTier === "pro") {
    const createdCount = await (db as any).collaborationRoom.count({
      where: { createdBy: userId, isActive: true },
    });
    if (createdCount >= 3) {
      return NextResponse.json(
        {
          error:
            "Limite de création atteinte pour le plan Pro (3 salles actives).",
        },
        { status: 403 },
      );
    }
  }

  const room = await (db as any).collaborationRoom.create({
    data: {
      name,
      createdBy: userId ?? session.user.email!,
      maxMembers: max,
      tier: userTier,
    },
  });

  // add creator as member
  if (userId) {
    await (db as any).collaborationMember.create({
      data: { roomId: room.id, userId },
    });
  }

  return NextResponse.json({ room });
}
