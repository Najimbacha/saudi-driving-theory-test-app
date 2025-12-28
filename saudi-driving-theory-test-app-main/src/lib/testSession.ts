export type PracticeSessionPayload = {
  mode: string;
  questions: string[];
  current: number;
  selected: number | null;
  showAnswer: boolean;
  score: number;
  sessionWrongIds: string[];
  sessionResults: { id: string; category: string; correct: boolean }[];
  selectedCategory: string | null;
};

export type ExamSessionPayload = {
  selectedMode: string;
  questions: string[];
  currentIndex: number;
  answers: {
    questionId: string;
    selectedAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean | null;
  }[];
  timeLeft: number;
  timerEnabled: boolean;
};

export type TestSession =
  | { type: "practice"; updatedAt: number; payload: PracticeSessionPayload }
  | { type: "exam"; updatedAt: number; payload: ExamSessionPayload };

const STORAGE_KEY = "last-test-session";

export const loadTestSession = (): TestSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TestSession;
    if (!parsed || !("type" in parsed) || !("payload" in parsed)) {
      return null;
    }
    if (!Array.isArray((parsed as TestSession).payload?.questions)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const saveTestSession = (session: TestSession) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors to preserve offline behavior.
  }
};

export const clearTestSession = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors to preserve offline behavior.
  }
};
