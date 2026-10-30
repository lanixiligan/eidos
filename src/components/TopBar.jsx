import { useState } from 'react';
import { Flap } from './Flap.jsx';
import { RedoIcon, UndoIcon } from './icons.jsx';
import { Segmented } from './Segmented.jsx';

const MODES = [
  { value: 'dark', label: 'Dark', title: 'Dark theme with a white hand' },
  { value: 'light', label: 'Light', title: 'Light theme with a black hand' },
];

export const NAME_LENGTH = 24;
const NAME_CELLS = 8; // the board shows at least this many cells

// The pose as a board line: its name in flap cells (click to type), whether
// it's saved, and the actions on the pose as a whole
export function TopBar({ mode, onModeChange, name, onNameChange, saveState, history, onSave }) {
  const [typing, setTyping] = useState(false);
  const atLimit = name.length >= NAME_LENGTH;

  return (
    <header className="topbar">
      <h1 className="brand">
        <Flap text="EIDOS" size="sm" />
        <span className="visually-hidden">Eidos, 3D hand studio</span>
      </h1>

      <div className="pose-line">
        <label className="board-label" htmlFor="pose-name">
          Pose
        </label>
        <span className={typing ? 'flap-field is-typing' : 'flap-field'}>
          <Flap text={name} cells={Math.max(NAME_CELLS, name.length)} size="lg" placeholder="NAME" />
          <input
            id="pose-name"
            className="flap-input"
            type="text"
            placeholder="Name"
            maxLength={NAME_LENGTH}
            autoComplete="off"
            spellCheck={false}
            aria-describedby="save-state"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onFocus={(e) => {
              setTyping(true);
              e.currentTarget.select();
            }}
            onBlur={() => setTyping(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave();
            }}
          />
        </span>
        <span id="save-state" className="save-state">
          <span className={saveState.saved ? 'mark is-on' : 'mark'} aria-hidden="true" />
          <Flap text={saveState.label} cells={9} size="sm" />
          <span className="visually-hidden">{saveState.label.toLowerCase()}</span>
          {atLimit && <span className="limit">Names stop at {NAME_LENGTH} characters</span>}
        </span>
      </div>

      <div className="topbar-actions">
        <button className="btn btn-icon" type="button" aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!history.canUndo} onClick={history.undo}>
          <UndoIcon />
        </button>
        <button className="btn btn-icon" type="button" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" disabled={!history.canRedo} onClick={history.redo}>
          <RedoIcon />
        </button>
        <button className="btn btn-primary save-btn" type="button" title="Save pose in this browser (Ctrl+S)" onClick={onSave}>
          Save
        </button>
        <Segmented label="Appearance" options={MODES} value={mode} onChange={onModeChange} />
      </div>
    </header>
  );
}
