// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { Resend } from "resend";
import { randomUUID } from "crypto";
export const dynamic = "force-dynamic";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.user.create({
      data: { email, name: name || null, passwordHash },
    });

    const token = randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await db.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL}api/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Vérifie ton adresse email — Choicely",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#090909;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#090909;padding:48px 24px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width:480px;background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
                  
                  <tr>
                    <td style="padding:40px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
                      <p style="margin:0;font-size:22px;font-weight:400;color:#ffffff;letter-spacing:-0.02em;">
                        Choicely<span style="color:rgba(255,255,255,0.3);">.</span>
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:32px 40px;">
                      <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.25);">
                        Vérification
                      </p>
                      <h1 style="margin:0 0 16px;font-size:26px;font-weight:400;color:#ffffff;letter-spacing:-0.02em;line-height:1.2;">
                        Confirme ton adresse email
                      </h1>
                      <p style="margin:0 0 32px;font-size:14px;line-height:1.75;color:rgba(255,255,255,0.45);">
                        Bienvenue sur Choicely. Clique sur le bouton ci-dessous pour vérifier ton adresse et activer ton compte.
                      </p>
                      <a href="${verifyUrl}" style="display:inline-block;padding:12px 28px;background:#ffffff;color:#090909;font-size:13px;font-weight:500;text-decoration:none;border-radius:10px;">
                        Vérifier mon email
                      </a>
                      <p style="margin:24px 0 0;font-size:12px;color:rgba(255,255,255,0.2);">
                        Ce lien expire dans 24h. Si tu n'as pas créé de compte, ignore cet email.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);">
                      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15);">
                        © ${new Date().getFullYear()} Choicely — tous droits réservés
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ message: "Email de vérification envoyé" }, { status: 201 });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}