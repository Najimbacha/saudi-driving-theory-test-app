import { useEffect, useMemo, useState } from 'react';
 
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Settings, Check, PlayCircle, ClipboardCheck, BookOpen, TrafficCone } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useLearning } from '@/context/LearningContext';
import rulesData from '@/data/rules.json';
import { loadTestSession, TestSession } from '@/lib/testSession';
import { ksaSigns } from '@/data/ksaSigns';
import SignIcon from '@/components/signs/SignIcon';

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { language, stats } = useApp();
  const { categoryStats } = useLearning();
  const [lastSession, setLastSession] = useState<TestSession | null>(() => loadTestSession());

  const lastLessonId = typeof window !== 'undefined' ? localStorage.getItem('lastLearnLessonId') : null;
  const lastLesson = rulesData.rules.find(rule => rule.id === lastLessonId) ?? rulesData.rules[0];
  const lastLessonTitle = lastLesson
    ? lastLesson.title[language as keyof typeof lastLesson.title] || lastLesson.title.en
    : t('learn.title');
  const numberFormatter = new Intl.NumberFormat(i18n.language);
  const averageScore = stats.quizzesTaken > 0
    ? Math.round(stats.totalScore / stats.quizzesTaken)
    : 0;
  const hasContinueSession = Boolean(lastSession);
  const hasContinueLesson = Boolean(lastLessonId);
  const sessionProgress = useMemo(() => {
    if (!lastSession) return null;
    const total = lastSession.payload.questions.length;
    const current = lastSession.type === 'exam'
      ? lastSession.payload.currentIndex
      : lastSession.payload.current;
    if (!total || current < 0) return null;
    const progress = Math.round(((current + 1) / total) * 100);
    return Math.min(Math.max(progress, 1), 100);
  }, [lastSession]);
  const continueName = hasContinueSession
    ? (lastSession?.type === 'exam' ? t('home.hero.continue.exam') : t('home.hero.continue.practice'))
    : lastLessonTitle;
  const showContinue = hasContinueSession || hasContinueLesson;
  const handleContinue = () => {
    if (lastSession) {
      navigate(lastSession.type === 'exam' ? '/exam?resume=1' : '/practice?resume=1', {
        state: { resume: true },
      });
      return;
    }
    if (lastLessonId) {
      navigate('/learn');
    }
  };
  const weakTopics = useMemo(() => {
    return Object.entries(categoryStats)
      .map(([category, stat]) => ({ category, wrong: Math.max(stat.total - stat.correct, 0) }))
      .filter((entry) => entry.wrong > 0)
      .sort((a, b) => b.wrong - a.wrong)
      .slice(0, 2);
  }, [categoryStats]);
  const weakTopicsRoute = weakTopics[0]?.category === 'violation_points'
    ? '/violation-points'
    : weakTopics[0]?.category === 'traffic_fines'
      ? '/traffic-fines'
      : weakTopics[0]?.category === 'signs'
        ? '/signs'
        : '/learn';
  const todayKey = new Date().toISOString().split('T')[0];
  const signSpotlight = useMemo(() => {
    if (!ksaSigns.length) return [];
    const seed = todayKey.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const wantCount = Math.min(3, ksaSigns.length);
    const picked = new Set<number>();
    const results: typeof ksaSigns = [];
    let offset = 0;
    while (results.length < Math.min(wantCount, ksaSigns.length)) {
      const index = (seed + offset) % ksaSigns.length;
      if (!picked.has(index)) {
        picked.add(index);
        results.push(ksaSigns[index]);
      }
      offset += 7;
    }
    return results;
  }, [todayKey, weakTopics]);

  useEffect(() => {
    const refresh = () => setLastSession(loadTestSession());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="p-4 space-y-6">
        <section className="relative overflow-hidden rounded-[2.2rem] bg-gradient-hero text-primary-foreground dark:text-foreground p-5 shadow-lg border border-primary/10">
          <div className="absolute -top-24 -right-10 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="relative z-10 space-y-5">
            <div className="flex items-start justify-between gap-4 rtl-row">
              <div>
                <h1 className="text-2xl font-bold">{t('app.name')}</h1>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-primary-foreground/90 dark:text-foreground">
                  {[
                    t('home.badges.offline'),
                    t('home.badges.noLogin'),
                    t('home.badges.noInternet'),
                  ].map((label) => (
                    <span key={label} className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/10 px-3 py-1">
                      <Check className="h-3.5 w-3.5" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition"
                aria-label={t('nav.settings')}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              {showContinue ? (
                <span className="text-primary-foreground/90 dark:text-foreground">
                  {typeof sessionProgress === 'number'
                    ? t('home.hero.continueLine', {
                        name: continueName,
                        value: numberFormatter.format(sessionProgress),
                      })
                    : t('home.hero.continueLineSimple', { name: continueName })}
                </span>
              ) : (
                <span className="text-primary-foreground/90 dark:text-foreground">{t('home.hero.pickMode')}</span>
              )}
              {showContinue && (
                <button
                  onClick={handleContinue}
                  className="ml-auto rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary-foreground/25 transition"
                >
                  {t('home.hero.continueCta')}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3 rtl-row">
              <button
                onClick={() => navigate('/practice')}
                className="flex-1 min-w-[140px] rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition flex items-center justify-center gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                {t('home.hero.startPractice')}
              </button>
              <button
                onClick={() => navigate('/exam')}
                className="flex-1 min-w-[140px] rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition flex items-center justify-center gap-2"
              >
                <ClipboardCheck className="h-4 w-4" />
                {t('home.hero.startExam')}
              </button>
            </div>

            <div className="flex flex-wrap gap-3 rtl-row">
              <button
                onClick={() => navigate('/signs')}
                className="flex-1 min-w-[140px] rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-foreground/20 transition flex items-center justify-center gap-2"
              >
                <TrafficCone className="h-4 w-4" />
                {t('home.hero.trafficSigns')}
              </button>
              <button
                onClick={() => navigate('/learn')}
                className="flex-1 min-w-[140px] rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-foreground/20 transition flex items-center justify-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                {t('home.hero.learnTheory')}
              </button>
            </div>
          </div>
        </section>

        <div className="rounded-2xl p-6 shadow-md border border-border/70 bg-gradient-to-br from-card/90 via-card to-card/70">
          <p className="text-sm font-semibold text-card-foreground">{t('home.focus.title')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('home.focus.subtitle')}</p>
          <p className="mt-4 text-sm text-muted-foreground">{t('home.focus.value')}</p>
          <button
            onClick={() => navigate('/learn')}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 active:scale-[0.98] transition"
          >
            {t('home.focus.cta')}
          </button>
        </div>

        {signSpotlight.length > 0 && (
          <div className="rounded-[1.75rem] p-6 shadow-md border border-primary/15 bg-gradient-to-br from-card/80 via-card to-card/60">
            <p className="text-sm font-semibold text-card-foreground">{t('home.signsSpotlight.title')}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t('home.signsSpotlight.subtitle')}</p>
            <div className="mt-5 flex items-center justify-center gap-4">
              {signSpotlight.map((sign) => (
                <div key={sign.id} className="h-20 w-20 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center">
                  <SignIcon
                    id={sign.id}
                    icon={sign.icon}
                    size={52}
                    svg={sign.svg}
                    alt={sign.title[language] || sign.title.en}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/signs')}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 active:scale-[0.98] transition"
            >
              {t('home.signsSpotlight.cta')}
            </button>
          </div>
        )}

        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('home.progressSummary.title')}</p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-lg font-semibold text-card-foreground">{numberFormatter.format(stats.quizzesTaken)}</p>
              <p className="text-xs text-muted-foreground">{t('home.progressSummary.testsTaken')}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-lg font-semibold text-card-foreground">{numberFormatter.format(stats.bestScore)}%</p>
              <p className="text-xs text-muted-foreground">{t('home.progressSummary.bestScoreLabel')}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-lg font-semibold text-card-foreground">{numberFormatter.format(averageScore)}%</p>
              <p className="text-xs text-muted-foreground">{t('home.progressSummary.overallAccuracy')}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('home.weakAreas.title')}</p>
          {weakTopics.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t('home.weakAreas.none')}</p>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                {weakTopics.map((topic) => (
                  <span key={topic.category} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                    {t(`quiz.categories.${topic.category}`)}
                  </span>
                ))}
              </div>
              <button
                onClick={() => navigate(weakTopicsRoute)}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
              >
                {t('home.weakAreas.cta')}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
