import type { Metadata } from "next";
import { IBM_Plex_Serif, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const serif = IBM_Plex_Serif({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  variable: "--font-ibm-serif",
  display: "swap",
});
const sans = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-sans",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ДЗИ по ИТ — Практика",
  description: "Безплатна платформа за подготовка за ДЗИ по Информационни Технологии",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg" data-scroll-behavior="smooth" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
