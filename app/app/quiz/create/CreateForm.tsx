"use client";

import { useState } from "react";
import { QUIZ_TOPICS, topicCounts } from "@/lib/quiz";
import { createRoom } from "../actions";

interface TopicSel { closed: number; open: number; }

export default function CreateForm({ error }: { error?: string }) {
  const [sel, setSel] = useState<Record<string, TopicSel>>({});
  const [minutes, setMinutes] = useState(15);

  const totalClosed = Object.values(sel).reduce((s, t) => s + t.closed, 0);
  const totalOpen = Object.values(sel).reduce((s, t) => s + t.open, 0);
  const total = totalClosed + totalOpen;

  function toggle(id: string) {
    setSel((s) => {
      const next = { ...s };
      if (next[id]) delete next[id];
      else next[id] = { closed: 0, open: 0 };
      return next;
    });
  }

  function setCount(id: string, kind: "closed" | "open", value: number, max: number) {
    setSel((s) => ({ ...s, [id]: { ...s[id], [kind]: Math.max(0, Math.min(max, value || 0)) } }));
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
        <span style={{ color: "var(--muted)" }}>Теми и брой въпроси</span>
        <div className="flex flex-col gap-2">
          {QUIZ_TOPICS.map((t) => {
            const on = !!sel[t.id];
            const avail = topicCounts(t.id);
            return (
              <div
                key={t.id}
                className="rounded-xl px-4 py-3"
                style={{
                  background: on ? "var(--option-selected-bg)" : "var(--input-bg)",
                  border: `1px solid ${on ? "var(--option-selected-border)" : "var(--border)"}`,
                }}
              >
                <label className="flex items-center gap-3 cursor-pointer" style={{ color: on ? "var(--option-selected-text)" : "var(--text)" }}>
                  {/* hidden marker so the server knows this topic is included */}
                  {on && <input type="hidden" name="topics" value={t.id} />}
                  <input type="checkbox" checked={on} onChange={() => toggle(t.id)} className="accent-violet-500" />
                  <span className="flex-1">{t.label}</span>
                </label>

                {on && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--muted)" }}>
                      Затворени ({avail.closed})
                      <input
                        type="number" name={`closed_${t.id}`} min={0} max={avail.closed}
                        value={sel[t.id].closed}
                        onChange={(e) => setCount(t.id, "closed", Number(e.target.value), avail.closed)}
                        className="rounded-lg px-3 py-2 focus:outline-none" style={inputStyle}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs" style={{ color: "var(--muted)" }}>
                      Отворени ({avail.open})
                      <input
                        type="number" name={`open_${t.id}`} min={0} max={avail.open}
                        value={sel[t.id].open}
                        onChange={(e) => setCount(t.id, "open", Number(e.target.value), avail.open)}
                        className="rounded-lg px-3 py-2 focus:outline-none" style={inputStyle}
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Общо: {totalClosed} затворени · {totalOpen} отворени
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span style={{ color: "var(--muted)" }}>Време за теста (минути)</span>
        <input type="number" name="minutes" min={1} max={180} value={minutes}
          onChange={(e) => setMinutes(Math.max(1, Math.min(180, Number(e.target.value))))}
          className="rounded-xl px-4 py-2.5 focus:outline-none" style={inputStyle} />
      </label>

      <button
        type="submit"
        disabled={total < 1}
        className="rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-40"
        style={{ background: "var(--btn-gradient-wide)", boxShadow: "var(--accent-glow)", cursor: "pointer" }}
      >
        Създай стаята
      </button>
    </form>
  );
}
