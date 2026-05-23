import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getUserIdByEmail, getUserTier } from "@/lib/collab-utils";
import PDFDocument from "pdfkit";

function bufferFromPdf(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
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

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#1f2937")
    .text(`Choix de la salle : ${room.name}`);
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor("#4b5563");
  doc.text(`Export généré le ${new Date().toLocaleString("fr-FR")}`);
  doc.moveDown(1);

  const tableTop = doc.y;
  const columnWidths = [120, 160, 180, 120];

  doc.fontSize(11).fillColor("#111827");
  doc.text("Membre", 40, tableTop, { width: columnWidths[0], bold: true });
  doc.text("Choix", 40 + columnWidths[0], tableTop, { width: columnWidths[1] });
  doc.text("Précisions", 40 + columnWidths[0] + columnWidths[1], tableTop, {
    width: columnWidths[2],
  });
  doc.text(
    "Date",
    40 + columnWidths[0] + columnWidths[1] + columnWidths[2],
    tableTop,
    { width: columnWidths[3] },
  );
  doc.moveDown(0.8);

  choices.forEach((choice: any, index: number) => {
    const y = doc.y;
    const fill = index % 2 === 0 ? "#f8fafc" : "#ffffff";
    doc
      .rect(40, y - 2, 520, 30)
      .fill(fill)
      .strokeOpacity(0);
    doc.fillColor("#111827");
    doc.text(choice.userName, 45, y, {
      width: columnWidths[0],
      continued: false,
    });
    doc.text(choice.choice, 45 + columnWidths[0], y, {
      width: columnWidths[1],
      continued: false,
    });
    doc.text(choice.note ?? "-", 45 + columnWidths[0] + columnWidths[1], y, {
      width: columnWidths[2],
      continued: false,
    });
    doc.text(
      new Date(choice.createdAt).toLocaleString("fr-FR"),
      45 + columnWidths[0] + columnWidths[1] + columnWidths[2],
      y,
      {
        width: columnWidths[3],
        continued: false,
      },
    );
    doc.moveDown(1.2);
  });

  const buffer = await bufferFromPdf(doc);
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="choix-${room.name.replaceAll(/[^a-zA-Z0-9_-]/g, "_")}.pdf"`,
    },
  });
}
