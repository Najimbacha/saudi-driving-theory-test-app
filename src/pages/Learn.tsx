import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, BookOpen, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import rulesData from '@/data/rules.json';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Learn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [studyPlan, setStudyPlan] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('studyPlan');
    return saved ? JSON.parse(saved) : {};
  });

  const studyPlanItems = [
    'Review traffic signs',
    'Read safety rules',
    'Practice road markings',
    'Take a practice test',
  ];

  const toggleStudyPlan = (item: string) => {
    setStudyPlan(prev => {
      const next = { ...prev, [item]: !prev[item] };
      localStorage.setItem('studyPlan', JSON.stringify(next));
      return next;
    });
  };

  const filteredRules = useMemo(() => {
    return rulesData.rules.filter(rule => {
      const matchesCategory = !selectedCategory || rule.category === selectedCategory;
      const title = rule.title[language as keyof typeof rule.title] || rule.title.en;
      const content = rule.content[language as keyof typeof rule.content] || rule.content.en;
      const matchesSearch = !search || 
        title.toLowerCase().includes(search.toLowerCase()) ||
        content.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, search, language]);

  const getCategoryTitle = (categoryId: string) => {
    const category = rulesData.categories.find(c => c.id === categoryId);
    if (!category) return categoryId;
    return category.title[language as keyof typeof category.title] || category.title.en;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-hero text-primary-foreground p-4 pb-6 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-full bg-primary-foreground/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{t('learn.title')}</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('signs.search')}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-primary-foreground/10 placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </header>

      <div className="p-4">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {t('practice.all')}
          </button>
          {rulesData.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition flex items-center gap-1 ${selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              <span>{cat.icon}</span>
              {cat.title[language as keyof typeof cat.title] || cat.title.en}
            </button>
          ))}
        </div>

        {/* Rules List */}
        <div className="mt-4 space-y-3">
          {filteredRules.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {t('favorites.empty')}
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {filteredRules.map((rule, i) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <AccordionItem value={rule.id} className="bg-card rounded-xl shadow-md border-0 overflow-hidden">
                    <AccordionTrigger className="px-4 py-4 hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                          {rule.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-card-foreground">
                            {rule.title[language as keyof typeof rule.title] || rule.title.en}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {getCategoryTitle(rule.category)}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="bg-muted/50 rounded-lg p-4 text-sm text-card-foreground leading-relaxed">
                        {rule.content[language as keyof typeof rule.content] || rule.content.en}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          )}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-primary/10 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground">{rulesData.rules.length} {t('learn.lessons')}</p>
              <p className="text-sm text-muted-foreground">{rulesData.categories.length} {t('quiz.selectCategory').toLowerCase()}</p>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 bg-card rounded-xl p-4">
          <h3 className="font-semibold text-card-foreground mb-3">Study Plan</h3>
          <div className="space-y-2">
            {studyPlanItems.map((item) => (
              <label key={item} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={!!studyPlan[item]}
                  onChange={() => toggleStudyPlan(item)}
                  className="h-4 w-4"
                />
                <span className={studyPlan[item] ? 'line-through text-muted-foreground' : ''}>
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
