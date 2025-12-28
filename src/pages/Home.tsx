import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Car, BookOpen, HelpCircle, BookOpenCheck, Settings, Trophy, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAchievements } from '@/context/AchievementsContext';
import { useLearning } from '@/context/LearningContext';
import { Progress } from '@/components/ui/progress';
import rulesData from '@/data/rules.json';

const quickNav = [
  { key: 'signs', icon: Car, path: '/signs', color: 'bg-accent' },
  { key: 'rules', icon: BookOpenCheck, path: '/learn', color: 'bg-info' },
  { key: 'quiz', icon: HelpCircle, path: '/practice', color: 'bg-success' },
  { key: 'points', icon: BookOpen, path: '/violation-points', color: 'bg-secondary' },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { language } = useApp();
  const { totalXP, currentLevel } = useAchievements();
  const { categoryStats, streak } = useLearning();

  const lastLessonId = typeof window !== 'undefined' ? localStorage.getItem('lastLearnLessonId') : null;
  const lastLesson = rulesData.rules.find(rule => rule.id === lastLessonId) ?? rulesData.rules[0];
  const lastLessonTitle = lastLesson
    ? lastLesson.title[language as keyof typeof lastLesson.title] || lastLesson.title.en
    : t('learn.title');
  const rulesProgress = categoryStats.rules?.accuracy;
  const numberFormatter = new Intl.NumberFormat(i18n.language);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="relative overflow-hidden bg-gradient-hero text-primary-foreground p-6 pb-16 rounded-b-[2.5rem]">
        <div className="absolute -top-24 -right-10 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">{t('app.name')}</h1>
              <p className="text-sm opacity-80">{t('app.offline')}</p>
            </div>
            <button onClick={() => navigate('/settings')} className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary-foreground/10 rounded-2xl p-4">
            <p className="text-base font-semibold">{t('home.greeting')}</p>
            <p className="text-sm opacity-80">{t('home.subtitle')}</p>
          </motion.div>
        </div>
      </header>

      <main className="relative z-10 p-4 -mt-10 space-y-6">
        <section className="space-y-3">
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
                <div className={`h-12 w-12 ${item.color} rounded-2xl flex items-center justify-center shadow-md`}>
                  <item.icon className="h-6 w-6 text-white" />
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
