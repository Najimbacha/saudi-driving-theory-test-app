import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

export function PWAInstallPrompt() {
  const { t } = useTranslation();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const hasDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (hasDismissed) {
      setDismissed(true);
    }

    // Show prompt after a short delay for better UX
    const timer = setTimeout(() => {
      if (isInstallable && !isInstalled && !dismissed) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, dismissed]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm"
      >
        <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">
                {t('pwa.installTitle')}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t('pwa.installDescription')}
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="text-xs"
                >
                  {t('pwa.install')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-xs"
                >
                  {t('pwa.notNow')}
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
