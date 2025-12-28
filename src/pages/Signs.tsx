import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Heart, Layers } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ksaSigns, AppSign } from '@/data/ksaSigns';
import SignIcon from '@/components/signs/SignIcon';
import SignDetailModal from '@/components/SignDetailModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSignMasteryMap, SignMasteryLevel } from '@/lib/signMastery';

const categories = ['all', 'warning', 'regulatory', 'mandatory', 'guide'] as const;
const pageSize = 48;
const priorityNames = [
  'Stop',
  'Give Way (Yield)',
  'No Entry',
  'Speed Limit',
  'No Parking',
  'No Stopping',
  'No U-Turn',
  'No Left Turn',
  'No Right Turn',
  'One Way',
  'Roundabout Mandatory',
  'Keep Right',
  'Keep Left',
  'Overtaking Prohibited',
  'End of Speed Limit',
  'Slippery Road',
  'Speed Bump Ahead',
  'Pedestrian Crossing',
  'Road Narrows',
  'Curve to Left',
  'Curve to Right',
  'Double Curve',
  'Steep Descent',
  'Steep Ascent',
  'School Zone',
  'Children Crossing',
  'Animals Crossing (Camels)',
  'Falling Rocks',
  'Traffic Signal Ahead',
  'Railway Crossing (Without Barrier)',
  'Parking Area',
  'Hospital',
  'Fuel Station',
  'Mosque',
  'Bus Stop',
  'Rest Area',
  'Emergency Phone',
  'U-Turn Allowed',
  'First Aid',
  'Airport Direction',
  'Roundabout Ahead',
  'Priority Road',
  'End of Priority Road',
  'Police Checkpoint',
  'Customs / Inspection',
  'End of All Restrictions',
  'Lane Merge',
  'Two-Way Traffic',
  'Narrow Bridge',
  'Dead End (End of Road)',
];

const normalizePriorityTerm = (value: string) =>
  value
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const cleanPriorityTitle = (value: string) => {
  let result = value.toLowerCase();
  const prefixes = [
    /^saudi arabia road sign\s*-\s*/i,
    /^sa road sign\s*-\s*/i,
    /^saudi arabia\s*-\s*/i,
    /^road sign\s*-\s*/i,
    /^saudi arabia road sign\s+/i,
    /^sa road sign\s+/i,
    /^saudi arabia\s+/i,
    /^road sign\s+/i,
    /^ksa\s+/i,
    /^saudi\s+/i,
    /^sa\s+/i,
  ];
  prefixes.forEach((pattern) => {
    result = result.replace(pattern, '').trim();
  });
  return result.replace(/[^a-z0-9]+/g, ' ').trim();
};

const priorityLookup = priorityNames.map(normalizePriorityTerm);
const priorityIndex = new Map(priorityLookup.map((name, index) => [name, index]));
const prefixMatchTerms = ['speed limit', 'end of speed limit'];
const priorityAliases: Record<string, string[]> = {
  [normalizePriorityTerm('Give Way (Yield)')]: ['give way', 'yield'],
  [normalizePriorityTerm('Roundabout Mandatory')]: ['mandatory roundabout', 'roundabout mandatory'],
  [normalizePriorityTerm('No U-Turn')]: ['no u turn', 'no u-turn', 'no uturn'],
  [normalizePriorityTerm('U-Turn Allowed')]: ['u turn allowed', 'u-turn allowed', 'u turn'],
  [normalizePriorityTerm('Traffic Signal Ahead')]: ['traffic signal ahead', 'traffic light ahead'],
  [normalizePriorityTerm('Railway Crossing (Without Barrier)')]: ['railway crossing without barrier', 'railway crossing'],
  [normalizePriorityTerm('Animals Crossing (Camels)')]: ['camel crossing', 'camels crossing', 'animals crossing camels'],
};
const aliasIndex = new Map<string, number>();

Object.entries(priorityAliases).forEach(([key, aliases]) => {
  const index = priorityIndex.get(key);
  if (index === undefined) return;
  aliases.forEach((alias) => {
    aliasIndex.set(normalizePriorityTerm(alias), index);
  });
});

const getPriorityIndexForTitle = (title: string) => {
  const normalized = cleanPriorityTitle(title);
  const direct =
    priorityIndex.get(normalized) ?? aliasIndex.get(normalized);
  if (direct !== undefined) return direct;

  for (const term of prefixMatchTerms) {
    if (normalized.startsWith(`${term} `)) {
      return priorityIndex.get(term);
    }
  }

  return undefined;
};

