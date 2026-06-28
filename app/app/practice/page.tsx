"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { questions } from "@/lib/questions";
import { openQuestions } from "@/lib/openQuestions";

const SERIF = "var(--font-ibm-serif), Georgia, serif";
const MONO = "var(--font-ibm-mono), monospace";

function Icon({ name }: { name: string }) {
  const c = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "var(--paper)", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "general": return (<svg {...c}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg>);
    case "data":    return (<svg {...c}><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" /><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></svg>);
    case "media":   return (<svg {...c}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>);
    case "web":     return (<svg {...c}><circle cx="12" cy="12" r="9" /><path d="M3.6 9h16.8M3.6 15h16.8" /><path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18" /></svg>);
    case "ict":     return (<svg {...c}><path d="M9 17a5 5 0 1 1 6 0a3.5 3.5 0 0 0-1 3a2 2 0 0 1-4 0a3.5 3.5 0 0 0-1-3" /><path d="M9.7 18h4.6" /></svg>);
    default: return null;
  }
}

const CATEGORIES = [
  { slug: "обработка-анализ", label: "Обработка и Анализ на Данни", icon: "data" },
  { slug: "мултимедия",       label: "Мултимедия",                  icon: "media" },
  { slug: "уеб-дизайн",       label: "Уеб Дизайн",                  icon: "web" },
  { slug: "решаване-икт",     label: "Решаване на проблеми с ИКТ",  icon: "ict" },
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
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 48, height: 48, borderRadius: 4, border: "1px solid var(--red)" }}>
              <Icon name="general" />
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
              <span className="absolute left-0 top-0 bottom-0" style={{ width: 3, background: i === 2 ? "var(--red)" : i === 3 ? "var(--accent-2)" : "var(--paper)" }} />
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: 48, height: 48, borderRadius: 4, border: "1px solid var(--border)" }}>
                  <Icon name={cat.icon} />
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
