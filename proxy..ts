// proxy.ts (à la racine du projet)
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth; // true si connecté, false sinon
  const url = req.nextUrl.clone();

  // 1. Si l'utilisateur tente d'aller sur le Dashboard sans être connecté
  if (url.pathname.startsWith("/dashboard") && !isLoggedIn) {
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // 2. Si l'utilisateur est DÉJÀ connecté et tente d'aller sur le Login
  if (url.pathname === "/auth/login" && isLoggedIn) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

// On applique le proxy uniquement sur les routes à surveiller
export const config = {
  matcher: ["/dashboard/:path*", "/auth/login"],
};