export interface Question {
  id: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  year?: number;
  // "dzi" = from an official МОН-published matura (free tier, attributed).
  // Absent = original authored question (paid tier eligible).
  source?: "dzi";
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface OpenQuestion {
  id: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  type: "short_answer" | "open_response";
  source?: "dzi";
  question: string;
  acceptedAnswers: string[];
  modelAnswer: string;
  explanation: string;
}

export type AnyQuestion = Question | OpenQuestion;

export function isClosed(q: AnyQuestion): q is Question {
  return !("type" in q);
}

export interface QuizAnswer {
  questionId: string;
  selectedIndex?: number;
  textAnswer?: string;
  correct: boolean;
}
