import { questions } from "@/lib/questions";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return questions.map((q) => ({ id: q.id }));
}

const LABELS = ["А", "Б", "В", "Г"];

export default async function QuestionPage(props: PageProps<"/question/[id]">) {
  const { id } = await props.params;
  const question = questions.find((q) => q.id === id);
  if (!question) notFound();

  const difficultyDots = ["", "●", "●●", "●●●"][question.difficulty];

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: "var(--bg)" }}
    >
      <div style={{ width: "100%", maxWidth: 540 }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium"
          style={{ color: "var(--muted)", textDecoration: "none" }}
        >
          ← Начало
        </Link>

        <div
          className="glass rounded-3xl p-7 mb-4"
          style={{ border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-5 text-xs" style={{ color: "var(--muted)" }}>
            <span
              className="rounded-xl px-3 py-1"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}
            >
              {question.topic}
            </span>
            <div className="flex items-center gap-3">
              <span>{question.year}</span>
              <span style={{ color: "#8b5cf6", fontWeight: 700 }}>{difficultyDots}</span>
            </div>
          </div>

          <p
            className="font-semibold leading-relaxed whitespace-pre-line mb-7"
            style={{ color: "var(--text)", fontSize: "1.05rem" }}
          >
            {question.question}
          </p>

          <div className="space-y-2.5">
            {question.options.map((opt, i) => {
              const isCorrect = i === question.correctIndex;
              return (
                <div
                  key={i}
                  className="px-4 py-3.5 rounded-2xl text-sm font-medium"
                  style={
                    isCorrect
                      ? {
                          background: "rgba(52,211,153,0.12)",
                          border: "1px solid rgba(52,211,153,0.4)",
                          color: "#6ee7b7",
                        }
                      : {
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border)",
                          color: "var(--muted)",
                        }
                  }
                >
                  <span
                    className="inline-flex items-center justify-center mr-3 rounded-lg text-xs font-bold"
                    style={{
                      width: 26,
                      height: 26,
                      background: "rgba(255,255,255,0.06)",
                      verticalAlign: "middle",
                    }}
                  >
                    {LABELS[i]}
                  </span>
                  {opt}
                  {isCorrect && <span className="ml-2 font-bold">✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-2xl px-5 py-4 text-sm leading-relaxed"
          style={{
            background: "rgba(6,182,212,0.08)",
            border: "1px solid rgba(6,182,212,0.25)",
            color: "#67e8f9",
          }}
        >
          <span className="font-semibold">Обяснение: </span>
          {question.explanation}
        </div>
      </div>
    </main>
  );
}
