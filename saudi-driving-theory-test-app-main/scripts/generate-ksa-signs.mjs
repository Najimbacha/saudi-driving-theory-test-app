import { promises as fs } from 'fs';
import path from 'path';

const SIGNS_DIR = path.resolve(process.cwd(), 'public/ksa-signs');
const OUTPUT_PATH = path.resolve(process.cwd(), 'src/data/ksa_signs.json');

const categoryKeywords = {
  warning: [
    'warning',
    'caution',
    'ahead',
    'curve',
    'bend',
    'turn',
    'steep',
    'slippery',
    'dip',
    'bump',
    'hump',
    'merging',
    'merge',
    'narrow',
    'works',
    'construction',
    'detour',
    'rock',
    'animal',
    'camel',
    'deer',
    'cattle',
    'horse',
    'sheep',
    'pedestrian',
    'children',
    'school',
    'signal',
    'light',
    'two way',
    'roundabout ahead',
    'flood',
    'fog',
    'sand',
    'crossing',
  ],
  mandatory: [
    'keep',
    'turn',
    'direction',
    'only',
    'one way',
    'straight',
    'roundabout',
    'enter',
    'pass',
    'lane',
    'route',
  ],
  guide: [
    'parking',
    'park',
    'hospital',
    'fuel',
    'gas',
    'petrol',
    'mosque',
    'airport',
    'city',
    'route',
    'road',
    'rest',
    'hotel',
    'services',
    'station',
    'bus',
    'information',
    'center',
    'detour',
    'kilometer',
    'km',
    'exit',
    'left lane closed',
  ],
};

const variantKeywords = ['type', 'arabic', 'english', 'temporary', 'variant'];
const skipNamePatterns = [
  /\bcity\s+road\b/i,
  /\bkilometer\s+sign\s+city\s+road\b/i,
];

const toTitleCase = (value) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();

