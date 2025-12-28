import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Brain, 
  AlertTriangle, 
  Clock, 
  Layers,
  BookOpen,
  Star,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/context/AppContext';
import { useLearning } from '@/context/LearningContext';
import { useFeedback } from '@/hooks/useFeedback';
import BottomNav from '@/components/BottomNav';
import questionsData from '@/data/questions.json';
import { getSignSrc } from '@/data/signAssets';
import Confetti from 'react-confetti';
import { clearTestSession, loadTestSession, saveTestSession } from '@/lib/testSession';

type PracticeMode = 'all' | 'mistakes' | 'weak' | 'review' | 'daily' | 'quick' | 'category';
type QuizState = 'setup' | 'playing' | 'result';

interface ModeConfig {
  id: PracticeMode;
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  color: string;
}

const PRACTICE_MODES: ModeConfig[] = [
  { 
    id: 'all', 
    icon: <Layers className="h-5 w-5" />, 
    titleKey: 'practice.modes.all', 
    descKey: 'practice.modes.allDesc',
    color: 'bg-primary/10 text-primary'
  },
  { 
    id: 'mistakes', 
    icon: <X className="h-5 w-5" />, 
    titleKey: 'practice.modes.mistakes', 
    descKey: 'practice.modes.mistakesDesc',
    color: 'bg-destructive/10 text-destructive'
  },
  { 
    id: 'weak', 
    icon: <AlertTriangle className="h-5 w-5" />, 
    titleKey: 'practice.modes.weak', 
    descKey: 'practice.modes.weakDesc',
    color: 'bg-warning/10 text-warning'
  },
  { 
    id: 'review', 
    icon: <Clock className="h-5 w-5" />, 
    titleKey: 'practice.modes.review', 
    descKey: 'practice.modes.reviewDesc',
    color: 'bg-info/10 text-info'
  },
  { 
    id: 'daily', 
    icon: <Star className="h-5 w-5" />, 
    titleKey: 'practice.modes.daily', 
    descKey: 'practice.modes.dailyDesc',
    color: 'bg-accent/10 text-accent'
  },
  { 
    id: 'quick', 
    icon: <Zap className="h-5 w-5" />, 
    titleKey: 'practice.modes.quick', 
    descKey: 'practice.modes.quickDesc',
    color: 'bg-success/10 text-success'
  },
];

const CATEGORIES = ['signs', 'rules', 'safety', 'signals', 'markings', 'violation_points', 'traffic_fines'];

