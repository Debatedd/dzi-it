"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getState, REWARDS } from "@/lib/gamification";

const MONO = "var(--font-ibm-mono), monospace";

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

  const serial = String(pts).padStart(4, "0");
  const inkMuted = "rgba(27, 36, 48, 0.55)";

  const label = { fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: inkMuted };
  const num = { fontFamily: MONO, fontWeight: 600, fontSize: "1.35rem", lineHeight: 1, color: "var(--ink)" };

  return (
    <Link href="/rewards" style={{ textDecoration: "none" }} className="block mx-auto" >
      <div className="ticket flex items-stretch mx-auto" style={{ maxWidth: 440 }}>
        {/* ── left stub ── */}
        <div className="flex flex-col justify-center px-5 py-4" style={{ minWidth: 122 }}>
          <div style={label}>Билет №</div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: "1.5rem", color: "var(--red)", lineHeight: 1.1, marginTop: 3 }}>
            {serial}
          </div>
          <div style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.14em", color: inkMuted, marginTop: 4 }}>
            ДЗИ · ИТ
          </div>
        </div>

        {/* ── perforation ── */}
        <div className="ticket-perf my-2" />

        {/* ── right (stats) ── */}
        <div className="flex-1 flex items-center justify-around px-3 py-4 gap-2">
          <div className="text-center">
            <div style={num}>{pts}</div>
            <div style={{ ...label, marginTop: 5 }}>Точки</div>
          </div>
          <div className="text-center">
            <div style={{ ...num, color: streak >= 2 ? "var(--red)" : "var(--ink)" }}>{streak || "—"}</div>
            <div style={{ ...label, marginTop: 5 }}>Серия</div>
          </div>
          <div className="text-center">
            <div style={num}>{toNext ?? "✓"}</div>
            <div style={{ ...label, marginTop: 5 }}>До награда</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
