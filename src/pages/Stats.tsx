import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Trophy, TrendingUp, Flame, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useLearning } from '@/context/LearningContext';
import { Progress } from '@/components/ui/progress';

export default function Stats() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stats } = useApp();
  const { categoryStats, streak, totalAnswered, totalCorrect, getOverallAccuracy, getMistakeQuestions, getWeakCategories, getDueReviews } = useLearning();

  const overallAccuracy = getOverallAccuracy();
  const mistakeCount = getMistakeQuestions().length;
  const weakAreas = getWeakCategories();
  const dueReviews = getDueReviews().length;

  const hasStats = totalAnswered > 0 || stats.quizzesTaken > 0;

  const statCards = [
    { icon: BarChart3, label: t('stats.quizzesTaken'), value: stats.quizzesTaken, color: 'bg-blue-500' },
    { icon: Trophy, label: t('stats.bestScore'), value: `${stats.bestScore}%`, color: 'bg-yellow-500' },
    { icon: Target, label: t('stats.accuracy'), value: `${overallAccuracy}%`, color: 'bg-green-500' },
    { icon: Flame, label: t('stats.streak'), value: `${streak.current} ${t('stats.days')}`, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-hero text-primary-foreground p-4 pb-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-full bg-primary-foreground/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{t('stats.title')}</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {!hasStats ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('stats.noStats')}</h2>
            <p className="text-muted-foreground">{t('stats.noStatsDesc')}</p>
          </motion.div>
        ) : (
          <>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl p-4 shadow-md"
                >
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Learning Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl p-4 shadow-md"
            >
              <h3 className="font-semibold text-card-foreground mb-4">{t('practice.learningStats')}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-muted-foreground">{t('common.correct')}</span>
                  </div>
                  <span className="font-semibold text-card-foreground">{totalCorrect}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-destructive" />
                    <span className="text-muted-foreground">{t('practice.mistakeCount')}</span>
                  </div>
                  <span className="font-semibold text-card-foreground">{mistakeCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                    <span className="text-muted-foreground">{t('practice.dueReviews')}</span>
                  </div>
                  <span className="font-semibold text-card-foreground">{dueReviews}</span>
                </div>
              </div>
            </motion.div>

            {/* Category Progress */}
            {Object.keys(categoryStats).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card rounded-xl p-4 shadow-md"
              >
                <h3 className="font-semibold text-card-foreground mb-4">{t('quiz.selectCategory')}</h3>
                <div className="space-y-4">
                  {Object.entries(categoryStats).map(([category, stat]) => (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground capitalize">{t(`quiz.categories.${category}`) || category}</span>
                        <span className="text-sm font-medium text-card-foreground">{stat.accuracy}%</span>
                      </div>
                      <Progress value={stat.accuracy} className="h-2" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Weak Areas */}
            {weakAreas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-destructive/10 rounded-xl p-4"
              >
                <h3 className="font-semibold text-destructive mb-2">{t('practice.weakAreas')}</h3>
                <div className="flex flex-wrap gap-2">
                  {weakAreas.map(area => (
                    <span key={area} className="bg-destructive/20 text-destructive px-3 py-1 rounded-full text-sm capitalize">
                      {t(`quiz.categories.${area}`) || area}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
