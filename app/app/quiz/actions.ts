"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  QUIZ_TOPICS,
  topicCounts,
  selectQuestionsForSpec,
  generateRoomCode,
  gradeQuiz,
  type StudentAnswers,
  type RoomQuestionIds,
  type TopicSpec,
} from "@/lib/quiz";

export async function createRoom(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim() || "Тест";
  const selectedTopics = formData.getAll("topics").map(String);
  const minutes = Math.max(1, Math.min(180, Number(formData.get("minutes") ?? 10)));

  // Read per-topic counts; clamp each to what's available in that topic.
  const spec: TopicSpec[] = [];
  for (const t of QUIZ_TOPICS) {
    if (!selectedTopics.includes(t.id)) continue;
    const avail = topicCounts(t.id);
    const closed = Math.max(0, Math.min(avail.closed, Number(formData.get(`closed_${t.id}`) ?? 0)));
    const open = Math.max(0, Math.min(avail.open, Number(formData.get(`open_${t.id}`) ?? 0)));
    if (closed + open > 0) spec.push({ topic: t.id, closed, open });
  }

  const numClosed = spec.reduce((s, t) => s + t.closed, 0);
  const numOpen = spec.reduce((s, t) => s + t.open, 0);

  if (numClosed + numOpen < 1) {
    redirect(`/quiz/create?error=${encodeURIComponent("Избери поне един въпрос от някоя тема.")}`);
  }

  const topics = spec.map((s) => s.topic);
  const questionIds = selectQuestionsForSpec(spec);

  // Generate a unique room code (retry on the rare collision).
  let code = generateRoomCode();
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase.from("quiz_rooms").select("id").eq("code", code).maybeSingle();
    if (!existing) break;
    code = generateRoomCode();
  }

  const { error } = await supabase.from("quiz_rooms").insert({
    code,
    host_id: user.id,
    title,
    topics,
    num_closed: numClosed,
    num_open: numOpen,
    time_limit_seconds: minutes * 60,
    question_ids: questionIds,
  });

  if (error) {
    redirect(`/quiz/create?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/quiz/host/${code}`);
}

export async function deleteRoom(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  // RLS ensures only the host can delete; participants cascade-delete.
  await supabase.from("quiz_rooms").delete().eq("code", code).eq("host_id", user.id);

  revalidatePath("/quiz/my");
  redirect("/quiz/my");
}

export async function joinRoom(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) redirect("/quiz");
  redirect(`/quiz/play/${code}`);
}

export async function submitResult(
  code: string,
  name: string,
  answers: StudentAnswers,
): Promise<{ score: number; maxScore: number } | { error: string }> {
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("quiz_rooms")
    .select("id, question_ids")
    .eq("code", code)
    .maybeSingle();

  if (!room) return { error: "Стаята не съществува." };

  const result = gradeQuiz(room.question_ids as RoomQuestionIds, answers);

  const { error } = await supabase.from("quiz_participants").insert({
    room_id: room.id,
    name: name.trim().slice(0, 40) || "Ученик",
    score: result.score,
    max_score: result.maxScore,
    answers,
  });

  if (error) return { error: error.message };

  return { score: result.score, maxScore: result.maxScore };
}