const phraseMaps = {
  ar: [
    [/\bend of speed limit\b/gi, 'نهاية حد السرعة'],
    [/\bspeed limit\b/gi, 'حد السرعة'],
    [/\bmaximum speed\b/gi, 'الحد الأقصى للسرعة'],
    [/\bminimum speed\b/gi, 'الحد الأدنى للسرعة'],
    [/\bgive way\b/gi, 'أعط الأولوية'],
    [/\byield\b/gi, 'أعط الأولوية'],
    [/\bno entry\b/gi, 'ممنوع الدخول'],
    [/\bno parking\b/gi, 'ممنوع الوقوف'],
    [/\bno stopping\b/gi, 'ممنوع التوقف'],
    [/\bno overtaking\b/gi, 'ممنوع التجاوز'],
    [/\bno u[- ]?turn\b/gi, 'ممنوع الدوران للخلف'],
    [/\bu[- ]?turn allowed\b/gi, 'الدوران للخلف مسموح'],
    [/\broundabout ahead\b/gi, 'دوار أمامك'],
    [/\broundabout mandatory\b/gi, 'دوار إلزامي'],
    [/\btwo way traffic\b/gi, 'حركة باتجاهين'],
    [/\bdead end\b/gi, 'نهاية الطريق'],
    [/\bnarrow bridge\b/gi, 'جسر ضيق'],
    [/\broad narrows\b/gi, 'الطريق يضيق'],
  ],
  ur: [
    [/\bend of speed limit\b/gi, 'رفتار کی حد ختم'],
    [/\bspeed limit\b/gi, 'رفتار کی حد'],
    [/\bmaximum speed\b/gi, 'زیادہ سے زیادہ رفتار'],
    [/\bminimum speed\b/gi, 'کم از کم رفتار'],
    [/\bgive way\b/gi, 'راستہ دیں'],
    [/\byield\b/gi, 'راستہ دیں'],
    [/\bno entry\b/gi, 'داخلہ ممنوع'],
    [/\bno parking\b/gi, 'پارکنگ ممنوع'],
    [/\bno stopping\b/gi, 'رکنا ممنوع'],
    [/\bno overtaking\b/gi, 'اوور ٹیک ممنوع'],
    [/\bno u[- ]?turn\b/gi, 'یو ٹرن ممنوع'],
    [/\bu[- ]?turn allowed\b/gi, 'یو ٹرن کی اجازت'],
    [/\broundabout ahead\b/gi, 'آگے گول چکر'],
    [/\broundabout mandatory\b/gi, 'گول چکر لازمی'],
    [/\btwo way traffic\b/gi, 'دو طرفہ ٹریفک'],
    [/\bdead end\b/gi, 'راستہ ختم'],
    [/\bnarrow bridge\b/gi, 'تنگ پل'],
    [/\broad narrows\b/gi, 'سڑک تنگ ہوتی ہے'],
  ],
  hi: [
    [/\bend of speed limit\b/gi, 'गति सीमा समाप्त'],
    [/\bspeed limit\b/gi, 'गति सीमा'],
    [/\bmaximum speed\b/gi, 'अधिकतम गति'],
    [/\bminimum speed\b/gi, 'न्यूनतम गति'],
    [/\bgive way\b/gi, 'रास्ता दें'],
    [/\byield\b/gi, 'रास्ता दें'],
    [/\bno entry\b/gi, 'प्रवेश निषेध'],
    [/\bno parking\b/gi, 'पार्किंग निषेध'],
    [/\bno stopping\b/gi, 'रुकना निषेध'],
    [/\bno overtaking\b/gi, 'ओवरटेक निषेध'],
    [/\bno u[- ]?turn\b/gi, 'यू-टर्न निषेध'],
    [/\bu[- ]?turn allowed\b/gi, 'यू-टर्न की अनुमति'],
    [/\broundabout ahead\b/gi, 'आगे गोलचक्कर'],
    [/\broundabout mandatory\b/gi, 'गोलचक्कर अनिवार्य'],
    [/\btwo way traffic\b/gi, 'दो-तरफा यातायात'],
    [/\bdead end\b/gi, 'सड़क समाप्त'],
    [/\bnarrow bridge\b/gi, 'संकरी पुल'],
    [/\broad narrows\b/gi, 'सड़क संकरी होती है'],
  ],
  bn: [
    [/\bend of speed limit\b/gi, 'গতিসীমা শেষ'],
    [/\bspeed limit\b/gi, 'গতিসীমা'],
    [/\bmaximum speed\b/gi, 'সর্বোচ্চ গতি'],
    [/\bminimum speed\b/gi, 'সর্বনিম্ন গতি'],
    [/\bgive way\b/gi, 'পথ দিন'],
    [/\byield\b/gi, 'পথ দিন'],
    [/\bno entry\b/gi, 'প্রবেশ নিষেধ'],
    [/\bno parking\b/gi, 'পার্কিং নিষেধ'],
    [/\bno stopping\b/gi, 'থামা নিষেধ'],
    [/\bno overtaking\b/gi, 'ওভারটেক নিষেধ'],
    [/\bno u[- ]?turn\b/gi, 'ইউ-টার্ন নিষেধ'],
    [/\bu[- ]?turn allowed\b/gi, 'ইউ-টার্ন অনুমোদিত'],
    [/\broundabout ahead\b/gi, 'সামনে রাউন্ডঅবাউট'],
    [/\broundabout mandatory\b/gi, 'রাউন্ডঅবাউট বাধ্যতামূলক'],
    [/\btwo way traffic\b/gi, 'দুইমুখী যান চলাচল'],
    [/\bdead end\b/gi, 'রাস্তা শেষ'],
    [/\bnarrow bridge\b/gi, 'সরু সেতু'],
    [/\broad narrows\b/gi, 'রাস্তা সরু হয়'],
  ],
};

const skipWords = {
  ar: new Set(['of', 'the', 'and', 'to', 'in', 'on', 'with']),
  ur: new Set(['of', 'the', 'and', 'to', 'in', 'on', 'with']),
  hi: new Set(['of', 'the', 'and', 'to', 'in', 'on', 'with']),
  bn: new Set(['of', 'the', 'and', 'to', 'in', 'on', 'with']),
};

