// Eidos: panel UI, pose editor and pose files around the 3D hand. The state
// the panels share lives here, in numbered sections.
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Library } from './components/Library.jsx';
import { PoseEditor } from './components/PoseEditor.jsx';
import { Stage } from './components/Stage.jsx';
import { TopBar } from './components/TopBar.jsx';
import { useHand } from './hooks/useHand.js';
import { usePoseEditor } from './hooks/usePoseEditor.js';
import { downloadBlob, fileNameFor, readPoseFiles } from './lib/files.js';
import { LETTER_PREFIX, SAVED_PREFIX, findPose, loadLetterPoses, loadSavedPoses, poseName, storeSavedPoses } from './lib/library.js';
import { clearSettings, readSetting, writeSetting } from './lib/settings.js';
import { RELAXED_POSE, normalizePose, serializePose } from './pose.js';
import { createZip } from './zip.js';

// index.html sets data-mode before first paint (saved choice or system setting)
const initialMode = () => (document.documentElement.dataset.mode === 'light' ? 'light' : 'dark');
const initialSide = () => (readSetting('hand-side') === 'left' ? 'left' : 'right');

export default function App() {
  // ---------------------------------------------------------------------------
  // 1. The pose being edited and the hand showing it
  // ---------------------------------------------------------------------------
  // The editor is always open: it starts from a hand at rest
  const editor = usePoseEditor(RELAXED_POSE);
  const [name, setName] = useState('');

  // The status line under the file buttons: what the last action did.
  // `problem` marks something that didn't work, which stays at full strength;
  // `id` restarts the fade when the same message comes twice.
  const [status, setStatus] = useState({ text: '', problem: false, id: 0 });
  const report = (text, problem = false) => setStatus((s) => ({ text, problem, id: s.id + 1 }));

  const [mode, setMode] = useState(initialMode);
  const [side, setSide] = useState(initialSide);
  const [numbers, setNumbers] = useState(true);

  const stageRef = useRef(null);
  const editorPanel = useRef(null);
  const hand = useHand(stageRef, {
    pose: editor.pose,
    mode,
    side,
    numbers,
    // Clicking a fingertip number on the hand opens that finger's tab
    onTipClick: (finger) => editorPanel.current?.jumpToFinger(finger),
  });

  // ---------------------------------------------------------------------------
  // 2. Poses: letters and saved poses
  // ---------------------------------------------------------------------------
  const [saved, setSaved] = useState(loadSavedPoses);
  const [letterState, setLetterState] = useState({ letters: [], status: 'Loading letters…' });
  const { letters } = letterState;

  useEffect(() => {
    let current = true;
    loadLetterPoses().then((result) => {
      if (current) setLetterState(result);
    });
    return () => {
      current = false;
    };
  }, []);

  // Returns false when browser storage is unavailable
  function updateSaved(next) {
    setSaved(next);
    return storeSavedPoses(next);
  }

  // Choosing a sign also turns the view back to its starting angle, so the
  // sign is seen as posed (its own hand rotation is part of the pose)
  function selectPose(key) {
    editor.selectPose(key, findPose(key, { letters, saved }));
    editor.commitEdit();
    setName(poseName(key));
    hand.resetView();
  }

  function deleteSavedPose(poseToDelete) {
    if (!confirm(`Delete saved pose "${poseToDelete}"?`)) return;
    const next = { ...saved };
    delete next[poseToDelete];
    updateSaved(next);
  }

  // ← and → open the previous or next row of the board: letters, then saved
  function stepBoard(offset) {
    const keys = [...letters.map((letter) => LETTER_PREFIX + letter.name), ...Object.keys(saved).map((n) => SAVED_PREFIX + n)];
    if (!keys.length) return;
    const i = keys.indexOf(editor.active);
    const next = i === -1 ? (offset > 0 ? 0 : keys.length - 1) : (i + offset + keys.length) % keys.length;
    selectPose(keys[next]);
  }

  // Leave nothing of Eidos in this browser: saved poses and every setting. The
  // page keeps its current look until reload.
  function deleteAllData() {
    const count = Object.keys(saved).length;
    const poses = count ? `your ${count} saved pose(s)` : 'your saved poses';
    if (!confirm(`Delete all Eidos data in this browser? This removes ${poses} and your settings, and can't be undone.`)) return;
    const ok = clearSettings();
    setSaved({});
    if (ok) report('Deleted all Eidos data from this browser.');
    else report('Browser storage is unavailable, so nothing was stored.', true);
  }

  // ---------------------------------------------------------------------------
  // 3. Pose editor: saving
  // ---------------------------------------------------------------------------
  // What the top bar says about the pose: a library pose as opened, saved,
  // or changed since (any edit clears the open row)
  const saveState = editor.active?.startsWith(SAVED_PREFIX)
    ? { label: 'SAVED', saved: true }
    : editor.active?.startsWith(LETTER_PREFIX)
      ? { label: 'LETTER', saved: true }
      : { label: 'NOT SAVED', saved: false };

  function savePose() {
    const poseName = name.trim() || `Pose ${Object.keys(saved).length + 1}`;
    const existed = Object.hasOwn(saved, poseName);
    const ok = updateSaved({ ...saved, [poseName]: editor.document });
    editor.markActive(SAVED_PREFIX + poseName);
    setName(poseName);
    if (ok) report(`${existed ? 'Updated' : 'Saved'} "${poseName}".`);
    else report(`Saved "${poseName}" for this session only: browser storage is unavailable. Download it to keep it.`, true);
  }

  // ---------------------------------------------------------------------------
  // 4. Pose files: download, copy, import, export all
  // ---------------------------------------------------------------------------
  function downloadPose() {
    const fileName = fileNameFor(name);
    downloadBlob(new Blob([serializePose(editor.document)], { type: 'application/json' }), fileName);
    report(`Downloaded ${fileName}.`);
  }

  async function copyPose() {
    const json = serializePose(editor.document);
    try {
      await navigator.clipboard.writeText(json);
      report('Pose JSON copied to clipboard.');
    } catch {
      console.log(json);
      report('The browser blocked the clipboard, so the pose JSON is in the console instead.', true);
    }
  }

  // Letters followed by saved poses; a saved pose with a letter's name replaces
  // that letter, so "edit A, save as A, export" updates the letter file.
  function exportAll() {
    const byFile = new Map();
    letters.forEach(({ name: letter, pose }) => byFile.set(fileNameFor(letter), pose));
    Object.entries(saved).forEach(([poseName, pose]) => byFile.set(fileNameFor(poseName), pose));
    if (byFile.size === 0) {
      report('Nothing to export yet: save a pose first.', true);
      return;
    }
    const files = [...byFile].map(([fileName, pose]) => ({ name: fileName, data: serializePose(pose) }));
    files.push({ name: 'index.json', data: JSON.stringify([...byFile.keys()], null, 2) + '\n' });
    downloadBlob(createZip(files), 'letters.zip');
    report(`Exported ${byFile.size} pose(s) with index.json. Unzip into letters/ to replace it.`);
  }

  // Load one pose into the editor
  function loadIntoEditor(pose, poseName) {
    editor.loadPose(pose);
    editor.commitEdit();
    if (poseName) setName(poseName);
  }

  // One file opens in the editor; several are added to Saved Poses
  async function importFiles(files) {
    const results = await readPoseFiles(files);
    const ok = results.filter((r) => r.pose);
    const failed = results.filter((r) => r.error);
    failed.forEach((r) => console.warn(`Could not import ${r.name}: ${r.error}`));

    let message;
    if (ok.length === 1 && results.length === 1) {
      loadIntoEditor(ok[0].pose, ok[0].name);
      message = `Loaded "${ok[0].name}". Save it to keep it.`;
    } else if (ok.length) {
      updateSaved({ ...saved, ...Object.fromEntries(ok.map(({ name: poseName, pose }) => [poseName, pose])) });
      message = `Imported ${ok.length} pose(s) into Saved Poses.`;
    } else {
      message = 'No valid pose found';
    }
    if (failed.length) {
      message += ` Skipped ${failed.map((r) => `${r.name} (${r.error})`).join(', ')}.`;
    } else if (!ok.length) {
      message += '.';
    }
    report(message, failed.length > 0);
  }

  // Drop .json files anywhere on the page
  const onDrop = useEffectEvent((files) => importFiles(files));
  useEffect(() => {
    const onDragOver = (e) => {
      if (!e.dataTransfer.types.includes('Files')) return;
      e.preventDefault();
      document.body.classList.add('is-drop-target');
    };
    const onDragLeave = (e) => {
      if (e.relatedTarget === null) document.body.classList.remove('is-drop-target');
    };
    const onDropFiles = (e) => {
      document.body.classList.remove('is-drop-target');
      if (!e.dataTransfer.files.length) return;
      e.preventDefault();
      onDrop([...e.dataTransfer.files]);
    };
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDropFiles);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDropFiles);
    };
  }, []);

  // Paste pose JSON (e.g. from a letter file) while not typing in a text field.
  // On Linux, releasing the middle button pastes the selected text, and the
  // middle button pans the hand, so a paste right after it is ignored.
  const onPaste = useEffectEvent((pose) => {
    loadIntoEditor(pose);
    report('Pasted pose loaded. Name it and save it to keep it.');
  });
  useEffect(() => {
    let middleUp = -Infinity;
    const onPointerUp = (e) => {
      if (e.button === 1) middleUp = e.timeStamp;
    };
    const onPasteText = (e) => {
      if (e.timeStamp - middleUp < 500) return;
      if (e.target.matches('input[type="text"], textarea')) return;
      let pose;
      try {
        pose = normalizePose(JSON.parse(e.clipboardData.getData('text')));
      } catch {
        return; // not a pose: ignore
      }
      e.preventDefault();
      onPaste(pose);
    };
    // pointerup, not mouseup: the hand's controls cancel the mouse events
    window.addEventListener('pointerup', onPointerUp, true);
    document.addEventListener('paste', onPasteText);
    return () => {
      window.removeEventListener('pointerup', onPointerUp, true);
      document.removeEventListener('paste', onPasteText);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 5. Transition and movement previews
  // ---------------------------------------------------------------------------
  // Keys are library keys, or null for the step being edited
  function playTransition(fromKey, toKey, duration) {
    const resolve = (key) => (key === null ? editor.pose : findPose(key, { letters, saved }));
    hand.playTransition(resolve(fromKey), resolve(toKey), duration);
  }

  // The movement being edited, from its first step to its last
  function playMotion() {
    hand.playMotion(editor.document);
  }

  // ---------------------------------------------------------------------------
  // 6. View settings
  // ---------------------------------------------------------------------------
  function chooseMode(next) {
    setMode(next);
    document.documentElement.dataset.mode = next;
    writeSetting('hand-mode', next);
  }

  function chooseSide(next) {
    setSide(next);
    writeSetting('hand-side', next);
  }

  // Keyboard: Ctrl+S saves the pose, from anywhere (the browser's own Save
  // Page is no use here). Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y) undo and redo in
  // the editor; text fields keep their own undo.
  const onKeyDown = useEffectEvent((e) => {
    const key = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && key === 's') {
      e.preventDefault();
      savePose();
      return;
    }
    if (e.target.matches('input[type="text"], textarea, select')) return;
    if ((e.ctrlKey || e.metaKey) && (key === 'z' || key === 'y')) {
      e.preventDefault();
      if (key === 'y' || e.shiftKey) editor.redo();
      else editor.undo();
      return;
    }
    // ← and → step through the board, unless a slider or the finger tabs
    // already use them
    const step = { arrowleft: -1, arrowright: 1 }[key];
    if (step && !e.ctrlKey && !e.metaKey && !e.altKey && !e.defaultPrevented && !e.target.matches('input, [role="tab"]')) {
      e.preventDefault();
      stepBoard(step);
    }
  });
  useEffect(() => {
    const listener = (e) => onKeyDown(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  return (
    <>
      <TopBar
        mode={mode}
        onModeChange={chooseMode}
        name={name}
        onNameChange={setName}
        saveState={saveState}
        onSave={savePose}
      />
      <Library
        active={editor.active}
        letters={letters}
        lettersStatus={letterState.status}
        saved={saved}
        onSelect={selectPose}
        onDelete={deleteSavedPose}
        onImport={importFiles}
        onExportAll={exportAll}
        onDeleteAll={deleteAllData}
      />
      <Stage
        stageRef={stageRef}
        status={status}
        history={editor}
        onSave={savePose}
        side={side}
        onSideChange={chooseSide}
        numbers={numbers}
        onNumbersChange={setNumbers}
        onResetView={hand.resetView}
        transition={{ letters, savedNames: Object.keys(saved), onPlay: playTransition }}
      />
      <PoseEditor
        ref={editorPanel}
        editor={editor}
        onHighlight={hand.highlightFinger}
        onReport={report}
        onPlayMotion={playMotion}
        files={{ onDownload: downloadPose, onCopy: copyPose }}
      />
    </>
  );
}
