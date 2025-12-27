import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, X, RotateCcw, Trophy, Zap, Brain } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useFeedback } from '@/hooks/useFeedback';
import Flashcard from '@/components/Flashcard';
import { ksaSigns } from '@/data/ksaSigns';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { recordSignAnswer } from '@/lib/signMastery';

interface SpacedRepetitionData {
  [signId: string]: {
    level: number; // 0-5 (0 = new, 5 = mastered)
    nextReview: number; // timestamp
    correctStreak: number;
  };
}

const LEVELS = [
  { interval: 0, name: 'new' },
  { interval: 1 * 60 * 1000, name: 'learning' }, // 1 min
  { interval: 10 * 60 * 1000, name: 'learning' }, // 10 min
  { interval: 24 * 60 * 60 * 1000, name: 'reviewing' }, // 1 day
  { interval: 7 * 24 * 60 * 60 * 1000, name: 'reviewing' }, // 1 week
  { interval: 30 * 24 * 60 * 60 * 1000, name: 'mastered' }, // 1 month
];

export default function Flashcards() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useApp();
  const { triggerCorrectFeedback, triggerIncorrectFeedback } = useFeedback();

  const [spacedData, setSpacedData] = useState<SpacedRepetitionData>(() => {
    const saved = localStorage.getItem('flashcardProgress');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [showResult, setShowResult] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const categoryFilter = searchParams.get('category');
  const filteredSigns = useMemo(() => {
    if (!categoryFilter) return ksaSigns;
    const allowed = new Set(['warning', 'regulatory', 'mandatory', 'guide']);
    if (!allowed.has(categoryFilter)) return ksaSigns;
    return ksaSigns.filter((sign) => sign.category === categoryFilter);
  }, [categoryFilter]);

  // Get cards due for review, prioritizing by level and next review time
  const dueCards = useMemo(() => {
    const now = Date.now();
    return filteredSigns
      .map(sign => {
        const data = spacedData[sign.id] || { level: 0, nextReview: 0, correctStreak: 0 };
        return { ...sign, srData: data };
      })
      .filter(sign => sign.srData.nextReview <= now || sign.srData.level === 0)
      .sort((a, b) => {
        // Prioritize lower levels (newer cards)
        if (a.srData.level !== b.srData.level) return a.srData.level - b.srData.level;
        // Then by next review time
        return a.srData.nextReview - b.srData.nextReview;
      })
      .slice(0, 20); // Limit session to 20 cards
  }, [spacedData]);

  const currentCard = dueCards[currentIndex];
  const progress = dueCards.length > 0 ? ((currentIndex) / dueCards.length) * 100 : 0;

  const saveProgress = useCallback((newData: SpacedRepetitionData) => {
    localStorage.setItem('flashcardProgress', JSON.stringify(newData));
  }, []);

  const handleResponse = (correct: boolean) => {
    if (!currentCard) return;

    recordSignAnswer(currentCard.id, correct);

    const now = Date.now();
    const currentSRData = spacedData[currentCard.id] || { level: 0, nextReview: 0, correctStreak: 0 };
    
    let newLevel = currentSRData.level;
    let newStreak = currentSRData.correctStreak;

    if (correct) {
      triggerCorrectFeedback();
      newLevel = Math.min(5, currentSRData.level + 1);
      newStreak = currentSRData.correctStreak + 1;
      setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      triggerIncorrectFeedback();
      newLevel = Math.max(0, currentSRData.level - 1);
      newStreak = 0;
      setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    const nextReview = now + LEVELS[newLevel].interval;

    const newSpacedData = {
      ...spacedData,
      [currentCard.id]: {
        level: newLevel,
        nextReview,
        correctStreak: newStreak,
      },
    };

    setSpacedData(newSpacedData);
    saveProgress(newSpacedData);

    // Move to next card or show results
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSessionStats({ correct: 0, incorrect: 0 });
    setShowResult(false);
    setIsFlipped(false);
  };

  const handleResetProgress = () => {
    setSpacedData({});
    localStorage.removeItem('flashcardProgress');
    handleRestart();
  };

  // Calculate mastery stats
  const masteryStats = useMemo(() => {
    const total = filteredSigns.length;
    let mastered = 0;
    let learning = 0;
    let reviewing = 0;

    Object.values(spacedData).forEach(data => {
      if (data.level >= 5) mastered++;
      else if (data.level >= 3) reviewing++;
      else if (data.level >= 1) learning++;
    });

    return { total, mastered, learning, reviewing, new: total - mastered - learning - reviewing };
  }, [spacedData, filteredSigns.length]);

  // Results screen
  if (showResult) {
    const totalAnswered = sessionStats.correct + sessionStats.incorrect;
    const accuracy = totalAnswered > 0 ? Math.round((sessionStats.correct / totalAnswered) * 100) : 0;

    return (
      <div className="min-h-screen bg-background">
        <header className="bg-gradient-hero text-primary-foreground p-4 pb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/signs')} className="p-2 rounded-full bg-primary-foreground/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{t('flashcards.sessionComplete')}</h1>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center"
          >
            <Trophy className="w-12 h-12 text-primary" />
          </motion.div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">{accuracy}%</h2>
            <p className="text-muted-foreground">{t('flashcards.accuracy')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 rounded-xl p-4 text-center">
              <Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{sessionStats.correct}</p>
              <p className="text-sm text-muted-foreground">{t('flashcards.correct')}</p>
            </div>
            <div className="bg-red-500/10 rounded-xl p-4 text-center">
              <X className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</p>
              <p className="text-sm text-muted-foreground">{t('flashcards.incorrect')}</p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-card-foreground">{t('flashcards.overallProgress')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('flashcards.mastered')}</span>
                <span className="font-medium text-green-600">{masteryStats.mastered}/{masteryStats.total}</span>
              </div>
              <Progress value={(masteryStats.mastered / masteryStats.total) * 100} className="h-2" />
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleRestart} className="w-full" size="lg">
              <RotateCcw className="w-5 h-5 mr-2" />
              {t('flashcards.practiceMore')}
            </Button>
            <Button onClick={() => navigate('/signs')} variant="outline" className="w-full" size="lg">
              {t('common.back')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No cards due
  if (dueCards.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-gradient-hero text-primary-foreground p-4 pb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/signs')} className="p-2 rounded-full bg-primary-foreground/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{t('flashcards.title')}</h1>
          </div>
        </header>

        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Brain className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('flashcards.allCaughtUp')}</h2>
          <p className="text-muted-foreground max-w-xs">{t('flashcards.allCaughtUpDesc')}</p>
          
          <div className="bg-card rounded-xl p-4 w-full max-w-xs space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('flashcards.mastered')}</span>
              <span className="font-medium text-green-600">{masteryStats.mastered}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('flashcards.reviewing')}</span>
              <span className="font-medium text-blue-600">{masteryStats.reviewing}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('flashcards.learning')}</span>
              <span className="font-medium text-amber-600">{masteryStats.learning}</span>
            </div>
          </div>

          <Button onClick={handleResetProgress} variant="outline" className="mt-4">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('flashcards.resetProgress')}
          </Button>
        </div>
      </div>
    );
  }

  const title = currentCard.title[language as keyof typeof currentCard.title] || currentCard.title.en;
  const meaning = currentCard.meaning[language as keyof typeof currentCard.meaning] || currentCard.meaning.en;
  const tip = currentCard.tip?.[language as keyof typeof currentCard.tip] || currentCard.tip?.en;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-gradient-hero text-primary-foreground p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/signs')} className="p-2 rounded-full bg-primary-foreground/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{t('flashcards.title')}</h1>
          </div>
          <div className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">{currentIndex + 1}/{dueCards.length}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-primary-foreground/20" />
      </header>

      <div className="flex-1 p-6 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="w-full max-w-sm">
              <Flashcard
                id={currentCard.id}
                icon={currentCard.icon}
                svg={currentCard.svg}
                front={title}
                back={meaning}
                tip={tip}
                onFlip={setIsFlipped}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Response buttons - only show after flip */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex gap-4 justify-center pt-6"
            >
              <Button
                onClick={() => handleResponse(false)}
                variant="outline"
                size="lg"
                className="flex-1 max-w-[140px] h-14 border-red-300 hover:bg-red-50 hover:border-red-400 dark:border-red-800 dark:hover:bg-red-950"
              >
                <X className="w-6 h-6 text-red-500 mr-2" />
                <span className="text-red-600">{t('flashcards.again')}</span>
              </Button>
              <Button
                onClick={() => handleResponse(true)}
                size="lg"
                className="flex-1 max-w-[140px] h-14 bg-green-500 hover:bg-green-600"
              >
                <Check className="w-6 h-6 mr-2" />
                {t('flashcards.gotIt')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
