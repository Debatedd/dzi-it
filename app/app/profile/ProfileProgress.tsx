"use client";

import { useEffect, useState } from "react";
import { getState, saveState } from "@/lib/gamification";
import { saveProgress } from "./actions";

export default function ProfileProgress({ dbPoints, dbStreak }: { dbPoints: number; dbStreak: number }) {
  const [points, setPoints] = useState(dbPoints);
  const [streak, setStreak] = useState(dbStreak);

  // Reconcile this device's localStorage progress with the account's saved progress.
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

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="glass p-5 text-center" style={{ border: "1px solid var(--border)", borderRadius: 4 }}>
        <div style={{ fontFamily: "var(--font-ibm-mono), monospace", fontWeight: 600, fontSize: "2.1rem", lineHeight: 1, color: "var(--paper)" }}>{points}</div>
        <div style={{ fontFamily: "var(--font-ibm-mono), monospace", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginTop: 8 }}>точки</div>
      </div>
      <div className="glass p-5 text-center" style={{ border: "1px solid var(--border)", borderRadius: 4 }}>
        <div style={{ fontFamily: "var(--font-ibm-mono), monospace", fontWeight: 600, fontSize: "2.1rem", lineHeight: 1, color: streak >= 2 ? "var(--red)" : "var(--muted)" }}>
          {streak > 0 ? streak : "—"}
        </div>
        <div style={{ fontFamily: "var(--font-ibm-mono), monospace", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginTop: 8 }}>дни серия</div>
      </div>
    </div>
  );
}
