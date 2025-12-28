import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineIndicator() {
  const { t } = useTranslation();
  const { isOnline } = usePWA();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2"
        >
          <WifiOff className="w-4 h-4" />
          {t('pwa.offline')}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
