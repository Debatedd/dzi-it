// Per-question answer history in localStorage (works for anonymous users too).
// Used by the "weak spots" quiz mode and the adaptive difficulty start level.

export interface QStat {
  attempts: number;
  wrong: number;
  lastCorrect: boolean;
}

const KEY = "dziQStats";

export function getQuestionStats(): Record<string, QStat> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function recordAnswerStats(results: { questionId: string; correct: boolean }[]): void {
  if (typeof window === "undefined") return;
  const stats = getQuestionStats();
  for (const r of results) {
    const s = stats[r.questionId] ?? { attempts: 0, wrong: 0, lastCorrect: true };
    s.attempts += 1;
    if (!r.correct) s.wrong += 1;
    s.lastCorrect = r.correct;
    stats[r.questionId] = s;
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    // ignore storage errors
  }
}

// Question ids the user struggles with, worst first.
// Score favours questions answered wrong recently and often.
export function weakQuestionIds(): string[] {
  const stats = getQuestionStats();
  return Object.entries(stats)
    .filter(([, s]) => s.wrong > 0)
    .sort((a, b) => {
      const score = (s: QStat) => s.wrong / s.attempts + (s.lastCorrect ? 0 : 0.5);
      return score(b[1]) - score(a[1]);
    })
    .map(([id]) => id);
}

// Rolling accuracy over everything answered so far (0..1), or null with no data.
export function overallAccuracy(): number | null {
  const stats = getQuestionStats();
  let attempts = 0;
  let wrong = 0;
  for (const s of Object.values(stats)) {
    attempts += s.attempts;
    wrong += s.wrong;
  }
  if (attempts === 0) return null;
  return (attempts - wrong) / attempts;
}
