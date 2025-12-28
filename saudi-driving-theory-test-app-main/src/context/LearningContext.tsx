import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Types
export interface MistakeRecord {
  questionId: string;
  selectedAnswer: number;
  correctAnswer: number;
  timestamp: number;
  category: string;
  difficulty: string;
  correctStreak: number; // Track consecutive correct answers
}

export interface CategoryStat {
  correct: number;
  total: number;
  accuracy: number;
}

export interface ReviewItem {
  questionId: string;
  interval: number; // days
  easeFactor: number;
  nextReviewDate: number; // timestamp
  repetitions: number;
}

export type MasteryLevel = 'beginner' | 'intermediate' | 'exam-ready';

export interface LearningState {
  mistakes: MistakeRecord[];
  categoryStats: Record<string, CategoryStat>;
  reviewQueue: ReviewItem[];
  mastery: Record<string, MasteryLevel>;
  streak: { current: number; lastDate: string; longest: number };
  totalAnswered: number;
  totalCorrect: number;
}

interface LearningContextType extends LearningState {
  // Actions
  recordAnswer: (
    questionId: string,
    selectedAnswer: number,
    correctAnswer: number,
    isCorrect: boolean,
    category: string,
    difficulty: string
  ) => void;
  getMistakeQuestions: () => string[];
  getWeakCategories: () => string[];
  getDueReviews: () => string[];
  getCategoryMastery: (category: string) => MasteryLevel;
  clearMistake: (questionId: string) => void;
  resetProgress: () => void;
  getOverallAccuracy: () => number;
  isQuestionMastered: (questionId: string) => boolean;
}

const STORAGE_KEY = 'driving-app-learning-state';
const MASTERY_STREAK_THRESHOLD = 3; // Correct 3 times in a row to master

