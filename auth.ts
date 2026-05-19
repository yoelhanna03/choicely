// auth.ts
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { loginLimiter } from "@/lib/limiter"; // Import de ton limiteur
export const dynamic = "force-dynamic";

// Erreurs personnalisées
class InvalidVerificationError extends CredentialsSignin {
  code = "Email non vérifié";
}

class TooManyRequestsError extends CredentialsSignin {
  code = "Trop de tentatives";
}

const nextAuth = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // 1. Récupération de l'IP pour le rate limit
        // En v5, req est disponible dans authorize
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

        try {
          // 2. Consommer un point
          await loginLimiter.consume(ip);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (rateLimitError) {
          // Si plus de points disponibles
          throw new TooManyRequestsError();
        }

        if (!credentials?.email || !credentials.password) return null;

        // 3. Recherche utilisateur
        const user = await db.user.findUnique({ 
          where: { email: credentials.email as string } 
        });

        if (!user || !user.passwordHash) return null;

        // 4. Vérification mot de passe
        const isValid = await bcrypt.compare(
          credentials.password as string, 
          user.passwordHash
        );
        
        if (!isValid) return null;

        // 5. Vérification de l'email
        if (!user.emailVerified) {
          throw new InvalidVerificationError();
        }
        
        return { 
          id: user.id.toString(), 
          email: user.email, 
          name: user.name 
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Si l'utilisateur se connecte avec Google
      if (account?.provider === "google") {
        // Mettre à jour/créer l'utilisateur avec emailVerified confirmé
        await db.user.upsert({
          where: { email: user.email! },
          update: { 
            emailVerified: new Date(),
            name: user.name || user.email?.split("@")[0],
          },
          create: {
            email: user.email!,
            name: user.name || user.email?.split("@")[0],
            emailVerified: new Date(),
            // passwordHash reste null, donc on ne peut pas se connecter avec Credentials
          },
        });
        return true;
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub && session.user) session.user.id = token.sub;
      return session;
    },
  },
});

export const { handlers, auth, signIn, signOut } = nextAuth;