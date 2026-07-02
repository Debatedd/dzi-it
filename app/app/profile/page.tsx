import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QUIZ_TOPICS, topicOf } from "@/lib/quiz";
import { logout } from "../login/actions";
import ProfileProgress from "./ProfileProgress";

export const metadata = { title: "Моят профил — ДЗИ по ИТ" };

const SERIF = "var(--font-ibm-serif), Georgia, serif";
const MONO = "var(--font-ibm-mono), monospace";
const AMBER = "#C9A24A";

// Named mastery levels are more legible than a raw percentage.
function mastery(pct: number | null, attempts: number): { label: string; level: number; color: string } {
  if (attempts === 0 || pct === null) return { label: "Няма данни", level: 0, color: "var(--muted)" };
  if (attempts < 4) return { label: "Начинаещ", level: 1, color: "var(--red)" };
  if (pct >= 85) return { label: "Готов за матура", level: 4, color: "var(--green)" };
  if (pct >= 65) return { label: "Уверен", level: 3, color: "var(--accent-2-text)" };
  if (pct >= 45) return { label: "Практикуващ", level: 2, color: AMBER };
  return { label: "Начинаещ", level: 1, color: "var(--red)" };
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("username, points, streak, created_at").eq("id", user.id).single();

  const { data: progress } = await supabase
    .from("question_progress").select("question_id, attempts, correct_count").eq("user_id", user.id);

  const agg = new Map<string, { attempts: number; correct: number }>();
  for (const row of progress ?? []) {
    const topic = topicOf(row.question_id);
    if (!topic) continue;
    const a = agg.get(topic) ?? { attempts: 0, correct: 0 };
    a.attempts += row.attempts;
    a.correct += row.correct_count;
    agg.set(topic, a);
  }

  const totalAttempts = [...agg.values()].reduce((s, a) => s + a.attempts, 0);
  const totalCorrect = [...agg.values()].reduce((s, a) => s + a.correct, 0);
  const overallPct = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const topicStats = QUIZ_TOPICS.map((t) => {
    const a = agg.get(t.id);
    const pct = a && a.attempts ? Math.round((a.correct / a.attempts) * 100) : null;
    return { id: t.id, label: t.label, attempts: a?.attempts ?? 0, pct, m: mastery(pct, a?.attempts ?? 0) };
  });

  // Specific next action: prefer an untouched topic, else the weakest practiced one.
  const untouched = topicStats.filter((t) => t.attempts === 0);
  const practicedByWeakness = topicStats.filter((t) => t.attempts > 0).sort((a, b) => a.m.level - b.m.level || (a.pct ?? 0) - (b.pct ?? 0));
  const nextTopic = untouched[0] ?? practicedByWeakness[0] ?? topicStats[0];
  const nextVerb = untouched[0] ? "Пробвай" : "Наблегни на";

  const verdict =
    overallPct >= 80 ? "Справяш се отлично." :
    overallPct >= 60 ? "Добре се справяш — има накъде да растеш." :
    overallPct >= 40 ? "На прав път си, нужна е още практика." :
    "Има какво да наваксаш — не се отказвай.";
  const verdictColor = overallPct >= 70 ? "var(--green)" : overallPct >= 40 ? AMBER : "var(--red)";

  const name = profile?.username ?? user.email ?? "Профил";
  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("bg-BG", { year: "numeric", month: "long" }) : null;

  const monoLabel = { fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "var(--muted)" };

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-12" style={{ color: "var(--text)" }}>
      <div className="w-full max-w-lg flex flex-col gap-5">
        <Link href="/" style={{ color: "var(--muted)", textDecoration: "none", fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          ← Начало
        </Link>

        {/* Header */}
        <div className="glass p-6 flex items-center gap-4" style={{ border: "1px solid var(--border)", borderRadius: 4 }}>
          <span className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 58, height: 58, border: "1.5px solid var(--red)", color: "var(--paper)", fontFamily: MONO, fontWeight: 600, fontSize: "1.5rem" }}>
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="truncate" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "1.35rem" }}>{name}</h1>
            <p className="truncate" style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{user.email}</p>
            {joined && <p style={{ ...monoLabel, marginTop: 3 }}>Член от {joined}</p>}
          </div>
        </div>

        <ProfileProgress dbPoints={profile?.points ?? 0} dbStreak={profile?.streak ?? 0} />

        {/* ── Next action (the specific one-tap step) ── */}
        <div className="glass p-6" style={{ border: "1px solid var(--red)", borderRadius: 4 }}>
          <div style={monoLabel}>Следваща стъпка</div>
          <p className="mt-2 mb-4" style={{ fontFamily: SERIF, fontSize: "1.15rem", fontWeight: 600, color: "var(--paper)" }}>
            {nextVerb} <span style={{ color: "var(--red)" }}>{nextTopic.label}</span>
          </p>
          <Link href={`/quiz/solo?topic=${encodeURIComponent(nextTopic.id)}&mode=6`}
            className="inline-flex items-center justify-center w-full transition-opacity hover:opacity-90"
            style={{ background: "var(--red)", color: "var(--paper)", fontWeight: 600, padding: "13px 0", borderRadius: 5, textDecoration: "none" }}>
            Реши 6 въпроса →
          </Link>
        </div>

        {totalAttempts > 0 && (
          <>
            {/* Overall */}
            <div className="glass p-6 text-center" style={{ border: "1px solid var(--border)", borderRadius: 4 }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: "3rem", lineHeight: 1, color: verdictColor }}>{overallPct}%</div>
              <p className="mt-3 font-semibold">{verdict}</p>
              <p style={{ ...monoLabel, marginTop: 6 }}>{totalCorrect} верни от {totalAttempts} решени</p>
            </div>

            {/* Mastery by topic */}
            <div className="glass p-6" style={{ border: "1px solid var(--border)", borderRadius: 4 }}>
              <h2 className="mb-5" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "1.05rem" }}>Ниво по теми</h2>
              <div className="space-y-4">
                {topicStats.map((t) => (
                  <div key={t.id}>
                    <div className="flex justify-between items-baseline mb-2">
                      <span style={{ fontSize: "0.9rem", color: "var(--paper)" }}>{t.label}</span>
                      <span style={{ fontFamily: MONO, fontSize: "0.68rem", letterSpacing: "0.06em", color: t.m.color }}>
                        {t.m.label}{t.pct !== null ? ` · ${t.pct}%` : ""}
                      </span>
                    </div>
                    {/* 4-segment mastery bar → progression toward exam-ready */}
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((seg) => (
                        <div key={seg} className="flex-1" style={{ height: 5, borderRadius: 2, background: seg <= t.m.level ? t.m.color : "var(--track-bg)" }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ ...monoLabel, marginTop: 16 }}>Начинаещ → Практикуващ → Уверен → Готов за матура</p>
            </div>
          </>
        )}

        {/* Quick links */}
        <div className="flex gap-3">
          <Link href="/quiz/my" className="flex-1 text-center rounded px-4 py-3"
            style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none", fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 4 }}>
            Моите тестове
          </Link>
          <form action={logout} className="flex-1">
            <button type="submit" className="w-full rounded px-4 py-3"
              style={{ background: "transparent", border: "1px solid var(--wrong-border)", color: "var(--wrong-text)", cursor: "pointer", fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 4 }}>
              Изход
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
