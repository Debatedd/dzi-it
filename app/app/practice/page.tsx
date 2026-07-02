"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { questions } from "@/lib/questions";
import { openQuestions } from "@/lib/openQuestions";

const SERIF = "var(--font-ibm-serif), Georgia, serif";
const MONO = "var(--font-ibm-mono), monospace";

const CATEGORIES = [
  { slug: "обработка-анализ", label: "Обработка и Анализ на Данни", accent: "var(--paper)" },
  { slug: "мултимедия",       label: "Мултимедия",                  accent: "var(--paper)" },
  { slug: "уеб-дизайн",       label: "Уеб Дизайн",                  accent: "var(--red)" },
  { slug: "решаване-икт",     label: "Решаване на проблеми с ИКТ",  accent: "var(--accent-2-text)" },
];

const MODES = [
  { label: "6 ВЪПР.", mode: "6",   desc: "4 + 2" },
  { label: "12 ВЪПР.", mode: "12",  desc: "8 + 4" },
  { label: "ДЗИ (25)", mode: "dzi", desc: "15 + 10" },
];

function ModeButtons({ slug }: { slug: string | null }) {
  const router = useRouter();
  return (
    <div className="flex gap-2 mt-4">
      {MODES.map(({ label, mode, desc }) => (
        <button
          key={mode}
          onClick={() => {
            const params = new URLSearchParams({ mode });
            if (slug) params.set("topic", slug);
            router.push(`/quiz/solo?${params}`);
          }}
          className="flex-1 py-2.5 transition-colors hover:bg-[rgba(236,230,216,0.06)]"
          style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--muted)", fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.08em", cursor: "pointer" }}
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
    <main className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/" className="inline-flex items-center gap-2 mb-8"
        style={{ color: "var(--muted)", textDecoration: "none", fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        ← Начало
      </Link>

      <h1 className="text-center mb-2" style={{ fontFamily: SERIF, fontWeight: 700, color: "var(--paper)", fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
        Избери тест
      </h1>
      <p className="text-center mb-10" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        Режим: <strong style={{ color: "var(--paper)" }}>6</strong> (4+2) ·{" "}
        <strong style={{ color: "var(--paper)" }}>12</strong> (8+4) ·{" "}
        <strong style={{ color: "var(--paper)" }}>ДЗИ 25</strong> (15+10) — затворени + открити
      </p>

      <div className="space-y-4">
        {/* General test */}
        <div className="glass p-5" style={{ border: "1px solid var(--border)", borderRadius: 4 }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 48, height: 48, borderRadius: 4, border: "1px solid var(--red)", fontFamily: MONO, fontWeight: 600, fontSize: "1.3rem", color: "var(--red)" }}>
              ∑
            </div>
            <div>
              <div style={{ fontFamily: SERIF, fontWeight: 600, color: "var(--paper)", fontSize: "1.05rem" }}>Общ тест</div>
              <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 2 }}>Всички категории, разбъркани</div>
            </div>
          </div>
          <ModeButtons slug={null} />
        </div>

        {/* Category cards */}
        {CATEGORIES.map((cat, i) => {
          const closedCount = questions.filter((q) => q.topic === cat.slug).length;
          const openCount   = openQuestions.filter((q) => q.topic === cat.slug).length;
          return (
            <div key={cat.slug} className="glass p-5 relative" style={{ border: "1px solid var(--border)", borderRadius: 4 }}>
              <span className="absolute left-0 top-0 bottom-0" style={{ width: 3, background: cat.accent }} />
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: 48, height: 48, borderRadius: 4, border: `1px solid ${cat.accent}`, fontFamily: MONO, fontWeight: 600, fontSize: "1.1rem", color: cat.accent }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div style={{ fontFamily: SERIF, fontWeight: 600, color: "var(--paper)", fontSize: "1.05rem" }}>{cat.label}</div>
                  <div style={{ fontFamily: MONO, color: "var(--muted)", fontSize: "0.72rem", letterSpacing: "0.04em", marginTop: 3 }}>
                    {closedCount} ЗАТВОРЕНИ · {openCount} ОТКРИТИ
                  </div>
                </div>
              </div>
              <ModeButtons slug={cat.slug} />
            </div>
          );
        })}
      </div>
    </main>
  );
}
