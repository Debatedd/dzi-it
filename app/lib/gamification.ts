export interface GameState {
  points: number;
  streak: number;
  lastDate: string; // YYYY-MM-DD
}

export interface AwardResult {
  earned: number;
  streakBonus: number;
  newStreak: number;
  newlyUnlocked: number[];
}

export const REWARDS = [
  {
    threshold: 50,
    title: "Съвет #1",
    tip: "Носи си нещо сладко за ядене — захарта помага за концентрацията по време на изпит!",
  },
  {
    threshold: 150,
    title: "Съвет #2",
    tip: "Винаги бъди подготвен системата да крашне — запазвай важни отговори на хартия преди да изпратиш.",
  },
  {
    threshold: 300,
    title: "Съвет #3",
    tip: "Очаквай въпросите с отворен отговор да не се запазват заради проблеми със сървъра — пиши ги и на черновата.",
  },
  {
    threshold: 500,
    title: "Съвет #4",
    tip: "Разпредели си времето и започни от най-лесната за теб задача — не губи минути заради едно трудно място.",
  },
  {
    threshold: 1000,
    title: "Съвет #5",
    tip: "Тренирай бързото писане на HTML код — той изисква най-много време от всички задачи на ДЗИ.",
  },
];

const KEY = "dziGame";

export function getState(): GameState {
  if (typeof window === "undefined") return { points: 0, streak: 0, lastDate: "" };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { points: 0, streak: 0, lastDate: "" };
  } catch {
    return { points: 0, streak: 0, lastDate: "" };
  }
}

export function saveState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function prevDay(d: string): string {
  const dt = new Date(d);
  dt.setDate(dt.getDate() - 1);
  return dt.toISOString().slice(0, 10);
}

// Add flat bonus points (e.g. daily challenge). Returns newly unlocked reward indices.
export function addBonusPoints(bonus: number): number[] {
  const state = getState();
  const oldPoints = state.points;
  const newPoints = oldPoints + bonus;
  saveState({ ...state, points: newPoints });
  return REWARDS
    .map((r, i) => ({ i, threshold: r.threshold }))
    .filter(({ threshold }) => threshold > oldPoints && threshold <= newPoints)
    .map(({ i }) => i);
}

export function awardPoints(correct: number): AwardResult {
  const state = getState();
  const t = todayStr();
  const alreadyToday = state.lastDate === t;

  let newStreak: number;
  if (alreadyToday) {
    newStreak = state.streak;
  } else if (state.lastDate === prevDay(t)) {
    newStreak = state.streak + 1;
  } else {
    newStreak = 1;
  }

  const earned = correct * 10;
  const streakBonus = alreadyToday ? 0 : Math.min((newStreak - 1) * 5, 30);
  const total = earned + streakBonus;

  const oldPoints = state.points;
  const newPoints = oldPoints + total;

  const newlyUnlocked = REWARDS
    .map((r, i) => ({ i, threshold: r.threshold }))
    .filter(({ threshold }) => threshold > oldPoints && threshold <= newPoints)
    .map(({ i }) => i);

  localStorage.setItem(
    KEY,
    JSON.stringify({ points: newPoints, streak: newStreak, lastDate: t })
  );

  return { earned, streakBonus, newStreak, newlyUnlocked };
}
