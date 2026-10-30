import { useEffect, useRef } from 'react';
import { LETTER_PREFIX, SAVED_PREFIX } from '../lib/library.js';
import { Flap } from './Flap.jsx';
import { CloseIcon } from './icons.jsx';

// One board row: a code in flap cells, the pose, its state. The open pose is
// the inverted row.
function Row({ code, label, state, open, onSelect, children }) {
  return (
    <li className={open ? 'board-row is-open' : 'board-row'}>
      <button className="board-select" type="button" aria-current={open || undefined} onClick={onSelect}>
        <Flap text={code} cells={2} size="sm" />
        <span className="board-pose">{label}</span>
        <span className="board-state">{open ? 'Open' : state}</span>
      </button>
      {children}
    </li>
  );
}

// The pose library as a departure board: letters, then poses saved in this
// browser; choosing a row opens it in the editor. Import and export act on
// the whole library, so they sit at its foot.
export function Library({ active, letters, lettersStatus, saved, onSelect, onDelete, onImport, onExportAll, onDeleteAll }) {
  const fileInput = useRef(null);
  const board = useRef(null);
  const savedNames = Object.keys(saved);

  // Keep the open row in view, e.g. when ← and → step through the board
  useEffect(() => {
    board.current.querySelector('.board-row.is-open')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <aside className="library" aria-label="Pose library" ref={board}>
      <div className="board-head" aria-hidden="true">
        <span>Code</span>
        <span>Pose</span>
        <span>State</span>
      </div>

      <div className="board-scroll">
        <section aria-labelledby="letters-title">
          <h2 id="letters-title" className="board-section">
            Letters
          </h2>
          <ul className="board">
            {letters.map(({ name }) => {
              const key = LETTER_PREFIX + name;
              return (
                <Row key={key} code={name} label={`Letter ${name}`} state="Ready" open={active === key} onSelect={() => onSelect(key)} />
              );
            })}
          </ul>
          {lettersStatus && <p className="hint board-note">{lettersStatus}</p>}
        </section>

        <section aria-labelledby="saved-title">
          <h2 id="saved-title" className="board-section">
            Saved in this browser
          </h2>
          {savedNames.length === 0 ? (
            <p className="hint board-note">Nothing saved yet. Shape the hand, name it and save it.</p>
          ) : (
            <ul className="board">
              {savedNames.map((name, i) => {
                const key = SAVED_PREFIX + name;
                return (
                  <Row
                    key={key}
                    code={String(i + 1).padStart(2, '0')}
                    label={name}
                    state="Saved"
                    open={active === key}
                    onSelect={() => onSelect(key)}
                  >
                    <button
                      className="board-delete"
                      type="button"
                      title={`Delete "${name}"`}
                      aria-label={`Delete saved pose ${name}`}
                      onClick={() => onDelete(name)}
                    >
                      <CloseIcon size={14} />
                    </button>
                  </Row>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="board-foot">
        <p className="hint">
          <kbd>←</kbd> <kbd>→</kbd> step through the board
        </p>
        <div className="pair">
          <button className="btn" type="button" title="Load pose .json files, or drop or paste them anywhere" onClick={() => fileInput.current.click()}>
            Import
          </button>
          <button className="btn" type="button" title="Letters and saved poses with index.json, as a zip to unzip into letters/" onClick={onExportAll}>
            Export all
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          multiple
          hidden
          onChange={(e) => {
            onImport([...e.target.files]);
            e.target.value = ''; // allow importing the same file again
          }}
        />
        <button className="link-btn" type="button" title="Delete your saved poses and settings from this browser" onClick={onDeleteAll}>
          Delete all site data
        </button>
      </div>
    </aside>
  );
}
