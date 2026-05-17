import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth; // true si l'utilisateur est connecté, false sinon
  const isOnLoginPage = req.nextUrl.pathname === "/auth/login";
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  // 1. Si l'utilisateur est DÉJÀ connecté et qu'il tente d'aller sur /auth/login
  // On le redirige automatiquement vers le dashboard
  if (isLoggedIn && isOnLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // 2. Sécurité inverse : Si l'utilisateur n'est PAS connecté et tente d'aller sur le dashboard
  // On le renvoie vers la page de login
  if (!isLoggedIn && isOnDashboard) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }

  return NextResponse.next();
});

// On indique à Next.js sur quelles routes le middleware doit s'exécuter
export const config = {
  matcher: ["/dashboard/:path*", "/auth/login"],
};