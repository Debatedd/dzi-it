"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ParallaxOrbs from "@/components/ParallaxOrbs";
import { getState, REWARDS } from "@/lib/gamification";

export default function RewardsPage() {
  const [pts, setPts]       = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const s = getState();
    setPts(s.points);
    setStreak(s.streak);
  }, []);

  return (
    <>
      <ParallaxOrbs />
      <main className="relative z-10 max-w-xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium"
          style={{ color: "var(--muted)", textDecoration: "none" }}
        >
          ← Начало
        </Link>

        <h1
          className="font-extrabold text-center mb-2"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", color: "var(--text)" }}
        >
          <span className="gradient-text">Награди</span>
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
              <div style={{ fontFamily: "var(--font-ibm-mono), monospace", fontWeight: 600, fontSize: "1.7rem", lineHeight: 1, color: c.color }}>
                {c.value}
              </div>
              <div style={{ fontFamily: "var(--font-ibm-mono), monospace", color: "var(--muted)", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 7 }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div
          className="glass rounded-2xl px-5 py-4 mb-8 space-y-3"
          style={{ border: "1px solid rgba(34,211,238,0.2)" }}
        >
          <div className="font-semibold" style={{ color: "var(--topic-data)", fontSize: "0.9rem" }}>
            ℹ️ Как работи системата?
          </div>
          <ul className="space-y-2 text-sm" style={{ color: "var(--muted)" }}>
            <li>
              <span style={{ color: "var(--text)", fontWeight: 600 }}>+10 точки</span>{" "}
              за всеки верен отговор на затворен или кратък въпрос
            </li>
            <li>
              <span style={{ color: "var(--streak-text)", fontWeight: 600 }}>🔥 Серия бонус</span>{" "}
              — реши тест в два поредни дни: +5 точки/ден (до +30)
            </li>
            <li>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>🏆 Съвети</span>{" "}
              се отключват автоматично при достигане на праговете по-долу
            </li>
            <li style={{ fontSize: "0.8rem" }}>
              Точките и серията се пазят в браузъра (localStorage) — не се нулират при рестарт.
            </li>
          </ul>
        </div>

        {/* Rewards list */}
        <div className="space-y-4">
          {REWARDS.map((r, i) => {
            const unlocked = pts >= r.threshold;
            const progress = Math.min((pts / r.threshold) * 100, 100);
            return (
              <div
                key={i}
                className="glass rounded-2xl p-5"
                style={{
                  border: unlocked
                    ? "1px solid rgba(167,139,250,0.4)"
                    : "1px solid var(--border)",
                  opacity: unlocked ? 1 : 0.6,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      width: 48,
                      height: 48,
                      background: unlocked ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
                      border: unlocked ? "1px solid rgba(167,139,250,0.4)" : "1px solid var(--border)",
                      filter: unlocked ? "none" : "grayscale(1)",
                    }}
                  >
                    {unlocked ? r.icon : "🔒"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: unlocked ? "var(--text)" : "var(--muted)" }}
                      >
                        {r.title}
                      </span>
                      <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                        {r.threshold} точки
                      </span>
                    </div>

                    {unlocked ? (
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                        {r.tip}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm" style={{ color: "var(--muted)" }}>
                          Още {r.threshold - pts} точки за отключване
                        </p>
                        <div
                          className="rounded-full overflow-hidden mt-2"
                          style={{ height: 3, background: "var(--track-bg)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${progress}%`,
                              background: "var(--progress-gradient)",
                              transition: "width 0.6s ease",
                            }}
                          />
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
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-white"
            style={{
              background: "var(--hero-gradient)",
              boxShadow: "var(--accent-glow)",
              textDecoration: "none",
            }}
          >
            Спечели точки →
          </Link>
        </div>
      </main>
    </>
  );
}
