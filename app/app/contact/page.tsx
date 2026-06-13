import Link from "next/link";
import ParallaxOrbs from "@/components/ParallaxOrbs";

export default function ContactPage() {
  return (
    <>
      <ParallaxOrbs />
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <div className="glass rounded-3xl p-10 w-full max-w-md text-center" style={{ border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-4">👤</div>
          <h1 className="font-extrabold mb-2" style={{ fontSize: "1.8rem", color: "var(--text)" }}>
            Виктор Петров
          </h1>
          <p className="mb-8" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            Създател на платформата
          </p>

          <a
            href="mailto:victorpetrov1914@gmail.com"
            className="inline-flex items-center gap-3 w-full justify-center px-6 py-4 rounded-2xl font-semibold transition-all"
            style={{
              background: "var(--option-selected-bg)",
              border: "1px solid var(--option-selected-border)",
              color: "var(--accent)",
              textDecoration: "none",
              fontSize: "0.95rem",
            }}
          >
            <span>✉️</span>
            victorpetrov1914@gmail.com
          </a>
        </div>

        <Link
          href="/"
          className="mt-8 text-sm"
          style={{ color: "var(--muted)", textDecoration: "none" }}
        >
          ← Към началото
        </Link>
      </main>
    </>
  );
}
