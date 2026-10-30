import { useLayoutEffect, useRef, useState } from 'react';
import { useCommitEvent } from '../hooks/useCommitEvent.js';
import { DEG, controlName, setAngle, shownDegrees, stepFrom } from '../lib/joints.js';

const STEP = 5; // degrees per up or down key; Shift for FINE_STEP
const FINE_STEP = 1;

// The value beside a joint's name: type an exact angle, or step it with the
// up and down keys. Retyping the shown whole degree keeps the exact value.
function ValueField({ label, degrees, onApply, onCommit }) {
  const inputRef = useRef(null);
  const [draft, setDraft] = useState(null); // text being typed; null shows the angle
  const cancelled = useRef(false);
  const reselect = useRef(false);

  // A step rewrites the value; keep it selected so the next key replaces it
  useLayoutEffect(() => {
    if (reselect.current) {
      reselect.current = false;
      inputRef.current.select();
    }
  });

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      cancelled.current = true;
      e.currentTarget.blur();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      onApply(stepFrom(degrees, (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? FINE_STEP : STEP)));
      onCommit();
      setDraft(null);
      reselect.current = true;
    }
  }

  function onBlur() {
    const deg = parseFloat((draft ?? '').replace(',', '.'));
    if (!cancelled.current && Number.isFinite(deg) && deg !== degrees) {
      onApply(deg);
      onCommit();
    }
    cancelled.current = false;
    setDraft(null);
  }

  return (
    <input
      ref={inputRef}
      className="joint-value"
      type="text"
      inputMode="decimal"
      spellCheck={false}
      autoComplete="off"
      aria-label={`${label}, exact degrees`}
      value={draft ?? `${degrees}°`}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    />
  );
}

// One row per joint: name and value, then a slider with its range under it
export function JointRow({ group, control, pose, editPose, commitEdit }) {
  const rangeRef = useRef(null);
  useCommitEvent(rangeRef, commitEdit);

  const label = controlName(group, control);
  const degrees = shownDegrees(group, control, pose);
  const apply = (deg) => editPose((p) => setAngle(group, control, p, deg * DEG));
  const { min, max } = control;
  // A value past the ends parks the thumb there; the field shows the real one
  const parked = Math.min(max, Math.max(min, degrees));

  // Double-click the name to set the joint to 0°
  function zero() {
    apply(0);
    commitEdit();
  }

  return (
    <div className="joint-row" title={control.title}>
      <div className="joint-row-head">
        <span className="joint-name" onDoubleClick={zero}>
          {control.label}
          {control.hint && <small>{control.hint}</small>}
        </span>
        <ValueField label={label} degrees={degrees} onApply={apply} onCommit={commitEdit} />
      </div>
      <input
        ref={rangeRef}
        className="joint-range"
        type="range"
        min={min}
        max={max}
        step={1}
        value={parked}
        aria-label={label}
        aria-valuetext={control.format(control.get(pose))}
        style={{ '--fill': `${((parked - min) / (max - min)) * 100}%` }}
        onChange={(e) => apply(e.target.valueAsNumber)}
      />
      <div className="joint-limits" aria-hidden="true">
        <span>{min}°</span>
        <span>{max}°</span>
      </div>
    </div>
  );
}
