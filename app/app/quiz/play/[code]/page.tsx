import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { roomQuestions, type RoomQuestionIds } from "@/lib/quiz";
import PlayQuiz from "./PlayQuiz";

export const metadata = { title: "Тест — ДЗИ по ИТ" };

export default async function PlayRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("quiz_rooms")
    .select("title, time_limit_seconds, question_ids")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (!room) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ color: "var(--text)" }}>
        <p className="mb-2 font-bold text-lg">Стаята не съществува</p>
        <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>Провери кода с учителя.</p>
        <Link href="/quiz" style={{ color: "var(--accent)" }}>← Quiz стаи</Link>
      </main>
    );
  }

  const qs = roomQuestions(room.question_ids as RoomQuestionIds);

  // Strip correct answers before sending to the browser — grading is server-side.
  const closed = qs.closed.map((q) => ({ id: q.id, question: q.question, options: q.options }));
  const open = qs.open.map((q) => ({ id: q.id, question: q.question }));

  return (
    <PlayQuiz
      code={code.toUpperCase()}
      title={room.title ?? "Тест"}
      seconds={room.time_limit_seconds}
      closed={closed}
      open={open}
    />
  );
}
