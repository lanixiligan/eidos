import { LETTER_PREFIX, SAVED_PREFIX } from '../lib/library.js';

const activeClass = (base, on) => (on ? `${base} active` : base);

// Letters and saved poses; choosing one opens it in the editor
export function Library({ active, letters, lettersStatus, saved, onSelect, onDelete, onDeleteAll }) {
  const savedNames = Object.keys(saved);
  return (
    <aside className="library" aria-label="Pose library">
      <section className="panel-section">
        <h2>Letters</h2>
        <div className="letters-grid">
          {letters.map(({ name }) => {
            const key = LETTER_PREFIX + name;
            return (
              <button key={key} className={activeClass('pose-btn', active === key)} type="button" title={name} onClick={() => onSelect(key)}>
                {name}
              </button>
            );
          })}
        </div>
        <p className="hint">{lettersStatus}</p>
      </section>

      <section className="panel-section">
        <h2>Saved poses</h2>
        <div className="saved-grid">
          {savedNames.map((name) => {
            const key = SAVED_PREFIX + name;
            // A select button with a delete button beside it
            return (
              <div key={key} className={activeClass('saved-pose', active === key)}>
                <button className="saved-select" type="button" title={name} onClick={() => onSelect(key)}>
                  {name}
                </button>
                <button
                  className="delete"
                  type="button"
                  title={`Delete "${name}"`}
                  aria-label={`Delete saved pose ${name}`}
                  onClick={() => onDelete(name)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
        {savedNames.length === 0 && <p className="hint">Nothing saved yet. Shape the hand and save it.</p>}
        <button
          className="btn btn-small delete-data"
          type="button"
          title="Delete your saved poses and settings from this browser"
          onClick={onDeleteAll}
        >
          Delete all site data
        </button>
      </section>
    </aside>
  );
}
