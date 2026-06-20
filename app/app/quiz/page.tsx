import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { joinRoom } from "./actions";

export const metadata = { title: "Quiz стаи — ДЗИ по ИТ" };

export default async function QuizLandingPage() {
  let loggedIn = false;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      loggedIn = !!(await supabase.auth.getUser()).data.user;
    } catch {
      loggedIn = false;
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ color: "var(--text)" }}>
      <Link href="/" className="mb-8 text-sm" style={{ color: "var(--muted)", textDecoration: "none" }}>
        &larr; Начало
      </Link>

      <div className="text-center mb-10">
        <h1 className="font-extrabold text-3xl mb-2">⚡ Quiz стаи</h1>
        <p className="text-sm mx-auto" style={{ color: "var(--muted)", maxWidth: 440 }}>
          Учителят прави тест и го споделя с код или линк. Учениците влизат само с име
          и решават в зададеното време.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl">
        {/* ── Create a room ── */}
        <div className="glass rounded-2xl p-6 flex flex-col" style={{ border: "1px solid var(--border)" }}>
          <h2 className="font-bold text-lg mb-1">Създай стая</h2>
          <p className="text-sm mb-5 flex-1" style={{ color: "var(--muted)" }}>
            Избери теми, брой въпроси и време. Изисква акаунт.
          </p>
          {loggedIn ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/quiz/create"
                className="rounded-xl px-4 py-3 font-semibold text-white text-center"
                style={{ background: "var(--btn-gradient-wide)", boxShadow: "var(--accent-glow)" }}
              >
                Създай тест
              </Link>
              <Link href="/quiz/my" className="text-sm text-center" style={{ color: "var(--accent)" }}>
                Моите тестове →
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl px-4 py-3 font-semibold text-center"
              style={{ background: "var(--surface)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}
            >
              Влез, за да създадеш
            </Link>
          )}
        </div>

        {/* ── Join a room ── */}
        <div className="glass rounded-2xl p-6 flex flex-col" style={{ border: "1px solid var(--border)" }}>
          <h2 className="font-bold text-lg mb-1">Влез в стая</h2>
          <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
            Имаш код от учителя? Въведи го тук.
          </p>
          <form action={joinRoom} className="flex flex-col gap-3 mt-auto">
            <input
              type="text"
              name="code"
              required
              autoComplete="off"
              placeholder="напр. ABC234"
              maxLength={8}
              className="rounded-xl px-4 py-3 text-center font-mono tracking-widest uppercase focus:outline-none"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "1.1rem" }}
            />
            <button
              type="submit"
              className="rounded-xl px-4 py-3 font-semibold text-white"
              style={{ background: "var(--btn-gradient)", cursor: "pointer" }}
            >
              Влез
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
