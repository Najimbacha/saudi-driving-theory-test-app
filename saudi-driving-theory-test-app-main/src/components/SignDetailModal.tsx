import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import SignIcon from '@/components/signs/SignIcon';
import { AppSign, ksaSigns } from '@/data/ksaSigns';
import { getSignMastery } from '@/lib/signMastery';

interface SignDetailModalProps {
  sign: AppSign | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SignDetailModal: React.FC<SignDetailModalProps> = ({
  sign,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { language, favorites, toggleFavorite } = useApp();

  if (!sign) return null;

  const title = sign.title[language as keyof typeof sign.title] || sign.title.en;
  const meaning = sign.meaning[language as keyof typeof sign.meaning] || sign.meaning.en;
  const tip = sign.tip?.[language as keyof typeof sign.tip] || sign.tip?.en;
  const isFavorite = favorites.signs.includes(sign.id);
  const mastery = getSignMastery(sign.id);
  const masteryLabel = t(`signs.mastery.${mastery}`);

  const related = ksaSigns.filter((item) => item.category === sign.category && item.id !== sign.id).slice(0, 3);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'warning': return 'bg-warning/15 text-warning';
      case 'regulatory': return 'bg-destructive/15 text-destructive';
      case 'mandatory': return 'bg-info/15 text-info';
      case 'guide': return 'bg-success/15 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 pb-4 flex justify-between items-start">
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(sign.category)}`}>
                  {t(`signs.categories.${sign.category}`)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {masteryLabel}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleFavorite('signs', sign.id)}
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Sign Display */}
            <div className="flex justify-center py-6 bg-gradient-to-b from-muted/30 to-transparent">
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
              >
                <SignIcon
                  id={sign.id}
                  icon={sign.icon}
                  svg={sign.svg}
                  size={120}
                />
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-6 pt-4 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-card-foreground">{title}</h2>
                <p className="text-muted-foreground mt-2">{meaning}</p>
              </div>

              {tip && (
                <div className="flex gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">
                      {t('signs.tip')}
                    </span>
                    <p className="text-sm text-card-foreground mt-1">{tip}</p>
                  </div>
                </div>
              )}

              {related.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    {t('signs.related')}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {related.map((item) => (
                      <div key={item.id} className="flex flex-col items-center gap-2">
                        <SignIcon id={item.id} svg={item.svg} icon={item.icon} size={48} />
                        <span className="text-[10px] text-center text-muted-foreground">
                          {item.title[language as keyof typeof item.title] || item.title.en}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SignDetailModal;
