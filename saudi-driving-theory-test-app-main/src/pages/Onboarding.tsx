import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { languages } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Check, Wifi, WifiOff } from 'lucide-react';

export default function Onboarding() {
  const { t } = useTranslation();
  const { setLanguage, setHasSeenOnboarding, language } = useApp();
  const [step, setStep] = useState(0);

  const handleComplete = () => setHasSeenOnboarding(true);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-6 text-primary-foreground dark:text-foreground">
      {step === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md w-full">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="w-24 h-24 bg-accent rounded-2xl mx-auto mb-8 flex items-center justify-center text-4xl shadow-gold">
            🚗
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">{t('onboarding.welcome')}</h1>
          <p className="text-lg text-primary-foreground dark:text-foreground mb-8">{t('onboarding.selectLanguage')}</p>
          <div className="space-y-3 mb-8">
            {languages.map((lang, i) => (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => setLanguage(lang.code)}
                className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${language === lang.code ? 'bg-accent text-accent-foreground shadow-gold' : 'bg-primary-foreground/10 hover:bg-primary-foreground/20'}`}
              >
                <span className="font-medium">{lang.nativeName}</span>
                {language === lang.code && <Check className="w-5 h-5" />}
              </motion.button>
            ))}
          </div>
          <p className="text-sm text-primary-foreground dark:text-foreground mb-6">{t('onboarding.languageNote')}</p>
          <Button onClick={() => setStep(1)} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {t('common.confirm')}
          </Button>
        </motion.div>
      )}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md w-full">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-success rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg">
            <WifiOff className="w-12 h-12 text-success-foreground" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-4">{t('onboarding.offlineReady')}</h2>
          <p className="text-lg text-primary-foreground dark:text-foreground mb-8">{t('onboarding.offlineDesc')}</p>
          <div className="flex items-center justify-center gap-4 mb-8 p-4 bg-primary-foreground/10 rounded-xl">
            <Wifi className="w-6 h-6 opacity-50" />
            <span className="text-2xl">→</span>
            <WifiOff className="w-6 h-6" />
            <Check className="w-6 h-6 text-success" />
          </div>
          <Button onClick={handleComplete} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {t('onboarding.getStarted')}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
