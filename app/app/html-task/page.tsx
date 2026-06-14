"use client";

import { useRef, useState } from "react";
import Link from "next/link";

interface CheckResult {
  label: string;
  pass: boolean;
  note?: string;
}

interface Task {
  id: string;
  title: string;
  year: string;
  description: string;
  requirements: string[];
  starter: string;
  runChecks: (doc: Document, containerW: number) => CheckResult[];
}

// ── helpers ──────────────────────────────────────────────────────────────────

function normalizeColor(c: string): string {
  if (!c) return "";
  c = c.trim().toLowerCase();
  const rgb = c.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (rgb) return "#" + [rgb[1], rgb[2], rgb[3]].map((x) => parseInt(x).toString(16).padStart(2, "0")).join("");
  return c;
}
function colorMatch(computed: string, expected: string) { return normalizeColor(computed) === expected.toLowerCase(); }
function pxClose(v: string, n: number, tol = 2) { return Math.abs(parseFloat(v) - n) <= tol; }
function pctClose(v: string, w: number, pct: number, tol = 3) { return Math.abs(parseFloat(v) - (w * pct) / 100) <= tol * (w / 100); }

// ── task definitions ──────────────────────────────────────────────────────────

const TASKS: Task[] = [
  {
    id: "zad28",
    title: "Задача 28",
    year: "ДЗИ 2026",
    description: "Създайте уеб страница за информационна кампания с HTML и CSS.",
    requirements: [
      "Заглавие в браузъра - Рециклиране",
      "Блок 1 - ширина 80%, шрифт Georgia",
      "Header (Блок 2) - височина 90px",
      "Header - фон #2E7D32",
      "Header - вътрешни отстояния 20px",
      "Лого изображение (logo.png) в header-а",
      "Навигация - минимум 2 линка",
      "Навигация - цвят на линкове #ffffff",
      "Навигация - размер на шрифт 20px",
      "Навигация - без подчертаване",
      "Линк към eea.europa.eu/bg",
      "Блокове 3 и 4 - ширина 50%",
      "Блокове 3 и 4 - височина 400px",
      "Блокове 3 и 4 - фон #1B5E20",
      "Изображение blue_green_yellow.png",
      "4 еднакви блока (6,7,8,9) - ширина 25%",
      "Блокове 6-9 - височина 400px",
      "Блокове 6-9 - фон #e8f5e9",
      "Footer (Блок 10) - височина 50px",
      "Footer - фон #1B5E20",
    ],
    starter: [
      "<!DOCTYPE html>",
      '<html lang="bg">',
      "<head>",
      '  <meta charset="UTF-8">',
      "  <title></title>",
      "  <style>",
      "    /* CSS тук */",
      "  </style>",
      "</head>",
      "<body>",
      "",
      "</body>",
      "</html>",
    ].join("\n"),
    runChecks(doc, containerW) {
      const r: CheckResult[] = [];
      const dv = doc.defaultView!;
      const req = this.requirements;

      r.push({ label: req[0], pass: doc.title.toLowerCase().includes("рециклиране") });

      const block1 = doc.querySelector("body > div, body > section, body > main") as HTMLElement | null;
      if (block1) {
        const cs = dv.getComputedStyle(block1);
        r.push({ label: req[1], pass: pctClose(cs.width, containerW, 80) && cs.fontFamily.toLowerCase().includes("georgia"), note: `w:${cs.width} f:${cs.fontFamily}` });
      } else {
        r.push({ label: req[1], pass: false, note: "не е намерен главен блок" });
      }

      const header = doc.querySelector("header") as HTMLElement | null;
      const hcs = header ? dv.getComputedStyle(header) : null;
      r.push({ label: req[2], pass: !!hcs && pxClose(hcs.height, 90), note: hcs?.height });
      r.push({ label: req[3], pass: !!hcs && colorMatch(hcs.backgroundColor, "#2e7d32"), note: hcs ? normalizeColor(hcs.backgroundColor) : "" });
      r.push({ label: req[4], pass: !!hcs && pxClose(hcs.paddingTop, 20) && pxClose(hcs.paddingLeft, 20) });
      r.push({ label: req[5], pass: !!doc.querySelector('img[src*="logo"]') });

      const navLinks = doc.querySelectorAll("nav a");
      r.push({ label: req[6], pass: navLinks.length >= 2, note: `${navLinks.length} линка` });

      const lcs = navLinks[0] ? dv.getComputedStyle(navLinks[0] as HTMLElement) : null;
      r.push({ label: req[7], pass: !!lcs && colorMatch(lcs.color, "#ffffff"), note: lcs ? normalizeColor(lcs.color) : "" });
      r.push({ label: req[8], pass: !!lcs && pxClose(lcs.fontSize, 20), note: lcs?.fontSize });
      r.push({ label: req[9], pass: !!lcs && lcs.textDecoration.includes("none") });
      r.push({ label: req[10], pass: !!doc.querySelector('a[href*="eea.europa.eu"]') });

      const allEls = Array.from(doc.querySelectorAll("div, section, article")) as HTMLElement[];
      const greenBig = allEls.filter((el) => {
        const cs = dv.getComputedStyle(el);
        return pctClose(cs.width, containerW, 50) && pxClose(cs.height, 400) && colorMatch(cs.backgroundColor, "#1b5e20");
      });
      r.push({ label: req[11], pass: greenBig.length >= 2, note: `${greenBig.length} намерени` });
      r.push({ label: req[12], pass: greenBig.length >= 2 });
      r.push({ label: req[13], pass: greenBig.length >= 2 });
      r.push({ label: req[14], pass: !!doc.querySelector('img[src*="blue_green_yellow"]') });

      const lightGreen = allEls.filter((el) => {
        const cs = dv.getComputedStyle(el);
        return pctClose(cs.width, containerW, 25) && pxClose(cs.height, 400) && colorMatch(cs.backgroundColor, "#e8f5e9");
      });
      r.push({ label: req[15], pass: lightGreen.length >= 4, note: `${lightGreen.length} намерени` });
      r.push({ label: req[16], pass: lightGreen.length >= 4 });
      r.push({ label: req[17], pass: lightGreen.length >= 4 });

      const footer = doc.querySelector("footer") as HTMLElement | null;
      const fcs = footer ? dv.getComputedStyle(footer) : null;
      r.push({ label: req[18], pass: !!fcs && pxClose(fcs.height, 50), note: fcs?.height });
      r.push({ label: req[19], pass: !!fcs && colorMatch(fcs.backgroundColor, "#1b5e20"), note: fcs ? normalizeColor(fcs.backgroundColor) : "" });

      return r;
    },
  },
];

