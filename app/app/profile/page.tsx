import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
          <span
            className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0"
            style={{ width: 60, height: 60, fontSize: "1.6rem", background: "var(--btn-gradient)" }}
          >
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="font-extrabold text-xl truncate">{name}</h1>
            <p className="text-sm truncate" style={{ color: "var(--muted)" }}>{user.email}</p>
            {joined && <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Член от {joined}</p>}
          </div>
        </div>

        <ProfileProgress dbPoints={profile?.points ?? 0} dbStreak={profile?.streak ?? 0} />

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