const wordMaps = {
  ar: {
    stop: 'قف',
    no: 'ممنوع',
    parking: 'الوقوف',
    stopping: 'التوقف',
    entry: 'الدخول',
    speed: 'السرعة',
    limit: 'الحد',
    end: 'نهاية',
    u: 'يو',
    turn: 'انعطاف',
    left: 'اليسار',
    right: 'اليمين',
    keep: 'الزم',
    one: 'واحد',
    way: 'اتجاه',
    roundabout: 'دوار',
    mandatory: 'إلزامي',
    overtaking: 'تجاوز',
    prohibited: 'ممنوع',
    slippery: 'زلق',
    road: 'طريق',
    bump: 'مطب',
    hump: 'مطبة',
    ahead: 'أمامك',
    pedestrian: 'مشاة',
    pedestrians: 'مشاة',
    crossing: 'عبور',
    narrows: 'يضيق',
    curve: 'منعطف',
    double: 'مزدوج',
    steep: 'حاد',
    descent: 'نزول',
    ascent: 'صعود',
    school: 'مدرسة',
    zone: 'منطقة',
    children: 'أطفال',
    animals: 'حيوانات',
    animal: 'حيوان',
    camels: 'جمال',
    camel: 'جمل',
    falling: 'متساقطة',
    rocks: 'صخور',
    traffic: 'مرور',
    signal: 'إشارة',
    railway: 'سكة',
    barrier: 'حاجز',
    parking: 'الوقوف',
    area: 'منطقة',
    hospital: 'مستشفى',
    fuel: 'وقود',
    station: 'محطة',
    mosque: 'مسجد',
    bus: 'حافلات',
    rest: 'استراحة',
    emergency: 'طوارئ',
    phone: 'هاتف',
    allowed: 'مسموح',
    priority: 'أولوية',
    checkpoint: 'نقطة تفتيش',
    customs: 'جمارك',
    inspection: 'تفتيش',
    restrictions: 'قيود',
    lane: 'مسار',
    merge: 'اندماج',
    two: 'اثنان',
    narrow: 'ضيق',
    bridge: 'جسر',
    dead: 'نهاية',
    city: 'مدينة',
    branch: 'فرعي',
    blank: 'فارغ',
    maximum: 'الحد الأقصى',
    minimum: 'الحد الأدنى',
    straight: 'مستقيم',
    only: 'فقط',
    go: 'اذهب',
    direction: 'اتجاه',
    detour: 'تحويلة',
    arrow: 'سهم',
    bicycle: 'دراجات',
    bicycles: 'دراجات',
    cyclists: 'دراجات',
    motor: 'محرك',
    vehicle: 'مركبة',
    vehicles: 'مركبات',
    truck: 'شاحنة',
    trucks: 'شاحنات',
    works: 'أعمال',
    construction: 'إنشاءات',
    information: 'معلومات',
    center: 'مركز',
    services: 'خدمات',
    airport: 'مطار',
    police: 'شرطة',
    saudi: 'السعودية',
    aarbia: 'العربية',
  },
  ur: {
    stop: 'رکیں',
    no: 'ممنوع',
    parking: 'پارکنگ',
    stopping: 'رکنا',
    entry: 'داخلہ',
    speed: 'رفتار',
    limit: 'حد',
    end: 'ختم',
    u: 'یو',
    turn: 'موڑ',
    left: 'بائیں',
    right: 'دائیں',
    keep: 'رہیں',
    one: 'ایک',
    way: 'طرف',
    roundabout: 'گول چکر',
    mandatory: 'لازمی',
    overtaking: 'اوورٹیک',
    prohibited: 'ممنوع',
    slippery: 'پھسلن',
    road: 'سڑک',
    bump: 'مطب',
    hump: 'مطب',
    ahead: 'آگے',
    pedestrian: 'پیدل',
    pedestrians: 'پیدل',
    crossing: 'گزرگاہ',
    narrows: 'تنگ',
    curve: 'موڑ',
    double: 'دوہرا',
    steep: 'تیز',
    descent: 'ڈھلوان',
    ascent: 'چڑھائی',
    school: 'اسکول',
    zone: 'زون',
    children: 'بچے',
    animals: 'جانور',
    animal: 'جانور',
    camels: 'اونٹ',
    camel: 'اونٹ',
    falling: 'گرنے والے',
    rocks: 'چٹانیں',
    traffic: 'ٹریفک',
    signal: 'سگنل',
    railway: 'ریلوے',
    barrier: 'بیریئر',
    area: 'علاقہ',
    hospital: 'ہسپتال',
    fuel: 'ایندھن',
    station: 'اسٹیشن',
    mosque: 'مسجد',
    bus: 'بس',
    rest: 'آرام',
    emergency: 'ایمرجنسی',
    phone: 'فون',
    allowed: 'اجازت',
    priority: 'ترجیح',
    checkpoint: 'چیک پوسٹ',
    customs: 'کسٹمز',
    inspection: 'معائنہ',
    restrictions: 'پابندیاں',
    lane: 'لین',
    merge: 'ضم',
    two: 'دو',
    narrow: 'تنگ',
    bridge: 'پل',
    dead: 'ختم',
    city: 'شہر',
    branch: 'شاخ',
    blank: 'خالی',
    maximum: 'زیادہ سے زیادہ',
    minimum: 'کم از کم',
    straight: 'سیدھا',
    only: 'صرف',
    go: 'جائیں',
    direction: 'سمت',
    detour: 'متبادل راستہ',
    arrow: 'تیر',
    bicycle: 'سائیکل',
    bicycles: 'سائیکلیں',
    cyclists: 'سائیکل سوار',
    motor: 'موٹر',
    vehicle: 'گاڑی',
    vehicles: 'گاڑیاں',
    truck: 'ٹرک',
    trucks: 'ٹرک',
    works: 'کام',
    construction: 'تعمیرات',
    information: 'معلومات',
    center: 'مرکز',
    services: 'خدمات',
    airport: 'ہوائی اڈہ',
    police: 'پولیس',
    saudi: 'سعودی',
    aarbia: 'عربیہ',
  },
  hi: {
    stop: 'रुकें',
    no: 'निषेध',
    parking: 'पार्किंग',
    stopping: 'रुकना',
    entry: 'प्रवेश',
    speed: 'गति',
    limit: 'सीमा',
    end: 'समाप्त',
    u: 'यू',
    turn: 'मुड़ें',
    left: 'बाएं',
    right: 'दाएं',
    keep: 'रहें',
    one: 'एक',
    way: 'दिशा',
    roundabout: 'गोलचक्कर',
    mandatory: 'अनिवार्य',
    overtaking: 'ओवरटेक',
    prohibited: 'निषेध',
    slippery: 'फिसलन',
    road: 'सड़क',
    bump: 'स्पीड ब्रेकर',
    hump: 'स्पीड ब्रेकर',
    ahead: 'आगे',
    pedestrian: 'पैदल',
    pedestrians: 'पैदल',
    crossing: 'क्रॉसिंग',
    narrows: 'संकरी',
    curve: 'मोड़',
    double: 'दोहरा',
    steep: 'तीव्र',
    descent: 'उतराई',
    ascent: 'चढ़ाई',
    school: 'विद्यालय',
    zone: 'क्षेत्र',
    children: 'बच्चे',
    animals: 'जानवर',
    animal: 'जानवर',
    camels: 'ऊंट',
    camel: 'ऊंट',
    falling: 'गिरते',
    rocks: 'चट्टानें',
    traffic: 'यातायात',
    signal: 'सिग्नल',
    railway: 'रेलवे',
    barrier: 'बैरियर',
    area: 'क्षेत्र',
    hospital: 'अस्पताल',
    fuel: 'ईंधन',
    station: 'स्टेशन',
    mosque: 'मस्जिद',
    bus: 'बस',
    rest: 'विश्राम',
    emergency: 'आपातकाल',
    phone: 'फोन',
    allowed: 'अनुमति',
    priority: 'प्राथमिकता',
    checkpoint: 'चेकपॉइंट',
    customs: 'सीमा शुल्क',
    inspection: 'निरीक्षण',
    restrictions: 'प्रतिबंध',
    lane: 'लेन',
    merge: 'मिलना',
    two: 'दो',
    narrow: 'संकरा',
    bridge: 'पुल',
    dead: 'समाप्त',
    city: 'शहर',
    branch: 'शाखा',
    blank: 'खाली',
    maximum: 'अधिकतम',
    minimum: 'न्यूनतम',
    straight: 'सीधा',
    only: 'केवल',
    go: 'जाएं',
    direction: 'दिशा',
    detour: 'परिवर्तन मार्ग',
    arrow: 'तीर',
    bicycle: 'साइकिल',
    bicycles: 'साइकिलें',
    cyclists: 'साइकिल चालक',
    motor: 'मोटर',
    vehicle: 'वाहन',
    vehicles: 'वाहन',
    truck: 'ट्रक',
    trucks: 'ट्रक',
    works: 'कार्य',
    construction: 'निर्माण',
    information: 'जानकारी',
    center: 'केंद्र',
    services: 'सेवाएं',
    airport: 'हवाई अड्डा',
    police: 'पुलिस',
    saudi: 'सऊदी',
    aarbia: 'अरबिया',
  },
  bn: {
    stop: 'থামুন',
    no: 'নিষেধ',
    parking: 'পার্কিং',
    stopping: 'থামা',
    entry: 'প্রবেশ',
    speed: 'গতি',
    limit: 'সীমা',
    end: 'শেষ',
    u: 'ইউ',
    turn: 'বাঁক',
    left: 'বাম',
    right: 'ডান',
    keep: 'থাকুন',
    one: 'এক',
    way: 'দিক',
    roundabout: 'রাউন্ডঅবাউট',
    mandatory: 'বাধ্যতামূলক',
    overtaking: 'ওভারটেক',
    prohibited: 'নিষেধ',
    slippery: 'পিচ্ছিল',
    road: 'রাস্তা',
    bump: 'স্পিড ব্রেকার',
    hump: 'স্পিড ব্রেকার',
    ahead: 'সামনে',
    pedestrian: 'পথচারী',
    pedestrians: 'পথচারী',
    crossing: 'পারাপার',
    narrows: 'সরু',
    curve: 'বাঁক',
    double: 'দ্বিগুণ',
    steep: 'খাড়া',
    descent: 'উতরাই',
    ascent: 'চড়াই',
    school: 'স্কুল',
    zone: 'এলাকা',
    children: 'শিশু',
    animals: 'প্রাণী',
    animal: 'প্রাণী',
    camels: 'উট',
    camel: 'উট',
    falling: 'পড়ন্ত',
    rocks: 'পাথর',
    traffic: 'যানবাহন',
    signal: 'সিগন্যাল',
    railway: 'রেলওয়ে',
    barrier: 'বাধা',
    area: 'এলাকা',
    hospital: 'হাসপাতাল',
    fuel: 'জ্বালানি',
    station: 'স্টেশন',
    mosque: 'মসজিদ',
    bus: 'বাস',
    rest: 'বিশ্রাম',
    emergency: 'জরুরি',
    phone: 'ফোন',
    allowed: 'অনুমোদিত',
    priority: 'অগ্রাধিকার',
    checkpoint: 'চেকপোস্ট',
    customs: 'শুল্ক',
    inspection: 'পরিদর্শন',
    restrictions: 'নিষেধাজ্ঞা',
    lane: 'লেন',
    merge: 'মিলন',
    two: 'দুই',
    narrow: 'সরু',
    bridge: 'সেতু',
    dead: 'শেষ',
    city: 'শহর',
    branch: 'শাখা',
    blank: 'খালি',
    maximum: 'সর্বোচ্চ',
    minimum: 'সর্বনিম্ন',
    straight: 'সোজা',
    only: 'শুধু',
    go: 'যান',
    direction: 'দিক',
    detour: 'বিকল্প পথ',
    arrow: 'তীর',
    bicycle: 'সাইকেল',
    bicycles: 'সাইকেল',
    cyclists: 'সাইকেল আরোহী',
    motor: 'মোটর',
    vehicle: 'যান',
    vehicles: 'যানবাহন',
    truck: 'ট্রাক',
    trucks: 'ট্রাক',
    works: 'কাজ',
    construction: 'নির্মাণ',
    information: 'তথ্য',
    center: 'কেন্দ্র',
    services: 'সেবা',
    airport: 'বিমানবন্দর',
    police: 'পুলিশ',
    saudi: 'সৌদি',
    aarbia: 'আরবিয়া',
  },
};

