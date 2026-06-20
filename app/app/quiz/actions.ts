"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  selectQuestions,
  availableCounts,
  generateRoomCode,
  gradeQuiz,
  type StudentAnswers,
  type RoomQuestionIds,
} from "@/lib/quiz";

export async function createRoom(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim() || "Тест";
  const topics = formData.getAll("topics").map(String);
  const numClosed = Math.max(0, Math.min(50, Number(formData.get("numClosed") ?? 0)));
  const numOpen = Math.max(0, Math.min(50, Number(formData.get("numOpen") ?? 0)));
  const minutes = Math.max(1, Math.min(180, Number(formData.get("minutes") ?? 10)));

  if (numClosed + numOpen < 1) {
    redirect(`/quiz/create?error=${encodeURIComponent("Избери поне един въпрос.")}`);
  }

  const avail = availableCounts(topics);
  if (numClosed > avail.closed || numOpen > avail.open) {
    redirect(`/quiz/create?error=${encodeURIComponent(`Няма достатъчно въпроси (макс. ${avail.closed} затворени, ${avail.open} отворени за избраните теми).`)}`);
  }

  const questionIds = selectQuestions(topics, numClosed, numOpen);

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
