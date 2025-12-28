import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, HelpCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ksaSigns } from '@/data/ksaSigns';
import questionsData from '@/data/questions.json';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignIcon from '@/components/signs/SignIcon';

export default function Favorites() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { language, favorites, toggleFavorite } = useApp();
  const [activeTab, setActiveTab] = useState<'questions' | 'signs'>('questions');

  const favoriteQuestions = questionsData.questions.filter(q => favorites.questions.includes(q.id));
  const favoriteSigns = ksaSigns.filter(s => favorites.signs.includes(s.id));

  const isEmpty = favorites.questions.length === 0 && favorites.signs.length === 0;

  const numberFormatter = new Intl.NumberFormat(i18n.language);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-hero text-primary-foreground dark:text-foreground p-4 pb-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-full bg-primary-foreground/10">
            <ArrowLeft className="w-5 h-5 rtl-flip" />
          </button>
          <h1 className="text-xl font-bold">{t('favorites.title')}</h1>
        </div>
      </header>

      <div className="p-4">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('favorites.empty')}</h2>
            <p className="text-muted-foreground">{t('favorites.emptyDesc')}</p>
          </motion.div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'questions' | 'signs')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="questions" className="gap-2">
                <HelpCircle className="w-4 h-4" />
                {t('favorites.questionsCount', { count: favorites.questions.length, value: numberFormatter.format(favorites.questions.length) })}
              </TabsTrigger>
              <TabsTrigger value="signs" className="gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t('favorites.signsCount', { count: favorites.signs.length, value: numberFormatter.format(favorites.signs.length) })}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-3">
              {favoriteQuestions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  {t('favorites.empty')}
                </div>
              ) : (
                favoriteQuestions.map((question, i) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl p-4 shadow-md"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                          {t(question.categoryKey)}
                        </span>
                        <p className="mt-2 font-medium text-card-foreground">
                          {t(question.questionKey)}
                        </p>
                      </div>
                      <button 
                        onClick={() => toggleFavorite('questions', question.id)}
                        className="p-2 shrink-0"
                      >
                        <Heart className="w-5 h-5 fill-destructive text-destructive" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="signs" className="space-y-3">
              {favoriteSigns.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  {t('favorites.empty')}
                </div>
              ) : (
                favoriteSigns.map((sign, i) => (
                  <motion.div
                    key={sign.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl p-4 shadow-md flex items-start gap-4"
                  >
                    <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      <SignIcon id={sign.id} icon={sign.icon} svg={sign.svg} size={56} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-card-foreground">
                        {sign.title[language as keyof typeof sign.title] || sign.title.en}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {sign.meaning[language as keyof typeof sign.meaning] || sign.meaning.en}
                      </p>
                    </div>
                    <button 
                      onClick={() => toggleFavorite('signs', sign.id)}
                      className="p-2 shrink-0"
                    >
                      <Heart className="w-5 h-5 fill-destructive text-destructive" />
                    </button>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