const transliterationMaps = {
  ar: {
    digraphs: {
      sh: 'ش',
      ch: 'تش',
      kh: 'خ',
      gh: 'غ',
      th: 'ث',
      dh: 'ذ',
      ph: 'ف',
    },
    letters: {
      a: 'ا', b: 'ب', c: 'ك', d: 'د', e: 'ي', f: 'ف', g: 'ج', h: 'ه',
      i: 'ي', j: 'ج', k: 'ك', l: 'ل', m: 'م', n: 'ن', o: 'و', p: 'ب',
      q: 'ق', r: 'ر', s: 'س', t: 'ت', u: 'و', v: 'ف', w: 'و', x: 'كس',
      y: 'ي', z: 'ز',
    },
  },
  ur: {
    digraphs: {
      sh: 'ش',
      ch: 'چ',
      kh: 'خ',
      gh: 'غ',
      th: 'تھ',
      dh: 'دھ',
      ph: 'پھ',
    },
    letters: {
      a: 'ا', b: 'ب', c: 'ک', d: 'د', e: 'ی', f: 'ف', g: 'گ', h: 'ہ',
      i: 'ی', j: 'ج', k: 'ک', l: 'ل', m: 'م', n: 'ن', o: 'و', p: 'پ',
      q: 'ق', r: 'ر', s: 'س', t: 'ت', u: 'و', v: 'و', w: 'و', x: 'کس',
      y: 'ی', z: 'ز',
    },
  },
  hi: {
    digraphs: {
      sh: 'श',
      ch: 'च',
      kh: 'ख',
      gh: 'घ',
      th: 'थ',
      dh: 'ध',
      ph: 'फ',
      bh: 'भ',
    },
    letters: {
      a: 'अ', b: 'ब', c: 'क', d: 'द', e: 'ए', f: 'फ', g: 'ग', h: 'ह',
      i: 'इ', j: 'ज', k: 'क', l: 'ल', m: 'म', n: 'न', o: 'ओ', p: 'प',
      q: 'क', r: 'र', s: 'स', t: 'त', u: 'उ', v: 'व', w: 'व', x: 'क्स',
      y: 'य', z: 'ज',
    },
  },
  bn: {
    digraphs: {
      sh: 'শ',
      ch: 'চ',
      kh: 'খ',
      gh: 'ঘ',
      th: 'থ',
      dh: 'ধ',
      ph: 'ফ',
      bh: 'ভ',
    },
    letters: {
      a: 'আ', b: 'ব', c: 'ক', d: 'দ', e: 'এ', f: 'ফ', g: 'গ', h: 'হ',
      i: 'ই', j: 'জ', k: 'ক', l: 'ল', m: 'ম', n: 'ন', o: 'ও', p: 'প',
      q: 'ক', r: 'র', s: 'স', t: 'ত', u: 'উ', v: 'ভ', w: 'ও', x: 'ক্স',
      y: 'য', z: 'জ',
    },
  },
};

