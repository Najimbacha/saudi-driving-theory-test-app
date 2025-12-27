import rawSigns from './ksa_signs.json';

type Category = 'warning' | 'regulatory' | 'mandatory' | 'guide';

type RawSign = {
  id: string;
  name_en: string;
  name_ar: string;
  name_ur: string;
  name_hi: string;
  name_bn: string;
  category: Category;
  svg: string;
};

export type AppSign = {
  id: string;
  category: Category;
  title: Record<string, string>;
  meaning: Record<string, string>;
  svg: string;
  icon: string;
  shape: string;
  color: string;
  tip?: Record<string, string>;
};

const buildAppSigns = (): AppSign[] => {
  const seenIds = new Set<string>();
  const invalidIds: string[] = [];
  const invalidSvgPaths: string[] = [];

  const results = (rawSigns as RawSign[]).flatMap((sign) => {
    if (!sign.svg.startsWith('/ksa-signs/') || !sign.svg.toLowerCase().endsWith('.svg')) {
      invalidSvgPaths.push(sign.svg);
      return [];
    }
    if (seenIds.has(sign.id)) {
      invalidIds.push(sign.id);
      return [];
    }
    seenIds.add(sign.id);

    const title = {
      en: sign.name_en,
      ar: sign.name_ar || sign.name_en,
      ur: sign.name_ur || sign.name_en,
      hi: sign.name_hi || sign.name_en,
      bn: sign.name_bn || sign.name_en,
    };

    return [{
      id: sign.id,
      category: sign.category,
      title,
      meaning: { ...title },
      svg: sign.svg,
      icon: '🚧',
      shape: 'svg',
      color: 'default',
    }];
  });

  if (import.meta.env.DEV && (invalidIds.length > 0 || invalidSvgPaths.length > 0)) {
    throw new Error(
      `Invalid KSA sign data: duplicate ids=${invalidIds.length}, invalid svg paths=${invalidSvgPaths.length}`
    );
  }

  return results;
};

export const ksaSigns: AppSign[] = buildAppSigns();
