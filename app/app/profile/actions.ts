"use server";

import { createClient } from "@/lib/supabase/server";

// Persist the account's points/streak to the profiles table (cross-device).
export async function saveProgress(points: number, streak: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ points, streak, last_active: new Date().toISOString().slice(0, 10) })
    .eq("id", user.id);
}

// Record per-question results so the profile can analyse strengths/weaknesses.
// No-op for anonymous users.
export async function recordAnswers(results: { questionId: string; correct: boolean }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || results.length === 0) return;

  const ids = results.map((r) => r.questionId);
  const { data: existing } = await supabase
    .from("question_progress")
    .select("question_id, attempts, correct_count")
    .eq("user_id", user.id)
    .in("question_id", ids);

  const prev = new Map((existing ?? []).map((e) => [e.question_id, e]));
  const now = new Date().toISOString();

  const rows = results.map((r) => {
    const p = prev.get(r.questionId);
    return {
      user_id: user.id,
      question_id: r.questionId,
      attempts: (p?.attempts ?? 0) + 1,
      correct_count: (p?.correct_count ?? 0) + (r.correct ? 1 : 0),
      last_correct: r.correct,
      updated_at: now,
    };
  });

  await supabase.from("question_progress").upsert(rows, { onConflict: "user_id,question_id" });
}
