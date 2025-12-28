import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Car, BookOpen, HelpCircle, BookOpenCheck, Settings, Trophy, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAchievements } from '@/context/AchievementsContext';
import { useLearning } from '@/context/LearningContext';
import { Progress } from '@/components/ui/progress';
import rulesData from '@/data/rules.json';
import { loadTestSession, TestSession } from '@/lib/testSession';

const quickNav = [
  { key: 'signs', icon: Car, path: '/signs', bg: 'bg-accent', fg: 'text-accent-foreground' },
  { key: 'rules', icon: BookOpenCheck, path: '/learn', bg: 'bg-info', fg: 'text-info-foreground' },
  { key: 'quiz', icon: HelpCircle, path: '/practice', bg: 'bg-success', fg: 'text-success-foreground' },
  { key: 'points', icon: BookOpen, path: '/violation-points', bg: 'bg-secondary', fg: 'text-secondary-foreground' },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { language, stats } = useApp();
  const { totalXP, currentLevel } = useAchievements();
  const { categoryStats, streak } = useLearning();
  const [lastSession, setLastSession] = useState<TestSession | null>(() => loadTestSession());

  const lastLessonId = typeof window !== 'undefined' ? localStorage.getItem('lastLearnLessonId') : null;
  const lastLesson = rulesData.rules.find(rule => rule.id === lastLessonId) ?? rulesData.rules[0];
  const lastLessonTitle = lastLesson
    ? lastLesson.title[language as keyof typeof lastLesson.title] || lastLesson.title.en
    : t('learn.title');
  const rulesProgress = categoryStats.rules?.accuracy;
  const numberFormatter = new Intl.NumberFormat(i18n.language);
  const averageScore = stats.quizzesTaken > 0
    ? Math.round(stats.totalScore / stats.quizzesTaken)
    : 0;
  const weakTopics = useMemo(() => {
    return Object.entries(categoryStats)
      .map(([category, stat]) => ({ category, wrong: Math.max(stat.total - stat.correct, 0) }))
      .filter((entry) => entry.wrong > 0)
      .sort((a, b) => b.wrong - a.wrong)
      .slice(0, 2);
  }, [categoryStats]);

  useEffect(() => {
    const refresh = () => setLastSession(loadTestSession());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="relative overflow-hidden bg-gradient-hero text-primary-foreground dark:text-foreground p-6 pb-16 rounded-b-[2.5rem]">
        <div className="absolute -top-24 -right-10 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">{t('app.name')}</h1>
              <span className="mt-2 inline-flex items-center rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold text-primary-foreground dark:text-foreground">
                {t('app.offline')}
              </span>
            </div>
            <button onClick={() => navigate('/settings')} className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary-foreground/10 rounded-2xl p-4">
            <p className="text-base font-semibold">{t('home.greeting')}</p>
            <p className="text-sm text-primary-foreground dark:text-muted-foreground">{t('home.subtitle')}</p>
          </motion.div>
        </div>
      </header>

      <main className="relative z-10 p-4 -mt-10 space-y-6">
        <section className="space-y-3">
          {lastSession && (
            <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('home.continueTest.title')}</p>
              <p className="mt-2 text-lg font-semibold text-card-foreground">
                {lastSession.type === 'exam' ? t('home.continueTest.examLabel') : t('home.continueTest.practiceLabel')}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('home.continueTest.progress', {
                  current: numberFormatter.format(
                    lastSession.type === 'exam'
                      ? Math.min(lastSession.payload.currentIndex + 1, lastSession.payload.questions.length)
                      : Math.min(lastSession.payload.current + 1, lastSession.payload.questions.length)
                  ),
                  total: numberFormatter.format(lastSession.payload.questions.length),
                })}
              </p>
              <button
                onClick={() =>
                  navigate(lastSession.type === 'exam' ? '/exam?resume=1' : '/practice?resume=1', { state: { resume: true } })
                }
                className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
              >
                {t('home.continueTest.cta')}
              </button>
            </div>
          )}
          <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('home.continueLearning.title')}</p>
            <p className="mt-2 text-lg font-semibold text-card-foreground">
              {t('home.continueLearning.lessonLabel', { lesson: lastLessonTitle })}
            </p>
            {typeof rulesProgress === 'number' && (
              <>
                <p className="mt-3 text-sm text-muted-foreground">
                  {t('home.continueLearning.progressLabel', { value: numberFormatter.format(rulesProgress) })}
                </p>
                <Progress value={rulesProgress} className="mt-2 h-2.5 bg-muted [&>div]:bg-primary" />
              </>
            )}
            <button
              onClick={() => navigate('/learn')}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
            >
              {t('home.continueLearning.cta')}
            </button>
          </div>
        </section>

        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('home.mission.title')}</p>
          <div className="mt-3 space-y-2 text-sm text-card-foreground">
            <p>{t('home.mission.items.answer')}</p>
            <p>{t('home.mission.items.earn')}</p>
            <p>{t('home.mission.items.improve')}</p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t('home.mission.time')}</p>
          <button
            onClick={() => navigate('/practice')}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            {t('home.mission.cta')}
          </button>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('home.progressSummary.title')}</p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-lg font-semibold text-card-foreground">{numberFormatter.format(stats.quizzesTaken)}</p>
              <p className="text-xs text-muted-foreground">{t('home.progressSummary.tests')}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-lg font-semibold text-card-foreground">{numberFormatter.format(stats.bestScore)}%</p>
              <p className="text-xs text-muted-foreground">{t('home.progressSummary.bestScore')}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-lg font-semibold text-card-foreground">{numberFormatter.format(averageScore)}%</p>
              <p className="text-xs text-muted-foreground">{t('home.progressSummary.averageScore')}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('home.progressSummary.weakTopics')}</p>
            {weakTopics.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">{t('home.progressSummary.noWeakTopics')}</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {weakTopics.map((topic) => (
                  <span key={topic.category} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                    {t(`quiz.categories.${topic.category}`)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-card px-4 py-3 shadow-sm border border-border">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-card-foreground">{t('achievements.level')}</span>
              <span>{t(`achievements.levels.${currentLevel.name}`)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-accent" />
              <span className="font-semibold text-card-foreground">
                {t('home.xpStrip.xpLabel', { xp: numberFormatter.format(totalXP) })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-secondary" />
              <span className="font-semibold text-card-foreground">
                {t('home.xpStrip.streakLabel', { count: streak.current, value: numberFormatter.format(streak.current) })}
              </span>
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {quickNav.map((item, i) => (
              <motion.button
                key={item.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.04 }}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-2 rounded-2xl bg-card px-3 py-4 text-center shadow-md card-hover tap-highlight-none"
              >
                <div className={`h-12 w-12 ${item.bg} rounded-2xl flex items-center justify-center shadow-md`}>
                  <item.icon className={`h-6 w-6 ${item.fg}`} />
                </div>
                <span className="text-xs font-semibold text-card-foreground">
                  {t(`home.quickNav.${item.key}`)}
                </span>
              </motion.button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
