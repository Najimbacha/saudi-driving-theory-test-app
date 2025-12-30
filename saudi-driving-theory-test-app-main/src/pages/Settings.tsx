import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Globe, Sun, Moon, Monitor, Volume2, VolumeX, Vibrate, Info, FileText } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { languages } from '@/i18n';
import { Switch } from '@/components/ui/switch';

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language, setLanguage, theme, setTheme, soundEnabled, setSoundEnabled, vibrationEnabled, setVibrationEnabled } = useApp();

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 flex items-center gap-3 border-b safe-top">
        <button onClick={() => navigate('/')} className="p-2 rounded-full bg-muted"><ArrowLeft className="w-5 h-5 rtl-flip" /></button>
        <h1 className="text-xl font-bold">{t('settings.title')}</h1>
      </header>

      <main className="p-4 space-y-6 safe-bottom">
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><Globe className="w-4 h-4" />{t('settings.language')}</h2>
          <div className="bg-card rounded-xl overflow-hidden">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`w-full p-4 flex items-center justify-between gap-3 border-b last:border-0 ${language === lang.code ? 'bg-primary/5' : ''}`}
              >
                <span className="text-left break-words min-w-0">{lang.nativeName}</span>
                {language === lang.code && <div className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">{t('settings.theme')}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { value: 'light' as const, icon: Sun, label: t('settings.themes.light') },
              { value: 'dark' as const, icon: Moon, label: t('settings.themes.dark') },
              { value: 'system' as const, icon: Monitor, label: t('settings.themes.system') },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`p-4 rounded-xl flex flex-col items-center gap-2 transition ${theme === opt.value ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
              >
                <opt.icon className="w-5 h-5" />
                <span className="text-sm text-center break-words">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">{t('settings.feedback')}</h2>
          <div className="bg-card rounded-xl overflow-hidden">
            <div className="p-4 flex items-center justify-between gap-3 border-b">
              <div className="flex items-center gap-3 min-w-0">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
                <div className="min-w-0">
                  <p className="font-medium">{t('settings.sound')}</p>
                  <p className="text-sm text-muted-foreground break-words">{t('settings.soundDesc')}</p>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Vibrate className={`w-5 h-5 ${vibrationEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="min-w-0">
                  <p className="font-medium">{t('settings.vibration')}</p>
                  <p className="text-sm text-muted-foreground break-words">{t('settings.vibrationDesc')}</p>
                </div>
              </div>
              <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
            </div>
          </div>
        </section>

        <section className="bg-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">
            {t('settings.versionLabel', { version: '1.0.0' })}
          </p>
          <p className="text-xs text-muted-foreground mt-2">{t('settings.aboutDesc')}</p>
          <p className="text-xs text-muted-foreground mt-2">{t('settings.offlineNote')}</p>
          <p className="text-xs text-muted-foreground mt-3">
            {t('settings.disclaimer')}
          </p>
        </section>

        <section>
          <div className="bg-card rounded-xl overflow-hidden">
            <button
              onClick={() => navigate('/traffic-fines')}
              className="w-full p-4 flex items-center justify-between border-b"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-primary" />
                <div className="text-left min-w-0">
                  <p className="font-medium">{t('settings.links.trafficFinesTitle')}</p>
                  <p className="text-sm text-muted-foreground break-words">{t('settings.links.trafficFinesDesc')}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground rtl-flip" />
            </button>
            <button
              onClick={() => navigate('/license-guide')}
              className="w-full p-4 flex items-center justify-between border-b"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-primary" />
                <div className="text-left min-w-0">
                  <p className="font-medium">{t('settings.links.licenseGuideTitle')}</p>
                  <p className="text-sm text-muted-foreground break-words">{t('settings.links.licenseGuideDesc')}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground rtl-flip" />
            </button>
            <button
              onClick={() => navigate('/credits')}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Info className="w-5 h-5 text-primary" />
                <div className="text-left min-w-0">
                  <p className="font-medium">{t('settings.links.creditsTitle')}</p>
                  <p className="text-sm text-muted-foreground break-words">{t('settings.links.creditsDesc')}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground rtl-flip" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
