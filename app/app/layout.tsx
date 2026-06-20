import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ДЗИ по ИТ — Практика",
  description: "Безплатна платформа за подготовка за ДЗИ по Информационни Технологии",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg" data-scroll-behavior="smooth">
      <body className={`${geist.className} bg-gray-50 min-h-screen`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
