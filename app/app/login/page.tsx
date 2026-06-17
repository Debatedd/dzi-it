import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; mode?: string }>;
}) {
  // If Supabase env vars are missing (e.g. not yet set on Vercel), show a friendly
  // message instead of crashing with a 500.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ color: "var(--text)" }}>
        <div className="glass rounded-2xl max-w-sm p-7" style={{ border: "1px solid var(--border)" }}>
          <h1 className="font-bold text-lg mb-2">Акаунтите се настройват</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Системата за вход още се конфигурира. Опитай отново след малко.
          </p>
          <Link href="/" className="inline-block mt-5 text-sm" style={{ color: "var(--accent)" }}>
            &larr; Към началото
          </Link>
        </div>
      </main>
    );
  }

  // Already logged in? No reason to be here.
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");

  const sp = await searchParams;
  const isRegister = sp.mode === "register";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ color: "var(--text)" }}>
      <Link
        href="/"
        className="mb-8 text-sm"
        style={{ color: "var(--muted)", textDecoration: "none" }}
      >
        &larr; Начало
      </Link>

      <div className="glass rounded-2xl w-full max-w-sm p-7" style={{ border: "1px solid var(--border)" }}>
        <h1 className="font-extrabold text-xl mb-1">
          {isRegister ? "Създай акаунт" : "Влез в акаунта си"}
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          {isRegister
            ? "Прогресът и точките ти ще се пазят на всички устройства."
            : "Добре дошъл отново!"}
        </p>

        {sp.message === "check-email" && (
          <div
            className="rounded-xl px-4 py-3 mb-4 text-sm"
            style={{ background: "var(--correct-bg)", border: "1px solid var(--correct-border)", color: "var(--correct-text)" }}
          >
            Изпратихме ти имейл за потвърждение. Отвори линка в него, за да активираш акаунта си.
          </div>
        )}

        {sp.error && (
          <div
            className="rounded-xl px-4 py-3 mb-4 text-sm"
            style={{ background: "var(--wrong-bg)", border: "1px solid var(--wrong-border)", color: "var(--wrong-text)" }}
          >
            {sp.error}
          </div>
        )}

        <form className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span style={{ color: "var(--muted)" }}>Имейл</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="ime@example.com"
              className="rounded-xl px-4 py-2.5 focus:outline-none"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span style={{ color: "var(--muted)" }}>Парола</span>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="поне 6 символа"
              className="rounded-xl px-4 py-2.5 focus:outline-none"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </label>

          <button
            formAction={isRegister ? signup : login}
            className="mt-2 rounded-xl px-4 py-3 font-semibold text-white"
            style={{ background: "var(--btn-gradient-wide)", boxShadow: "var(--accent-glow)" }}
          >
            {isRegister ? "Регистрация" : "Вход"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm" style={{ color: "var(--muted)" }}>
          {isRegister ? (
            <>
              Вече имаш акаунт?{" "}
              <Link href="/login" style={{ color: "var(--accent)" }}>
                Влез
              </Link>
            </>
          ) : (
            <>
              Нямаш акаунт?{" "}
              <Link href="/login?mode=register" style={{ color: "var(--accent)" }}>
                Регистрирай се
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
