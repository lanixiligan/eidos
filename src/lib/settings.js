// Settings remembered per browser; storage may be unavailable (private mode)
export function readSetting(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// Every key Eidos stores (saved poses included). Clearing removes only these:
// on GitHub Pages other sites can share this origin's storage.
const KEYS = ['hand-mode', 'hand-side', 'hand-transition-ms', 'hand-poses.v1'];

// Returns false when storage is unavailable (then nothing was stored)
export function clearSettings() {
  try {
    KEYS.forEach((key) => localStorage.removeItem(key));
    return true;
  } catch {
    return false;
  }
}

export function writeSetting(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
