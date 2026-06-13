"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ParallaxOrbs from "@/components/ParallaxOrbs";
import { questions } from "@/lib/questions";
import { openQuestions } from "@/lib/openQuestions";

const CATEGORIES = [
  { slug: "обработка-анализ", label: "Обработка и Анализ на Данни", icon: "📊", color: "#22d3ee" },
  { slug: "мултимедия",       label: "Мултимедия",                  icon: "🎬", color: "#a78bfa" },
  { slug: "уеб-дизайн",       label: "Уеб Дизайн",                  icon: "🌐", color: "#f59e0b" },
  { slug: "решаване-икт",     label: "Решаване на проблеми с ИКТ",  icon: "🧩", color: "#4ade80" },
];

const MODES = [
  { label: "6 въпр.", mode: "6",   desc: "4 + 2" },
  { label: "12 въпр.", mode: "12",  desc: "8 + 4" },
  { label: "ДЗИ (25)", mode: "dzi", desc: "15 + 10" },
];

function ModeButtons({ slug, color }: { slug: string | null; color: string }) {
  const router = useRouter();
  return (
    <div className="flex gap-2 mt-3">
      {MODES.map(({ label, mode, desc }) => (
        <button
          key={mode}
          onClick={(e) => {
            e.preventDefault();
            const params = new URLSearchParams({ mode });
            if (slug) params.set("topic", slug);
            router.push(`/quiz?${params}`);
          }}
          className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${color}30`,
            color: "var(--muted)",
          }}
          title={desc}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function PracticePage() {
  return (
    <>
      <ParallaxOrbs />
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium"
          style={{ color: "var(--muted)", textDecoration: "none" }}
        >
          ← Начало
        </Link>

        <h1
          className="font-extrabold text-center mb-2"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--text)" }}
        >
          <span className="gradient-text">Избери тест</span>
        </h1>
        <p className="text-center mb-10" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Избери режим: <strong style={{ color: "var(--text)" }}>6</strong> (4+2) ·{" "}
          <strong style={{ color: "var(--text)" }}>12</strong> (8+4) ·{" "}
          <strong style={{ color: "var(--text)" }}>ДЗИ 25</strong> (15+10) — затворени + открити
        </p>

        <div className="space-y-4">
          {/* General test */}
          <div
            className="glass rounded-2xl p-5"
            style={{ border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  width: 52, height: 52,
                  background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(34,211,238,0.2))",
                  border: "1px solid rgba(139,92,246,0.3)",
                }}
              >
                🎯
              </div>
              <div>
                <div className="font-semibold" style={{ color: "var(--text)", fontSize: "1.05rem" }}>
                  Общ тест
                </div>
                <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 1 }}>
                  Всички категории, разбъркани
                </div>
              </div>
            </div>
            <ModeButtons slug={null} color="#8b5cf6" />
          </div>

          {/* Category cards */}
          {CATEGORIES.map((cat) => {
            const closedCount = questions.filter((q) => q.topic === cat.slug).length;
            const openCount   = openQuestions.filter((q) => q.topic === cat.slug).length;
            return (
              <div
                key={cat.slug}
                className="glass rounded-2xl p-5"
                style={{ border: `1px solid ${cat.color}22` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ width: 52, height: 52, background: `${cat.color}18`, border: `1px solid ${cat.color}40` }}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: "var(--text)", fontSize: "1.05rem" }}>
                      {cat.label}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 1 }}>
                      {closedCount} затворени · {openCount} открити
                    </div>
                  </div>
                </div>
                <ModeButtons slug={cat.slug} color={cat.color} />
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
