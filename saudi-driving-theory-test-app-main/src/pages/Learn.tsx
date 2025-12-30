import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, BookOpen } from 'lucide-react';
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
  const getCoreValue = (rule: typeof rulesData.rules[number]) => {
    const coreValue = (rule as { coreValue?: Record<string, string> }).coreValue;
    return coreValue?.[language] || coreValue?.en || '';
  };
  const getCoreSummary = (rule: typeof rulesData.rules[number]) => {
    const coreSummary = (rule as { coreSummary?: Record<string, string> }).coreSummary;
    return coreSummary?.[language] || coreSummary?.en || '';
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
    const primaryViolation = hasViolations ? focusedRule.relatedViolationIds[0] : null;
    const violationName = primaryViolation ? t(`violations.${primaryViolation.id}`) : '';
    const sentences = getRuleContent(focusedRule)
      .split(/(?<=[.!?؟])\s+/)
      .filter(Boolean);
    const heroSentence = sentences[0] || getRuleContent(focusedRule);
    const examSign = hasSigns ? signById.get(focusedRule.relatedSignIds[0]) : null;
    const relatedSignItems = hasSigns
      ? focusedRule.relatedSignIds
          .map((id: string) => signById.get(id))
          .filter((sign): sign is AppSign => Boolean(sign))
          .slice(0, 3)
      : [];
    const relatedRuleIds = Array.isArray((focusedRule as { relatedRuleIds?: string[] }).relatedRuleIds)
      ? (focusedRule as { relatedRuleIds?: string[] }).relatedRuleIds
      : null;
    const relatedRuleCandidates = relatedRuleIds
      ? relatedRuleIds
          .map((id) => rulesData.rules.find((rule) => rule.id === id))
          .filter((rule): rule is typeof rulesData.rules[number] => Boolean(rule))
      : relatedRules;
    const relatedRulePreview = relatedRuleCandidates[0] ?? null;
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
    const showRelatedLearning =
      (primaryViolation && typeof primaryViolation.points === 'number') ||
      relatedSignItems.length > 0 ||
      relatedRulePreview;

    return (
      <div className="min-h-screen bg-background pb-20" dir={language === 'ar' || language === 'ur' ? 'rtl' : 'ltr'}>
        <header className="p-4 flex items-center gap-3 border-b bg-gradient-to-b from-background to-transparent safe-top">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 rtl-flip" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-card-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">{getCategoryTitle(focusedRule.category)}</p>
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-9 max-w-xl mx-auto safe-bottom">
          <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background px-6 py-8 text-center shadow-sm">
            <p className="text-xl font-semibold text-card-foreground leading-relaxed">
              {heroSentence}
            </p>
          </section>

          {examSign && (
            <section className="space-y-4">
              <p className="text-sm font-semibold text-card-foreground">{t('learn.lessonExamSituation')}</p>
              <div className="flex flex-wrap items-center gap-4">
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

          {showRelatedLearning && (
            <section className="space-y-4">
              <p className="text-sm font-semibold text-card-foreground">{t('learn.relatedLearningTitle')}</p>
              <div className="grid gap-4 md:grid-cols-3">
                {primaryViolation && typeof primaryViolation.points === 'number' && (
                  <div className="rounded-2xl border border-border bg-card shadow-sm p-5 flex flex-col gap-4 min-h-[220px]">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-card-foreground">
                        {t('learn.relatedCards.violationTitle')}
                      </p>
                      <p className="text-3xl font-semibold text-primary">
                        {t('learn.relatedCards.pointsLabel', {
                          value: numberFormatter.format(primaryViolation.points),
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('learn.relatedCards.violationLine', { violation: violationName })}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-auto w-full"
                      onClick={() => navigate(`/violation-points?focus=${primaryViolation.id}`)}
                    >
                      {t('learn.relatedCards.viewDetails')}
                    </Button>
                  </div>
                )}

                {relatedSignItems.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card shadow-sm p-5 flex flex-col gap-4 min-h-[220px]">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-card-foreground">
                        {t('learn.relatedCards.signsTitle')}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        {relatedSignItems.map((sign) => (
                          <div
                            key={sign.id}
                            className="h-16 w-16 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center"
                          >
                            <SignIcon
                              id={sign.id}
                              icon={sign.icon}
                              size={44}
                              svg={sign.svg}
                              alt={sign.title[language as keyof typeof sign.title] || sign.title.en}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-auto w-full"
                      onClick={() =>
                        navigate(`/signs?ids=${focusedRule.relatedSignIds.slice(0, 3).join(',')}`)
                      }
                    >
                      {t('learn.relatedCards.viewSigns')}
                    </Button>
                  </div>
                )}

                {relatedRulePreview && (
                  <div className="rounded-2xl border border-border bg-card shadow-sm p-5 flex flex-col gap-4 min-h-[220px]">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-card-foreground">
                        {t('learn.relatedCards.rulesTitle')}
                      </p>
                      <p className="text-sm text-card-foreground font-semibold">
                        {getRuleTitle(relatedRulePreview)}
                      </p>
                      <p className="text-sm text-muted-foreground leading-5 break-words">
                        {getFirstSentence(getRuleContent(relatedRulePreview))}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-auto w-full"
                      onClick={() => navigate(`/learn?rule=${relatedRulePreview.id}`)}
                    >
                      {t('learn.relatedCards.readRule')}
                    </Button>
                  </div>
                )}
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
      <header className="bg-gradient-hero text-primary-foreground dark:text-foreground p-4 pb-6 sticky top-0 z-10 safe-top">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-full bg-primary-foreground/10">
            <ArrowLeft className="w-5 h-5 rtl-flip" />
          </button>
          <h1 className="text-xl font-bold">{t('learn.title')}</h1>
        </div>
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground dark:text-foreground icon-inset-start" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('signs.search')}
            className="w-full input-with-icon py-3 rounded-xl bg-primary-foreground/10 placeholder:text-primary-foreground dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </header>

      <div className="p-4 safe-bottom">
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
                const violations = hasViolations ? rule.relatedViolationIds.slice(0, 2) : [];
                const headlineValue = keyFact.type === 'speed' && keyFact.value ? keyFact.value : null;
                const coreValue = getCoreValue(rule) || headlineValue || keyFact.value || keyFact.label;
                const coreSummary = getCoreSummary(rule) || getFirstSentence(content);
                const relatedSigns = Array.isArray(rule.relatedSignIds)
                  ? rule.relatedSignIds
                      .map((id: string) => signById.get(id))
                      .filter((sign): sign is AppSign => Boolean(sign))
                      .slice(0, 3)
                  : [];
                const showSigns = relatedSigns.length > 0;
                const showViolations = violations.length > 0;
                const showLearnMore = showSigns || showViolations;

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
                        <div className="flex items-center gap-3 text-left min-w-0">
                          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                            {rule.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-card-foreground break-words">
                              {title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {getCategoryTitle(rule.category)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 break-words leading-snug">
                              {keyFactText}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 space-y-4">
                          <div className="space-y-2">
                            <p className="text-3xl font-semibold text-card-foreground">{coreValue}</p>
                            <p className="text-base font-semibold text-card-foreground">{title}</p>
                            <p className="text-sm text-muted-foreground">{coreSummary}</p>
                          </div>

                          {(showSigns || showViolations || showLearnMore) && (
                            <div className="h-px bg-border/60" />
                          )}

                          {showSigns && (
                            <div className="space-y-3">
                              <p className="text-sm font-semibold text-card-foreground">
                                {t('learn.examSignToRecognize')}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {relatedSigns.map((sign) => (
                                  <button
                                    key={sign.id}
                                    type="button"
                                    onClick={() => setSelectedSign(sign)}
                                    className="bg-card rounded-xl p-3 border border-border/70 text-left rtl:text-right flex items-center gap-3 min-w-0"
                                  >
                                    <div className="h-14 w-14 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center">
                                      <SignIcon
                                        id={sign.id}
                                        icon={sign.icon}
                                        size={40}
                                        svg={sign.svg}
                                        alt={sign.title[language as keyof typeof sign.title] || sign.title.en}
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-card-foreground break-words min-w-0">
                                      {sign.title[language as keyof typeof sign.title] || sign.title.en}
                                    </span>
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={() => navigate(`/signs?ids=${rule.relatedSignIds.join(',')}`)}
                                className="text-sm font-semibold text-primary hover:text-primary/80 transition"
                              >
                                {t('learn.viewSimilarSignsLink')}
                              </button>
                            </div>
                          )}

                          {showSigns && showViolations && <div className="h-px bg-border/60" />}

                          {showViolations && (
                            <div className="space-y-3">
                              <p className="text-sm font-semibold text-card-foreground">
                                {t('learn.commonViolationsTitle')}
                              </p>
                              <div className="space-y-3">
                                {violations.map((violation: { id: string; points: number }) => {
                                  const key = `violations.${violation.id}`;
                                  return (
                                    <button
                                      key={violation.id}
                                      type="button"
                                      onClick={() => navigate(`/violation-points?focus=${violation.id}`)}
                                      className="w-full text-left rtl:text-right bg-card rounded-xl p-4 border border-border/70"
                                    >
                                      <div className="flex items-center justify-between gap-3 rtl-row">
                                        <span className="text-sm font-semibold text-card-foreground break-words min-w-0">
                                          {t(key)}
                                        </span>
                                        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-200">
                                          {t('learn.pointsBadge', { value: numberFormatter.format(violation.points) })}
                                        </span>
                                      </div>
                                      <p className="mt-2 text-xs text-muted-foreground">
                                        {t('violationPoints.previewDescription', { violation: t(key) })}
                                      </p>
                                    </button>
                                  );
                                })}
                              </div>
                              <button
                                onClick={() => navigate('/violation-points')}
                                className="text-sm font-semibold text-primary hover:text-primary/80 transition"
                              >
                                {t('learn.viewViolationSystemLink')}
                              </button>
                            </div>
                          )}

                          {showLearnMore && <div className="h-px bg-border/60" />}

                          {showLearnMore && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-card-foreground">
                                {t('learn.learnMoreTitle')}
                              </p>
                              <div className="space-y-1">
                                {showViolations && (
                                  <button
                                    onClick={() => navigate('/violation-points')}
                                    className="w-full text-left rtl:text-right text-sm text-muted-foreground hover:text-foreground transition"
                                  >
                                    {t('learn.viewViolationSystemLink')}
                                  </button>
                                )}
                                {showSigns && (
                                  <button
                                    onClick={() => navigate(`/signs?ids=${rule.relatedSignIds.join(',')}`)}
                                    className="w-full text-left rtl:text-right text-sm text-muted-foreground hover:text-foreground transition"
                                  >
                                    {t('learn.viewRelatedSignsLink')}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
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
