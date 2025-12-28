export type SignMasteryLevel = "new" | "learning" | "reviewing" | "mastered";

type SignStats = {
  correct: number;
  total: number;
};

const SIGN_STATS_KEY = "signStats";
const FLASHCARD_KEY = "flashcardProgress";

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const recordSignAnswer = (signId: string, isCorrect: boolean) => {
  const stats = readJson<Record<string, SignStats>>(SIGN_STATS_KEY, {});
  const current = stats[signId] || { correct: 0, total: 0 };
  stats[signId] = {
    correct: current.correct + (isCorrect ? 1 : 0),
    total: current.total + 1,
  };
  localStorage.setItem(SIGN_STATS_KEY, JSON.stringify(stats));
};

const getFlashcardLevel = (signId: string) => {
  const progress = readJson<Record<string, { level: number }>>(FLASHCARD_KEY, {});
  return progress[signId]?.level ?? 0;
};

const getStatsLevel = (signId: string) => {
  const stats = readJson<Record<string, SignStats>>(SIGN_STATS_KEY, {});
  const current = stats[signId];
  if (!current || current.total === 0) return "new";
  const accuracy = current.correct / current.total;
  if (current.total >= 8 && accuracy >= 0.9) return "mastered";
  if (current.total >= 4 && accuracy >= 0.7) return "reviewing";
  return "learning";
};

export const getSignMastery = (signId: string): SignMasteryLevel => {
  const level = getFlashcardLevel(signId);
  if (level >= 5) return "mastered";
  if (level >= 3) return "reviewing";
  if (level >= 1) return "learning";
  return getStatsLevel(signId);
};

export const getSignMasteryMap = (signIds: string[]) => {
  const map = new Map<string, SignMasteryLevel>();
  signIds.forEach((id) => map.set(id, getSignMastery(id)));
  return map;
};
