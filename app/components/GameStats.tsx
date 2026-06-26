"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getState, REWARDS } from "@/lib/gamification";

const MONO = "var(--font-ibm-mono), monospace";
const HOLE = "#1B2430"; // page background — makes the perforation look punched through

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
  const label = { fontFamily: MONO, fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "var(--muted)" };
  const num = { fontFamily: MONO, fontWeight: 600, fontSize: "1.35rem", lineHeight: 1, color: "var(--paper)" };
  const hole = { position: "absolute" as const, right: -6, width: 12, height: 12, borderRadius: "50%", background: HOLE };

  return (
    <Link href="/rewards" style={{ textDecoration: "none" }} className="block mx-auto">
      <div
        className="flex items-stretch mx-auto"
        style={{
          maxWidth: 440,
          background: "#212B38",
          border: "1px solid var(--border)",
          borderRadius: 4,
          transform: "rotate(-1.2deg)",
          clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)",
        }}
      >
        {/* ── left stub ── */}
        <div className="relative flex flex-col justify-center px-5 py-4" style={{ minWidth: 122, borderRight: "1px dashed #3A4452" }}>
          <div style={label}>Билет №</div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: "1.5rem", color: "var(--red)", lineHeight: 1.1, marginTop: 3 }}>
            {serial}
          </div>
          <div style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.14em", color: "var(--muted)", marginTop: 4 }}>
            ДЗИ · ИТ
          </div>
          {/* perforation holes on the dashed line */}
          <span style={{ ...hole, top: 5 }} />
          <span style={{ ...hole, bottom: 5 }} />
        </div>

        {/* ── right (stats) ── */}
        <div className="flex-1 flex items-center justify-around px-4 py-4 gap-2">
          <div className="text-center">
            <div style={num}>{pts}</div>
            <div style={{ ...label, marginTop: 5 }}>Точки</div>
          </div>
          <div className="text-center">
            <div style={{ ...num, color: streak >= 2 ? "var(--red)" : "var(--paper)" }}>{streak || "—"}</div>
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
