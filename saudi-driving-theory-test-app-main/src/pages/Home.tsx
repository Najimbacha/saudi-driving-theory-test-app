import { useMemo } from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Settings, Check, PlayCircle, ClipboardCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useLearning } from '@/context/LearningContext';

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { language, stats } = useApp();
  const { categoryStats } = useLearning();

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
  const weakTopicsRoute = weakTopics[0]?.category === 'violation_points'
    ? '/violation-points'
    : weakTopics[0]?.category === 'traffic_fines'
      ? '/traffic-fines'
      : weakTopics[0]?.category === 'signs'
        ? '/signs'
        : '/learn';

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="p-4 space-y-6 safe-top safe-bottom">
        <section className="relative overflow-hidden rounded-[2.2rem] bg-gradient-hero text-primary-foreground dark:text-foreground p-5 md:p-6 min-h-[200px] md:min-h-[230px] shadow-lg border border-primary/10">
          <div className="absolute -top-24 -right-10 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="relative z-10 flex h-full flex-col gap-4">
            <div className="flex items-start justify-between gap-4 rtl-row">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold break-words">{t('app.name')}</h1>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-primary-foreground/90 dark:text-foreground">
                  {[
                    t('home.badges.offline'),
                    t('home.badges.noLogin'),
                    t('home.badges.noInternet'),
                  ].map((label) => (
                    <span key={label} className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/10 px-3 py-1 leading-none">
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

            <div className="flex flex-wrap gap-3 rtl-row mt-auto pt-3">
              <button
                onClick={() => navigate('/practice')}
                className="flex-1 min-w-[140px] rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition flex items-center justify-center gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                {t('home.hero.startPractice')}
              </button>
              <button
                onClick={() => navigate('/exam')}
                className="flex-1 min-w-[140px] rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-primary/15 transition flex items-center justify-center gap-2"
              >
                <ClipboardCheck className="h-4 w-4" />
                {t('home.hero.startExam')}
              </button>
            </div>

          </div>
        </section>

        <section className="space-y-3">
          <p className="text-sm font-semibold text-card-foreground">{t('home.roadKnowledge.title')}</p>
          <motion.div
            className="flex justify-center gap-3 overflow-x-auto no-scrollbar rtl-row md:grid md:grid-cols-3 md:gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
            }}
          >
            <motion.button
              onClick={() => navigate('/signs')}
              className="min-w-[8rem] w-28 md:w-full min-h-24 h-auto rounded-xl border border-border bg-gradient-card shadow-sm flex flex-col items-center justify-start gap-2 text-center px-2 py-2 flex-shrink-0 active:brightness-95 active:shadow-none transition-all duration-200 hover:shadow-md"
              variants={{ hidden: { opacity: 0, y: 12, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
            >
              <div className="h-14 w-full overflow-hidden rounded-lg">
                <img
                  src="/assets/road-knowledge/warning-sign.svg"
                  alt={t('home.roadKnowledge.signs.title')}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-sm font-semibold text-card-foreground text-center leading-tight break-words">
                {t('home.roadKnowledge.signs.title')}
              </span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/violation-points')}
              className="min-w-[8rem] w-28 md:w-full min-h-24 h-auto rounded-xl border border-border bg-gradient-card shadow-sm flex flex-col items-center justify-start gap-2 text-center px-2 py-2 flex-shrink-0 active:brightness-95 active:shadow-none transition-all duration-200 hover:shadow-md"
              variants={{ hidden: { opacity: 0, y: 12, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
            >
              <div className="h-14 w-full overflow-hidden rounded-lg">
                <img
                  src="/assets/road-knowledge/violation.svg"
                  alt={t('home.roadKnowledge.points.title')}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-sm font-semibold text-card-foreground text-center leading-tight break-words">
                {t('home.roadKnowledge.points.title')}
              </span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/learn')}
              className="min-w-[8rem] w-28 md:w-full min-h-24 h-auto rounded-xl border border-border bg-gradient-card shadow-sm flex flex-col items-center justify-start gap-2 text-center px-2 py-2 flex-shrink-0 active:brightness-95 active:shadow-none transition-all duration-200 hover:shadow-md"
              variants={{ hidden: { opacity: 0, y: 12, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
            >
              <div className="h-14 w-full overflow-hidden rounded-lg">
                <img
                  src="/assets/road-knowledge/general.svg"
                  alt={t('home.roadKnowledge.rules.title')}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-sm font-semibold text-card-foreground text-center leading-tight break-words">
                {t('home.roadKnowledge.rules.title')}
              </span>
            </motion.button>
          </motion.div>
        </section>

        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('home.progressSummary.title')}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
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

      </main>
    </div>
  );
}
