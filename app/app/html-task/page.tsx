"use client";

import { useRef, useState, type ReactNode } from "react";
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
  brief?: ReactNode;
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
    description: "Създайте уеб страница за информационна кампания за рециклиране с HTML и CSS. Използвайте вътрешен стил (вътрешен <style>) за цялата страница.",
    brief: (() => {
      const box: React.CSSProperties = {
        border: "1px solid var(--muted)",
        borderRadius: 4,
        textAlign: "center",
        fontSize: "0.68rem",
        color: "var(--muted)",
        padding: "6px 4px",
        background: "rgba(255,255,255,0.03)",
      };
      return (
        <>
          <p style={{ marginBottom: 12 }}>
            <b>Задача 28.</b> Създайте уеб страница за информационна кампания за рециклиране като
            използвате изображенията и текста от ресурсните файлове. Страницата да бъде със следната
            структура:
          </p>

          {/* ── Wireframe на структурата ── */}
          <div
            style={{
              maxWidth: 380,
              margin: "0 auto 16px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              padding: 12,
              border: "1px dashed var(--border)",
              borderRadius: 10,
            }}
          >
            <div style={{ ...box, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>🖼 лого</span>
              <span>Блок 2 (header) &mdash; навигация</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <div style={box}>Блок 3<br />заглавие + текст</div>
              <div style={box}>Блок 4<br />🖼 + заглавие</div>
            </div>
            <div style={{ ...box, padding: "8px 4px" }}>
              Блок 5 &mdash; заглавие и текст
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, marginTop: 6 }}>
                {[6, 7, 8, 9].map((n) => (
                  <div key={n} style={{ ...box, fontSize: "0.6rem" }}>{n}<br />🖼</div>
                ))}
              </div>
            </div>
            <div style={box}>Блок 10 (footer)</div>
            <div style={{ textAlign: "center", fontSize: "0.62rem", color: "var(--muted)" }}>
              всичко е в Блок 1 (ширина 80%)
            </div>
          </div>

          <p style={{ marginBottom: 12, fontStyle: "italic" }}>
            За стилизиране използвайте вътрешен стил за цялата страница. Използвайте актуални
            стандарти при структурирането на кода.
          </p>

          <ol style={{ listStyle: "decimal", paddingLeft: 22, display: "flex", flexDirection: "column", gap: 10 }}>
            <li>Заглавие в браузъра: <b>Рециклиране</b>.</li>
            <li>
              <b>Блок 1</b> съдържа всички останали елементи и е с:
              <ul style={{ listStyle: "disc", paddingLeft: 20, marginTop: 4 }}>
                <li>ширина 80%</li>
                <li>шрифт Georgia</li>
              </ul>
            </li>
            <li>
              <b>Блок 2</b> (заглавна част / header):
              <ul style={{ listStyle: "disc", paddingLeft: 20, marginTop: 4 }}>
                <li>височина 90 px, фон <b>#2E7D32</b>, вътрешни отстояния 20 px</li>
                <li>вляво лого <b>logo.png</b> с ширина 8%</li>
                <li>вдясно навигация с минимум 2 линка, вертикално центрирана</li>
                <li>линковете: цвят <b>#ffffff</b>, размер 20 px, без подчертаване, отстояние между думите 10 px, margin отгоре/отдолу 30 px</li>
              </ul>
            </li>
            <li>
              <b>Блокове 3 и 4</b> са наредени един до друг, всеки с ширина 50%, височина 400 px, фон <b>#1B5E20</b>:
              <ul style={{ listStyle: "disc", paddingLeft: 20, marginTop: 4 }}>
                <li>Блок 3: заглавие и два параграфа</li>
                <li>Блок 4: изображение <b>blue_green_yellow.png</b> (ширина 50%) и заглавие</li>
              </ul>
            </li>
            <li>
              <b>Блок 5</b> е с височина 500 px и фон <b>#e8f5e9</b>. Съдържа заглавие, текст и четири
              еднакви блока (6, 7, 8, 9), наредени един до друг.
            </li>
            <li>
              <b>Блокове 6, 7, 8 и 9</b> са с ширина 25%, височина 400 px и фон <b>#e8f5e9</b>. Всеки съдържа:
              <ul style={{ listStyle: "disc", paddingLeft: 20, marginTop: 4 }}>
                <li>изображение с ширина 50%</li>
                <li>заглавие</li>
                <li>списък (само в блок 6)</li>
                <li>текст с цвят <b>#1B5E20</b>, размер 15 px, курсив (italic)</li>
              </ul>
            </li>
            <li>
              <b>Блок 10</b> (footer) е с височина 50 px и фон <b>#1B5E20</b>. Текстът е центриран,
              бял, 16 px, с отстояние отгоре 20 px.
            </li>
            <li>
              Текстът <b>„Европейска агенция по околна среда"</b> е хипервръзка към{" "}
              https://www.eea.europa.eu/bg
            </li>
          </ol>
        </>
      );
    })(),
    requirements: [
      "Заглавие в браузъра - Рециклиране",
      "Блок 1 - ширина 80%, шрифт Georgia",
      "Header (Блок 2) - височина 90px",
      "Header - фон #2E7D32",
      "Header - вътрешни отстояния 20px",
      "Лого изображение в header-а (всяко изображение)",
      "Навигация - минимум 2 линка",
      "Навигация - цвят на линкове #ffffff",
      "Навигация - размер на шрифт 20px",
      "Навигация - без подчертаване",
      "Линк към eea.europa.eu/bg",
      "Блокове 3 и 4 - ширина 50%",
      "Блокове 3 и 4 - височина 400px",
      "Блокове 3 и 4 - фон #1B5E20",
      "Изображение в зелените блокове (всяко изображение)",
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
      r.push({ label: req[5], pass: !!(header && header.querySelector("img")) || !!doc.querySelector('img[src*="logo"]') });

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
      r.push({ label: req[14], pass: greenBig.some((el) => !!el.querySelector("img")) || !!doc.querySelector('img[src*="blue_green_yellow"]') });

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
  {
    id: "zad28-2025aug",
    title: "Задача 28 — Пътна безопасност",
    year: "ДЗИ 2025 (август)",
    description: "Създайте информативен сайт за пътната безопасност (road.html) с четири части. Използвайте вътрешен стил (вътрешен <style>) за цялата страница.",
    brief: (() => {
      const wireBox: React.CSSProperties = {
        border: "1px solid var(--muted)",
        borderRadius: 4,
        textAlign: "center",
        fontSize: "0.7rem",
        color: "var(--muted)",
        padding: "6px 4px",
        background: "rgba(255,255,255,0.03)",
      };
      return (
        <>
          <p style={{ marginBottom: 12 }}>
            <b>Задача 28.</b> Създайте информативен сайт за пътната безопасност като използвате
            изображенията и текста от ресурсните файлове в <b>Resources_Zad28</b>. Страницата да бъде
            със следната структура:
          </p>

          {/* ── Wireframe на структурата ── */}
          <div
            style={{
              maxWidth: 360,
              margin: "0 auto 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: 12,
              border: "1px dashed var(--border)",
              borderRadius: 10,
            }}
          >
            <div style={wireBox}>1 &mdash; Заглавие h1</div>
            <div style={wireBox}>2 &mdash; Текст h3</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ ...wireBox, lineHeight: 1.5 }}>
                  Заглавие h4
                  <br />🖼<br />текст<br />🔗
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", fontSize: "0.65rem", color: "var(--muted)" }}>3 &mdash; три елемента</div>
            <div style={wireBox}>4 &mdash; Текст h3</div>
          </div>

          <p style={{ marginBottom: 12, fontStyle: "italic" }}>
            За стилизиране използвайте вътрешен стил за цялата страница. Използвайте актуални
            стандарти при структурирането на кода.
          </p>

          <ol style={{ listStyle: "decimal", paddingLeft: 22, display: "flex", flexDirection: "column", gap: 10 }}>
            <li>Файлът да е с име: <b>road.html</b></li>
            <li>Страницата се състои от четири части, като третата съдържа три елемента със сходно оформление.</li>
            <li>
              <b>Страницата</b> е с:
              <ul style={{ listStyle: "disc", paddingLeft: 20, marginTop: 4 }}>
                <li>Ширина 1000 px</li>
                <li>Шрифт Calibri</li>
                <li>Размер на буквите 14 pt</li>
              </ul>
            </li>
            <li>
              <b>Първа част</b> (заглавна):
              <ul style={{ listStyle: "disc", paddingLeft: 20, marginTop: 4 }}>
                <li>съдържа центрирано заглавие (налично в текстовия документ) с цвят: <b>#EE4A49</b></li>
                <li>за фон има изображение &mdash; <b>header.jpg</b></li>
              </ul>
            </li>
            <li>
              <b>Втората и четвъртата част</b> са еднотипно оформени:
              <ul style={{ listStyle: "disc", paddingLeft: 20, marginTop: 4 }}>
                <li>с фон <b>#EE4A49</b></li>
                <li>центриран текст с бял цвят</li>
                <li>отстояние от текста до рамките на секцията 30 px от всички страни</li>
              </ul>
            </li>
            <li>
              <b>Третата част</b> съдържа три сходно оформени елемента, като всеки от тях е с еднаква
              ширина и са разположени един до друг.
              <ul style={{ listStyle: "none", paddingLeft: 8, marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                <li>
                  <b>6.1.</b> Всеки от тези елементи съдържа:
                  <ul style={{ listStyle: "disc", paddingLeft: 20, marginTop: 4 }}>
                    <li>центрирано заглавие</li>
                    <li>изображение</li>
                    <li>центриран текст</li>
                    <li>изображение тип икона</li>
                    <li>хипервръзка</li>
                  </ul>
                </li>
                <li><b>6.2.</b> Височината на елементите е 550 px. Поставете отстояние на съдържанието до външната рамка на елементите 10 px.</li>
                <li><b>6.3.</b> Фоновете на всеки от елементите са съответно следните: <b>#EFC465</b>, <b>#D5D9F4</b>, <b>#BCDF95</b>.</li>
              </ul>
            </li>
          </ol>

          <p style={{ marginTop: 14, color: "var(--muted)", fontSize: "0.85rem" }}>
            Създайте архив, включващ създадената страница и използваните изображения, с име{" "}
            <b>it_25.08.2025_zad28.zip</b> и го прикачете в изпитната система.
          </p>
        </>
      );
    })(),
    requirements: [
      "Файлът да е road.html и да има 4 части (третата с 3 елемента)",
      "Страница - ширина 1000px",
      "Страница - шрифт Calibri",
      "Страница - размер на буквите 14pt",
      "Първа част - фоново изображение (всяко изображение)",
      "Първа част - центрирано заглавие h1",
      "Първа част - цвят на заглавието #EE4A49",
      "Втора и четвърта част - фон #EE4A49",
      "Втора и четвърта част - центриран текст",
      "Втора и четвърта част - бял цвят на текста",
      "Втора и четвърта част - отстояние 30px от всички страни",
      "Трета част - три еднакво широки елемента, наредени един до друг",
      "Всеки от трите елемента има центрирано заглавие (h4)",
      "Всеки от трите елемента има изображение",
      "Всеки от трите елемента има центриран текст",
      "Всеки от трите елемента има икона (второ изображение)",
      "Всеки от трите елемента има хипервръзка",
      "Трите елемента - височина 550px",
      "Трите елемента - вътрешно отстояние 10px",
      "Първи елемент (ляво) - фон #EFC465",
      "Втори елемент (среда) - фон #D5D9F4",
      "Трети елемент (дясно) - фон #BCDF95",
    ],
    starter: [
      "<!DOCTYPE html>",
      '<html lang="bg">',
      "<head>",
      '  <meta charset="UTF-8">',
      "  <title>Пътна безопасност</title>",
      "  <style>",
      "    /* CSS тук */",
      "  </style>",
      "</head>",
      "<body>",
      "  <!-- Четири части -->",
      "</body>",
      "</html>",
    ].join("\n"),
    runChecks(doc, containerW) {
      const r: CheckResult[] = [];
      const dv = doc.defaultView!;
      const req = this.requirements;
      const cs = (el: Element) => dv.getComputedStyle(el as HTMLElement);

      // ── locate the three coloured cards of part 3 first (used in several checks)
      const THREE = ["#efc465", "#d5d9f4", "#bcdf95"];
      const allEls = Array.from(doc.querySelectorAll("div, section, article")) as HTMLElement[];
      const cards = allEls
        .filter((el) => THREE.includes(normalizeColor(cs(el).backgroundColor)))
        .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);

      // 0. road.html + 4 parts. We can only verify structure: a page wrapper with >=4 top-level parts.
      const wrapper = doc.querySelector("body > div, body > main, body > section") as HTMLElement | null;
      const topChildren = Array.from((wrapper ?? doc.body).children).filter(
        (el) => ["DIV", "SECTION", "ARTICLE", "HEADER", "FOOTER", "MAIN"].includes(el.tagName)
      ) as HTMLElement[];
      r.push({ label: req[0], pass: topChildren.length >= 4 || (!!wrapper && cards.length >= 3), note: `${topChildren.length} части` });

      // 1. Page width 1000px
      const pageEl = wrapper ?? doc.body;
      r.push({ label: req[1], pass: pxClose(cs(pageEl).width, 1000, 5), note: cs(pageEl).width });

      // 2-3. Font Calibri, 14pt (~18.67px) — may be set on body OR the page wrapper
      const bcs = cs(doc.body);
      const wcs = cs(pageEl);
      const fontStr = (bcs.fontFamily + " " + wcs.fontFamily).toLowerCase();
      const sizeOK = (s: CSSStyleDeclaration) => pxClose(s.fontSize, 18.67, 2) || pxClose(s.fontSize, 14, 2);
      r.push({ label: req[2], pass: fontStr.includes("calibri"), note: wcs.fontFamily });
      r.push({ label: req[3], pass: sizeOK(bcs) || sizeOK(wcs), note: wcs.fontSize });

      // 4-6. Part 1: header background image, centered h1, color #EE4A49
      const part1 = (doc.querySelector("header") as HTMLElement | null) ?? topChildren[0] ?? null;
      const p1cs = part1 ? cs(part1) : null;
      r.push({ label: req[4], pass: !!p1cs && p1cs.backgroundImage !== "none" && p1cs.backgroundImage.includes("url"), note: p1cs?.backgroundImage });
      const h1 = (part1 ? part1.querySelector("h1") : doc.querySelector("h1")) as HTMLElement | null;
      const h1cs = h1 ? cs(h1) : null;
      r.push({ label: req[5], pass: !!h1cs && h1cs.textAlign === "center", note: h1cs?.textAlign });
      r.push({ label: req[6], pass: !!h1cs && colorMatch(h1cs.color, "#ee4a49"), note: h1cs ? normalizeColor(h1cs.color) : "" });

      // 7-10. Parts 2 & 4: bg #EE4A49, centered, white, padding 30px (need 2 such sections)
      const redSections = (topChildren.length ? topChildren : Array.from(doc.body.children) as HTMLElement[])
        .filter((el) => colorMatch(cs(el).backgroundColor, "#ee4a49"));
      r.push({ label: req[7], pass: redSections.length >= 2, note: `${redSections.length} намерени` });
      const redOK = (test: (s: CSSStyleDeclaration) => boolean) =>
        redSections.length >= 2 && redSections.slice(0, 2).every((el) => test(cs(el)));
      r.push({ label: req[8], pass: redOK((s) => s.textAlign === "center") });
      r.push({ label: req[9], pass: redOK((s) => colorMatch(s.color, "#ffffff")) });
      r.push({ label: req[10], pass: redOK((s) => pxClose(s.paddingTop, 30) && pxClose(s.paddingLeft, 30) && pxClose(s.paddingRight, 30) && pxClose(s.paddingBottom, 30)) });

      // 11. Three equal-width side-by-side cards
      const widths = cards.map((el) => Math.round(parseFloat(cs(el).width)));
      const equalW = cards.length >= 3 && Math.max(...widths) - Math.min(...widths) <= 4;
      r.push({ label: req[11], pass: cards.length >= 3 && equalW, note: `${cards.length} карти, ширини: ${widths.join("/")}` });

      // 12-16. Each of the three cards: centered h4, image, centered text, icon (2nd img), link
      const three = cards.slice(0, 3);
      const everyCard = (test: (el: HTMLElement) => boolean) => three.length === 3 && three.every(test);
      r.push({ label: req[12], pass: everyCard((el) => {
        const h = el.querySelector("h4") as HTMLElement | null;
        return !!h && cs(h).textAlign === "center";
      }) });
      r.push({ label: req[13], pass: everyCard((el) => el.querySelectorAll("img").length >= 1) });
      r.push({ label: req[14], pass: everyCard((el) => {
        const p = el.querySelector("p") as HTMLElement | null;
        return !!p && (cs(p).textAlign === "center" || cs(el).textAlign === "center");
      }) });
      r.push({ label: req[15], pass: everyCard((el) => el.querySelectorAll("img").length >= 2) });
      r.push({ label: req[16], pass: everyCard((el) => !!el.querySelector("a")) });

      // 17-18. Height 550px, padding 10px (all three)
      r.push({ label: req[17], pass: everyCard((el) => pxClose(cs(el).height, 550, 4)), note: three.map((el) => cs(el).height).join("/") });
      r.push({ label: req[18], pass: everyCard((el) => pxClose(cs(el).paddingTop, 10) && pxClose(cs(el).paddingLeft, 10)), note: three.map((el) => cs(el).paddingTop).join("/") });

      // 19-21. Background colours in left-to-right order
      const bg = three.map((el) => normalizeColor(cs(el).backgroundColor));
      r.push({ label: req[19], pass: bg[0] === "#efc465", note: bg[0] });
      r.push({ label: req[20], pass: bg[1] === "#d5d9f4", note: bg[1] });
      r.push({ label: req[21], pass: bg[2] === "#bcdf95", note: bg[2] });

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

        <p className="mt-10 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
          Това е неофициална, безплатна платформа за подготовка и не е свързана с МОН.
          Изпитните задачи са от публично достъпните материали за ДЗИ на{" "}
          <a
            href="https://www.mon.bg/dejnosti/matura/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)", textDecoration: "underline" }}
          >
            Министерството на образованието и науката
          </a>
          .
        </p>
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
              <h2 className="font-bold text-lg mb-3" style={{ color: "var(--accent)" }}>{task.title}</h2>
              {task.brief ? (
                <div className="text-sm" style={{ color: "var(--text)", lineHeight: 1.6 }}>{task.brief}</div>
              ) : (
                <>
                  <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>{task.description}</p>
                  <ol className="space-y-2 text-sm list-decimal list-inside" style={{ color: "var(--text)" }}>
                    {task.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ol>
                </>
              )}
              <div className="mt-5 pt-4 text-xs" style={{ color: "var(--text)", borderTop: "1px solid var(--border)" }}>
                <p className="font-semibold mb-2" style={{ color: "var(--accent)" }}>💡 Безплатни изображения (без теглене — само линк)</p>
                <p className="mb-2" style={{ color: "var(--muted)" }}>
                  Нямаш нужда от файловете от изпита. Сложи кой да е от тези линкове като{" "}
                  <code style={{ background: "var(--input-bg)", padding: "1px 5px", borderRadius: 4 }}>&lt;img src="..."&gt;</code>{" "}
                  или като <code style={{ background: "var(--input-bg)", padding: "1px 5px", borderRadius: 4 }}>background-image: url('...')</code>:
                </p>
                <ul className="space-y-1.5" style={{ color: "var(--muted)" }}>
                  <li>
                    <b>Снимка:</b>{" "}
                    <code style={{ background: "var(--input-bg)", padding: "1px 5px", borderRadius: 4, color: "var(--accent-2-text)" }}>https://picsum.photos/400/300</code>{" "}
                    (различни размери — сменяш числата)
                  </li>
                  <li>
                    <b>Цветна кутия:</b>{" "}
                    <code style={{ background: "var(--input-bg)", padding: "1px 5px", borderRadius: 4, color: "var(--accent-2-text)" }}>https://placehold.co/400x300/2E7D32/white?text=Лого</code>
                  </li>
                  <li>
                    <b>Икона:</b>{" "}
                    <code style={{ background: "var(--input-bg)", padding: "1px 5px", borderRadius: 4, color: "var(--accent-2-text)" }}>https://api.dicebear.com/9.x/icons/svg?seed=eco</code>
                  </li>
                </ul>
              </div>
              <p className="mt-4 pt-4 text-xs" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
                Източник: ДЗИ &mdash; публично достъпни изпитни материали на{" "}
                <a href="https://www.mon.bg/dejnosti/matura/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "underline" }}>
                  МОН
                </a>
                . Платформата е неофициална.
              </p>
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
          <iframe ref={iframeRef} srcDoc={code} className="flex-1 border-0" style={{ background: "#fff" }} title="preview" sandbox="allow-same-origin" />
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