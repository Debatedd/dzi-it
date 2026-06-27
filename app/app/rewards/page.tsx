"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getState, REWARDS } from "@/lib/gamification";

const SERIF = "var(--font-ibm-serif), Georgia, serif";
const MONO = "var(--font-ibm-mono), monospace";

function LockIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l4.5 4.5L19 7" />
    </svg>
  );
}

export default function RewardsPage() {
  const [pts, setPts]       = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const s = getState();
    setPts(s.points);
    setStreak(s.streak);
  }, []);

  return (
    <main className="max-w-xl mx-auto px-6 py-16">
      <Link href="/" className="inline-flex items-center gap-2 mb-8"
        style={{ color: "var(--muted)", textDecoration: "none", fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        ← Начало
      </Link>

      <h1 className="text-center mb-2" style={{ fontFamily: SERIF, fontWeight: 700, color: "var(--paper)", fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>
        Награди
      </h1>
      <p className="text-center mb-8" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        Решавай тестове, спечели точки, отключи съвети за ДЗИ
      </p>

      {/* Stats — ledger strip with a torn (zigzag) bottom edge */}
      <div
        className="flex items-stretch mb-10"
        style={{
          background: "#212B38",
          borderTop: "1px solid var(--border)",
          borderLeft: "1px solid var(--border)",
          borderRight: "1px solid var(--border)",
          padding: "18px 0 26px",
          clipPath:
            "polygon(0% 0%, 100% 0%, 100% 88%, 93.75% 100%, 87.5% 88%, 81.25% 100%, 75% 88%, 68.75% 100%, 62.5% 88%, 56.25% 100%, 50% 88%, 43.75% 100%, 37.5% 88%, 31.25% 100%, 25% 88%, 18.75% 100%, 12.5% 88%, 6.25% 100%, 0% 88%)",
        }}
      >
        {[
          { value: pts, label: "точки общо", color: "var(--paper)" },
          { value: streak > 0 ? streak : 0, label: "дни серия", color: streak >= 2 ? "var(--red)" : "var(--paper)" },
          { value: `${REWARDS.filter((r) => r.threshold <= pts).length}/${REWARDS.length}`, label: "съвета", color: "var(--paper)" },
        ].map((c, i) => (
          <div key={c.label} className="flex-1 text-center" style={{ borderLeft: i > 0 ? "1px solid #3A4452" : "none" }}>
            <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: "1.7rem", lineHeight: 1, color: c.color }}>{c.value}</div>
            <div style={{ fontFamily: MONO, color: "var(--muted)", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 7 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="glass mb-8 p-5 space-y-3" style={{ border: "1px solid var(--border)", borderRadius: 4 }}>
        <div style={{ fontFamily: MONO, color: "var(--paper)", fontSize: "0.74rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Как работи системата
        </div>
        <ul className="space-y-2 text-sm" style={{ color: "var(--muted)" }}>
          <li><span style={{ color: "var(--paper)", fontWeight: 600 }}>+10 точки</span> за всеки верен отговор на затворен или кратък въпрос</li>
          <li><span style={{ color: "var(--red)", fontWeight: 600 }}>Серия бонус</span> — реши тест в два поредни дни: +5 точки/ден (до +30)</li>
          <li><span style={{ color: "var(--accent-2-text)", fontWeight: 600 }}>Съвети</span> се отключват автоматично при достигане на праговете по-долу</li>
          <li style={{ fontSize: "0.8rem" }}>Точките и серията се пазят към акаунта ти и в браузъра.</li>
        </ul>
      </div>

      {/* Rewards list */}
      <div className="space-y-3">
        {REWARDS.map((r, i) => {
          const unlocked = pts >= r.threshold;
          const progress = Math.min((pts / r.threshold) * 100, 100);
          return (
            <div key={i} className="glass p-5"
              style={{ border: `1px solid ${unlocked ? "var(--accent-border)" : "var(--border)"}`, borderRadius: 4, opacity: unlocked ? 1 : 0.7 }}>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 44, height: 44, borderRadius: 4, border: `1px solid ${unlocked ? "var(--accent-2)" : "var(--border)"}` }}>
                  {unlocked ? <CheckIcon color="var(--accent-2-text)" /> : <LockIcon color="var(--muted)" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontFamily: SERIF, fontWeight: 600, color: unlocked ? "var(--paper)" : "var(--muted)", fontSize: "0.98rem" }}>{r.title}</span>
                    <span style={{ fontFamily: MONO, color: "var(--muted)", fontSize: "0.7rem", letterSpacing: "0.06em" }}>{r.threshold} ТОЧКИ</span>
                  </div>
                  {unlocked ? (
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{r.tip}</p>
                  ) : (
                    <>
                      <p className="text-sm" style={{ color: "var(--muted)" }}>Още {r.threshold - pts} точки за отключване</p>
                      <div className="overflow-hidden mt-2" style={{ height: 3, background: "var(--track-bg)", borderRadius: 2 }}>
                        <div className="h-full" style={{ width: `${progress}%`, background: "var(--red)", transition: "width 0.6s ease" }} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link href="/practice" className="inline-flex items-center gap-2 transition-opacity hover:opacity-90"
          style={{ background: "var(--red)", color: "var(--paper)", fontWeight: 600, padding: "14px 32px", borderRadius: 5, textDecoration: "none" }}>
          Спечели точки →
        </Link>
      </div>
    </main>
  );
}
