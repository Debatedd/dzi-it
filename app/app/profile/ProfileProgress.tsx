"use client";

import { useEffect, useState } from "react";
import { getState, saveState, REWARDS } from "@/lib/gamification";
import { saveProgress } from "./actions";

export default function ProfileProgress({ dbPoints, dbStreak }: { dbPoints: number; dbStreak: number }) {
  const [points, setPoints] = useState(dbPoints);
  const [streak, setStreak] = useState(dbStreak);

  // Reconcile this device's localStorage progress with the account's saved progress.
  // We keep the higher of the two and sync both ways, so progress follows the account.
  useEffect(() => {
    const local = getState();
    const effPoints = Math.max(dbPoints, local.points);
    const effStreak = Math.max(dbStreak, local.streak);
    setPoints(effPoints);
    setStreak(effStreak);

    if (effPoints > local.points || effStreak > local.streak) {
      saveState({ points: effPoints, streak: effStreak, lastDate: local.lastDate });
    }
    if (effPoints > dbPoints || effStreak > dbStreak) {
      saveProgress(effPoints, effStreak);
    }
  }, [dbPoints, dbStreak]);

  const unlocked = REWARDS.filter((r) => r.threshold <= points).length;
  const nextReward = REWARDS.find((r) => r.threshold > points);
  const toNext = nextReward ? nextReward.threshold - points : null;
  const progressPct = nextReward
    ? Math.min(100, Math.round((points / nextReward.threshold) * 100))
    : 100;

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 text-center" style={{ border: "1px solid var(--border)" }}>
          <div className="font-extrabold gradient-text" style={{ fontSize: "2.2rem", lineHeight: 1 }}>{points}</div>
          <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>точки</div>
        </div>
        <div className="glass rounded-2xl p-5 text-center" style={{ border: "1px solid var(--border)" }}>
          <div className="font-extrabold" style={{ fontSize: "2.2rem", lineHeight: 1, color: streak >= 2 ? "#fb923c" : "var(--muted)" }}>
            {streak > 0 ? `🔥 ${streak}` : "—"}
          </div>
          <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>дни серия</div>
        </div>
      </div>

      {/* Progress to next reward */}
      <div className="glass rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-2 text-sm">
          <span style={{ color: "var(--text)", fontWeight: 600 }}>
            {toNext !== null ? `${nextReward!.icon} До следващ съвет` : "🏆 Всички съвети отключени!"}
          </span>
          <span style={{ color: "var(--muted)" }}>
            {toNext !== null ? `още ${toNext} точки` : `${unlocked}/${REWARDS.length}`}
          </span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 8, background: "var(--track-bg)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: "var(--progress-gradient)" }} />
        </div>
      </div>

      {/* Rewards list */}
      <div className="glass rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
        <h2 className="font-bold mb-3">Съвети ({unlocked}/{REWARDS.length})</h2>
        <div className="space-y-2">
          {REWARDS.map((r, i) => {
            const open = r.threshold <= points;
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border)", opacity: open ? 1 : 0.5 }}>
                <span style={{ fontSize: "1.2rem" }}>{open ? r.icon : "🔒"}</span>
                <span className="flex-1 text-sm" style={{ color: open ? "var(--text)" : "var(--muted)" }}>
                  {open ? r.tip : `Отключва се при ${r.threshold} точки`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