export default function Practice() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateStats, favorites, toggleFavorite } = useApp();
  const { 
    getMistakeQuestions, 
    getWeakCategories, 
    getDueReviews, 
    recordAnswer,
    categoryStats,
    mistakes
  } = useLearning();
  const { triggerCorrectFeedback, triggerIncorrectFeedback, triggerSuccessFeedback, triggerFailFeedback } = useFeedback();

  const [state, setState] = useState<QuizState>('setup');
  const [mode, setMode] = useState<PracticeMode>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<typeof questionsData.questions>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionWrongIds, setSessionWrongIds] = useState<string[]>([]);
  const [sessionResults, setSessionResults] = useState<{ id: string; category: string; correct: boolean }[]>([]);
  const [signError, setSignError] = useState(false);
  const numberFormatter = new Intl.NumberFormat(i18n.language);
  const percentFormatter = new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 0 });
  const getCategoryLabel = (category: string) =>
    i18n.exists(`quiz.categories.${category}`) ? t(`quiz.categories.${category}`) : t('quiz.categories.unknown');

  const warnedLegacyRef = useRef(new Set<string>());
  const didResumeRef = useRef(false);

  const getCategoryId = (question: any) =>
    question.category || question.categoryId || question.categoryKey?.split('.').pop() || 'unknown';

  const getDifficultyId = (question: any) =>
    question.difficulty || question.difficultyId || question.difficultyKey?.split('.').pop() || 'unknown';

  const questionsById = useMemo(() => {
    return new Map(questionsData.questions.map((question) => [question.id, question]));
  }, []);

  useEffect(() => {
    if (didResumeRef.current) return;
    const resumeRequested =
      (location.state as { resume?: boolean } | null)?.resume === true ||
      new URLSearchParams(location.search).get('resume') === '1';
    if (!resumeRequested) return;

    const session = loadTestSession();
    if (!session || session.type !== 'practice') return;

    const ordered = session.payload.questions
      .map((id) => questionsById.get(id))
      .filter(Boolean);
    if (ordered.length === 0) {
      clearTestSession();
      return;
    }

    setQuestions(ordered);
    setMode(session.payload.mode as PracticeMode);
    setSelectedCategory(session.payload.selectedCategory ?? null);
    setCurrent(Math.min(session.payload.current, ordered.length - 1));
    setSelected(session.payload.selected ?? null);
    setShowAnswer(session.payload.showAnswer ?? false);
    setScore(session.payload.score ?? 0);
    setSessionWrongIds(session.payload.sessionWrongIds ?? []);
    setSessionResults(session.payload.sessionResults ?? []);
    setState('playing');
    didResumeRef.current = true;
  }, [location, questionsById]);

  // Get available questions for each mode
  const mistakeQuestionIds = useMemo(() => getMistakeQuestions(), [getMistakeQuestions]);
  const weakCategories = useMemo(() => getWeakCategories(), [getWeakCategories]);
  const dueReviewIds = useMemo(() => getDueReviews(), [getDueReviews]);

  const mistakeQuestions = useMemo(() => 
    questionsData.questions.filter(q => mistakeQuestionIds.includes(q.id)),
    [mistakeQuestionIds]
  );

  const weakQuestions = useMemo(() =>
    questionsData.questions.filter(q => weakCategories.includes(getCategoryId(q))),
    [weakCategories]
  );

  const reviewQuestions = useMemo(() => 
    questionsData.questions.filter(q => dueReviewIds.includes(q.id)),
    [dueReviewIds]
  );

  // Get questions by category
  const getQuestionsByCategory = (category: string) =>
    questionsData.questions.filter(q => getCategoryId(q) === category);

  // Start practice with selected mode
  const startPractice = (practiceMode: PracticeMode, count: number, category?: string) => {
    clearTestSession();
    let pool: typeof questionsData.questions = [];

    switch (practiceMode) {
      case 'all':
        pool = [...questionsData.questions];
        break;
      case 'mistakes':
        pool = [...mistakeQuestions];
        break;
      case 'weak':
        pool = [...weakQuestions];
        break;
      case 'review':
        pool = [...reviewQuestions];
        break;
      case 'daily':
        pool = [...questionsData.questions];
        break;
      case 'quick':
        pool = [...questionsData.questions];
        break;
      case 'category':
        pool = category ? getQuestionsByCategory(category) : [];
        break;
    }

    if (pool.length === 0) {
      return; // No questions available
    }

    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
    setQuestions(shuffled);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowAnswer(false);
    setMode(practiceMode);
    setSessionWrongIds([]);
    setSessionResults([]);
    setState('playing');
  };

  const startPracticeWithIds = (ids: string[]) => {
    clearTestSession();
    const pool = questionsData.questions.filter(q => ids.includes(q.id));
    if (pool.length === 0) return;

    const shuffled = pool.sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowAnswer(false);
    setMode('mistakes');
    setSessionWrongIds([]);
    setSessionResults([]);
    setState('playing');
  };

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setShowAnswer(true);
    
    const q = questions[current];
    const correctIndex = q.correctIndex ?? q.correctAnswer ?? 0;
    const isCorrect = selected === correctIndex;
    
    if (isCorrect) {
      setScore(s => s + 1);
      triggerCorrectFeedback();
    } else {
      setSessionWrongIds(prev => (prev.includes(q.id) ? prev : [...prev, q.id]));
      triggerIncorrectFeedback();
    }

    // Record in learning engine
    recordAnswer(
      q.id,
      selected,
      correctIndex,
      isCorrect,
      getCategoryId(q),
      getDifficultyId(q)
    );

    setSessionResults(prev => {
      const next = [...prev];
      const idx = next.findIndex(item => item.id === q.id);
      const entry = { id: q.id, category: getCategoryId(q), correct: isCorrect };
      if (idx === -1) {
        next.push(entry);
      } else {
        next[idx] = entry;
      }
      return next;
    });
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      const currentCorrectIndex = questions[current].correctIndex ?? questions[current].correctAnswer ?? 0;
      const finalScore = score + (selected === currentCorrectIndex ? 1 : 0);
      updateStats(finalScore, questions.length);
      const didPass = (finalScore / questions.length) * 100 >= 70;
      if (didPass) {
        triggerSuccessFeedback();
      } else {
        triggerFailFeedback();
      }
      setState('result');
    }
  };

  const q = questions[current];
  const correctIndex = q?.correctIndex ?? q?.correctAnswer ?? 0;
  const passed = questions.length > 0 && (score / questions.length) * 100 >= 70;
  const isFavorite = q ? favorites.questions.includes(q.id) : false;

  useEffect(() => {
    if (state === 'playing' && questions.length === 0) {
      setState('setup');
    }
  }, [state, questions.length]);
  useEffect(() => {
    if (state !== 'playing' || questions.length === 0) return;
    saveTestSession({
      type: 'practice',
      updatedAt: Date.now(),
      payload: {
        mode,
        questions: questions.map((question) => question.id),
        current,
        selected,
        showAnswer,
        score,
        sessionWrongIds,
        sessionResults,
        selectedCategory,
      },
    });
  }, [state, mode, questions, current, selected, showAnswer, score, sessionWrongIds, sessionResults, selectedCategory]);
  useEffect(() => {
    if (state === 'result') {
      clearTestSession();
    }
  }, [state]);
  useEffect(() => {
    setSignError(false);
  }, [q?.id]);
  useEffect(() => {
    if (!import.meta.env.DEV || !q || warnedLegacyRef.current.has(q.id)) return;
    if (q.question || q.options || q.explanation || typeof q.correctAnswer === 'number') {
      console.warn(`[quiz-i18n] Legacy fields detected for question ${q.id}`);
      warnedLegacyRef.current.add(q.id);
    }
  }, [q]);

  // Setup screen with modes
  if (state === 'setup') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5 rtl-flip" />
            </Button>
            <h1 className="text-xl font-bold">{t('quiz.title')}</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <Tabs defaultValue="modes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="modes">{t('practice.byMode')}</TabsTrigger>
              <TabsTrigger value="category">{t('practice.byCategory')}</TabsTrigger>
            </TabsList>

            <TabsContent value="modes" className="space-y-4">
              {PRACTICE_MODES.map((modeConfig) => {
                let count = 0;
                let disabled = false;

                switch (modeConfig.id) {
                  case 'all':
                    count = questionsData.questions.length;
                    break;
                  case 'mistakes':
                    count = mistakeQuestions.length;
                    disabled = count === 0;
                    break;
                  case 'weak':
                    count = weakQuestions.length;
                    disabled = count === 0;
                    break;
                  case 'review':
                    count = reviewQuestions.length;
                    disabled = count === 0;
                    break;
                  case 'daily':
                    count = Math.min(5, questionsData.questions.length);
                    disabled = count === 0;
                    break;
                  case 'quick':
                    count = Math.min(10, questionsData.questions.length);
                    disabled = count === 0;
                    break;
                }

                return (
                  <motion.div
                    key={modeConfig.id}
                    whileHover={{ scale: disabled ? 1 : 1.02 }}
                    whileTap={{ scale: disabled ? 1 : 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all ${disabled ? 'bg-muted/40 text-muted-foreground' : ''}`}
                      onClick={() => !disabled && setMode(modeConfig.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${modeConfig.color}`}>
                              {modeConfig.icon}
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {t(modeConfig.titleKey)}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {t(modeConfig.descKey)}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary">{numberFormatter.format(count)}</Badge>
                        </div>
                      </CardHeader>
                      {mode === modeConfig.id && !disabled && (
                        <CardContent className="pt-0">
                          {modeConfig.id === 'daily' || modeConfig.id === 'quick' ? (
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startPractice(modeConfig.id, count);
                                }}
                              >
                                {modeConfig.id === 'daily'
                                  ? t('practice.startDailyCount', { count, value: numberFormatter.format(count) })
                                  : t('practice.startQuickCount', { count, value: numberFormatter.format(count) })
                                }
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm text-muted-foreground mb-3">
                                {t('quiz.selectQuestions')}
                              </p>
                              <div className="flex gap-2">
                                {[5, 10, 20].map(n => (
                                  <Button 
                                    key={n} 
                                    variant="outline" 
                                    size="sm"
                                    disabled={n > count}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startPractice(modeConfig.id, n);
                                    }}
                                  >
                                    {numberFormatter.format(Math.min(n, count))}
                                  </Button>
                                ))}
                                {count > 0 && (
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startPractice(modeConfig.id, count);
                                    }}
                                  >
                                    {t('practice.allCount', { count, value: numberFormatter.format(count) })}
                                  </Button>
                                )}
                              </div>
                            </>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                );
              })}

              {/* Learning Stats Summary */}
              <Card className="mt-6 bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {t('practice.learningStats')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-destructive">{numberFormatter.format(mistakes.length)}</p>
                      <p className="text-xs text-muted-foreground">{t('practice.mistakeCount')}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-warning">{numberFormatter.format(weakCategories.length)}</p>
                      <p className="text-xs text-muted-foreground">{t('practice.weakAreas')}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-info">{numberFormatter.format(dueReviewIds.length)}</p>
                      <p className="text-xs text-muted-foreground">{t('practice.dueReviews')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="category" className="space-y-4">
              {CATEGORIES.map((category) => {
                const categoryQuestions = getQuestionsByCategory(category);
                const stats = categoryStats[category];
                const accuracy = stats?.accuracy ?? 0;

                return (
                  <motion.div
                    key={category}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all ${
                        selectedCategory === category ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedCategory(
                        selectedCategory === category ? null : category
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base capitalize">
                                {getCategoryLabel(category)}
                              </CardTitle>
                              {stats && (
                                <CardDescription className="text-sm">
                                  {t('practice.accuracyLabel', { value: percentFormatter.format(accuracy / 100) })}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary">{numberFormatter.format(categoryQuestions.length)}</Badge>
                        </div>
                      </CardHeader>
                      {selectedCategory === category && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-3">
                            {t('quiz.selectQuestions')}
                          </p>
                          <div className="flex gap-2">
                            {[5, 10, 20].map(n => (
                              <Button 
                                key={n} 
                                variant="outline" 
                                size="sm"
                                disabled={n > categoryQuestions.length}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startPractice('category', n, category);
                                }}
                              >
                                {numberFormatter.format(Math.min(n, categoryQuestions.length))}
                              </Button>
                            ))}
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                startPractice('category', categoryQuestions.length, category);
                              }}
                            >
                              {t('practice.all')}
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
              {(selectedCategory === 'violation_points' || selectedCategory === 'traffic_fines') && (
                <div className="bg-muted/60 rounded-xl p-4 text-xs text-muted-foreground">
                  {t('disclaimer.educationalGovernment')}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        <BottomNav />
      </div>
    );
  }

  // Result screen
  if (state === 'result') {
    const finalScore = Math.round((score / questions.length) * 100);
    const byCategory = sessionResults.reduce<Record<string, { correct: number; total: number }>>((acc, result) => {
      if (!acc[result.category]) acc[result.category] = { correct: 0, total: 0 };
      acc[result.category].total += 1;
      if (result.correct) acc[result.category].correct += 1;
      return acc;
    }, {});

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        {passed && <Confetti recycle={false} numberOfPieces={200} />}
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold mb-6 ${
            passed ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
          }`}
        >
          {percentFormatter.format(finalScore / 100)}
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">
          {passed ? t('results.passed') : t('results.failed')}
        </h2>
        <p className="text-muted-foreground mb-2">
          {t('results.scoreSummary', {
            correct: numberFormatter.format(score),
            total: numberFormatter.format(questions.length),
          })}
        </p>
        {mode !== 'all' && (
          <Badge variant="outline" className="mb-4">
            {t(`practice.modes.${mode}`)}
          </Badge>
        )}
        <div className="flex gap-4 mt-4 flex-wrap justify-center">
          {sessionWrongIds.length > 0 && (
            <Button variant="secondary" onClick={() => startPracticeWithIds(sessionWrongIds)}>
              {t('practice.reviewMistakes')}
            </Button>
          )}
          <Button variant="outline" onClick={() => setState('setup')}>
            {t('results.tryAgain')}
          </Button>
          <Button onClick={() => navigate('/')}>
            {t('results.backHome')}
          </Button>
        </div>

        <div className="mt-6 w-full max-w-md bg-card rounded-xl p-4 text-left">
          <h3 className="font-semibold text-card-foreground mb-3">
            {t('results.topicBreakdown')}
          </h3>
          <div className="space-y-2 text-sm">
            {Object.entries(byCategory).map(([category, stats]) => {
              const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
              return (
                <div key={category} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {getCategoryLabel(category)}
                  </span>
                  <span className="font-medium text-card-foreground">
                    {t('results.categoryBreakdownRow', {
                      correct: numberFormatter.format(stats.correct),
                      total: numberFormatter.format(stats.total),
                      accuracy: percentFormatter.format(accuracy / 100),
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  return (
    q ? (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => setState('setup')}>
          <ArrowLeft className="h-5 w-5 rtl-flip" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {t('practice.progressCount', {
              current: numberFormatter.format(current + 1),
              total: numberFormatter.format(questions.length),
            })}
          </span>
          {mode !== 'all' && (
            <Badge variant="outline" className="text-xs">
              {t(`practice.modes.${mode}`)}
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => toggleFavorite('questions', q.id)}
        >
          <Star className={`h-5 w-5 ${isFavorite ? 'fill-accent text-accent' : ''}`} />
        </Button>
      </header>

      <div className="h-1 bg-muted">
        <motion.div 
          className="h-full bg-primary" 
          initial={{ width: 0 }} 
          animate={{ width: `${((current + 1) / questions.length) * 100}%` }} 
        />
      </div>

      <main className="flex-1 p-4 flex flex-col">
        <div className="flex gap-2 mb-4">
          <Badge variant="outline">{t(q.categoryKey)}</Badge>
          <Badge variant="secondary">{t(q.difficultyKey)}</Badge>
        </div>

        {q.signId && (
          <div className="mb-6 flex justify-center">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              {getSignSrc(q.signId) && !signError ? (
                <img
                  src={getSignSrc(q.signId)}
                  alt={q.signAltKey ? t(q.signAltKey) : t(q.questionKey)}
                  aria-label={q.signAltKey ? t(q.signAltKey) : t(q.questionKey)}
                  className="max-h-40 w-auto object-contain"
                  onError={() => setSignError(true)}
                />
              ) : (
                <div className="text-xs text-muted-foreground text-center min-w-[160px]">
                  {t('ui.signUnavailable')}
                </div>
              )}
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold mb-6">
          {t(q.questionKey)}
        </h2>

        <div className="space-y-3 flex-1">
          <AnimatePresence mode="wait">
            {q.optionsKeys.map((optKey, idx) => {
              const isCorrect = idx === correctIndex;
              const isSelected = idx === selected;
              
              let className = 'w-full p-4 rounded-xl text-left border-2 transition-all ';
              if (showAnswer) {
                if (isCorrect) className += 'border-success bg-success/10';
                else if (isSelected) className += 'border-destructive bg-destructive/10';
                else className += 'border-border bg-muted/30 text-muted-foreground';
              } else if (isSelected) {
                className += 'border-primary bg-primary/10';
              } else {
                className += 'border-border hover:border-primary/50';
              }
              
              return (
                <motion.button 
                  key={idx} 
                  onClick={() => handleSelect(idx)} 
                  className={className} 
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      showAnswer && isCorrect 
                        ? 'bg-success text-success-foreground' 
                        : showAnswer && isSelected && !isCorrect 
                        ? 'bg-destructive text-destructive-foreground'
                        : isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {showAnswer && isCorrect ? (
                        <Check className="w-4 h-4" />
                      ) : showAnswer && isSelected && !isCorrect ? (
                        <X className="w-4 h-4" />
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </div>
                    <span>{t(optKey)}</span>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {showAnswer && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-muted rounded-xl p-4 my-4"
          >
            <p className="text-sm font-medium mb-1">{t('quiz.explanation')}</p>
            <p className="text-sm text-muted-foreground">
              {q.explanationKey ? t(q.explanationKey) : t('quiz.explanationFallback')}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {t('quiz.otherOptionsNote')}
            </p>
          </motion.div>
        )}

        <div className="pt-4 pb-safe">
          {!showAnswer ? (
            <Button 
              onClick={handleSubmit} 
              disabled={selected === null} 
              className="w-full" 
              size="lg"
            >
              {t('quiz.submit')}
            </Button>
          ) : (
            <Button onClick={handleNext} className="w-full" size="lg">
              {current < questions.length - 1 
                ? t('quiz.next') 
                : t('results.title')}
            </Button>
          )}
        </div>
      </main>
    </div>
    ) : (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <p className="text-muted-foreground">{t('common.error')}</p>
          <Button onClick={() => setState('setup')}>
            {t('common.back')}
          </Button>
        </div>
      </div>
    )
  );
}
