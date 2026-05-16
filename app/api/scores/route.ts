import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const propositions = await db.question.findMany({
    where: { by_email: session.user.email },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      score: true,
      question: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ scores: propositions });
}