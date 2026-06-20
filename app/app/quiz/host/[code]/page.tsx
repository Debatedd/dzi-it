import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HostPanel from "./HostPanel";

export const metadata = { title: "Управление на тест — ДЗИ по ИТ" };

export default async function HostRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: room } = await supabase
    .from("quiz_rooms")
    .select("id, host_id, title, num_closed, num_open, time_limit_seconds")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (!room || room.host_id !== user.id) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ color: "var(--text)" }}>
        <p className="mb-4" style={{ color: "var(--muted)" }}>Стаята не съществува или не е твоя.</p>
        <Link href="/quiz" style={{ color: "var(--accent)" }}>← Quiz стаи</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-12" style={{ color: "var(--text)" }}>
      <div className="w-full max-w-2xl mb-6">
        <Link href="/quiz" className="text-sm" style={{ color: "var(--muted)", textDecoration: "none" }}>
          &larr; Quiz стаи
        </Link>
      </div>
      <HostPanel
        code={code.toUpperCase()}
        roomId={room.id}
        title={room.title ?? "Тест"}
        minutes={Math.round(room.time_limit_seconds / 60)}
        numClosed={room.num_closed}
        numOpen={room.num_open}
      />
    </main>
  );
}
