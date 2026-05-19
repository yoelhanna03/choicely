import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Récupérer la session
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;

    // Supprimer toutes les données associées à l'utilisateur en utilisant une transaction
    await db.$transaction([
      // Supprimer les propositions IA
      db.proposition.deleteMany({
        where: { for_email: userEmail },
      }),
      // Supprimer les bilans
      db.bilan.deleteMany({
        where: { by_email: userEmail },
      }),
      // Supprimer les questions
      db.question.deleteMany({
        where: { by_email: userEmail },
      }),
      // Supprimer l'utilisateur (les sessions et accounts sont supprimées en cascade)
      db.user.delete({
        where: { email: userEmail },
      }),
    ]);

    return NextResponse.json(
      { message: "Compte supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression du compte" },
      { status: 500 }
    );
  }
}
