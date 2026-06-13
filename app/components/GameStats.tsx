"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getState, REWARDS } from "@/lib/gamification";

export default function GameStats() {
  const [pts, setPts]       = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const s = getState();
    setPts(s.points);
    setStreak(s.streak);
  }, []);

  const nextReward = REWARDS.find((r) => r.threshold > pts);
  const toNext = nextReward ? nextReward.threshold - pts : null;
  const unlocked = REWARDS.filter((r) => r.threshold <= pts).length;

  return (
    <Link
      href="/rewards"
      style={{ textDecoration: "none" }}
    >
      <div
        className="glass rounded-2xl px-5 py-4 flex items-center gap-5 mx-auto"
        style={{
          border: "1px solid rgba(167,139,250,0.25)",
          maxWidth: 420,
          cursor: "pointer",
        }}
      >
        {/* Points */}
        <div className="text-center" style={{ minWidth: 64 }}>
          <div
            className="font-extrabold gradient-text"
            style={{ fontSize: "1.6rem", lineHeight: 1 }}
          >
            {pts}
          </div>
          <div style={{ color: "var(--muted)", fontSize: "0.72rem", marginTop: 2 }}>
            точки
          </div>
        </div>

        <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.1)" }} />

        {/* Streak */}
        <div className="text-center" style={{ minWidth: 56 }}>
          <div
            className="font-extrabold"
            style={{ fontSize: "1.6rem", lineHeight: 1, color: streak >= 2 ? "#fb923c" : "var(--muted)" }}
          >
            {streak > 0 ? `🔥${streak}` : "—"}
          </div>
          <div style={{ color: "var(--muted)", fontSize: "0.72rem", marginTop: 2 }}>
            серия
          </div>
        </div>

        <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.1)" }} />

        {/* Next reward */}
        <div className="flex-1 text-right">
          {toNext !== null ? (
            <>
              <div style={{ color: "var(--text)", fontSize: "0.82rem", fontWeight: 600 }}>
                {nextReward!.icon} до следващ съвет
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
                още {toNext} точки
              </div>
            </>
          ) : (
            <div style={{ color: "#4ade80", fontSize: "0.82rem", fontWeight: 600 }}>
              🏆 Всички {unlocked} съвета отключени!
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
