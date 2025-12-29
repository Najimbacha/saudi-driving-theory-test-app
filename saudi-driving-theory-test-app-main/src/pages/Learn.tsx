import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, BookOpen, FileText } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import rulesData from '@/data/rules.json';
import { ksaSigns, AppSign } from '@/data/ksaSigns';
import { getLicenseGuide } from '@/data/licenseGuide';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import SignIcon from '@/components/signs/SignIcon';
import SignDetailModal from '@/components/SignDetailModal';

export default function Learn() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { language } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedRule, setExpandedRule] = useState<string | undefined>(() => searchParams.get('rule') ?? undefined);
  const [studyPlan, setStudyPlan] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('studyPlan');
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedSign, setSelectedSign] = useState<AppSign | null>(null);

  const studyPlanItems = [
    'reviewSigns',
    'readSafety',
    'practiceMarkings',
    'practiceTest',
  ] as const;

  const toggleStudyPlan = (item: string) => {
    setStudyPlan(prev => {
      const next = { ...prev, [item]: !prev[item] };
      localStorage.setItem('studyPlan', JSON.stringify(next));
      return next;
    });
  };

  const guide = useMemo(() => getLicenseGuide(language), [language]);
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
  const getRuleTitle = (rule: typeof rulesData.rules[number]) =>
    rule.title[language as keyof typeof rule.title] || rule.title.en;
  const getRuleContent = (rule: typeof rulesData.rules[number]) =>
    rule.content[language as keyof typeof rule.content] || rule.content.en;
  const getShortDescription = (text: string) => {
    const sentences = text.split(/(?<=[.!?؟])\s+/).filter(Boolean);
    if (sentences.length <= 1) return text;
    const keep = new Set<number>();
    keep.add(0);
    sentences.forEach((sentence, idx) => {
      if (/[0-9٠-٩]/.test(sentence) || /km\/h/i.test(sentence)) {
        keep.add(idx);
      }
      if (/unless otherwise posted/i.test(sentence)) {
        keep.add(idx);
      }
    });
    return Array.from(keep)
      .sort((a, b) => a - b)
      .map((idx) => sentences[idx])
      .join(' ');
  };
  const getFirstSentence = (text: string) => {
    const sentence = text.split(/(?<=[.!?؟])\s+/).filter(Boolean)[0] || text;
    return sentence.length > 140 ? `${sentence.slice(0, 137).trim()}...` : sentence;
  };
  const getKeyFact = (rule: typeof rulesData.rules[number]) => {
    const title = getRuleTitle(rule);
    const content = getRuleContent(rule);
    const extractText = `${content} ${rule.content.en || ''}`;
    const speedMatch = extractText.match(/([0-9]+)\s*km\/h/i);
    if (speedMatch) {
      const speedValue = Number.parseInt(speedMatch[1], 10);
      return {
        type: 'speed',
        label: t('learn.keyFact.speedLimit'),
        value: `${numberFormatter.format(speedValue)} km/h`,
      };
    }

    const pointsFromField = Array.isArray(rule.relatedViolationIds)
      ? rule.relatedViolationIds.find((violation) => typeof violation.points === 'number')?.points
      : undefined;
    const pointsMatch = extractText.match(/([0-9]+)\s*points?/i);
    const pointsValue = typeof pointsFromField === 'number'
      ? pointsFromField
      : pointsMatch
      ? Number.parseInt(pointsMatch[1], 10)
      : undefined;
    if (typeof pointsValue === 'number' && !Number.isNaN(pointsValue)) {
      return { type: 'points', label: t('learn.keyFact.points'), value: numberFormatter.format(pointsValue) };
    }

    const priorityMatch =
      rule.category === 'rightOfWay' ||
      /priority|right of way|roundabout|intersection/i.test(rule.title.en || '') ||
      /priority|right of way|roundabout|intersection/i.test(title);
    if (priorityMatch) {
      return { type: 'priority', label: t('learn.keyFact.priorityRule') };
    }

    const prohibitedMatch =
      /\bno\b|prohibit|forbid/i.test(rule.title.en || '') ||
      /\bno\b|prohibit|forbid/i.test(title);
    if (prohibitedMatch) {
      return { type: 'ruleType', label: t('learn.keyFact.ruleType'), value: t('learn.keyFact.prohibited') };
    }

    const requiredMatch =
      /must|required/i.test(rule.title.en || '') ||
      /must|required/i.test(title);
    if (requiredMatch) {
      return { type: 'ruleType', label: t('learn.keyFact.ruleType'), value: t('learn.keyFact.required') };
    }

    return { type: 'fallback', label: t('learn.keyFact.keyRuleInside') };
  };
  const formatKeyFact = (fact: { label: string; value?: string }) =>
    fact.value ? `${fact.label}: ${fact.value}` : fact.label;

  const handleLessonChange = (value: string) => {
    if (!value) {
      setExpandedRule(undefined);
      return;
    }
    setExpandedRule(value);
    localStorage.setItem('lastLearnLessonId', value);
  };

  const numberFormatter = new Intl.NumberFormat(i18n.language);
  const signById = useMemo(() => new Map(ksaSigns.map((sign) => [sign.id, sign])), []);
  const focusRuleId = searchParams.get('rule');
  const focusStateRuleId = (location.state as { focusRuleId?: string } | null)?.focusRuleId;
  const focusedRule = useMemo(() => {
    const id = focusRuleId || focusStateRuleId;
    return id ? rulesData.rules.find((rule) => rule.id === id) : null;
  }, [focusRuleId, focusStateRuleId]);
  const previousRule = useMemo(() => {
    if (!focusedRule) return null;
    const index = rulesData.rules.findIndex((rule) => rule.id === focusedRule.id);
    if (index <= 0) return null;
    return rulesData.rules[index - 1] ?? null;
  }, [focusedRule]);
  const nextRule = useMemo(() => {
    if (!focusedRule) return null;
    const index = rulesData.rules.findIndex((rule) => rule.id === focusedRule.id);
    if (index < 0) return null;
    return rulesData.rules[index + 1] ?? null;
  }, [focusedRule]);
  const relatedRules = useMemo(() => {
    if (!focusedRule) return [];
    return rulesData.rules
      .filter((rule) => rule.category === focusedRule.category && rule.id !== focusedRule.id)
      .slice(0, 3);
  }, [focusedRule]);

  useEffect(() => {
    if (!focusedRule) return;
    setSelectedCategory(focusedRule.category);
    setExpandedRule(focusedRule.id);
  }, [focusedRule]);

  if (focusedRule) {
    const title = getRuleTitle(focusedRule);
    const content = getRuleContent(focusedRule);
    const keyFact = getKeyFact(focusedRule);
    const hasSigns = Array.isArray(focusedRule.relatedSignIds) && focusedRule.relatedSignIds.length > 0;
    const hasViolations = Array.isArray(focusedRule.relatedViolationIds) && focusedRule.relatedViolationIds.length > 0;
    const violations = hasViolations ? focusedRule.relatedViolationIds.slice(0, 5) : [];
    const sentences = getRuleContent(focusedRule)
      .split(/(?<=[.!?؟])\s+/)
      .filter(Boolean);
    const heroSentence = sentences[0] || getRuleContent(focusedRule);
    const examSign = hasSigns ? signById.get(focusedRule.relatedSignIds[0]) : null;
    const violationDetails = violations[0]
      ? (() => {
          const pointsValue = violations[0].points;
          const severityLabel =
            typeof pointsValue === 'number'
              ? pointsValue >= 6
                ? t('learn.severity.serious')
                : pointsValue >= 3
                ? t('learn.severity.moderate')
                : t('learn.severity.minor')
              : '';
          return {
            pointsValue: numberFormatter.format(pointsValue),
            severityLabel,
          };
        })()
      : null;

    return (
      <div className="min-h-screen bg-background pb-20" dir={language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'}>
        <header className="p-4 flex items-center gap-3 border-b bg-gradient-to-b from-background to-transparent">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 rtl-flip" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-card-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">{getCategoryTitle(focusedRule.category)}</p>
          </div>
        </header>

        <main className="p-6 space-y-9 max-w-xl mx-auto">
          <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background px-6 py-8 text-center shadow-sm">
            <p className="text-xl font-semibold text-card-foreground leading-relaxed">
              {heroSentence}
            </p>
          </section>

          {examSign && (
            <section className="space-y-4">
              <p className="text-sm font-semibold text-card-foreground">{t('learn.lessonExamSituation')}</p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedSign(examSign)}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-muted/60 border border-border/60 px-5 py-4 shadow-sm hover:bg-muted/70 active:scale-[0.98] transition"
                  aria-label={examSign.title[language as keyof typeof examSign.title] || examSign.title.en}
                >
                  <SignIcon
                    id={examSign.id}
                    icon={examSign.icon}
                    size={56}
                    svg={examSign.svg}
                    alt={examSign.title[language as keyof typeof examSign.title] || examSign.title.en}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {t(`signs.categories.${examSign.category}`)}
                  </span>
                </button>
              </div>
            </section>
          )}

          {violationDetails && (
            <section className="space-y-4">
              <p className="text-sm font-semibold text-card-foreground">{t('learn.lessonPenaltyTitle')}</p>
              <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background px-6 py-6 text-center shadow-sm">
                <p className="text-6xl font-semibold text-primary">
                  {violationDetails.pointsValue}
                </p>
                <p className="mt-2 text-lg font-semibold text-card-foreground">
                  {t('learn.lessonPenaltyPoints')}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{t('learn.lessonPenaltyRecord')}</p>
              </div>
            </section>
          )}

          <div className="pt-6 flex flex-wrap gap-3">
            {previousRule ? (
              <button
                onClick={() => navigate(`/learn?rule=${previousRule.id}`)}
                className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition"
              >
                {t('learn.lessonPrevRule')}
              </button>
            ) : (
              <button
                onClick={() => navigate('/learn')}
                className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition"
              >
                {t('learn.lessonBackToList')}
              </button>
            )}
            <button
              onClick={() => {
                if (nextRule) {
                  navigate(`/learn?rule=${nextRule.id}`);
                  return;
                }
                navigate('/learn');
              }}
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition"
            >
              {t('learn.lessonNextRule')}
            </button>
          </div>
        </main>

        {selectedSign && (
          <SignDetailModal
            sign={selectedSign}
            isOpen={!!selectedSign}
            onClose={() => setSelectedSign(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-hero text-primary-foreground dark:text-foreground p-4 pb-6 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-full bg-primary-foreground/10">
            <ArrowLeft className="w-5 h-5 rtl-flip" />
          </button>
          <h1 className="text-xl font-bold">{t('learn.title')}</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground dark:text-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('signs.search')}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-primary-foreground/10 placeholder:text-primary-foreground dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </header>

      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl p-4 shadow-md border border-border mb-4"
        >
          <div className="flex items-start justify-between gap-4 rtl-row">
            <div className="flex items-start gap-3 rtl-row">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">{guide.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{guide.homeSubtitle}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/license-guide')}
              className="self-start px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition whitespace-normal text-center"
            >
              {guide.cta}
            </button>
          </div>
        </motion.div>
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
              {t('learn.noResults')}
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              className="space-y-3"
              value={expandedRule}
              onValueChange={handleLessonChange}
            >
              {filteredRules.map((rule, i) => {
                const showHeader = i === 0 || filteredRules[i - 1].category !== rule.category;
                const title = getRuleTitle(rule);
                const content = getRuleContent(rule);
                const keyFact = getKeyFact(rule);
                const keyFactText = formatKeyFact(keyFact);
                const hasViolations = Array.isArray(rule.relatedViolationIds) && rule.relatedViolationIds.length > 0;
                const pointsValue = hasViolations
                  ? rule.relatedViolationIds.find((violation) => typeof violation.points === 'number')?.points
                  : undefined;
                const severityLabel =
                  typeof pointsValue === 'number'
                    ? pointsValue >= 6
                      ? t('learn.severity.serious')
                      : pointsValue >= 3
                      ? t('learn.severity.moderate')
                      : t('learn.severity.minor')
                    : null;
                const headlineValue = keyFact.type === 'speed' && keyFact.value ? keyFact.value : null;

                return (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    {showHeader && (
                      <div className="px-2 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {getCategoryTitle(rule.category)}
                      </div>
                    )}
                    <AccordionItem value={rule.id} className="bg-card rounded-xl shadow-md border-0 overflow-hidden">
                      <AccordionTrigger className="px-4 py-4 hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                            {rule.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-card-foreground">
                              {title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {getCategoryTitle(rule.category)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {keyFactText}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="bg-muted/50 rounded-lg p-4 text-sm text-card-foreground leading-relaxed space-y-2">
                          {headlineValue && (
                            <p className="text-2xl font-semibold text-card-foreground">
                              {headlineValue}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-card-foreground">
                            {title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getShortDescription(content)}
                          </p>
                        </div>
                      {Array.isArray(rule.relatedSignIds) && rule.relatedSignIds.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-sm font-semibold text-card-foreground">
                              {t('learn.examSignToRecognize')}
                            </h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/signs?ids=${rule.relatedSignIds.join(',')}`)}
                            >
                              {t('learn.viewSimilarSigns')}
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {rule.relatedSignIds
                              .map((id: string) => signById.get(id))
                              .filter((sign): sign is AppSign => Boolean(sign))
                              .slice(0, 4)
                              .map((sign) => (
                                <button
                                  key={sign.id}
                                  type="button"
                                  onClick={() => setSelectedSign(sign)}
                                  className="bg-card rounded-xl p-3 shadow-sm border border-border text-left hover:shadow-md transition"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                      <SignIcon
                                        id={sign.id}
                                        icon={sign.icon}
                                        size={36}
                                        svg={sign.svg}
                                        alt={sign.title[language as keyof typeof sign.title] || sign.title.en}
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-card-foreground">
                                      {sign.title[language as keyof typeof sign.title] || sign.title.en}
                                    </span>
                                  </div>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                      {hasViolations && typeof pointsValue === 'number' && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-sm font-semibold text-card-foreground">
                              {t('learn.relatedViolationsTitle')}
                            </h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/violation-points')}
                            >
                              {t('learn.viewViolationSystem')}
                            </Button>
                          </div>
                          {severityLabel && (
                            <p className="text-sm text-muted-foreground">
                              {numberFormatter.format(pointsValue)} {t('learn.keyFact.points')} • {severityLabel}
                            </p>
                          )}
                          <div className="space-y-3">
                            {rule.relatedViolationIds.slice(0, 3).map((violation: { id: string; points: number }) => {
                              const key = `violations.${violation.id}`;
                              return (
                                <button
                                  key={violation.id}
                                  type="button"
                                  onClick={() => navigate(`/violation-points?focus=${violation.id}`)}
                                  className="w-full text-left bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-md transition"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-semibold text-card-foreground">
                                      {t(key)}
                                    </span>
                                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                                      {t('violationPoints.pointsLabel', { value: numberFormatter.format(violation.points) })}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    {t('violationPoints.previewDescription', { violation: t(key) })}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              );
            })}
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
              <p className="font-semibold text-foreground">
                {t('learn.lessonsCount', { count: rulesData.rules.length, value: numberFormatter.format(rulesData.rules.length) })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('learn.categoriesCount', { count: rulesData.categories.length, value: numberFormatter.format(rulesData.categories.length) })}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 bg-card rounded-xl p-4">
          <h3 className="font-semibold text-card-foreground mb-3">{t('learn.studyPlan.title')}</h3>
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
                  {t(`learn.studyPlan.items.${item}`)}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <SignDetailModal
        sign={selectedSign}
        isOpen={!!selectedSign}
        onClose={() => setSelectedSign(null)}
      />
    </div>
  );
}
