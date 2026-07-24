import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kotoba-web-kappa.vercel.app"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Kotoba 言葉 — Plataforma de Literatura Libre",
    template: "%s | Kotoba 言葉",
  },
  description:
    "Kotoba es la plataforma de literatura digital donde escritores y lectores se encuentran. Publica, descubre y disfruta novelas, fanfiction y obras originales en español.",
  keywords: [
    "literatura digital",
    "plataforma de escritura",
    "fanfiction",
    "novelas ligeras",
    "light novels",
    "escritura creativa",
    "kotoba",
  ],
  openGraph: {
    title: "Kotoba 言葉 — Plataforma de Literatura Libre",
    description:
      "Donde las palabras encuentran su hogar. Publica y descubre obras literarias sin barreras.",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-kotoba-bg text-kotoba-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
