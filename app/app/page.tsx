import Link from "next/link";
import { questions } from "@/lib/questions";
import { openQuestions } from "@/lib/openQuestions";
import { QUIZ_TOPICS, topicOf } from "@/lib/quiz";
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

  // Days until the next ДЗИ (matura ≈ 21 May).
  const now = new Date();
  let examYear = now.getFullYear();
  if (now > new Date(examYear, 4, 21)) examYear += 1;
  const daysToExam = Math.max(0, Math.ceil((new Date(examYear, 4, 21).getTime() - now.getTime()) / 86400000));

  // Suggested topic for today — rotates by day, or the weakest one for a logged-in user.
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  let suggested = QUIZ_TOPICS[dayOfYear % QUIZ_TOPICS.length];

  let user = null;
  let displayName: string | null = null;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      user = (await supabase.auth.getUser()).data.user;
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
        displayName = profile?.username ?? user.email ?? null;

        const { data: progress } = await supabase
          .from("question_progress").select("question_id, attempts, correct_count").eq("user_id", user.id);
        const agg = new Map<string, { at: number; c: number }>();
        for (const row of progress ?? []) {
          const t = topicOf(row.question_id);
          if (!t) continue;
          const a = agg.get(t) ?? { at: 0, c: 0 };
          a.at += row.attempts; a.c += row.correct_count;
          agg.set(t, a);
        }
        const stats = QUIZ_TOPICS.map((t) => { const a = agg.get(t.id); return { t, at: a?.at ?? 0, pct: a && a.at ? a.c / a.at : null }; });
        const untouched = stats.find((s) => s.at === 0);
        const weakest = stats.filter((s) => s.pct !== null).sort((a, b) => a.pct! - b.pct!)[0];
        if (untouched) suggested = untouched.t;
        else if (weakest) suggested = weakest.t;
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
            {[["/rewards", "Награди"], ["/feedback", "Обратна връзка"], ["/contact", "Контакт"], ["/privacy", "Поверителност"], ["/quiz", "Quiz стая"]].map(([href, label]) => (
              <Link key={href} href={href} className="px-4 py-3" style={{ ...navLink, borderBottom: "1px solid var(--border)" }}>{label}</Link>
            ))}
          </div>
        </details>

        <div className="hidden sm:flex items-center gap-7">
          <Link href="/rewards" style={navLink}>Награди</Link>
          <Link href="/feedback" style={navLink}>Обратна връзка</Link>
          <Link href="/contact" style={navLink}>Контакт</Link>
          <Link href="/privacy" style={navLink}>Поверителност</Link>
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

      {/* ── HERO (two columns on desktop) ─────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex items-center px-6 py-28">
        <div className="w-full max-w-5xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT — identity + entry points */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="mb-7 stamp">Държавен зрелостен изпит · Подготовка</div>

            <h1 style={{ fontFamily: SERIF, fontWeight: 700, color: "var(--paper)", fontSize: "clamp(2.4rem, 5vw, 4.3rem)", lineHeight: 1.05, letterSpacing: "-0.01em" }}>
              <span className="ink-underline">ДЗИ</span> по
              <br />Информационни
              <br />Технологии
            </h1>

            <p className="mt-6" style={{ color: "var(--muted)", fontSize: "1.05rem", maxWidth: 440, lineHeight: 1.7 }}>
              Практикувай по програмата за ДЗИ, виж обяснения веднага и проследи напредъка си по теми.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link href="/practice" className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
                style={{ background: "var(--red)", color: "var(--paper)", fontWeight: 600, fontSize: "0.95rem", padding: "13px 26px", borderRadius: 5, minWidth: 180, textDecoration: "none" }}>
                Започни теория
              </Link>
              <Link href="/html-task" className="inline-flex items-center justify-center transition-colors"
                style={{ background: "transparent", color: "var(--paper)", border: "1px solid var(--paper)", fontWeight: 600, fontSize: "0.95rem", padding: "13px 26px", borderRadius: 5, minWidth: 180, textDecoration: "none" }}>
                Започни практика
              </Link>
            </div>
            <Link href="/quiz" className="inline-flex items-center gap-2 transition-colors mt-3"
              style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", fontFamily: MONO, fontSize: "0.74rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 24px", borderRadius: 5, justifyContent: "center", textDecoration: "none" }}>
              Quiz стая →
            </Link>

            <p className="mt-7" style={{ fontFamily: MONO, fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
              <span style={{ color: "var(--paper)" }}>{totalQuestions}</span> въпроса по програмата · {totalTopics} теми
            </p>
          </div>

          {/* RIGHT — your dashboard: today's plan + points ticket */}
          <div className="flex flex-col gap-5 w-full mx-auto" style={{ maxWidth: 440 }}>
            {/* daily plan card */}
            <div className="glass p-6 text-left" style={{ border: "1px solid var(--border)", borderRadius: 4 }}>
              <div className="flex items-center gap-2.5 pb-3.5 mb-3.5" style={{ borderBottom: "1px dashed var(--border)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" />
                </svg>
                <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "1.05rem", color: "var(--paper)" }}>
                  До ДЗИ остават <span style={{ color: "var(--red)", fontFamily: MONO, fontWeight: 700 }}>{daysToExam}</span> {daysToExam === 1 ? "ден" : "дни"}
                </span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)" }}>Препоръка за днес</div>
              <ul className="mt-3 space-y-2.5" style={{ fontSize: "0.92rem" }}>
                {["Реши 12 въпроса", `Позанимавай се с «${suggested.label}»`, "Спечели +25 точки"].map((t, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={i === 2 ? "var(--red)" : "var(--accent-2-text)"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" />
                    </svg>
                    <span style={{ color: "var(--paper)" }}>{t}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/quiz/solo?topic=${encodeURIComponent(suggested.id)}&mode=12`}
                className="inline-flex items-center justify-center w-full mt-5 transition-opacity hover:opacity-90"
                style={{ background: "var(--red)", color: "var(--paper)", fontWeight: 600, padding: "12px 0", borderRadius: 5, textDecoration: "none" }}>
                Започни сега →
              </Link>
            </div>

            {/* points ticket */}
            <GameStats />
          </div>
        </div>
      </section>
    </>
  );
}
