import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateForm from "./CreateForm";

export const metadata = { title: "Създай тест — ДЗИ по ИТ" };

export default async function CreateRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sp = await searchParams;

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16" style={{ color: "var(--text)" }}>
      <div className="w-full max-w-lg mb-6">
        <Link href="/quiz" className="text-sm" style={{ color: "var(--muted)", textDecoration: "none" }}>
          &larr; Quiz стаи
        </Link>
        <h1 className="font-extrabold text-2xl mt-4">Създай тест</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Настрой теста — после ще получиш код, линк и QR за учениците.
        </p>
      </div>
      <CreateForm error={sp.error} />
    </main>
  );
}
