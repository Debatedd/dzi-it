import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QUIZ_TOPICS, topicOf } from "@/lib/quiz";
import { logout } from "../login/actions";
import ProfileProgress from "./ProfileProgress";

export const metadata = { title: "Моят профил — ДЗИ по ИТ" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, points, streak, created_at")
    .eq("id", user.id)
    .single();

  const { data: progress } = await supabase
    .from("question_progress")
    .select("question_id, attempts, correct_count")
    .eq("user_id", user.id);

  // Aggregate answered questions by topic.
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
    return {
      id: t.id,
      label: t.label,
      attempts: a?.attempts ?? 0,
      pct: a && a.attempts ? Math.round((a.correct / a.attempts) * 100) : null,
    };
  });

  const practiced = topicStats.filter((t) => t.attempts > 0);
  const notPracticed = topicStats.filter((t) => t.attempts === 0);
  const weakest = practiced.filter((t) => t.pct !== null && t.pct < 70).sort((a, b) => a.pct! - b.pct!);

  const verdict =
    overallPct >= 80 ? "Справяш се отлично! 🎯" :
    overallPct >= 60 ? "Добре се справяш — има накъде да растеш." :
    overallPct >= 40 ? "На прав път си, нужна е още практика." :
    "Има какво да наваксаш — не се отказвай! 💪";

  const verdictColor = overallPct >= 70 ? "var(--green)" : overallPct >= 40 ? "#fbbf24" : "var(--red)";

  const name = profile?.username ?? user.email ?? "Профил";
  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("bg-BG", { year: "numeric", month: "long" })
    : null;

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-12" style={{ color: "var(--text)" }}>
      <div className="w-full max-w-lg flex flex-col gap-5">
        <Link href="/" className="text-sm" style={{ color: "var(--muted)", textDecoration: "none" }}>
          &larr; Начало
        </Link>

        {/* Header */}
        <div className="glass rounded-2xl p-6 flex items-center gap-4" style={{ border: "1px solid var(--border)" }}>
          <span className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0"
            style={{ width: 60, height: 60, fontSize: "1.6rem", background: "var(--btn-gradient)" }}>
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="font-extrabold text-xl truncate">{name}</h1>
            <p className="text-sm truncate" style={{ color: "var(--muted)" }}>{user.email}</p>
            {joined && <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Член от {joined}</p>}
          </div>
        </div>

        <ProfileProgress dbPoints={profile?.points ?? 0} dbStreak={profile?.streak ?? 0} />

        {/* ── Performance analysis ── */}
        {totalAttempts === 0 ? (
          <div className="glass rounded-2xl p-6 text-center" style={{ border: "1px solid var(--border)" }}>
            <p className="mb-3" style={{ color: "var(--muted)" }}>
              Още нямаш решени въпроси. Направи няколко практики, за да видиш анализ на силните и слабите си страни.
            </p>
            <Link href="/practice" className="font-semibold" style={{ color: "var(--accent)" }}>
              Започни практика →
            </Link>
          </div>
        ) : (
          <>
            {/* Overall */}
            <div className="glass rounded-2xl p-6 text-center" style={{ border: "1px solid var(--border)" }}>
              <div className="font-extrabold" style={{ fontSize: "3rem", lineHeight: 1, color: verdictColor }}>{overallPct}%</div>
              <p className="mt-2 font-semibold">{verdict}</p>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                {totalCorrect} верни от {totalAttempts} решени
              </p>
            </div>

            {/* Per-topic */}
            <div className="glass rounded-2xl p-6" style={{ border: "1px solid var(--border)" }}>
              <h2 className="font-bold mb-4">По теми</h2>
              <div className="space-y-3">
                {topicStats.map((t) => (
                  <div key={t.id}>
                    <div className="flex justify-between items-center mb-1.5 text-sm">
                      <span style={{ color: "var(--text)" }}>{t.label}</span>
                      <span style={{ color: "var(--muted)" }}>
                        {t.pct === null ? "няма данни" : `${t.pct}% (${t.attempts})`}
                      </span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: 6, background: "var(--track-bg)" }}>
                      <div className="h-full rounded-full" style={{
                        width: `${t.pct ?? 0}%`,
                        background: t.pct === null ? "transparent" : t.pct >= 70 ? "var(--green)" : t.pct >= 40 ? "#fbbf24" : "var(--red)",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What to focus on */}
            <div className="glass rounded-2xl p-6" style={{ border: "1px solid var(--accent-border)" }}>
              <h2 className="font-bold mb-3" style={{ color: "var(--accent)" }}>🎯 На какво да наблегнеш</h2>
              {weakest.length === 0 && notPracticed.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Справяш се добре по всички теми, които си упражнявал — продължавай в същия дух!
                </p>
              ) : (
                <div className="space-y-3">
                  {weakest.map((t) => (
                    <div key={t.id} className="flex items-center gap-3">
                      <span className="flex-1 text-sm">
                        <b>{t.label}</b> — само {t.pct}% верни. Тук имаш нужда от още работа.
                      </span>
                      <Link href={`/quiz/solo?topic=${encodeURIComponent(t.id)}&mode=12`}
                        className="text-sm font-semibold px-3 py-1.5 rounded-lg text-white flex-shrink-0"
                        style={{ background: "var(--btn-gradient)", textDecoration: "none" }}>
                        Упражнявай
                      </Link>
                    </div>
                  ))}
                  {notPracticed.length > 0 && (
                    <p className="text-sm" style={{ color: "var(--muted)" }}>
                      Още не си решавал въпроси от: {notPracticed.map((t) => t.label).join(", ")}.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Quick links */}
        <div className="flex gap-3">
          <Link href="/quiz/my" className="flex-1 text-center text-sm font-medium rounded-xl px-4 py-3"
            style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none" }}>
            Моите тестове
          </Link>
          <form action={logout} className="flex-1">
            <button type="submit" className="w-full text-sm font-medium rounded-xl px-4 py-3"
              style={{ background: "var(--wrong-bg)", border: "1px solid var(--wrong-border)", color: "var(--wrong-text)", cursor: "pointer" }}>
              Изход
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
