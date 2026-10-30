import { useState } from 'react';
import { Flap } from './Flap.jsx';
import { Segmented } from './Segmented.jsx';

const MODES = [
  { value: 'dark', label: 'Dark', title: 'Dark theme' },
  { value: 'light', label: 'Light', title: 'Light theme' },
];

export const NAME_LENGTH = 24;
const NAME_CELLS = 8; // the board shows at least this many cells

// The pose as a board line: its name in flap cells (click to type) and
// whether it's saved. Undo, Redo and Save sit on the toolbar under the hand.
export function TopBar({ mode, onModeChange, name, onNameChange, saveState, onSave }) {
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
        <Segmented label="Appearance" options={MODES} value={mode} onChange={onModeChange} />
      </div>
    </header>
  );
}
