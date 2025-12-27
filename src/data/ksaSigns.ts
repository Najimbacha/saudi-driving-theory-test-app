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

const meaningTemplates: Record<Category, Record<string, string>> = {
  warning: {
    en: 'This sign warns you about {{title}}.',
    ar: 'هذه العلامة تحذّرك من {{title}}.',
    ur: 'یہ نشان آپ کو {{title}} کے بارے میں خبردار کرتا ہے۔',
    hi: 'यह संकेत आपको {{title}} के बारे में चेतावनी देता है।',
    bn: 'এই চিহ্নটি আপনাকে {{title}} সম্পর্কে সতর্ক করে।',
  },
  regulatory: {
    en: 'This sign shows a traffic rule: {{title}}.',
    ar: 'هذه العلامة تُظهر قاعدة مرورية: {{title}}.',
    ur: 'یہ نشان ٹریفک کا اصول بتاتا ہے: {{title}}۔',
    hi: 'यह संकेत एक ट्रैफिक नियम बताता है: {{title}}।',
    bn: 'এই চিহ্নটি একটি ট্রাফিক নিয়ম দেখায়: {{title}}।',
  },
  mandatory: {
    en: 'You must do this: {{title}}.',
    ar: 'يجب عليك الالتزام بهذا: {{title}}.',
    ur: 'آپ کو یہ کرنا ضروری ہے: {{title}}۔',
    hi: 'आपको यह करना जरूरी है: {{title}}।',
    bn: 'আপনাকে এটি করতে হবে: {{title}}।',
  },
  guide: {
    en: 'This sign guides you to {{title}}.',
    ar: 'هذه العلامة ترشدك إلى {{title}}.',
    ur: 'یہ نشان آپ کو {{title}} کی طرف رہنمائی کرتا ہے۔',
    hi: 'यह संकेत आपको {{title}} की दिशा बताता है।',
    bn: 'এই চিহ্নটি আপনাকে {{title}} এর দিক দেখায়।',
  },
};

const tipTemplates: Record<Category, Record<string, string>> = {
  warning: {
    en: 'Slow down and stay alert.',
    ar: 'خفف السرعة وكن منتبهاً.',
    ur: 'رفتار کم کریں اور محتاط رہیں۔',
    hi: 'गति कम करें और सतर्क रहें।',
    bn: 'গতি কমান এবং সতর্ক থাকুন।',
  },
  regulatory: {
    en: 'Follow the rule exactly.',
    ar: 'التزم بالقانون بدقة.',
    ur: 'قانون پر پوری طرح عمل کریں۔',
    hi: 'नियम का ठीक से पालन करें।',
    bn: 'নিয়মটি ঠিকভাবে মানুন।',
  },
  mandatory: {
    en: 'Do this instruction now.',
    ar: 'نفّذ هذا التوجيه الآن.',
    ur: 'اس ہدایت پر فوراً عمل کریں۔',
    hi: 'इस निर्देश का पालन करें।',
    bn: 'এই নির্দেশটি মানুন।',
  },
  guide: {
    en: 'Use this for direction and location.',
    ar: 'استخدمها لمعرفة الاتجاه والموقع.',
    ur: 'سمت اور جگہ کے لیے اسے دیکھیں۔',
    hi: 'दिशा और जगह जानने के लिए देखें।',
    bn: 'দিক ও জায়গা জানতে এটি দেখুন।',
  },
};

const buildMeaning = (category: Category, title: Record<string, string>) => {
  const templates = meaningTemplates[category];
  return {
    en: templates.en.replace('{{title}}', title.en),
    ar: templates.ar.replace('{{title}}', title.ar || title.en),
    ur: templates.ur.replace('{{title}}', title.ur || title.en),
    hi: templates.hi.replace('{{title}}', title.hi || title.en),
    bn: templates.bn.replace('{{title}}', title.bn || title.en),
  };
};

const buildTip = (category: Category) => {
  const templates = tipTemplates[category];
  return {
    en: templates.en,
    ar: templates.ar,
    ur: templates.ur,
    hi: templates.hi,
    bn: templates.bn,
  };
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
      meaning: buildMeaning(sign.category, title),
      svg: sign.svg,
      icon: '🚧',
      shape: 'svg',
      color: 'default',
      tip: buildTip(sign.category),
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
