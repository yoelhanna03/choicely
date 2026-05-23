import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getUserIdByEmail, getUserTier } from "@/lib/collab-utils";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

  const tier = await getUserTier(session.user.email);
  if (tier !== "pro" && tier !== "premium")
    return NextResponse.json(
      { error: "Export PDF réservé aux abonnements Pro et Premium." },
      { status: 403 },
    );

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

  const choices = await (db as any).collaborationChoice.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
  });

  const pdfDoc = await PDFDocument.create();
  let currentPage = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 40;
  let y = currentPage.getHeight() - margin;

  currentPage.drawText(`Choix de la salle : ${room.name}`, {
    x: margin,
    y,
    size: 22,
    font: boldFont,
    color: rgb(0.12, 0.18, 0.29),
  });

  y -= 32;
  currentPage.drawText(
    `Export généré le ${new Date().toLocaleString("fr-FR")}`,
    {
      x: margin,
      y,
      size: 12,
      font,
      color: rgb(0.29, 0.35, 0.42),
    },
  );

  y -= 36;
  const columnPositions = [margin, margin + 140, margin + 320, margin + 510];
  const rowHeight = 18;

  currentPage.drawRectangle({
    x: margin,
    y: y - 10,
    width: currentPage.getWidth() - margin * 2,
    height: rowHeight + 8,
    color: rgb(0.95, 0.96, 0.98),
  });

  currentPage.drawText("Membre", {
    x: columnPositions[0],
    y,
    size: 11,
    font: boldFont,
    color: rgb(0.07, 0.09, 0.15),
  });
  currentPage.drawText("Choix", {
    x: columnPositions[1],
    y,
    size: 11,
    font: boldFont,
    color: rgb(0.07, 0.09, 0.15),
  });
  currentPage.drawText("Précisions", {
    x: columnPositions[2],
    y,
    size: 11,
    font: boldFont,
    color: rgb(0.07, 0.09, 0.15),
  });
  currentPage.drawText("Date", {
    x: columnPositions[3],
    y,
    size: 11,
    font: boldFont,
    color: rgb(0.07, 0.09, 0.15),
  });

  y -= rowHeight + 12;

  for (const [index, choice] of choices.entries()) {
    if (y < margin + 60) {
      currentPage = pdfDoc.addPage([595.28, 841.89]);
      y = currentPage.getHeight() - margin;
    }

    if (index % 2 === 0) {
      currentPage.drawRectangle({
        x: margin,
        y: y - 6,
        width: currentPage.getWidth() - margin * 2,
        height: rowHeight + 4,
        color: rgb(0.97, 0.98, 0.99),
      });
    }

    currentPage.drawText(choice.userName ?? "Inconnu", {
      x: columnPositions[0],
      y,
      size: 10,
      font,
      color: rgb(0.07, 0.09, 0.15),
      maxWidth: 130,
    });
    currentPage.drawText(choice.choice, {
      x: columnPositions[1],
      y,
      size: 10,
      font,
      color: rgb(0.07, 0.09, 0.15),
      maxWidth: 170,
    });
    currentPage.drawText(choice.note ?? "-", {
      x: columnPositions[2],
      y,
      size: 10,
      font,
      color: rgb(0.07, 0.09, 0.15),
      maxWidth: 175,
    });
    currentPage.drawText(new Date(choice.createdAt).toLocaleString("fr-FR"), {
      x: columnPositions[3],
      y,
      size: 10,
      font,
      color: rgb(0.07, 0.09, 0.15),
      maxWidth: 80,
    });

    y -= rowHeight + 8;
  }

  const buffer = Buffer.from(await pdfDoc.save());
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="choix-${room.name.replaceAll(/[^a-zA-Z0-9_-]/g, "_")}.pdf"`,
    },
  });
}