export default function Signs() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, favorites, toggleFavorite } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<typeof categories[number]>('all');
  const [selectedSign, setSelectedSign] = useState<AppSign | null>(null);
  const [page, setPage] = useState(1);
  const relatedIds = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get('ids');
    if (!raw) return null;
    const ids = raw.split(',').map((value) => value.trim()).filter(Boolean);
    return ids.length ? new Set(ids) : null;
  }, [location.search]);

  const masteryMap = useMemo(() => {
    return getSignMasteryMap(ksaSigns.map((sign) => sign.id));
  }, []);

  const getMasteryLabel = (level: SignMasteryLevel) => {
    switch (level) {
      case 'mastered':
        return t('signs.mastery.mastered');
      case 'reviewing':
        return t('signs.mastery.reviewing');
      case 'learning':
        return t('signs.mastery.learning');
      default:
        return t('signs.mastery.new');
    }
  };

  const getMasteryBadgeClass = (level: SignMasteryLevel) => {
    switch (level) {
      case 'mastered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'reviewing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'learning':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const signs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return ksaSigns
      .filter((sign) => {
        const matchesRelated = !relatedIds || relatedIds.has(sign.id);
        const matchesCategory = category === 'all' || sign.category === category;
        const searchValue =
          sign.title[language as keyof typeof sign.title] || sign.title.en;
        const matchesSearch = !query || searchValue.toLowerCase().includes(query);
        return matchesRelated && matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const titleA = a.title.en;
        const titleB = b.title.en;
        const priA = getPriorityIndexForTitle(titleA);
        const priB = getPriorityIndexForTitle(titleB);

        if (priA !== undefined || priB !== undefined) {
          if (priA === undefined) return 1;
          if (priB === undefined) return -1;
          if (priA !== priB) return priA - priB;
        }

        return titleA.localeCompare(titleB);
      });
  }, [category, search, language, relatedIds]);

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  useEffect(() => {
    if (relatedIds) {
      setCategory('all');
      setSearch('');
      setPage(1);
    }
  }, [relatedIds]);

  const pageCount = Math.max(1, Math.ceil(signs.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = signs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const showingFrom = signs.length ? (currentPage - 1) * pageSize + 1 : 0;
  const showingTo = signs.length ? Math.min(signs.length, currentPage * pageSize) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-hero text-primary-foreground p-4 pb-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-full bg-primary-foreground/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{t('signs.title')}</h1>
          </div>
          <Button
            onClick={() => navigate('/flashcards')}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            <Layers className="w-4 h-4" />
            {t('signs.flashcards')}
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('signs.search')}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-primary-foreground/10 placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </header>

      <div className="p-4 pb-24">
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${category === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {t(`signs.categories.${cat}`)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground mt-2">
          <div>
            {t('signs.showing', { from: showingFrom, to: showingTo, total: signs.length })}
          </div>
          <div className="flex items-center gap-2">
            {category !== 'all' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/flashcards?category=${category}`)}
              >
                {t('signs.practiceCategory')}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t('common.previous')}
            </Button>
            <span className="min-w-[90px] text-center">
              {t('signs.page', { current: currentPage, total: pageCount })}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {visible.map((sign, i) => (
            <motion.div
              key={sign.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedSign(sign)}
              className="relative bg-card rounded-xl p-4 shadow-md flex flex-col items-center gap-3 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]"
            >
              <Badge
                variant="outline"
                className={`absolute left-2 top-2 text-[10px] ${getMasteryBadgeClass(masteryMap.get(sign.id) ?? 'new')}`}
              >
                {getMasteryLabel(masteryMap.get(sign.id) ?? 'new')}
              </Badge>
              <SignIcon
                id={sign.id}
                icon={sign.icon}
                size={64}
                svg={sign.svg}
              />
              <div className="text-center w-full">
                <h3 className="font-medium text-sm text-card-foreground">
                  {sign.title[language as keyof typeof sign.title] || sign.title.en}
                </h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite('signs', sign.id);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm"
              >
                <Heart className={`w-4 h-4 ${favorites.signs.includes(sign.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
              </button>
            </motion.div>
          ))}
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
