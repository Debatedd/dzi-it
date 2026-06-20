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
  const username = String(formData.get("username") ?? "").trim();

  const regErr = (msg: string) => `/login?mode=register&error=${encodeURIComponent(msg)}`;

  if (username.length < 3 || username.length > 20) {
    redirect(regErr("Потребителското име трябва да е между 3 и 20 символа."));
  }
  if (/\s/.test(username)) {
    redirect(regErr("Потребителското име не може да съдържа интервали."));
  }
  if (password.length < 6) {
    redirect(regErr("Паролата трябва да е поне 6 символа."));
  }

  // Pre-check username availability (profiles are publicly readable).
  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .maybeSingle();
  if (taken) {
    redirect(regErr("Това потребителско име е заето. Избери друго."));
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    redirect(regErr(error.message));
  }

  // If email confirmation is OFF, a session is created immediately → save the
  // chosen username on the profile, then go home.
  if (data.session && data.user) {
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", data.user.id);
    if (profileErr) {
      redirect(regErr("Това потребителско име е заето. Избери друго."));
    }
    revalidatePath("/", "layout");
    redirect("/");
  }

  // If email confirmation is ON, the user must click the link in their email first.
  redirect("/login?message=check-email");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
