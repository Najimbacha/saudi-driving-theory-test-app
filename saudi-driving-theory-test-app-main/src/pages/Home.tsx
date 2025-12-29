import { useEffect, useMemo, useState } from 'react';
 
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Settings, Check, PlayCircle, ClipboardCheck, BookOpen, TrafficCone, Shuffle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useLearning } from '@/context/LearningContext';
import rulesData from '@/data/rules.json';
import { loadTestSession, TestSession } from '@/lib/testSession';
import { ksaSigns } from '@/data/ksaSigns';
import SignIcon from '@/components/signs/SignIcon';
import SignDetailModal from '@/components/SignDetailModal';
import { getSignMasteryMap } from '@/lib/signMastery';
import { AppSign } from '@/data/ksaSigns';

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
  const pickRandomRule = (rules: typeof rulesData.rules) => {
    if (!rules.length) return null;
    const index = Math.floor(Math.random() * rules.length);
    return rules[index] ?? null;
  };
  const [focusRule, setFocusRule] = useState(() => pickRandomRule(rulesData.rules));
  const [selectedSign, setSelectedSign] = useState<AppSign | null>(null);
  const getRuleTitle = (rule: typeof rulesData.rules[number]) =>
    rule.title[language as keyof typeof rule.title] || rule.title.en;
  const getRuleContent = (rule: typeof rulesData.rules[number]) =>
    rule.content[language as keyof typeof rule.content] || rule.content.en;
  const getCategoryTitle = (categoryId: string) => {
    const category = rulesData.categories.find((item) => item.id === categoryId);
    if (!category) return t('home.todayFocus.categoryFallback');
    return category.title[language as keyof typeof category.title] || category.title.en;
  };
  const getFocusKeyFact = (rule: typeof rulesData.rules[number]) => {
    const content = getRuleContent(rule);
    const source = `${content} ${rule.content.en || ''}`;
    const speedMatch = source.match(/([0-9]+)\s*km\/h/i);
    if (speedMatch) {
      return t('home.todayFocus.speedLimit', { value: `${speedMatch[1]} km/h` });
    }
    const pointsFromField = Array.isArray(rule.relatedViolationIds)
      ? rule.relatedViolationIds.find((violation) => typeof violation.points === 'number')?.points
      : undefined;
    const pointsMatch = source.match(/([0-9]+)\s*points?/i);
    const pointsValue = typeof pointsFromField === 'number'
      ? pointsFromField
      : pointsMatch
      ? Number.parseInt(pointsMatch[1], 10)
      : undefined;
    if (typeof pointsValue === 'number' && !Number.isNaN(pointsValue)) {
      return t('home.todayFocus.points', { value: numberFormatter.format(pointsValue) });
    }
    const sentence = content.split(/(?<=[.!?؟])\s+/).filter(Boolean)[0] || content;
    return sentence.length > 80 ? `${sentence.slice(0, 77).trim()}...` : sentence;
  };
  const getFocusFacts = (rule: typeof rulesData.rules[number]) => {
    const content = getRuleContent(rule);
    const listMatch = content.match(/:\s*(.+)/);
    if (listMatch) {
      const items = listMatch[1]
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 3);
      if (items.length) {
        return items.join(' • ');
      }
    }
    const keyFact = getFocusKeyFact(rule);
    if (keyFact) {
      return keyFact;
    }
    return getCategoryTitle(rule.category);
  };
  const pickRandomDistinctSigns = (signs: typeof ksaSigns, count = 3) => {
    if (!signs.length) return [];
    const picks: typeof ksaSigns = [];
    const used = new Set<number>();
    while (picks.length < Math.min(count, signs.length)) {
      const index = Math.floor(Math.random() * signs.length);
      if (used.has(index)) continue;
      used.add(index);
      picks.push(signs[index]);
    }
    return picks;
  };
  const [signSpotlight, setSignSpotlight] = useState<typeof ksaSigns>([]);
  const masteryMap = useMemo(() => getSignMasteryMap(ksaSigns.map((sign) => sign.id)), []);

  useEffect(() => {
    const refresh = () => setLastSession(loadTestSession());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  useEffect(() => {
    if (!ksaSigns.length) {
      setSignSpotlight([]);
      return;
    }
    const weakSigns = ksaSigns.filter((sign) => {
      const level = masteryMap.get(sign.id);
      return level === 'new' || level === 'learning';
    });
    const pool = weakSigns.length ? weakSigns : ksaSigns;
    setSignSpotlight(pickRandomDistinctSigns(pool, 3));
  }, [masteryMap]);

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
          <div className="flex items-start justify-between gap-3 rtl-row">
            <div>
              <p className="text-sm font-semibold text-card-foreground">{t('home.todayFocus.title')}</p>
            </div>
            <button
              type="button"
              onClick={() => setFocusRule(pickRandomRule(rulesData.rules))}
              className="p-2 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
              aria-label={t('home.todayFocus.shuffle')}
            >
              <Shuffle className="h-4 w-4" />
            </button>
          </div>
          {focusRule ? (
            <>
              <div className="mt-4 flex items-start gap-3 rtl-row">
                <div className="h-12 w-12 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center text-2xl">
                  {focusRule.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-card-foreground">
                    {getRuleTitle(focusRule)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getFocusFacts(focusRule)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">{t('home.todayFocus.empty')}</p>
          )}
          <button
            onClick={() => {
              if (!focusRule) {
                navigate('/learn');
                return;
              }
              navigate('/learn', { state: { focusRuleId: focusRule.id } });
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 active:scale-[0.98] transition"
          >
            {t('home.todayFocus.cta')}
          </button>
        </div>

        {signSpotlight.length > 0 && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/signs')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigate('/signs');
              }
            }}
            className="rounded-[1.75rem] p-6 shadow-md border border-primary/15 bg-gradient-to-br from-card/80 via-card to-card/60 cursor-pointer"
          >
            <p className="text-sm font-semibold text-card-foreground">{t('home.signsSpotlight.title')}</p>
            <div className="mt-5 flex items-center justify-center gap-4">
              {signSpotlight.map((sign) => (
                <button
                  key={sign.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedSign(sign);
                  }}
                  className="h-24 w-24 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center hover:bg-muted/80 active:scale-[0.98] transition"
                  aria-label={sign.title[language] || sign.title.en}
                >
                  <SignIcon
                    id={sign.id}
                    icon={sign.icon}
                    size={64}
                    svg={sign.svg}
                    alt={sign.title[language] || sign.title.en}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={(event) => {
                event.stopPropagation();
                navigate('/signs');
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 active:scale-[0.98] transition"
            >
              {t('home.signsSpotlight.cta')}
            </button>
          </div>
        )}

        <SignDetailModal
          sign={selectedSign}
          isOpen={Boolean(selectedSign)}
          onClose={() => setSelectedSign(null)}
        />
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
