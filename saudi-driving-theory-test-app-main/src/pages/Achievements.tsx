import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievements } from '@/context/AchievementsContext';
import DailyGoal from '@/components/DailyGoal';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Trophy, Star, Flame, Target, Crown, Zap, Award,
  AlertTriangle, BookOpen, ShieldCheck, GraduationCap, CalendarCheck,
  Sunrise, Moon, Brain, Book, Car, Medal, Crosshair, Rocket, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  'rocket': Rocket,
  'target': Target,
  'crown': Crown,
  'star': Star,
  'crosshair': Crosshair,
  'medal': Medal,
  'flame': Flame,
  'zap': Zap,
  'trophy': Trophy,
  'alert-triangle': AlertTriangle,
  'book-open': BookOpen,
  'shield-check': ShieldCheck,
  'graduation-cap': GraduationCap,
  'award': Award,
  'calendar-check': CalendarCheck,
  'sunrise': Sunrise,
  'moon': Moon,
  'brain': Brain,
  'book': Book,
  'car': Car,
};

const categoryColors: Record<string, string> = {
  progress: 'bg-info/20 text-info',
  accuracy: 'bg-success/20 text-success',
  streak: 'bg-warning/20 text-warning',
  mastery: 'bg-primary/20 text-primary',
  exam: 'bg-accent/20 text-accent',
  daily: 'bg-secondary/20 text-secondary-foreground',
  special: 'bg-destructive/20 text-destructive',
};

const Achievements: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const numberFormatter = new Intl.NumberFormat(i18n.language);
  const {
    achievements,
    totalXP,
    currentLevel,
    nextLevel,
    xpToNextLevel,
    unlockedAchievements,
    lockedAchievements,
  } = useAchievements();

  const [activeTab, setActiveTab] = useState('all');

  const categories = ['all', 'progress', 'accuracy', 'streak', 'mastery', 'exam', 'special'];

  const filteredUnlocked = activeTab === 'all' 
    ? unlockedAchievements 
    : unlockedAchievements.filter(a => a.category === activeTab);
  
  const filteredLocked = activeTab === 'all'
    ? lockedAchievements
    : lockedAchievements.filter(a => a.category === activeTab);

  const levelProgress = nextLevel 
    ? ((totalXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100 
    : 100;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{t('achievements.title')}</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* XP and Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-primary rounded-2xl p-6 text-primary-foreground"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-primary-foreground">{t('achievements.level')}</p>
              <h2 className="text-2xl font-bold">
                {t(`achievements.levels.${currentLevel.name}`)}
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-background/20 rounded-full px-4 py-2">
              <Star className="h-5 w-5" />
              <span className="font-bold text-lg">{numberFormatter.format(totalXP)}</span>
              <span className="text-sm text-primary-foreground">{t('common.xp')}</span>
            </div>
          </div>

          {nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('achievements.nextLevel')}: {t(`achievements.levels.${nextLevel.name}`)}</span>
                <span>{t('common.xpValue', { value: numberFormatter.format(xpToNextLevel) })}</span>
              </div>
              <Progress value={levelProgress} className="h-2 bg-background/30" />
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-background/20">
            <div className="text-center">
              <p className="text-2xl font-bold">{unlockedAchievements.length}</p>
              <p className="text-xs text-primary-foreground">{t('achievements.unlocked')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{achievements.length}</p>
              <p className="text-xs text-primary-foreground">{t('achievements.total')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
              </p>
              <p className="text-xs text-primary-foreground">{t('achievements.progress')}</p>
            </div>
          </div>
        </motion.div>

        {/* Daily Goal */}
        <DailyGoal />

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/50 p-1">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="flex-1 min-w-[80px] text-xs"
              >
                {t(`achievements.categories.${cat}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {/* Unlocked Achievements */}
            {filteredUnlocked.length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  {t('achievements.unlocked')} ({filteredUnlocked.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <AnimatePresence>
                    {filteredUnlocked.map((achievement, index) => {
                      const Icon = iconMap[achievement.icon] || Trophy;
                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-gradient-card border border-border rounded-xl p-4 card-hover"
                        >
                          <div className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                            categoryColors[achievement.category]
                          )}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <h4 className="font-semibold text-sm mb-1">
                            {t(`achievements.badges.${achievement.id}.name`)}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {t(`achievements.badges.${achievement.id}.desc`)}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-accent">
                            <Star className="h-3 w-3" />
                            <span>{t('common.xpValue', { value: `+${numberFormatter.format(achievement.points)}` })}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Locked Achievements */}
            {filteredLocked.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  {t('achievements.locked')} ({filteredLocked.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {filteredLocked.map((achievement) => {
                    const Icon = iconMap[achievement.icon] || Trophy;
                    return (
                      <div
                        key={achievement.id}
                        className="bg-muted/40 border border-border/70 rounded-xl p-4"
                      >
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3 relative">
                          <Icon className="h-6 w-6 text-muted-foreground" />
                          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                        <h4 className="font-semibold text-sm mb-1 text-muted-foreground">
                          {t(`achievements.badges.${achievement.id}.name`)}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {t(`achievements.badges.${achievement.id}.desc`)}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Star className="h-3 w-3" />
                          <span>{t('common.xpValue', { value: `+${numberFormatter.format(achievement.points)}` })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredUnlocked.length === 0 && filteredLocked.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t('achievements.empty')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Achievements;