const applyPhraseMap = (value, lang) => {
  const entries = phraseMaps[lang] || [];
  return entries.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), value);
};

const hasNonLatinLetters = (value) => /[\u0600-\u06FF\u0900-\u097F\u0980-\u09FF]/.test(value);

const transliterate = (token, lang) => {
  const map = transliterationMaps[lang];
  if (!map) return token;
  const lower = token.toLowerCase();
  let result = '';
  let i = 0;
  while (i < lower.length) {
    const pair = lower.slice(i, i + 2);
    if (map.digraphs[pair]) {
      result += map.digraphs[pair];
      i += 2;
      continue;
    }
    const ch = lower[i];
    if (map.letters[ch]) {
      result += map.letters[ch];
    } else if (/\d/.test(ch)) {
      result += ch;
    }
    i += 1;
  }
  return result || token;
};

const translateTitle = (value, lang) => {
  const withPhrases = applyPhraseMap(value, lang);
  return withPhrases
    .split(/(\s+|[()\\/,-])/)
    .map((part) => {
      if (part.trim() === '') return part;
      if (/^[()\\/,-]$/.test(part)) return part;
      if (/^\d+$/.test(part)) return part;
      if (hasNonLatinLetters(part)) return part;
      const normalized = part.toLowerCase();
      if (skipWords[lang]?.has(normalized)) return '';
      const mapped = wordMaps[lang]?.[normalized];
      if (mapped) return mapped;
      return transliterate(part, lang);
    })
    .join('')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const stripCommonPrefix = (value) => {
  let result = value;
  const prefixes = [
    /^saudi arabia\s*-\s*/i,
    /^saudi arabia\s*/i,
    /^sa\s*-\s*/i,
    /^sa\s*/i,
    /^ksa\s*/i,
    /^saudi\s*/i,
    /^saudi arabia road sign\s*-\s*/i,
    /^sa road sign\s*-\s*/i,
    /^saudi arabia road sign\s*/i,
    /^sa road sign\s*/i,
  ];
  prefixes.forEach((pattern) => {
    result = result.replace(pattern, '').trim();
  });
  return result;
};

const cleanBaseName = (filename) => {
  const base = filename.replace(/\.svg$/i, '').replace(/[_-]+/g, ' ');
  const withoutVariants = base.replace(/\((type[^)]*|arabic|english|temporary[^)]*)\)/gi, '');
  const stripped = stripCommonPrefix(withoutVariants)
    .replace(/\broad\s+signs?\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped;
};

