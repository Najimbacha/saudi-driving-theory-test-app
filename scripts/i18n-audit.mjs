import fs from 'node:fs';
import path from 'node:path';

const srcRoot = path.resolve('src');
const ignoreDirs = new Set([
  path.join(srcRoot, 'i18n', 'locales'),
  path.join(srcRoot, 'data'),
]);
const exts = new Set(['.ts', '.tsx', '.js', '.jsx']);

function shouldIgnoreDir(dir) {
  for (const ignored of ignoreDirs) {
    if (dir.startsWith(ignored)) {
      return true;
    }
  }
  return false;
}

function walk(dir, files = []) {
  if (shouldIgnoreDir(dir)) {
    return files;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (exts.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function lineNumberForIndex(text, index) {
  return text.slice(0, index).split('\n').length;
}

const findings = [];
const jsxTextRegex = />[^<>{}]*[A-Za-z][^<>{}]*</g;
const attrRegex = /\b(aria-label|aria-labelledby|alt|title|placeholder|label|helperText|description|message|toastText|emptyText)\s*=\s*["']([^"']*[A-Za-z][^"']*)["']/g;

for (const file of walk(srcRoot)) {
  const content = fs.readFileSync(file, 'utf-8');

  let match;
  while ((match = jsxTextRegex.exec(content)) !== null) {
    const raw = match[0];
    const text = raw.slice(1, -1).trim();
    if (!text) {
      continue;
    }
    findings.push({
      file,
      line: lineNumberForIndex(content, match.index),
      text,
    });
  }

  while ((match = attrRegex.exec(content)) !== null) {
    const text = match[2].trim();
    if (!text) {
      continue;
    }
    findings.push({
      file,
      line: lineNumberForIndex(content, match.index),
      text,
    });
  }
}

if (!findings.length) {
  console.log('i18n audit: no obvious hardcoded English strings found.');
  process.exit(0);
}

console.log(`i18n audit: found ${findings.length} potential hardcoded strings:\n`);
for (const finding of findings) {
  console.log(`${finding.file}:${finding.line} -> ${finding.text}`);
}
process.exit(1);
