import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeleteRoomButton from "./DeleteRoomButton";

export const metadata = { title: "Моите тестове — ДЗИ по ИТ" };

interface Room {
  code: string;
  title: string | null;
  num_closed: number;
  num_open: number;
  time_limit_seconds: number;
  created_at: string;
}

export default async function MyRoomsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rooms } = await supabase
    .from("quiz_rooms")
    .select("code, title, num_closed, num_open, time_limit_seconds, created_at")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false });

  const list = (rooms ?? []) as Room[];

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16" style={{ color: "var(--text)" }}>
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/quiz" className="text-sm" style={{ color: "var(--muted)", textDecoration: "none" }}>
            &larr; Quiz стаи
          </Link>
          <Link
            href="/quiz/create"
            className="text-sm font-semibold px-4 py-2 rounded-xl text-white"
            style={{ background: "var(--btn-gradient)" }}
          >
            + Нов тест
          </Link>
        </div>

        <h1 className="font-extrabold text-2xl mb-6">Моите тестове</h1>

        {list.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center" style={{ border: "1px solid var(--border)" }}>
            <p className="mb-4" style={{ color: "var(--muted)" }}>Още нямаш създадени тестове.</p>
            <Link href="/quiz/create" className="font-semibold" style={{ color: "var(--accent)" }}>
              Създай първия си тест →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((r) => (
              <div key={r.code} className="glass rounded-2xl px-5 py-4 flex items-center gap-4" style={{ border: "1px solid var(--border)" }}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{r.title ?? "Тест"}</div>
                  <div className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                    Код <span className="font-mono" style={{ color: "var(--accent-2-text)" }}>{r.code}</span>
                    {" · "}{r.num_closed + r.num_open} въпроса · {Math.round(r.time_limit_seconds / 60)} мин
                    {" · "}{new Date(r.created_at).toLocaleDateString("bg-BG")}
                  </div>
                </div>
                <Link
                  href={`/quiz/host/${r.code}`}
                  className="text-sm px-3 py-1.5 rounded-lg"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none" }}
                >
                  Отвори
                </Link>
                <DeleteRoomButton code={r.code} title={r.title ?? "Тест"} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