const defaultState: LearningState = {
  mistakes: [],
  categoryStats: {},
  reviewQueue: [],
  mastery: {},
  streak: { current: 0, lastDate: '', longest: 0 },
  totalAnswered: 0,
  totalCorrect: 0,
};

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LearningState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultState, ...JSON.parse(stored) };
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Failed to load learning state:', e);
      }
    }
    return defaultState;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Failed to save learning state:', e);
      }
    }
  }, [state]);

  // Update streak on new day
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (state.streak.lastDate && state.streak.lastDate !== today && state.streak.lastDate !== yesterday) {
      // Streak broken
      setState(prev => ({
        ...prev,
        streak: { ...prev.streak, current: 0 }
      }));
    }
  }, [state.streak.lastDate]);

  // SM-2 inspired spaced repetition algorithm
  const calculateNextReview = useCallback((item: ReviewItem | undefined, isCorrect: boolean): ReviewItem => {
    const now = Date.now();
    
    if (!item) {
      // New item
      return {
        questionId: '',
        interval: isCorrect ? 1 : 0.5,
        easeFactor: 2.5,
        nextReviewDate: now + (isCorrect ? 86400000 : 43200000), // 1 day or 12 hours
        repetitions: isCorrect ? 1 : 0,
      };
    }

    let { interval, easeFactor, repetitions } = item;

    if (isCorrect) {
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      easeFactor = Math.max(1.3, easeFactor + 0.1);
    } else {
      repetitions = 0;
      interval = 0.5;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    }

    return {
      ...item,
      interval,
      easeFactor,
      repetitions,
      nextReviewDate: now + interval * 86400000,
    };
  }, []);

  // Calculate mastery level for a category
  const calculateMastery = useCallback((stats: CategoryStat): MasteryLevel => {
    if (stats.total < 10) return 'beginner';
    if (stats.accuracy >= 80 && stats.total >= 20) return 'exam-ready';
    if (stats.accuracy >= 50) return 'intermediate';
    return 'beginner';
  }, []);

  // Record an answer
  const recordAnswer = useCallback((
    questionId: string,
    selectedAnswer: number,
    correctAnswer: number,
    isCorrect: boolean,
    category: string,
    difficulty: string
  ) => {
    const today = new Date().toISOString().split('T')[0];

    setState(prev => {
      // Update category stats
      const categoryStats = { ...prev.categoryStats };
      if (!categoryStats[category]) {
        categoryStats[category] = { correct: 0, total: 0, accuracy: 0 };
      }
      categoryStats[category] = {
        correct: categoryStats[category].correct + (isCorrect ? 1 : 0),
        total: categoryStats[category].total + 1,
        accuracy: Math.round(
          ((categoryStats[category].correct + (isCorrect ? 1 : 0)) /
            (categoryStats[category].total + 1)) *
            100
        ),
      };

      // Update mastery
      const mastery = { ...prev.mastery };
      mastery[category] = calculateMastery(categoryStats[category]);

      // Update mistakes
      let mistakes = [...prev.mistakes];
      const existingMistakeIdx = mistakes.findIndex(m => m.questionId === questionId);

      if (isCorrect) {
        if (existingMistakeIdx !== -1) {
          const mistake = mistakes[existingMistakeIdx];
          if (mistake.correctStreak + 1 >= MASTERY_STREAK_THRESHOLD) {
            // Remove from mistakes - mastered!
            mistakes = mistakes.filter(m => m.questionId !== questionId);
          } else {
            // Increment streak
            mistakes[existingMistakeIdx] = {
              ...mistake,
              correctStreak: mistake.correctStreak + 1,
            };
          }
        }
      } else {
        if (existingMistakeIdx !== -1) {
          // Reset streak on wrong answer
          mistakes[existingMistakeIdx] = {
            ...mistakes[existingMistakeIdx],
            selectedAnswer,
            timestamp: Date.now(),
            correctStreak: 0,
          };
        } else {
          // Add new mistake
          mistakes.push({
            questionId,
            selectedAnswer,
            correctAnswer,
            timestamp: Date.now(),
            category,
            difficulty,
            correctStreak: 0,
          });
        }
      }

      // Update review queue (spaced repetition)
      const reviewQueue = [...prev.reviewQueue];
      const existingReviewIdx = reviewQueue.findIndex(r => r.questionId === questionId);
      const existingReview = existingReviewIdx !== -1 ? reviewQueue[existingReviewIdx] : undefined;
      const newReview = calculateNextReview(existingReview, isCorrect);
      newReview.questionId = questionId;

      if (existingReviewIdx !== -1) {
        reviewQueue[existingReviewIdx] = newReview;
      } else {
        reviewQueue.push(newReview);
      }

      // Update streak
      const streak = { ...prev.streak };
      if (streak.lastDate !== today) {
        if (streak.lastDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
          streak.current += 1;
        } else {
          streak.current = 1;
        }
        streak.lastDate = today;
        streak.longest = Math.max(streak.longest, streak.current);
      }

      return {
        ...prev,
        mistakes,
        categoryStats,
        mastery,
        reviewQueue,
        streak,
        totalAnswered: prev.totalAnswered + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
      };
    });
  }, [calculateMastery, calculateNextReview]);

  // Get questions that user got wrong
  const getMistakeQuestions = useCallback((): string[] => {
    return state.mistakes.map(m => m.questionId);
  }, [state.mistakes]);

  // Get categories with low accuracy
  const getWeakCategories = useCallback((): string[] => {
    return Object.entries(state.categoryStats)
      .filter(([, stats]) => stats.total >= 5 && stats.accuracy < 70)
      .sort((a, b) => a[1].accuracy - b[1].accuracy)
      .map(([category]) => category);
  }, [state.categoryStats]);

  // Get questions due for review
  const getDueReviews = useCallback((): string[] => {
    const now = Date.now();
    return state.reviewQueue
      .filter(r => r.nextReviewDate <= now)
      .sort((a, b) => a.nextReviewDate - b.nextReviewDate)
      .map(r => r.questionId);
  }, [state.reviewQueue]);

  // Get mastery level for category
  const getCategoryMastery = useCallback((category: string): MasteryLevel => {
    return state.mastery[category] || 'beginner';
  }, [state.mastery]);

  // Clear a specific mistake
  const clearMistake = useCallback((questionId: string) => {
    setState(prev => ({
      ...prev,
      mistakes: prev.mistakes.filter(m => m.questionId !== questionId),
    }));
  }, []);

  // Check if question is mastered (correct 3+ times in review)
  const isQuestionMastered = useCallback((questionId: string): boolean => {
    const review = state.reviewQueue.find(r => r.questionId === questionId);
    return review ? review.repetitions >= 3 : false;
  }, [state.reviewQueue]);

  // Get overall accuracy
  const getOverallAccuracy = useCallback((): number => {
    if (state.totalAnswered === 0) return 0;
    return Math.round((state.totalCorrect / state.totalAnswered) * 100);
  }, [state.totalAnswered, state.totalCorrect]);

  // Reset all progress
  const resetProgress = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: LearningContextType = {
    ...state,
    recordAnswer,
    getMistakeQuestions,
    getWeakCategories,
    getDueReviews,
    getCategoryMastery,
    clearMistake,
    resetProgress,
    getOverallAccuracy,
    isQuestionMastered,
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = (): LearningContextType => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};
