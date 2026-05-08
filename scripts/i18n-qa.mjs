import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const srcDir = join(root, 'src');
const localeRoot = join(srcDir, 'locales');
const languages = ['vi', 'en'];
const productTerms = [
  'TravChain',
  'All Travel One Tap',
  'Travel Passport',
  'QR',
  'NFT',
  'Hash',
  'VND',
  'USD',
  'CGV',
  'Lotte',
  'Galaxy',
  'Beta',
  'Cinestar',
  'PIN',
  'DApp',
  'USDT',
];

function flatten(value, prefix = '') {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key));
  }
  return [[prefix, value]];
}

function listFiles(dir, predicate, output = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) listFiles(path, predicate, output);
    else if (predicate(path)) output.push(path);
  }
  return output;
}

const failures = [];
const warnings = [];

const localeMaps = Object.fromEntries(languages.map((language) => [language, new Map()]));
for (const language of languages) {
  const dir = join(localeRoot, language);
  for (const file of readdirSync(dir).filter((name) => name.endsWith('.json'))) {
    const json = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    for (const [key, value] of flatten(json, file.replace(/\.json$/, ''))) {
      localeMaps[language].set(key, value);
    }
  }
}

for (const key of localeMaps.vi.keys()) {
  if (!localeMaps.en.has(key)) failures.push(`Missing EN locale key: ${key}`);
}
for (const key of localeMaps.en.keys()) {
  if (!localeMaps.vi.has(key)) failures.push(`Missing VI locale key: ${key}`);
}

for (const term of productTerms) {
  localeMaps.vi.set(`__allowed.${term}`, term);
  localeMaps.en.set(`__allowed.${term}`, term);
}

const sourceFiles = listFiles(srcDir, (path) => /\.(tsx|ts)$/.test(path) && !path.includes(`${join('src', 'locales')}${'/'}`));
const visibleStringPattern = /(?:>|=|\(|\[|,)\s*(['"`])([^'"`\n{}<>]*[A-Za-zÀ-ỹ][^'"`\n{}<>]*)\1/g;
const ignoreFragments = [
  'http',
  '/api/',
  'data:image',
  'className',
  'Bearer ',
  'Content-Type',
  'localStorage',
  'console.',
  'import ',
  'export ',
];

for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8');
  let match;
  while ((match = visibleStringPattern.exec(source))) {
    const value = match[2].trim();
    if (!value || value.length < 3) continue;
    if (/^[a-z0-9_./:-]+$/i.test(value)) continue;
    if (productTerms.includes(value)) continue;
    if (ignoreFragments.some((fragment) => value.includes(fragment))) continue;
    warnings.push(`${relative(root, file)}: possible hardcoded visible string "${value.slice(0, 90)}"`);
  }
}

for (const language of languages) {
  const required = ['common', 'traveler', 'partner', 'admin', 'wallet', 'booking', 'assistant'];
  for (const namespace of required) {
    if (!existsSync(join(localeRoot, language, `${namespace}.json`))) {
      failures.push(`Missing ${language}/${namespace}.json`);
    }
  }
}

if (warnings.length) {
  console.warn('i18n QA warnings: hardcoded visible strings may remain.');
  for (const warning of warnings.slice(0, 80)) console.warn(`- ${warning}`);
  if (warnings.length > 80) console.warn(`- ...and ${warnings.length - 80} more`);
}

if (failures.length) {
  console.error('i18n QA failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('i18n QA passed: locale key parity is valid. Hardcoded string scan completed with warnings only.');
