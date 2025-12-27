import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  Trophy,
  AlertTriangle,
  Play,
  RotateCcw,
  Home,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLearning } from '@/context/LearningContext';
import { useFeedback } from '@/hooks/useFeedback';
import BottomNav from '@/components/BottomNav';
import questionsData from '@/data/questions.json';
import { getSignSrc } from '@/data/signAssets';
import Confetti from 'react-confetti';

type ExamMode = 'quick' | 'standard' | 'full';
type ExamState = 'selection' | 'in-progress' | 'completed' | 'review';

interface ExamConfig {
  questions: number;
  timeMinutes: number;
  passThreshold: number;
}

const EXAM_CONFIGS: Record<ExamMode, ExamConfig> = {
  quick: { questions: 10, timeMinutes: 10, passThreshold: 70 },
  standard: { questions: 20, timeMinutes: 20, passThreshold: 70 },
  full: { questions: 40, timeMinutes: 40, passThreshold: 70 },
};

interface Answer {
  questionId: string;
  selectedAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean | null;
}

const Exam: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { recordAnswer } = useLearning();
  const { triggerSuccessFeedback, triggerFailFeedback } = useFeedback();
  
  const [examState, setExamState] = useState<ExamState>('selection');
  const [selectedMode, setSelectedMode] = useState<ExamMode>('standard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [examQuestions, setExamQuestions] = useState<typeof questionsData.questions>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [signError, setSignError] = useState(false);
  const warnedLegacyRef = useRef(new Set<string>());

  const getCategoryId = (question: any) =>
    question.category || question.categoryId || question.categoryKey?.split('.').pop() || 'unknown';

  const getDifficultyId = (question: any) =>
    question.difficulty || question.difficultyId || question.difficultyKey?.split('.').pop() || 'unknown';

  // Shuffle and select questions for exam
  const startExam = useCallback((mode: ExamMode) => {
    const config = EXAM_CONFIGS[mode];
    const shuffled = [...questionsData.questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, config.questions);
    
    setExamQuestions(selected);
    setAnswers(selected.map(q => ({
      questionId: q.id,
      selectedAnswer: null,
      correctAnswer: q.correctIndex ?? q.correctAnswer ?? 0,
      isCorrect: null,
    })));
    setCurrentIndex(0);
    setTimeLeft(config.timeMinutes * 60);
    setSelectedMode(mode);
    setExamState('in-progress');
  }, []);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Select an answer
  const selectAnswer = useCallback((answerIndex: number) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        selectedAnswer: answerIndex,
      };
      return updated;
    });
  }, [currentIndex]);

  // Submit the exam
  const submitExam = useCallback(() => {
    const results = answers.map(answer => ({
      ...answer,
      isCorrect: answer.selectedAnswer === answer.correctAnswer,
    }));
    
    setAnswers(results);
    
    // Record all answers in learning engine
    results.forEach((result, idx) => {
      const question = examQuestions[idx];
      if (result.selectedAnswer !== null) {
        recordAnswer(
          question.id,
          result.selectedAnswer,
          result.correctAnswer,
          result.isCorrect ?? false,
          getCategoryId(question),
          getDifficultyId(question)
        );
      }
    });

    const score = results.filter(r => r.isCorrect).length;
    const percentage = Math.round((score / results.length) * 100);
    
    if (percentage >= EXAM_CONFIGS[selectedMode].passThreshold) {
      setShowConfetti(true);
      triggerSuccessFeedback();
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      triggerFailFeedback();
    }
    
    setExamState('completed');
  }, [answers, examQuestions, recordAnswer, selectedMode, triggerSuccessFeedback, triggerFailFeedback]);

  // Timer countdown
  useEffect(() => {
    if (examState !== 'in-progress' || !timerEnabled || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, timerEnabled, timeLeft, submitExam]);

  // Calculate results
  const results = useMemo(() => {
    const correct = answers.filter(a => a.isCorrect === true).length;
    const total = answers.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = percentage >= EXAM_CONFIGS[selectedMode].passThreshold;

    const byCategory: Record<string, { correct: number; total: number }> = {};
    answers.forEach((answer, idx) => {
      const question = examQuestions[idx];
      if (!question) return;
      const category = getCategoryId(question);
      if (!byCategory[category]) {
        byCategory[category] = { correct: 0, total: 0 };
      }
      byCategory[category].total += 1;
      if (answer.isCorrect) {
        byCategory[category].correct += 1;
      }
    });

    return { correct, total, percentage, passed, byCategory };
  }, [answers, selectedMode, examQuestions]);

  // Current question
  const currentQuestion = examQuestions[currentIndex];
  const currentAnswer = answers[currentIndex];
  useEffect(() => {
    setSignError(false);
  }, [currentQuestion?.id]);
  useEffect(() => {
    if (!import.meta.env.DEV || !currentQuestion || warnedLegacyRef.current.has(currentQuestion.id)) return;
    if (currentQuestion.question || currentQuestion.options || currentQuestion.explanation || typeof currentQuestion.correctAnswer === 'number') {
      console.warn(`[quiz-i18n] Legacy fields detected for question ${currentQuestion.id}`);
      warnedLegacyRef.current.add(currentQuestion.id);
    }
  }, [currentQuestion]);

  // Navigation
  const goNext = () => setCurrentIndex(prev => Math.min(prev + 1, examQuestions.length - 1));
  const goPrev = () => setCurrentIndex(prev => Math.max(prev - 1, 0));
  const goToQuestion = (idx: number) => setCurrentIndex(idx);

  // Mode selection screen
  if (examState === 'selection') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">{t('exam.title', 'Practice Test')}</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{t('exam.selectMode', 'Select Practice Mode')}</h2>
              <p className="text-muted-foreground">
                {t('exam.selectModeDesc', 'Choose the practice format that suits your preparation level')}
              </p>
            </div>

            {(['quick', 'standard', 'full'] as ExamMode[]).map((mode) => {
              const config = EXAM_CONFIGS[mode];
              return (
                <motion.div
                  key={mode}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedMode === mode ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedMode(mode)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="capitalize">
                          {t(`exam.modes.${mode}`, mode)} {t('exam.exam', 'Practice')}
                        </CardTitle>
                        <Badge variant={mode === 'quick' ? 'secondary' : mode === 'standard' ? 'default' : 'destructive'}>
                          {config.questions} {t('exam.questions', 'questions')}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {config.timeMinutes} {t('exam.minutes', 'min')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          {t('exam.passThreshold', 'Pass')}: {config.passThreshold}%
                        </span>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}

            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('exam.enableTimer', 'Enable Timer')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('exam.timerDesc', 'Practice with a timer')}
                    </p>
                  </div>
                  <Button
                    variant={timerEnabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimerEnabled(!timerEnabled)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {timerEnabled ? t('common.on', 'On') : t('common.off', 'Off')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button 
              size="lg" 
              className="w-full mt-6"
              onClick={() => startExam(selectedMode)}
            >
              <Play className="h-5 w-5 mr-2" />
              {t('exam.startExam', 'Start Practice')}
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  // Exam in progress
  if (examState === 'in-progress' && currentQuestion) {
    const answeredCount = answers.filter(a => a.selectedAnswer !== null).length;
    const progress = (answeredCount / examQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  {currentIndex + 1} / {examQuestions.length}
                </span>
                {timerEnabled && (
                  <Badge variant={timeLeft < 60 ? 'destructive' : 'secondary'} className="font-mono">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(timeLeft)}
                  </Badge>
                )}
              </div>
              <Button variant="destructive" size="sm" onClick={submitExam}>
                {t('exam.submit', 'Submit')}
              </Button>
            </div>
            <Progress value={progress} className="mt-2 h-2" />
          </div>
        </header>

        {/* Question */}
        <main className="flex-1 container mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{t(currentQuestion.categoryKey)}</Badge>
                    <Badge variant="secondary">{t(currentQuestion.difficultyKey)}</Badge>
                  </div>
                  {currentQuestion.signId && (
                    <div className="mb-4 flex justify-center">
                      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                        {getSignSrc(currentQuestion.signId) && !signError ? (
                          <img
                            src={getSignSrc(currentQuestion.signId)}
                            alt={currentQuestion.signAltKey
                              ? t(currentQuestion.signAltKey)
                              : t(currentQuestion.questionKey)}
                            aria-label={currentQuestion.signAltKey
                              ? t(currentQuestion.signAltKey)
                              : t(currentQuestion.questionKey)}
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
                  <CardTitle className="text-lg leading-relaxed">
                    {t(currentQuestion.questionKey)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentQuestion.optionsKeys.map((optionKey, idx) => (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        currentAnswer?.selectedAnswer === idx
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => selectAnswer(idx)}
                    >
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {t(optionKey)}
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Question navigator */}
        <div className="sticky bottom-0 bg-background border-t border-border">
          <div className="container mx-auto px-4 py-4">
            {/* Quick nav dots */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {answers.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => goToQuestion(idx)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    idx === currentIndex
                      ? 'bg-primary text-primary-foreground'
                      : answer.selectedAnswer !== null
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Prev/Next buttons */}
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.previous', 'Previous')}
              </Button>
              
              {currentIndex === examQuestions.length - 1 ? (
                <Button onClick={submitExam}>
                  {t('exam.submit', 'Submit Practice')}
                </Button>
              ) : (
                <Button onClick={goNext}>
                  {t('common.next', 'Next')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (examState === 'completed') {
    return (
      <div className="min-h-screen bg-background">
        {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
        
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-center">{t('exam.results', 'Practice Results')}</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center mb-8"
            >
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 ${
                results.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {results.passed ? (
                  <Trophy className="h-16 w-16 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="h-16 w-16 text-red-600 dark:text-red-400" />
                )}
              </div>
              
              <h2 className={`text-4xl font-bold mb-2 ${
                results.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {results.percentage}%
              </h2>
              
              <p className="text-lg font-medium">
                {results.passed 
                  ? t('exam.passed', 'Great job! Practice complete.') 
                  : t('exam.failed', 'Keep Practicing!')}
              </p>
              
              <p className="text-muted-foreground mt-2">
                {results.correct} / {results.total} {t('exam.correctAnswers', 'correct answers')}
              </p>
            </motion.div>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setExamState('review')}
              >
                <Eye className="h-4 w-4 mr-2" />
                {t('exam.reviewAnswers', 'Review Answers')}
              </Button>
              
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => startExam(selectedMode)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('exam.tryAgain', 'Try Again')}
              </Button>
              
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                {t('common.home', 'Home')}
              </Button>
            </div>

            <div className="mt-6 bg-card rounded-xl p-4">
              <h3 className="font-semibold text-card-foreground mb-3">
                {t('quiz.categories.all', 'Topic Breakdown')}
              </h3>
              <div className="space-y-2 text-sm">
                {Object.entries(results.byCategory).map(([category, stats]) => {
                  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
                  return (
                    <div key={category} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t(`quiz.categories.${category}`, category)}
                      </span>
                      <span className="font-medium text-card-foreground">
                        {stats.correct}/{stats.total} ({accuracy}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Review mode
  if (examState === 'review') {
    const reviewQuestion = examQuestions[currentIndex];
    const reviewAnswer = answers[currentIndex];

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setExamState('completed')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('exam.backToResults', 'Back')}
              </Button>
              <span className="font-medium">
                {t('exam.review', 'Review')}: {currentIndex + 1} / {examQuestions.length}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{t(reviewQuestion.categoryKey)}</Badge>
                      <Badge variant="secondary">{t(reviewQuestion.difficultyKey)}</Badge>
                    </div>
                    {reviewAnswer.isCorrect ? (
                      <Badge className="bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t('common.correct', 'Correct')}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        {t('common.incorrect', 'Incorrect')}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-relaxed">
                    {t(reviewQuestion.questionKey)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reviewQuestion.optionsKeys.map((optionKey, idx) => {
                    const isSelected = reviewAnswer.selectedAnswer === idx;
                    const isCorrect = idx === reviewAnswer.correctAnswer;
                    
                    let className = 'w-full p-4 text-left rounded-lg border-2 ';
                    if (isCorrect) {
                      className += 'border-green-500 bg-green-50 dark:bg-green-900/20';
                    } else if (isSelected && !isCorrect) {
                      className += 'border-red-500 bg-red-50 dark:bg-red-900/20';
                    } else {
                      className += 'border-border';
                    }

                    return (
                      <div key={idx} className={className}>
                        <div className="flex items-center justify-between">
                          <span>
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + idx)}.
                            </span>
                            {t(optionKey)}
                          </span>
                          {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                          {isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                        </div>
                      </div>
                    );
                  })}

                  {reviewQuestion.explanationKey && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">{t('exam.explanation', 'Explanation')}:</p>
                      <p className="text-sm text-muted-foreground">
                        {t(reviewQuestion.explanationKey)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </main>

        <div className="sticky bottom-0 bg-background border-t border-border">
          <div className="container mx-auto px-4 py-4 flex justify-between">
            <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.previous', 'Previous')}
            </Button>
            <Button onClick={goNext} disabled={currentIndex === examQuestions.length - 1}>
              {t('common.next', 'Next')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Exam;
