// Pose files: names, downloads and reading imported files.
import { normalizePose } from '../pose.js';

// Characters that are not allowed in file names on common systems
export function fileNameFor(name) {
  // eslint-disable-next-line no-control-regex -- control characters are among them
  return `${name.trim().replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_') || 'pose'}.json`;
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Each file becomes { name, pose } or { name, error }
export function readPoseFiles(files) {
  return Promise.all(
    files.map(async (file) => {
      const name = file.name.replace(/\.json$/i, '');
      try {
        return { name, pose: normalizePose(JSON.parse(await file.text())) };
      } catch (err) {
        return { name, error: err.message };
      }
    })
  );
}
