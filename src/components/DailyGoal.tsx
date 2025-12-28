import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAchievements } from '@/context/AchievementsContext';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyGoalProps {
  className?: string;
}

const DailyGoal: React.FC<DailyGoalProps> = ({ className }) => {
  const { t } = useTranslation();
  const { dailyGoalProgress, dailyGoalTarget, isDailyGoalCompleted } = useAchievements();

  const progressPercent = Math.min((dailyGoalProgress / dailyGoalTarget) * 100, 100);

  return (
    <div className={cn(
      'rounded-2xl bg-card p-4 shadow-md border-t-4 border-secondary',
      isDailyGoalCompleted && 'border-success/50',
      className
    )}>
      <div className="flex items-center gap-3 mb-3">
        {isDailyGoalCompleted ? (
          <div className="p-2 rounded-xl bg-success/15">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-secondary/20">
            <Target className="h-5 w-5 text-secondary" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {isDailyGoalCompleted 
              ? t('achievements.dailyGoalComplete')
              : t('achievements.dailyGoal')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('achievements.dailyGoalDesc', { count: dailyGoalTarget })}
          </p>
        </div>
        <div className="text-right">
          <span className={cn(
            'text-lg font-bold',
            isDailyGoalCompleted ? 'text-success' : 'text-foreground'
          )}>
            {dailyGoalProgress}
          </span>
          <span className="text-muted-foreground">/{dailyGoalTarget}</span>
        </div>
      </div>
      <Progress 
        value={progressPercent} 
        className={cn(
          'h-2.5 bg-muted',
          isDailyGoalCompleted ? '[&>div]:bg-success' : '[&>div]:bg-secondary'
        )}
      />
    </div>
  );
};

export default DailyGoal;
