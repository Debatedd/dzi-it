"use client";

import { useEffect, useState } from "react";
import { getTodayChallenge, getDailyState, DAILY_BONUS, type DailyChallenge, type DailyState } from "@/lib/dailyChallenge";

const SERIF = "var(--font-ibm-serif), Georgia, serif";
const MONO = "var(--font-ibm-mono), monospace";

export default function DailyChallengeCard() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [state, setState] = useState<DailyState | null>(null);

  useEffect(() => {
    setChallenge(getTodayChallenge());
    setState(getDailyState());
  }, []);

  if (!challenge || !state) return null;

  const pct = Math.min((state.progress / challenge.target) * 100, 100);
  const label = { fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "var(--muted)" };

  return (
    <div className="glass p-5 relative" style={{ border: `1px solid ${state.done ? "var(--green)" : "var(--border)"}`, borderRadius: 4 }}>
      <span className="absolute left-0 top-0 bottom-0" style={{ width: 3, background: state.done ? "var(--green)" : "var(--red)" }} />
      <div className="flex items-baseline justify-between">
        <div style={label}>Дневно предизвикателство</div>
        <div style={{ fontFamily: MONO, fontSize: "0.68rem", letterSpacing: "0.08em", color: state.done ? "var(--green)" : "var(--muted)" }}>
          {state.done ? `Изпълнено · +${DAILY_BONUS} т.` : `+${DAILY_BONUS} т. бонус`}
        </div>
      </div>
      <p className="mt-2" style={{ fontFamily: SERIF, fontWeight: 600, color: "var(--paper)", fontSize: "1.02rem" }}>
        {challenge.label}
      </p>
      <div className="flex items-center gap-3 mt-3">
        <div className="flex-1 overflow-hidden" style={{ height: 4, borderRadius: 2, background: "var(--track-bg)" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: state.done ? "var(--green)" : "var(--red)", transition: "width 0.5s ease" }} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: "0.72rem", color: "var(--paper)" }}>
          {state.progress}/{challenge.target}
        </span>
      </div>
    </div>
  );
}
