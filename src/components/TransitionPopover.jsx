import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useCommitEvent } from '../hooks/useCommitEvent.js';
import { LETTER_PREFIX, SAVED_PREFIX } from '../lib/library.js';
import { readSetting, writeSetting } from '../lib/settings.js';

const EDIT_OPTION = 'edit';

// How long the move between the two poses takes, remembered per browser
const MIN_DURATION = 100;
const MAX_DURATION = 2000;
const DURATION_STEP = 50;
const DEFAULT_DURATION = 400;

function storedDuration() {
  const ms = Math.round(Number(readSetting('hand-transition-ms')) / DURATION_STEP) * DURATION_STEP;
  return ms ? Math.min(MAX_DURATION, Math.max(MIN_DURATION, ms)) : DEFAULT_DURATION;
}

function PoseSelect({ label, groups, value, fallback, onChange }) {
  // A pose that is not in the lists (not chosen yet, or a deleted saved
  // pose) shows the fallback
  const known = groups.some(([, options]) => options.some(([option]) => option === value));
  return (
    <select aria-label={label} value={known ? value : fallback} onChange={(e) => onChange(e.target.value)}>
      {groups.map(([groupLabel, options]) => (
        <optgroup key={groupLabel} label={groupLabel}>
          {options.map(([option, text]) => (
            <option key={option} value={option}>
              {text}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

// Transition settings: play one pose into another. Opens as a popover above
// the toolbar's Transition button (`anchorRef`). onPlay gets two library keys
// (null for the current edit) and the duration in ms.
export function TransitionPopover({ id, anchorRef, letters, savedNames, onOpenChange, onPlay }) {
  const popoverRef = useRef(null);
  const durationRef = useRef(null);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(EDIT_OPTION);
  const [duration, setDuration] = useState(storedDuration);

  const groups = [
    ['Editor', [[EDIT_OPTION, 'Current edit']]],
    ['Letters', letters.map(({ name }) => [LETTER_PREFIX + name, name])],
    ['Saved', savedNames.map((name) => [SAVED_PREFIX + name, name])],
  ].filter(([, options]) => options.length);
  // Until one is chosen, play from the first letter into the current edit
  const firstLetter = letters.length ? LETTER_PREFIX + letters[0].name : EDIT_OPTION;
  const fromValue = from ?? firstLetter;

  useCommitEvent(durationRef, () => writeSetting('hand-transition-ms', durationRef.current.value));

  const openChanged = useEffectEvent((open) => onOpenChange(open));
  useEffect(() => {
    const popover = popoverRef.current;
    const anchor = anchorRef.current;
    function place() {
      const box = anchor.getBoundingClientRect();
      const width = popover.offsetWidth || Math.min(320, window.innerWidth - 16);
      const left = Math.min(Math.max(8, box.left + box.width / 2 - width / 2), window.innerWidth - width - 8);
      popover.style.left = `${left}px`;
      popover.style.bottom = `${window.innerHeight - box.top + 8}px`;
    }
    const onBeforeToggle = (e) => {
      if (e.newState === 'open') place();
    };
    const onToggle = (e) => openChanged(e.newState === 'open');
    const onResize = () => {
      if (popover.matches(':popover-open')) place();
    };
    popover.addEventListener('beforetoggle', onBeforeToggle);
    popover.addEventListener('toggle', onToggle);
    window.addEventListener('resize', onResize);
    return () => {
      popover.removeEventListener('beforetoggle', onBeforeToggle);
      popover.removeEventListener('toggle', onToggle);
      window.removeEventListener('resize', onResize);
    };
  }, [anchorRef]);

  const asKey = (value) => (value === EDIT_OPTION ? null : value);
  const fill = ((duration - MIN_DURATION) / (MAX_DURATION - MIN_DURATION)) * 100;

  return (
    <div id={id} ref={popoverRef} className="popover" popover="auto" aria-labelledby="transition-title">
      <h2 id="transition-title">Transition</h2>
      <div className="preview-row">
        <PoseSelect label="Transition from" groups={groups} value={fromValue} fallback={EDIT_OPTION} onChange={setFrom} />
        <span aria-hidden="true">to</span>
        <PoseSelect label="Transition to" groups={groups} value={to} fallback={EDIT_OPTION} onChange={setTo} />
      </div>
      <div className="duration">
        <div className="joint-row-head">
          <label className="joint-name" htmlFor="preview-duration">
            Duration
          </label>
          <output className="range-value" htmlFor="preview-duration">
            {duration} ms
          </output>
        </div>
        <input
          id="preview-duration"
          ref={durationRef}
          className="joint-range"
          type="range"
          min={MIN_DURATION}
          max={MAX_DURATION}
          step={DURATION_STEP}
          value={duration}
          style={{ '--fill': `${fill}%` }}
          onChange={(e) => setDuration(e.target.valueAsNumber)}
        />
        <div className="joint-limits" aria-hidden="true">
          <span>{MIN_DURATION} ms</span>
          <span>{MAX_DURATION} ms</span>
        </div>
      </div>
      <button className="btn btn-primary" type="button" onClick={() => onPlay(asKey(fromValue), asKey(to), duration)}>
        Play transition
      </button>
      <p className="hint">Plays one pose into the next in that time, the way they would appear in a row.</p>
    </div>
  );
}
