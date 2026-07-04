import Link from "next/link";
import { questions } from "@/lib/questions";
import { openQuestions } from "@/lib/openQuestions";
import GameStats from "@/components/GameStats";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./login/actions";

const SERIF = "var(--font-ibm-serif), Georgia, serif";
const MONO = "var(--font-ibm-mono), monospace";

export default async function HomePage() {
  const topicMap = new Map<string, number>();
  for (const q of questions) topicMap.set(q.topic, 1);
  const totalQuestions = questions.length + openQuestions.length;
  const totalTopics    = topicMap.size;

  let user = null;
  let displayName: string | null = null;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      user = (await supabase.auth.getUser()).data.user;
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
        displayName = profile?.username ?? user.email ?? null;
      }
    } catch { user = null; }
  }

  const navLink = { color: "var(--muted)", textDecoration: "none", fontFamily: MONO, fontSize: "0.74rem", letterSpacing: "0.12em", textTransform: "uppercase" as const };

  return (
    <>
      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3"
        style={{ background: "var(--nav-bg)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--border)" }}
      >
        {/* hamburger on mobile */}
        <details className="sm:hidden relative">
          <summary className="nav-burger flex items-center justify-center cursor-pointer"
            style={{ width: 38, height: 38, border: "1px solid var(--border)", color: "var(--paper)", borderRadius: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </summary>
          <div className="absolute top-full left-0 mt-2 flex flex-col w-56"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4 }}>
            {[["/rewards", "Награди"], ["/feedback", "Обратна връзка"], ["/contact", "Контакт"], ["/quiz", "Quiz стая"]].map(([href, label]) => (
              <Link key={href} href={href} className="px-4 py-3" style={{ ...navLink, borderBottom: "1px solid var(--border)" }}>{label}</Link>
            ))}
          </div>
        </details>

        <div className="hidden sm:flex items-center gap-7">
          <Link href="/rewards" style={navLink}>Награди</Link>
          <Link href="/feedback" style={navLink}>Обратна връзка</Link>
          <Link href="/contact" style={navLink}>Контакт</Link>
        </div>

        {/* account */}
        {user ? (
          <div className="flex items-center gap-3 pl-4 sm:ml-2" style={{ borderLeft: "1px solid var(--border)" }}>
            <Link href="/profile" className="flex items-center gap-2.5" style={{ textDecoration: "none" }} title="Моят профил">
              <span className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{ width: 32, height: 32, border: "1.5px solid var(--red)", color: "var(--paper)", fontFamily: MONO, fontSize: "0.78rem", fontWeight: 600 }}>
                {(displayName ?? "?").charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline" style={{ color: "var(--paper)", fontFamily: MONO, fontSize: "0.74rem", letterSpacing: "0.08em" }}>{displayName}</span>
            </Link>
            <form action={logout}>
              <button type="submit" style={{ ...navLink, background: "transparent", border: "1px solid var(--border)", borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}>
                Изход
              </button>
            </form>
          </div>
        ) : (
          <Link href="/login" className="sm:ml-2"
            style={{ background: "var(--red)", color: "var(--paper)", fontFamily: MONO, fontSize: "0.74rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 16px", borderRadius: 4, textDecoration: "none" }}>
            Вход
          </Link>
        )}
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center" style={{ paddingTop: "12vh" }}>
        {/* stamp */}
        <div className="mb-9 stamp">Държавен зрелостен изпит · Подготовка</div>

        <h1 style={{ fontFamily: SERIF, fontWeight: 700, color: "var(--paper)", fontSize: "clamp(2.6rem, 7vw, 5.4rem)", lineHeight: 1.06, maxWidth: 860, letterSpacing: "-0.01em" }}>
          <span className="ink-underline">ДЗИ</span> по
          <br />Информационни
          <br />Технологии
        </h1>

        <p className="mt-7" style={{ color: "var(--muted)", fontSize: "clamp(1rem, 2.2vw, 1.15rem)", maxWidth: 520, lineHeight: 1.7 }}>
          Практикувай с реални въпроси от матури, виж обяснения веднага и
          проследи напредъка си по теми.
        </p>

        {/* ticket (points / streak) */}
        <div className="mt-9 w-full" style={{ maxWidth: 460 }}>
          <GameStats />
        </div>

        {/* trust line — scope of the content */}
        <p className="mt-6" style={{ fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
          <span style={{ color: "var(--paper)" }}>{totalQuestions}</span> въпроса от реални матури · {totalTopics} теми · безплатно
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 mt-9 mb-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/practice" className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
              style={{ background: "var(--red)", color: "var(--paper)", fontWeight: 600, fontSize: "0.95rem", padding: "14px 30px", borderRadius: 5, minWidth: 210, textDecoration: "none" }}>
              Започни теория
            </Link>
            <Link href="/html-task" className="inline-flex items-center justify-center transition-colors"
              style={{ background: "transparent", color: "var(--paper)", border: "1px solid var(--paper)", fontWeight: 600, fontSize: "0.95rem", padding: "14px 30px", borderRadius: 5, minWidth: 210, textDecoration: "none" }}>
              Започни практика
            </Link>
          </div>
          <Link href="/quiz" className="inline-flex items-center gap-2 transition-colors"
            style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", fontFamily: MONO, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "11px 26px", borderRadius: 5, minWidth: 210, justifyContent: "center", textDecoration: "none" }}>
            Quiz стая →
          </Link>
        </div>

        {/* footer */}
        <div className="flex justify-center gap-6 flex-wrap mt-2">
          {[["/rewards", "Награди"], ["/feedback", "Обратна връзка"], ["/contact", "Контакт"], ["/privacy", "Поверителност"]].map(([href, label]) => (
            <Link key={href} href={href} style={{ color: "var(--muted)", textDecoration: "none", fontFamily: MONO, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</Link>
          ))}
        </div>
      </section>
    </>
  );
}
