// Daily challenge: one deterministic challenge per calendar day, bonus points
// on completion. Progress lives in localStorage (same approach as gamification).

import { QUIZ_TOPICS } from "./quiz";
import type { AnyQuestion, QuizAnswer } from "./types";

export const DAILY_BONUS = 30;

export type ChallengeKind = "solve" | "correct" | "topic";

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  kind: ChallengeKind;
  target: number;
  topic?: string;
  topicLabel?: string;
  label: string;
}

export interface DailyState {
  date: string;
  progress: number;
  done: boolean;
}

const KEY = "dziDaily";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// Simple deterministic hash of the date string.
function hashDate(d: string): number {
  let h = 0;
  for (let i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) >>> 0;
  return h;
}

export function getTodayChallenge(): DailyChallenge {
  const date = todayStr();
  const h = hashDate(date);
  const kind: ChallengeKind = (["solve", "correct", "topic"] as const)[h % 3];

  if (kind === "solve") {
    return { date, kind, target: 8, label: "Реши 8 въпроса днес" };
  }
  if (kind === "correct") {
    return { date, kind, target: 5, label: "Отговори вярно на 5 въпроса днес" };
  }
  const t = QUIZ_TOPICS[(h >> 2) % QUIZ_TOPICS.length];
  return {
    date, kind, target: 6, topic: t.id, topicLabel: t.label,
    label: `Реши 6 въпроса от ${t.label}`,
  };
}

export function getDailyState(): DailyState {
  const date = todayStr();
  if (typeof window === "undefined") return { date, progress: 0, done: false };
  try {
    const raw = localStorage.getItem(KEY);
    const s: DailyState | null = raw ? JSON.parse(raw) : null;
    if (s && s.date === date) return s;
  } catch {
    // fall through
  }
  return { date, progress: 0, done: false };
}

function saveDailyState(s: DailyState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // ignore storage errors
  }
}

// Apply a finished quiz to today's challenge.
// Returns whether this quiz just completed the challenge (bonus should be awarded once).
export function applyQuizToDaily(
  answers: QuizAnswer[],
  questions: AnyQuestion[],
): { challenge: DailyChallenge; state: DailyState; justCompleted: boolean } {
  const challenge = getTodayChallenge();
  const state = getDailyState();
  if (state.done) return { challenge, state, justCompleted: false };

  let delta = 0;
  if (challenge.kind === "solve") {
    delta = answers.length;
  } else if (challenge.kind === "correct") {
    delta = answers.filter((a) => a.correct).length;
  } else {
    const topicById = new Map(questions.map((q) => [q.id, q.topic]));
    delta = answers.filter((a) => topicById.get(a.questionId) === challenge.topic).length;
  }

  const progress = Math.min(state.progress + delta, challenge.target);
  const done = progress >= challenge.target;
  const next: DailyState = { date: state.date, progress, done };
  saveDailyState(next);
  return { challenge, state: next, justCompleted: done };
}