const toId = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const inferCategory = (name) => {
  const lower = name.toLowerCase();
  if (categoryKeywords.guide.some((k) => lower.includes(k))) return 'guide';
  if (categoryKeywords.warning.some((k) => lower.includes(k))) return 'warning';
  if (categoryKeywords.mandatory.some((k) => lower.includes(k))) return 'mandatory';
  return 'regulatory';
};

const hasVariantKeyword = (source) =>
  variantKeywords.some((keyword) => new RegExp(`\\b${keyword}\\b`, 'i').test(source));

async function buildIndex() {
  const entries = await fs.readdir(SIGNS_DIR);
  const svgFiles = entries.filter((file) => file.toLowerCase().endsWith('.svg'));

  const byId = new Map();

  svgFiles.forEach((file) => {
    const cleanedName = cleanBaseName(file);
    if (skipNamePatterns.some((pattern) => pattern.test(cleanedName) || pattern.test(file))) {
      return;
    }
    const id = toId(cleanedName);
    if (!id) return;

    const name_en = toTitleCase(cleanedName);
    const name_ar = translateTitle(name_en, 'ar');
    const name_ur = translateTitle(name_en, 'ur');
    const name_hi = translateTitle(name_en, 'hi');
    const name_bn = translateTitle(name_en, 'bn');
    const category = inferCategory(cleanedName);
    const candidate = {
      id,
      name_en,
      name_ar,
      name_ur,
      name_hi,
      name_bn,
      category,
      svg: `/ksa-signs/${file}`,
      _source: file,
    };

    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, candidate);
      return;
    }

    const existingHasVariant = hasVariantKeyword(existing._source);
    const candidateHasVariant = hasVariantKeyword(candidate._source);
    const shouldReplace =
      (!candidateHasVariant && existingHasVariant) ||
      (candidateHasVariant === existingHasVariant && candidate._source.length < existing._source.length);

    if (shouldReplace) {
      byId.set(id, candidate);
    }
  });

  const signs = Array.from(byId.values())
    .map(({ _source, ...rest }) => rest)
    .sort((a, b) => a.name_en.localeCompare(b.name_en));

  const json = JSON.stringify(signs, null, 2);
  await fs.writeFile(OUTPUT_PATH, `${json}\n`, 'utf8');
  console.log(`Generated ${signs.length} signs to ${OUTPUT_PATH}`);
}

buildIndex().catch((err) => {
  console.error(err);
  process.exit(1);
});
