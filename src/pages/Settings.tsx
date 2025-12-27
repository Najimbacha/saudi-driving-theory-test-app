import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Sun, Moon, Monitor, Volume2, VolumeX, Vibrate, Info, BookOpen, FileText } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { languages } from '@/i18n';
import { Switch } from '@/components/ui/switch';

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language, setLanguage, theme, setTheme, soundEnabled, setSoundEnabled, vibrationEnabled, setVibrationEnabled } = useApp();

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 flex items-center gap-3 border-b">
        <button onClick={() => navigate('/')} className="p-2 rounded-full bg-muted"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">{t('settings.title')}</h1>
      </header>

      <main className="p-4 space-y-6">
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><Globe className="w-4 h-4" />{t('settings.language')}</h2>
          <div className="bg-card rounded-xl overflow-hidden">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`w-full p-4 flex items-center justify-between border-b last:border-0 ${language === lang.code ? 'bg-primary/5' : ''}`}
              >
                <span>{lang.nativeName}</span>
                {language === lang.code && <div className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">{t('settings.theme')}</h2>
          <div className="grid grid-cols-3 gap-3">
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
                <span className="text-sm">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">{t('settings.feedback', 'Feedback')}</h2>
          <div className="bg-card rounded-xl overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
                <div>
                  <p className="font-medium">{t('settings.sound', 'Sound Effects')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.soundDesc', 'Play sounds for correct/incorrect answers')}</p>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Vibrate className={`w-5 h-5 ${vibrationEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium">{t('settings.vibration', 'Vibration')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.vibrationDesc', 'Haptic feedback on answers')}</p>
                </div>
              </div>
              <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
            </div>
          </div>
        </section>

        <section className="bg-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">{t('settings.version')} 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-2">Educational app for learning driving theory. All content works offline.</p>
          <p className="text-xs text-muted-foreground mt-3">
            Disclaimer: This app is not affiliated with any government entity and is intended for educational practice only.
          </p>
        </section>

        <section>
          <div className="bg-card rounded-xl overflow-hidden">
            <button
              onClick={() => navigate('/traffic-fines')}
              className="w-full p-4 flex items-center justify-between border-b"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Traffic Fines & Penalties</p>
                  <p className="text-sm text-muted-foreground">Educational guide</p>
                </div>
              </div>
              <span className="text-muted-foreground">›</span>
            </button>
            <button
              onClick={() => navigate('/violation-points')}
              className="w-full p-4 flex items-center justify-between border-b"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Traffic Violation Points</p>
                  <p className="text-sm text-muted-foreground">Educational reference</p>
                </div>
              </div>
              <span className="text-muted-foreground">›</span>
            </button>
            <button
              onClick={() => navigate('/credits')}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Credits & Attribution</p>
                  <p className="text-sm text-muted-foreground">Content sources and licenses</p>
                </div>
              </div>
              <span className="text-muted-foreground">›</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