// ── task list screen ──────────────────────────────────────────────────────────

function TaskList({ onSelect }: { onSelect: (t: Task) => void }) {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="flex items-center justify-between px-6 py-3 border-b" style={{ background: "var(--nav-bg)", borderColor: "var(--border)" }}>
        <Link href="/" style={{ color: "var(--muted)", textDecoration: "none", fontSize: "0.85rem" }}>&larr; Начало</Link>
        <span className="font-bold">HTML Кодиране</span>
        <span />
      </div>
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
        <h1 className="font-extrabold text-2xl mb-2" style={{ color: "var(--text)" }}>Избери задача</h1>
        <p className="mb-8 text-sm" style={{ color: "var(--muted)" }}>Напиши HTML код по заданието и получи автоматична проверка.</p>
        <div className="space-y-3">
          {TASKS.map((task) => (
            <button
              key={task.id}
              onClick={() => onSelect(task)}
              className="w-full text-left glass rounded-2xl px-5 py-4 flex items-center justify-between group"
              style={{ border: "1px solid var(--border)", cursor: "pointer" }}
            >
              <div>
                <div className="font-semibold" style={{ color: "var(--text)" }}>{task.title}</div>
                <div className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{task.year} &middot; {task.requirements.length} изисквания</div>
              </div>
              <span className="transition-transform group-hover:translate-x-1" style={{ color: "var(--accent)", fontSize: "1.2rem" }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

// ── editor screen ─────────────────────────────────────────────────────────────

function TaskEditor({ task, onBack }: { task: Task; onBack: () => void }) {
  const [code, setCode] = useState(task.starter);
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [tab, setTab] = useState<"task" | "editor" | "preview">("task");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hiddenRef = useRef<HTMLIFrameElement>(null);

  function handleCheck() {
    const iframe = hiddenRef.current;
    if (!iframe) return;
    iframe.srcdoc = code;
    iframe.onload = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      setResults(task.runChecks(doc, iframe.clientWidth || 1200));
      setTab("task");
    };
  }

  function handlePreview() {
    if (iframeRef.current) iframeRef.current.srcdoc = code;
    setTab("preview");
  }

  const passed = results ? results.filter((r) => r.pass).length : 0;
  const total = task.requirements.length;
  const score = results ? Math.round((passed / total) * 100) : 0;

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="flex items-center justify-between px-6 py-3 border-b" style={{ background: "var(--nav-bg)", borderColor: "var(--border)" }}>
        <button onClick={onBack} style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem" }}>
          &larr; Задачи
        </button>
        <span className="font-bold">{task.title} — HTML Кодиране</span>
        <div className="flex gap-2">
          <button onClick={handlePreview} className="px-4 py-1.5 rounded-xl text-sm font-medium" style={{ background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer" }}>
            Преглед
          </button>
          <button onClick={handleCheck} className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--btn-gradient)", cursor: "pointer" }}>
            Провери
          </button>
        </div>
      </div>

      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        {(["task", "editor", "preview"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-5 py-2.5 text-sm font-medium transition-colors"
            style={{ color: tab === t ? "var(--accent)" : "var(--muted)", borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent", background: "none", cursor: "pointer" }}>
            {t === "task" ? "Задание" : t === "editor" ? "Код" : "Преглед"}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        {tab === "task" && (
          <div className="flex-1 overflow-y-auto p-6" style={{ maxWidth: 720, margin: "0 auto" }}>
            <div className="glass rounded-2xl p-6" style={{ border: "1px solid var(--border)" }}>
              <h2 className="font-bold text-lg mb-2" style={{ color: "var(--accent)" }}>{task.title}</h2>
              <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>{task.description}</p>
              <ol className="space-y-2 text-sm list-decimal list-inside" style={{ color: "var(--text)" }}>
                <li><b>Заглавие в браузъра</b> &mdash; &bdquo;Рециклиране&ldquo;</li>
                <li><b>Блок 1</b> &mdash; ширина 80%, шрифт Georgia, съдържа всички останали елементи</li>
                <li><b>Блок 2 (header)</b> &mdash; височина 90px, фон #2E7D32, padding 20px. Лого (logo.png) вляво, ширина 8%. Навигация вдясно, вертикално центрирана: цвят #ffffff, без подчертаване, размер 20px, word-spacing 10px, margin top/bottom 30px.</li>
                <li><b>Блокове 3 и 4</b> &mdash; наредени един до друг, ширина 50%, височина 400px, фон #1B5E20. Блок 3: заглавие + 2 параграфа. Блок 4: изображение (blue_green_yellow.png, ширина 50%) + заглавие.</li>
                <li><b>Блок 5</b> &mdash; височина 500px, фон #e8f5e9. Заглавие, текст и четири еднакви блока (6-9) наредени един до друг.</li>
                <li><b>Блокове 6, 7, 8, 9</b> &mdash; ширина 25%, височина 400px, фон #e8f5e9. Изображение (ширина 50%), заглавие, списък (само блок 6), текст (цвят #1B5E20, 15px, italic).</li>
                <li><b>Блок 10 (footer)</b> &mdash; височина 50px, фон #1B5E20. Текст: центриран, бял, 16px, padding-top 20px.</li>
                <li>Текстът &bdquo;Европейска агенция по околна среда&ldquo; е хипервръзка към https://www.eea.europa.eu/bg</li>
              </ol>
            </div>

            {results && (
              <div className="mt-6 glass rounded-2xl p-6" style={{ border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Резултат</h3>
                  <span className="font-extrabold text-xl" style={{ color: score >= 70 ? "var(--green)" : score >= 40 ? "#fbbf24" : "var(--red)" }}>
                    {passed}/{total} ({score}%)
                  </span>
                </div>
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span style={{ color: r.pass ? "var(--green)" : "var(--red)", flexShrink: 0 }}>{r.pass ? "+" : "x"}</span>
                      <span>{r.label}</span>
                      {r.note && !r.pass && <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>({r.note})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "editor" && (
          <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
            <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false}
              className="flex-1 resize-none focus:outline-none font-mono text-sm p-4"
              style={{ background: "#0d1117", color: "#e6edf3", border: "none", lineHeight: 1.6 }} />
            {results && (
              <div className="flex items-center justify-between px-4 py-2 text-sm border-t" style={{ borderColor: "var(--border)", background: "var(--nav-bg)" }}>
                <span style={{ color: "var(--muted)" }}>Последна проверка:</span>
                <span className="font-bold" style={{ color: score >= 70 ? "var(--green)" : score >= 40 ? "#fbbf24" : "var(--red)" }}>{passed}/{total} ({score}%)</span>
              </div>
            )}
          </div>
        )}

        {tab === "preview" && (
          <iframe ref={iframeRef} className="flex-1 border-0" style={{ background: "#fff" }} title="preview" sandbox="allow-same-origin" />
        )}
      </div>

      <iframe ref={hiddenRef} title="checker"
        style={{ position: "absolute", left: -9999, width: 1200, height: 900, visibility: "hidden" }}
        sandbox="allow-same-origin" />
    </main>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function HtmlTaskPage() {
  const [selected, setSelected] = useState<Task | null>(null);

  if (selected) {
    return <TaskEditor task={selected} onBack={() => setSelected(null)} />;
  }
  return <TaskList onSelect={setSelected} />;
}