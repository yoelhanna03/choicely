import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
export const revalidate = 30; // Cache 30 secondes pour le dernier bilan

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const bilan = await db.bilan.findFirst({
      where: { by_email: session.user.email },
      orderBy: { createdAt: "desc" },
      select: { bilan: true, createdAt: true },
    });

    console.log("[API /bilan/last] Email:", session.user.email, "=> Trouvé:", !!bilan);
    return NextResponse.json({ bilan: bilan?.bilan ?? null });
  } catch (error: any) {
    console.error("[API /bilan/last] Erreur:", error?.message);
    return NextResponse.json({ bilan: null, error: error?.message }, { status: 500 });
  }
}