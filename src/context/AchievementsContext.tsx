import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import achievementsData from '@/data/achievements.json';

interface Achievement {
  id: string;
  icon: string;
  points: number;
  category: string;
  requirement: {
    type: string;
    value?: number;
    category?: string;
    start?: number;
    end?: number;
  };
}

interface Level {
  level: number;
  name: string;
  minXP: number;
}

interface DailyGoalState {
  date: string;
  questionsAnswered: number;
  completed: boolean;
}

interface AchievementsState {
  unlockedAchievements: string[];
  totalXP: number;
  dailyGoal: DailyGoalState;
  dailyGoalsCompleted: number;
  questionsAnswered: number;
  quizzesCompleted: number;
  perfectQuizzes: number;
  examsPassed: number;
  categoryAccuracy: Record<string, { correct: number; total: number }>;
  streak: number;
  lastActiveDate: string | null;
}

interface AchievementsContextType {
  achievements: Achievement[];
  levels: Level[];
  state: AchievementsState;
  totalXP: number;
  currentLevel: Level;
  nextLevel: Level | null;
  xpToNextLevel: number;
  unlockedAchievements: Achievement[];
  lockedAchievements: Achievement[];
  dailyGoalProgress: number;
  dailyGoalTarget: number;
  isDailyGoalCompleted: boolean;
  recordQuizCompletion: (score: number, total: number, category?: string) => void;
  recordExamPassed: () => void;
  recordQuestionAnswered: (correct: boolean, category?: string) => void;
  checkTimeBasedAchievements: () => void;
}

const STORAGE_KEY = 'saudi-driving-achievements';

