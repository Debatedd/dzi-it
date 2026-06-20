"use client";

import { useEffect, useState, useCallback } from "react";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/client";

interface Participant {
  id: string;
  name: string;
  score: number;
  max_score: number;
  finished_at: string;
}

export default function HostPanel({
  code,
  roomId,
  title,
  minutes,
  numClosed,
  numOpen,
}: {
  code: string;
  roomId: string;
  title: string;
  minutes: number;
  numClosed: number;
  numOpen: number;
}) {
  const [joinUrl, setJoinUrl] = useState("");
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const url = `${window.location.origin}/quiz/play/${code}`;
    setJoinUrl(url);
    QRCode.toDataURL(url, { width: 220, margin: 1, color: { dark: "#0f1629", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [code]);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("quiz_participants")
      .select("id, name, score, max_score, finished_at")
      .eq("room_id", roomId)
      .order("score", { ascending: false });
    if (data) setParticipants(data as Participant[]);
  }, [roomId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  function copy() {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-5">
      <div className="glass rounded-2xl p-6" style={{ border: "1px solid var(--border)" }}>
        <h1 className="font-extrabold text-xl mb-1">{title}</h1>
        <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
          {numClosed} затворени · {numOpen} отворени · {minutes} мин
        </p>

        <div className="flex flex-col sm:flex-row gap-6 items-center">
          {qr && (
            <img src={qr} alt="QR код" width={180} height={180} className="rounded-xl" style={{ background: "#fff", padding: 8 }} />
          )}
          <div className="flex-1 w-full">
            <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>Код за достъп</p>
            <p className="font-mono font-extrabold tracking-[0.3em] mb-4" style={{ fontSize: "2rem", color: "var(--accent-2-text)" }}>
              {code}
            </p>
            <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>Линк за учениците</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={joinUrl}
                className="flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
              <button
                onClick={copy}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: "var(--btn-gradient)", cursor: "pointer" }}
              >
                {copied ? "✓" : "Копирай"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6" style={{ border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Резултати ({participants.length})</h2>
          <span className="text-xs" style={{ color: "var(--muted)" }}>обновява се автоматично</span>
        </div>
        {participants.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>Все още никой не е предал. Сподели кода или линка.</p>
        ) : (
          <div className="space-y-2">
            {participants.map((p, i) => {
              const pct = p.max_score ? Math.round((p.score / p.max_score) * 100) : 0;
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-xl px-4 py-2.5" style={{ background: "var(--input-bg)", border: "1px solid var(--border)" }}>
                  <span className="font-bold w-6 text-center" style={{ color: "var(--muted)" }}>{i + 1}</span>
                  <span className="flex-1 font-medium truncate">{p.name}</span>
                  <span className="font-bold" style={{ color: pct >= 70 ? "var(--green)" : pct >= 40 ? "#fbbf24" : "var(--red)" }}>
                    {p.score}/{p.max_score} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
