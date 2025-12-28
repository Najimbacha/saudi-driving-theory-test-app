import fs from 'node:fs';
import path from 'node:path';

const localesDir = path.resolve('src', 'i18n', 'locales');
const languages = ['en', 'ar', 'ur', 'hi', 'bn'];

function flatten(obj, prefix = '', out = {}) {
  if (Array.isArray(obj)) {
    obj.forEach((value, index) => {
      flatten(value, `${prefix}[${index}]`, out);
    });
    return out;
  }

  if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      const next = prefix ? `${prefix}.${key}` : key;
      flatten(value, next, out);
    });
    return out;
  }

  out[prefix] = obj;
  return out;
}

const localeData = {};
for (const lang of languages) {
  const filePath = path.join(localesDir, `${lang}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  localeData[lang] = JSON.parse(raw);
}

const baseKeys = new Set(Object.keys(flatten(localeData.en)));
let hasErrors = false;

for (const lang of languages) {
  const keys = new Set(Object.keys(flatten(localeData[lang])));
  const missing = [...baseKeys].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !baseKeys.has(key));

  if (missing.length || extra.length) {
    hasErrors = true;
    console.log(`\n${lang.toUpperCase()} locale issues:`);
    if (missing.length) {
      console.log(`  Missing keys (${missing.length}):`);
      missing.forEach((key) => console.log(`   - ${key}`));
    }
    if (extra.length) {
      console.log(`  Extra keys (${extra.length}):`);
      extra.forEach((key) => console.log(`   - ${key}`));
    }
  }
}

if (hasErrors) {
  console.error('\nLocalization validation failed.');
  process.exit(1);
}

console.log('Localization validation passed. All locale files share identical keys.');
