import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Car, BookOpen, HelpCircle, ClipboardCheck, Heart, BarChart3, Settings, Trophy, Star, ChevronRight, FileText } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAchievements } from '@/context/AchievementsContext';
import DailyGoal from '@/components/DailyGoal';
import { Progress } from '@/components/ui/progress';
import { getLicenseGuide } from '@/data/licenseGuide';

const menuItems = [
  { key: 'learnSigns', icon: Car, path: '/signs', color: 'bg-accent' },
  { key: 'learnRules', icon: BookOpen, path: '/learn', color: 'bg-info' },
  { key: 'practice', icon: HelpCircle, path: '/practice', color: 'bg-success' },
  { key: 'mockExam', icon: ClipboardCheck, path: '/exam', color: 'bg-warning' },
  { key: 'violationPoints', icon: BookOpen, path: '/violation-points', color: 'bg-primary' },
  { key: 'trafficFines', icon: BookOpen, path: '/traffic-fines', color: 'bg-secondary' },
  { key: 'favorites', icon: Heart, path: '/favorites', color: 'bg-destructive' },
  { key: 'stats', icon: BarChart3, path: '/stats', color: 'bg-secondary' },
];

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stats, language } = useApp();
  const { totalXP, currentLevel, nextLevel, unlockedAchievements } = useAchievements();
  const guide = useMemo(() => getLicenseGuide(language), [language]);

  const levelProgress = nextLevel 
    ? ((totalXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100 
    : 100;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-hero text-primary-foreground p-6 pb-12 rounded-b-3xl">
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
          <p className="text-lg font-semibold mb-1">{t('home.greeting')}</p>
          <p className="text-sm opacity-80">{t('home.subtitle')}</p>
          {stats.quizzesTaken > 0 && (
            <div className="flex gap-4 mt-3 text-sm">
              <span>🎯 {stats.bestScore}%</span>
              <span>📝 {stats.quizzesTaken} {t('stats.quizzesTaken').toLowerCase()}</span>
            </div>
          )}
        </motion.div>
      </header>

      <main className="p-4 -mt-6 space-y-4">
        {/* License Guide Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="bg-card rounded-2xl p-4 shadow-md border border-border"
        >
          <div className="flex items-start justify-between gap-4 rtl-row">
            <div className="flex items-start gap-3 rtl-row">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">{guide.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{guide.homeSubtitle}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/license-guide')}
              className="self-start px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition whitespace-normal text-center"
            >
              {guide.cta}
            </button>
          </div>
        </motion.div>
        {/* XP Progress Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/achievements')}
          className="w-full bg-card rounded-2xl p-4 shadow-md card-hover tap-highlight-none text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Trophy className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('achievements.level')}</p>
                <p className="font-semibold text-card-foreground">{t(`achievements.levels.${currentLevel.name}`)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-accent" />
                  <span className="font-bold text-card-foreground">{totalXP}</span>
                  <span className="text-xs text-muted-foreground">XP</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {unlockedAchievements.length} {t('achievements.badgesLabel')}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          {nextLevel && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t(`achievements.levels.${currentLevel.name}`)}</span>
                <span>{t(`achievements.levels.${nextLevel.name}`)}</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
            </div>
          )}
        </motion.button>

        {/* Daily Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <DailyGoal />
        </motion.div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => navigate(item.path)}
              className="bg-card rounded-2xl p-5 text-left shadow-md card-hover tap-highlight-none"
            >
              <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-card-foreground">{t(`home.${item.key}`)}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t(`home.${item.key}Desc`)}</p>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}
