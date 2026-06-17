"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (password.length < 6) {
    redirect(`/login?mode=register&error=${encodeURIComponent("Паролата трябва да е поне 6 символа.")}`);
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/login?mode=register&error=${encodeURIComponent(error.message)}`);
  }

  // If email confirmation is OFF, a session is created immediately → go home.
  // If it's ON, the user must click the link in their email first.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  redirect("/login?message=check-email");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