const getInitialState = (): AchievementsState => {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored) as AchievementsState;
    // Reset daily goal if it's a new day
    if (parsed.dailyGoal.date !== today) {
      parsed.dailyGoal = { date: today, questionsAnswered: 0, completed: false };
    }
    return parsed;
  }
  return {
    unlockedAchievements: [],
    totalXP: 0,
    dailyGoal: { date: today, questionsAnswered: 0, completed: false },
    dailyGoalsCompleted: 0,
    questionsAnswered: 0,
    quizzesCompleted: 0,
    perfectQuizzes: 0,
    examsPassed: 0,
    categoryAccuracy: {},
    streak: 0,
    lastActiveDate: null,
  };
};

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export const AchievementsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AchievementsState>(getInitialState);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const numberFormatter = new Intl.NumberFormat(i18n.language);

  const achievements = achievementsData.achievements as Achievement[];
  const levels = achievementsData.levels as Level[];
  const dailyGoalTarget = achievementsData.dailyGoal.questionsTarget;
  const dailyGoalBonusXP = achievementsData.dailyGoal.bonusXP;

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Calculate current level
  const currentLevel = levels.reduce((acc, level) => 
    state.totalXP >= level.minXP ? level : acc, levels[0]);
  
  const nextLevel = levels.find(l => l.minXP > state.totalXP) || null;
  const xpToNextLevel = nextLevel ? nextLevel.minXP - state.totalXP : 0;

  // Get unlocked/locked achievements
  const unlockedAchievements = achievements.filter(a => state.unlockedAchievements.includes(a.id));
  const lockedAchievements = achievements.filter(a => !state.unlockedAchievements.includes(a.id));

  // Daily goal progress
  const dailyGoalProgress = state.dailyGoal.questionsAnswered;
  const isDailyGoalCompleted = state.dailyGoal.completed;

  // Check and unlock achievements
  const checkAndUnlockAchievements = useCallback((newState: AchievementsState): string[] => {
    const newlyUnlocked: string[] = [];

    for (const achievement of achievements) {
      if (newState.unlockedAchievements.includes(achievement.id)) continue;

      const { requirement } = achievement;
      let unlocked = false;

      switch (requirement.type) {
        case 'quizzes_completed':
          unlocked = newState.quizzesCompleted >= (requirement.value || 0);
          break;
        case 'perfect_quiz':
          unlocked = newState.perfectQuizzes >= (requirement.value || 0);
          break;
        case 'accuracy_above':
          {
            const totalQuestions = newState.questionsAnswered;
            const categoryStats = Object.values(newState.categoryAccuracy);
            const totalCorrect = categoryStats.reduce((sum, c) => sum + c.correct, 0);
            const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
            unlocked = totalQuestions >= 20 && overallAccuracy >= (requirement.value || 0);
            break;
          }
        case 'streak_days':
          unlocked = newState.streak >= (requirement.value || 0);
          break;
        case 'category_accuracy':
          {
            const cat = newState.categoryAccuracy[requirement.category || ''];
            if (cat && cat.total >= 10) {
              const catAccuracy = (cat.correct / cat.total) * 100;
              unlocked = catAccuracy >= (requirement.value || 0);
            }
            break;
          }
        case 'exam_passed':
          unlocked = newState.examsPassed >= (requirement.value || 0);
          break;
        case 'daily_goals_completed':
          unlocked = newState.dailyGoalsCompleted >= (requirement.value || 0);
          break;
        case 'questions_answered':
          unlocked = newState.questionsAnswered >= (requirement.value || 0);
          break;
        case 'time_of_day':
          // Checked separately
          break;
      }

      if (unlocked) {
        newlyUnlocked.push(achievement.id);
      }
    }

    return newlyUnlocked;
  }, [achievements]);

  const unlockAchievements = useCallback((achievementIds: string[]) => {
    if (achievementIds.length === 0) return;

    setState(prev => {
      const xpGained = achievementIds.reduce((sum, id) => {
        const achievement = achievements.find(a => a.id === id);
        return sum + (achievement?.points || 0);
      }, 0);

      return {
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, ...achievementIds],
        totalXP: prev.totalXP + xpGained,
      };
    });

    // Show toast for each achievement
    achievementIds.forEach(id => {
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        toast({
          title: `🏆 ${t(`achievements.badges.${id}.name`)}`,
          description: t('common.xpValue', { value: `+${numberFormatter.format(achievement.points)}` }),
        });
      }
    });
  }, [achievements, numberFormatter, t, toast]);

  const updateStreak = useCallback((currentState: AchievementsState): AchievementsState => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = currentState.lastActiveDate;
    
    if (lastActive === today) {
      return currentState;
    }

    let newStreak = currentState.streak;
    
    if (lastActive) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    return {
      ...currentState,
      streak: newStreak,
      lastActiveDate: today,
    };
  }, []);

  const recordQuestionAnswered = useCallback((correct: boolean, category?: string) => {
    setState(prev => {
      let newState = updateStreak(prev);
      
      // Update category accuracy
      const cat = category || 'general';
      const categoryAccuracy = { ...newState.categoryAccuracy };
      if (!categoryAccuracy[cat]) {
        categoryAccuracy[cat] = { correct: 0, total: 0 };
      }
      categoryAccuracy[cat].total += 1;
      if (correct) {
        categoryAccuracy[cat].correct += 1;
      }

      // Update daily goal
      const dailyGoal = { ...newState.dailyGoal };
      dailyGoal.questionsAnswered += 1;

      let dailyGoalsCompleted = newState.dailyGoalsCompleted;
      let bonusXP = 0;

      if (!dailyGoal.completed && dailyGoal.questionsAnswered >= dailyGoalTarget) {
        dailyGoal.completed = true;
        dailyGoalsCompleted += 1;
        bonusXP = dailyGoalBonusXP;
        toast({
          title: t('achievements.dailyGoalComplete'),
          description: t('common.xpValue', { value: `+${numberFormatter.format(dailyGoalBonusXP)}` }),
        });
      }

      newState = {
        ...newState,
        questionsAnswered: newState.questionsAnswered + 1,
        categoryAccuracy,
        dailyGoal,
        dailyGoalsCompleted,
        totalXP: newState.totalXP + bonusXP,
      };

      // Check for new achievements
      const newlyUnlocked = checkAndUnlockAchievements(newState);
      if (newlyUnlocked.length > 0) {
        const xpGained = newlyUnlocked.reduce((sum, id) => {
          const achievement = achievements.find(a => a.id === id);
          return sum + (achievement?.points || 0);
        }, 0);
        newState.unlockedAchievements = [...newState.unlockedAchievements, ...newlyUnlocked];
        newState.totalXP += xpGained;

        newlyUnlocked.forEach(id => {
          const achievement = achievements.find(a => a.id === id);
          if (achievement) {
            toast({
              title: `🏆 ${t(`achievements.badges.${id}.name`)}`,
              description: t('common.xpValue', { value: `+${numberFormatter.format(achievement.points)}` }),
            });
          }
        });
      }

      return newState;
    });
  }, [achievements, checkAndUnlockAchievements, dailyGoalBonusXP, dailyGoalTarget, numberFormatter, t, toast, updateStreak]);

  const recordQuizCompletion = useCallback((score: number, total: number, category?: string) => {
    setState(prev => {
      const newState = { ...prev, quizzesCompleted: prev.quizzesCompleted + 1 };

      if (score === total && total > 0) {
        newState.perfectQuizzes += 1;
      }

      // Check for new achievements
      const newlyUnlocked = checkAndUnlockAchievements(newState);
      if (newlyUnlocked.length > 0) {
        const xpGained = newlyUnlocked.reduce((sum, id) => {
          const achievement = achievements.find(a => a.id === id);
          return sum + (achievement?.points || 0);
        }, 0);
        newState.unlockedAchievements = [...newState.unlockedAchievements, ...newlyUnlocked];
        newState.totalXP += xpGained;

        newlyUnlocked.forEach(id => {
          const achievement = achievements.find(a => a.id === id);
          if (achievement) {
            toast({
              title: `🏆 ${t(`achievements.badges.${id}.name`)}`,
              description: t('common.xpValue', { value: `+${numberFormatter.format(achievement.points)}` }),
            });
          }
        });
      }

      return newState;
    });
  }, [achievements, checkAndUnlockAchievements, numberFormatter, t, toast]);

  const recordExamPassed = useCallback(() => {
    setState(prev => {
      const newState = { ...prev, examsPassed: prev.examsPassed + 1 };

      const newlyUnlocked = checkAndUnlockAchievements(newState);
      if (newlyUnlocked.length > 0) {
        const xpGained = newlyUnlocked.reduce((sum, id) => {
          const achievement = achievements.find(a => a.id === id);
          return sum + (achievement?.points || 0);
        }, 0);
        newState.unlockedAchievements = [...newState.unlockedAchievements, ...newlyUnlocked];
        newState.totalXP += xpGained;

        newlyUnlocked.forEach(id => {
          const achievement = achievements.find(a => a.id === id);
          if (achievement) {
            toast({
              title: `🏆 ${t(`achievements.badges.${id}.name`)}`,
              description: t('common.xpValue', { value: `+${numberFormatter.format(achievement.points)}` }),
            });
          }
        });
      }

      return newState;
    });
  }, [achievements, checkAndUnlockAchievements, numberFormatter, t, toast]);

  const checkTimeBasedAchievements = useCallback(() => {
    const hour = new Date().getHours();
    
    setState(prev => {
      const newlyUnlocked: string[] = [];

      for (const achievement of achievements) {
        if (prev.unlockedAchievements.includes(achievement.id)) continue;
        if (achievement.requirement.type !== 'time_of_day') continue;

        const { start, end } = achievement.requirement;
        if (start !== undefined && end !== undefined && hour >= start && hour < end) {
          newlyUnlocked.push(achievement.id);
        }
      }

      if (newlyUnlocked.length === 0) return prev;

      const xpGained = newlyUnlocked.reduce((sum, id) => {
        const achievement = achievements.find(a => a.id === id);
        return sum + (achievement?.points || 0);
      }, 0);

      newlyUnlocked.forEach(id => {
        const achievement = achievements.find(a => a.id === id);
        if (achievement) {
          toast({
            title: `🏆 ${t(`achievements.badges.${id}.name`)}`,
            description: t('common.xpValue', { value: `+${numberFormatter.format(achievement.points)}` }),
          });
        }
      });

      return {
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, ...newlyUnlocked],
        totalXP: prev.totalXP + xpGained,
      };
    });
  }, [achievements, numberFormatter, t, toast]);

  return (
    <AchievementsContext.Provider value={{
      achievements,
      levels,
      state,
      totalXP: state.totalXP,
      currentLevel,
      nextLevel,
      xpToNextLevel,
      unlockedAchievements,
      lockedAchievements,
      dailyGoalProgress,
      dailyGoalTarget,
      isDailyGoalCompleted,
      recordQuizCompletion,
      recordExamPassed,
      recordQuestionAnswered,
      checkTimeBasedAchievements,
    }}>
      {children}
    </AchievementsContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within AchievementsProvider');
  }
  return context;
};
