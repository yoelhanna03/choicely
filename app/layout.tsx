import "./globals.css";
import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";
import { Geist } from "next/font/google";
import { dmSerif, outfit } from "./fonts";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Choicely",
  description: "Decision intelligence, simplified.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={cn("font-sans", geist.variable, dmSerif.variable, outfit.variable)}>
      <body className="bg-[#04060b] text-white min-h-screen antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}