import Link from "next/link";
import { questions } from "@/lib/questions";
import { openQuestions } from "@/lib/openQuestions";
import ParallaxOrbs from "@/components/ParallaxOrbs";
import ScrollReveal from "@/components/ScrollReveal";
import GameStats from "@/components/GameStats";

// hex values kept here for JS string interpolation (e.g. `${color}18` for opacity suffix).
// The same values are mirrored in globals.css as --topic-* CSS vars.
const TOPIC_META: Record<string, { icon: string; color: string; label: string }> = {
  "обработка-анализ": { icon: "📊", color: "#22d3ee", label: "Обработка и Анализ на Данни" },
  "мултимедия":       { icon: "🎬", color: "#a78bfa", label: "Мултимедия" },
  "уеб-дизайн":       { icon: "🌐", color: "#f59e0b", label: "Уеб Дизайн" },
  "решаване-икт":     { icon: "🧩", color: "#4ade80", label: "Решаване на проблеми с ИКТ" },
};

export default function HomePage() {
  const topicMap = new Map<string, number>();
  for (const q of questions) {
    topicMap.set(q.topic, (topicMap.get(q.topic) ?? 0) + 1);
  }
  const topics         = Array.from(topicMap.entries());
  const totalClosed    = questions.length;
  const totalOpen      = openQuestions.length;
  const totalQuestions = totalClosed + totalOpen;
  const totalTopics    = topics.length;

  return (
    <>
      <ParallaxOrbs />

      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end gap-3 px-6 py-4"
        style={{ background: "var(--nav-bg)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}
      >
        <Link href="/rewards" className="text-sm font-medium" style={{ color: "var(--muted)", textDecoration: "none" }}>
          🏆 Награди
        </Link>
        <Link href="/feedback" className="text-sm font-medium" style={{ color: "var(--muted)", textDecoration: "none" }}>
          💬 Обратна връзка
        </Link>
        <Link href="/contact" className="text-sm font-medium" style={{ color: "var(--muted)", textDecoration: "none" }}>
          👤 Контакт
        </Link>
        <Link
          href="/practice"
          className="text-sm font-semibold px-4 py-2 rounded-xl text-white"
          style={{ background: "var(--hero-gradient)", textDecoration: "none" }}
        >
          Практика →
        </Link>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center"
        style={{ paddingTop: "10vh" }}
      >
        <div className="pill mb-8">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
          Безплатна платформа за подготовка
        </div>

        <h1
          className="font-extrabold tracking-tight mb-6"
          style={{ fontSize: "clamp(2.4rem, 7vw, 5.5rem)", lineHeight: 1.08, maxWidth: 820 }}
        >
          <span className="gradient-text">ДЗИ по</span>
          <br />
          <span style={{ color: "var(--text)" }}>Информационни</span>
          <br />
          <span style={{ color: "var(--text)" }}>Технологии</span>
        </h1>

        <p
          className="mb-8"
          style={{ color: "var(--muted)", fontSize: "clamp(1rem, 2.2vw, 1.2rem)", maxWidth: 520, lineHeight: 1.7 }}
        >
          Практикувай с реални въпроси от матури, виж обяснения веднага и
          проследи напредъка си по теми.
        </p>

        {/* Gamification badge */}
        <div className="mb-8 w-full" style={{ maxWidth: 460 }}>
          <GameStats />
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/practice"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-white overflow-hidden"
            style={{ background: "var(--btn-gradient-wide)", boxShadow: "var(--accent-glow)", fontSize: "1rem" }}
          >
            <span>Започни практика</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/html-task"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold glass"
            style={{ fontSize: "1rem", color: "var(--text)" }}
          >
            Започни теория
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex gap-8 sm:gap-16 mb-20 sm:mb-24">
          {[
            { value: totalQuestions, label: "въпроса" },
            { value: totalTopics,    label: "теми" },
            { value: "∞",            label: "практики" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-extrabold gradient-text" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
                {value}
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{label}</div>
            </div>
          ))}
        </div>

        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1 hidden sm:flex"
          style={{ color: "var(--muted)", fontSize: "0.72rem", letterSpacing: "0.1em" }}
        >
          <span>SCROLL</span>
          <span style={{ animation: "bounce 1.8s infinite" }}>↓</span>
        </div>
      </section>

      {/* ── TOPICS ────────────────────────────────────────────────────── */}
      <section id="topics" className="relative z-10 max-w-3xl mx-auto px-6 pb-32">
        <ScrollReveal>
          <h2 className="font-bold text-center mb-3" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", color: "var(--text)" }}>
            Теми за изпита
          </h2>
          <p className="text-center mb-12" style={{ color: "var(--muted)" }}>
            Избери тема или практикувай всички наведнъж
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topics.map(([topic, count], i) => {
            const meta = TOPIC_META[topic] ?? { icon: "●", color: "#8b5cf6", label: topic };
            return (
              <ScrollReveal key={topic} delay={i * 60}>
                <Link
                  href={`/practice?topic=${encodeURIComponent(topic)}`}
                  className="glass rounded-2xl px-5 py-5 flex items-center gap-4 group block"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-xl font-mono font-bold text-sm"
                    style={{ width: 44, height: 44, background: `${meta.color}18`, border: `1px solid ${meta.color}40`, color: meta.color }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate" style={{ color: "var(--text)", fontSize: "0.92rem" }}>
                      {meta.label}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: 2 }}>
                      {count} въпроса
                    </div>
                  </div>
                  <span className="transition-transform group-hover:translate-x-1" style={{ color: meta.color, fontSize: "1.1rem" }}>
                    →
                  </span>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={600} className="mt-10 text-center">
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-semibold text-white"
            style={{ background: "var(--hero-gradient)", boxShadow: "var(--accent-glow-lg)", fontSize: "1.05rem" }}
          >
            Практика — всички теми →
          </Link>
        </ScrollReveal>

        {/* Footer links */}
        <div className="mt-16 flex justify-center gap-8">
          <Link href="/rewards"  style={{ color: "var(--muted)", textDecoration: "none", fontSize: "0.85rem" }}>🏆 Награди</Link>
          <Link href="/feedback" style={{ color: "var(--muted)", textDecoration: "none", fontSize: "0.85rem" }}>💬 Обратна връзка</Link>
        </div>
      </section>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(6px); }
        }
      `}</style>
    </>
  );
}
