// Check letters/ the way the editor loads it: every pose file must be a valid
// pose and be listed in index.json, or the editor skips or never shows it.
// Listed files that don't exist yet are letters still to make, not errors.
//
//   npm run check:letters
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { normalizePose } from '../src/pose.js';

const dir = new URL('../letters/', import.meta.url);
const read = (file) => JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
const errors = [];
const missing = [];

let index;
try {
  index = read('index.json');
  if (!Array.isArray(index)) throw new Error('expected a list of file names');
} catch (err) {
  errors.push(`index.json: ${err.message}`);
  index = [];
}

const listed = new Set();
index.forEach((entry) => {
  if (typeof entry !== 'string') {
    errors.push(`index.json: ${JSON.stringify(entry)} is not a file name`);
    return;
  }
  const file = /\.json$/i.test(entry) ? entry : `${entry}.json`;
  if (listed.has(file)) errors.push(`index.json lists ${file} twice`);
  listed.add(file);
  if (!existsSync(new URL(file, dir))) missing.push(file);
});

const files = readdirSync(dir).filter((file) => /\.json$/i.test(file) && file !== 'index.json');
files.forEach((file) => {
  try {
    normalizePose(read(file));
  } catch (err) {
    errors.push(`${file}: ${err.message}`);
  }
  if (!listed.has(file)) errors.push(`${file} is not listed in index.json, so the editor never shows it`);
});

console.log(`${files.length} letter pose(s) checked.`);
if (missing.length) console.log(`Listed but not made yet: ${missing.join(', ')}`);
if (errors.length) {
  errors.forEach((error) => console.error(`error: ${error}`));
  process.exit(1);
}
