import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import SignIcon from '@/components/signs/SignIcon';
import { AppSign, ksaSigns } from '@/data/ksaSigns';

interface SignDetailModalProps {
  sign: AppSign | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectSign?: (sign: AppSign) => void;
}

export const SignDetailModal: React.FC<SignDetailModalProps> = ({
  sign,
  isOpen,
  onClose,
  onSelectSign,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useApp();

  if (!sign) return null;

  const title = sign.title[language as keyof typeof sign.title] || sign.title.en;
  const meaning = sign.meaning[language as keyof typeof sign.meaning] || sign.meaning.en;
  const currentIndex = ksaSigns.findIndex((item) => item.id === sign.id);
  const previousSign = currentIndex > 0 ? ksaSigns[currentIndex - 1] : null;
  const nextSign = currentIndex >= 0 && currentIndex < ksaSigns.length - 1 ? ksaSigns[currentIndex + 1] : null;
  const isSignsPage = location.pathname === '/signs';
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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[85vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(sign.category)}`}>
                  {t(`signs.categories.${sign.category}`)}
                </span>
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition"
                >
                  <ArrowLeft className="h-4 w-4 rtl-flip" />
                  {t('common.back')}
                </button>
              </div>

              <div className="mt-6 flex justify-center">
                <motion.div
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 200, delay: 0.05 }}
                >
                  <SignIcon
                    id={sign.id}
                    icon={sign.icon}
                    svg={sign.svg}
                    size={160}
                  />
                </motion.div>
              </div>

              <div className="mt-6 text-center space-y-2">
                <h2 className="text-xl font-bold text-card-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{meaning}</p>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={onClose}
                  className="w-full rounded-full bg-primary/10 text-primary font-semibold py-2.5 hover:bg-primary/20 transition"
                >
                  {t('common.back')}
                </button>
                {isSignsPage && onSelectSign ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => previousSign && onSelectSign(previousSign)}
                      disabled={!previousSign}
                      className="flex-1 rounded-full border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/15 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t('common.previous')}
                    </button>
                    <button
                      onClick={() => nextSign && onSelectSign(nextSign)}
                      disabled={!nextSign}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t('common.next')}
                      <ChevronRight className="h-4 w-4 rtl-flip" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/signs');
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/15 transition"
                  >
                    {t('signs.title')}
                    <ChevronRight className="h-4 w-4 rtl-flip" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SignDetailModal;
