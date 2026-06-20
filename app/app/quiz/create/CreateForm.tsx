"use client";

import { useState } from "react";
import { QUIZ_TOPICS, availableCounts } from "@/lib/quiz";
import { createRoom } from "../actions";

export default function CreateForm({ error }: { error?: string }) {
  const [topics, setTopics] = useState<string[]>([]);
  const [numClosed, setNumClosed] = useState(8);
  const [numOpen, setNumOpen] = useState(2);
  const [minutes, setMinutes] = useState(15);

  const avail = availableCounts(topics);

  function toggle(id: string) {
    setTopics((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  }

  const inputStyle = {
    background: "var(--input-bg)",
    border: "1px solid var(--border)",
    color: "var(--text)",
  } as const;

  return (
    <form action={createRoom} className="glass rounded-2xl p-6 w-full max-w-lg flex flex-col gap-5" style={{ border: "1px solid var(--border)" }}>
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--wrong-bg)", border: "1px solid var(--wrong-border)", color: "var(--wrong-text)" }}>
          {error}
        </div>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span style={{ color: "var(--muted)" }}>Име на теста</span>
        <input type="text" name="title" maxLength={60} placeholder="напр. Тест по Уеб дизайн" className="rounded-xl px-4 py-2.5 focus:outline-none" style={inputStyle} />
      </label>

      <div className="flex flex-col gap-2 text-sm">
        <span style={{ color: "var(--muted)" }}>Теми (празно = всички)</span>
        <div className="grid grid-cols-1 gap-2">
          {QUIZ_TOPICS.map((t) => {
            const on = topics.includes(t.id);
            return (
              <label
                key={t.id}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 cursor-pointer"
                style={{
                  background: on ? "var(--option-selected-bg)" : "var(--input-bg)",
                  border: `1px solid ${on ? "var(--option-selected-border)" : "var(--border)"}`,
                  color: on ? "var(--option-selected-text)" : "var(--text)",
                }}
              >
                <input type="checkbox" name="topics" value={t.id} checked={on} onChange={() => toggle(t.id)} className="accent-violet-500" />
                {t.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span style={{ color: "var(--muted)" }}>Затворени ({avail.closed} налични)</span>
          <input type="number" name="numClosed" min={0} max={avail.closed} value={numClosed}
            onChange={(e) => setNumClosed(Math.max(0, Math.min(avail.closed, Number(e.target.value))))}
            className="rounded-xl px-4 py-2.5 focus:outline-none" style={inputStyle} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span style={{ color: "var(--muted)" }}>Отворени ({avail.open} налични)</span>
          <input type="number" name="numOpen" min={0} max={avail.open} value={numOpen}
            onChange={(e) => setNumOpen(Math.max(0, Math.min(avail.open, Number(e.target.value))))}
            className="rounded-xl px-4 py-2.5 focus:outline-none" style={inputStyle} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span style={{ color: "var(--muted)" }}>Време за теста (минути)</span>
        <input type="number" name="minutes" min={1} max={180} value={minutes}
          onChange={(e) => setMinutes(Math.max(1, Math.min(180, Number(e.target.value))))}
          className="rounded-xl px-4 py-2.5 focus:outline-none" style={inputStyle} />
      </label>

      <button
        type="submit"
        disabled={numClosed + numOpen < 1}
        className="rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-40"
        style={{ background: "var(--btn-gradient-wide)", boxShadow: "var(--accent-glow)", cursor: "pointer" }}
      >
        Създай стаята
      </button>
    </form>
  );
}
