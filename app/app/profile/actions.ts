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
