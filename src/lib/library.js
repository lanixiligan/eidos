// The pose library: letters from letters/ and poses saved in this browser.
import { RELAXED_POSE, normalizePose } from '../pose.js';
import { readSetting, writeSetting } from './settings.js';

// Saved poses are keyed "saved:<name>" and letter poses "letter:<name>" so a
// saved pose named like a letter stays a separate button.
export const SAVED_PREFIX = 'saved:';
export const LETTER_PREFIX = 'letter:';

export function findPose(key, { letters, saved }) {
  if (key.startsWith(SAVED_PREFIX)) {
    return saved[key.slice(SAVED_PREFIX.length)] || RELAXED_POSE;
  }
  const name = key.slice(LETTER_PREFIX.length);
  return letters.find((letter) => letter.name === name)?.pose || RELAXED_POSE;
}

// Name to prefill when a letter or saved pose is opened in the editor
export function poseName(key) {
  if (key.startsWith(SAVED_PREFIX)) return key.slice(SAVED_PREFIX.length);
  if (key.startsWith(LETTER_PREFIX)) return key.slice(LETTER_PREFIX.length);
  return '';
}

const SAVED_POSES_KEY = 'hand-poses.v1';

export function loadSavedPoses() {
  try {
    const stored = JSON.parse(readSetting(SAVED_POSES_KEY)) || {};
    const poses = {};
    Object.entries(stored).forEach(([name, pose]) => {
      try {
        poses[name] = normalizePose(pose);
      } catch (err) {
        console.warn(`Dropping saved pose "${name}": ${err.message}`);
      }
    });
    return poses;
  } catch {
    return {};
  }
}

export function storeSavedPoses(poses) {
  return writeSetting(SAVED_POSES_KEY, JSON.stringify(poses));
}

// Letter poses: one JSON file per letter in ./letters/, listed (in display
// order) in letters/index.json, since a browser cannot list a folder itself.
async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Resolves to { letters: [{ name, pose }], status }; status is '' when every
// listed file loaded
export async function loadLetterPoses() {
  let files;
  try {
    files = await fetchJson('./letters/index.json');
    if (!Array.isArray(files)) throw new Error('expected a list of file names');
  } catch (err) {
    console.warn('Could not read letters/index.json:', err.message);
    return { letters: [], status: 'Could not read letters/index.json.' };
  }

  const results = await Promise.all(
    files.map(async (entry) => {
      const file = /\.json$/i.test(entry) ? entry : `${entry}.json`;
      const name = file.replace(/\.json$/i, '');
      try {
        const pose = normalizePose(await fetchJson(`./letters/${encodeURIComponent(file)}`));
        return { name, pose };
      } catch (err) {
        console.warn(`Skipping letters/${file}: ${err.message}`);
        return { name, pose: null };
      }
    })
  );

  const letters = results.filter((r) => r.pose);
  const skipped = results.length - letters.length;
  const status = letters.length
    ? skipped
      ? `${skipped} file(s) skipped; see the browser console.`
      : ''
    : files.length
      ? 'No valid letter files; see the browser console.'
      : 'No letters yet. Add JSON files to letters/ and list them in letters/index.json.';
  return { letters, status };
}
