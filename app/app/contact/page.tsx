import Link from "next/link";

const SERIF = "var(--font-ibm-serif), Georgia, serif";
const MONO = "var(--font-ibm-mono), monospace";

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="glass p-10 w-full max-w-md text-center" style={{ border: "1px solid var(--border)", borderRadius: 4 }}>
        {/* outline user icon */}
        <div className="flex justify-center mb-5">
          <span className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, border: "1.5px solid var(--red)" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--paper)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" /><path d="M5 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" />
            </svg>
          </span>
        </div>

        <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "1.8rem", color: "var(--paper)" }}>
          Виктор Петров
        </h1>
        <p className="mt-2 mb-8" style={{ fontFamily: MONO, color: "var(--muted)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Създател на платформата
        </p>

        <a
          href="mailto:viktorskipetrov@proton.me"
          className="inline-flex items-center gap-3 w-full justify-center px-6 py-4 transition-colors"
          style={{ background: "transparent", border: "1px solid var(--red)", color: "var(--red)", textDecoration: "none", fontFamily: MONO, fontSize: "0.9rem", letterSpacing: "0.04em", borderRadius: 4 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
          </svg>
          viktorskipetrov@proton.me
        </a>
      </div>

      <Link href="/" className="mt-8" style={{ color: "var(--muted)", textDecoration: "none", fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        ← Към началото
      </Link>
    </main>
  );
}
