import { questions } from "./questions";
import { openQuestions } from "./openQuestions";
import type { Question, OpenQuestion } from "./types";

// Lessons / topics available for a quiz (label shown in the UI).
export const QUIZ_TOPICS: { id: string; label: string }[] = [
  { id: "обработка-анализ", label: "Обработка и анализ на данни" },
  { id: "мултимедия", label: "Мултимедия" },
  { id: "уеб-дизайн", label: "Уеб дизайн" },
  { id: "решаване-икт", label: "Решаване на проблеми с ИКТ" },
];

export interface RoomQuestionIds {
  closed: string[];
  open: string[];
}

// Only short_answer open questions can be auto-graded (they have acceptedAnswers).
const gradableOpen = openQuestions.filter((q) => q.type === "short_answer" && q.acceptedAnswers.length > 0);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick `numClosed` closed + `numOpen` open questions at random from the chosen topics.
export function selectQuestions(topics: string[], numClosed: number, numOpen: number): RoomQuestionIds {
  const inTopics = (t: string) => topics.length === 0 || topics.includes(t);
  const closed = shuffle(questions.filter((q) => inTopics(q.topic))).slice(0, numClosed).map((q) => q.id);
  const open = shuffle(gradableOpen.filter((q) => inTopics(q.topic))).slice(0, numOpen).map((q) => q.id);
  return { closed, open };
}

// How many questions are actually available per topic selection (for form validation).
export function availableCounts(topics: string[]): { closed: number; open: number } {
  const inTopics = (t: string) => topics.length === 0 || topics.includes(t);
  return {
    closed: questions.filter((q) => inTopics(q.topic)).length,
    open: gradableOpen.filter((q) => inTopics(q.topic)).length,
  };
}

// Available counts for a single topic.
export function topicCounts(topic: string): { closed: number; open: number } {
  return {
    closed: questions.filter((q) => q.topic === topic).length,
    open: gradableOpen.filter((q) => q.topic === topic).length,
  };
}

export interface TopicSpec {
  topic: string;
  closed: number;
  open: number;
}

// Pick the requested number of closed/open questions from each topic separately.
export function selectQuestionsForSpec(spec: TopicSpec[]): RoomQuestionIds {
  const closed: string[] = [];
  const open: string[] = [];
  for (const s of spec) {
    closed.push(
      ...shuffle(questions.filter((q) => q.topic === s.topic)).slice(0, s.closed).map((q) => q.id),
    );
    open.push(
      ...shuffle(gradableOpen.filter((q) => q.topic === s.topic)).slice(0, s.open).map((q) => q.id),
    );
  }
  return { closed, open };
}

// Fast lookup of a question's topic by id (closed + open).
const topicById = new Map<string, string>();
for (const q of questions) topicById.set(q.id, q.topic);
for (const q of openQuestions) topicById.set(q.id, q.topic);
export function topicOf(id: string): string | undefined {
  return topicById.get(id);
}

export function getClosed(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}
export function getOpen(id: string): OpenQuestion | undefined {
  return openQuestions.find((q) => q.id === id);
}

// Resolve the full question objects for a room snapshot (in stored order).
export function roomQuestions(ids: RoomQuestionIds) {
  return {
    closed: ids.closed.map(getClosed).filter((q): q is Question => !!q),
    open: ids.open.map(getOpen).filter((q): q is OpenQuestion => !!q),
  };
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isOpenCorrect(q: OpenQuestion, answer: string): boolean {
  const a = normalize(answer);
  if (!a) return false;
  return q.acceptedAnswers.some((acc) => {
    const n = normalize(acc);
    return n === a || a.includes(n) || n.includes(a);
  });
}

export interface StudentAnswers {
  closed: Record<string, number>; // questionId -> selectedIndex
  open: Record<string, string>; // questionId -> text
}

export interface GradeResult {
  score: number;
  maxScore: number;
  details: { questionId: string; correct: boolean }[];
}

// Server-side grading from the room snapshot + the student's submitted answers.
export function gradeQuiz(ids: RoomQuestionIds, answers: StudentAnswers): GradeResult {
  const details: { questionId: string; correct: boolean }[] = [];
  let score = 0;

  for (const id of ids.closed) {
    const q = getClosed(id);
    if (!q) continue;
    const correct = answers.closed?.[id] === q.correctIndex;
    if (correct) score++;
    details.push({ questionId: id, correct });
  }
  for (const id of ids.open) {
    const q = getOpen(id);
    if (!q) continue;
    const correct = isOpenCorrect(q, answers.open?.[id] ?? "");
    if (correct) score++;
    details.push({ questionId: id, correct });
  }

  return { score, maxScore: ids.closed.length + ids.open.length, details };
}

// Short, unambiguous join code (no easily-confused chars like 0/O, 1/I).
export function generateRoomCode(len = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
