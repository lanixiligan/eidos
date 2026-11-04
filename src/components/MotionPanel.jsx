import { useRef } from 'react';
import { useCommitEvent } from '../hooks/useCommitEvent.js';
import { motionSteps } from '../pose.js';
import { Flap } from './Flap.jsx';
import { PlayIcon } from './icons.jsx';

// How long a step takes to reach from the one before, like the Transition
// duration
const MIN_DURATION = 100;
const MAX_DURATION = 2000;
const DURATION_STEP = 50;

const seconds = (ms) => `${(ms / 1000).toFixed(2)} s`;

// The time the shown step takes to reach from the step before
function StepTime({ step, duration, onRetime, onCommit }) {
  const rangeRef = useRef(null);
  useCommitEvent(rangeRef, onCommit);
  const parked = Math.min(MAX_DURATION, Math.max(MIN_DURATION, duration));
  const fill = ((parked - MIN_DURATION) / (MAX_DURATION - MIN_DURATION)) * 100;
  return (
    <div className="joint-row step-time">
      <div className="joint-row-head">
        <label className="joint-name" htmlFor="step-time">
          Time from step {step}
        </label>
        <output className="range-value" htmlFor="step-time">
          {seconds(duration)}
        </output>
      </div>
      <input
        id="step-time"
        ref={rangeRef}
        className="joint-range"
        type="range"
        min={MIN_DURATION}
        max={MAX_DURATION}
        step={DURATION_STEP}
        value={parked}
        aria-valuetext={seconds(duration)}
        style={{ '--fill': `${fill}%` }}
        onChange={(e) => onRetime(e.target.valueAsNumber)}
      />
      <div className="joint-limits" aria-hidden="true">
        <span>{seconds(MIN_DURATION)}</span>
        <span>{seconds(MAX_DURATION)}</span>
      </div>
    </div>
  );
}

// The Motion tab: the steps of a movement, as board rows. The shown step is
// the one the other tabs edit; Add step copies it to change from there, and
// Play runs through every step.
export function MotionPanel({ editor, onPlay }) {
  const { document: pose, step, showStep, addStep, deleteStep, retimeStep, commitEdit } = editor;
  const steps = motionSteps(pose);
  const moves = steps.length > 1;

  function run(action) {
    action();
    commitEdit();
  }

  return (
    <>
      <div className="finger-actions">
        <button className="link-btn" type="button" title="Copy the shown step after it, to change from there" onClick={() => run(addStep)}>
          Add step
        </button>
        <button className="link-btn" type="button" title="Delete the shown step" disabled={!moves} onClick={() => run(deleteStep)}>
          Delete step {step + 1}
        </button>
      </div>

      <div className="joint-head" aria-hidden="true">
        <span>Step</span>
        <span>Time</span>
      </div>

      <ol className="board motion-steps" aria-label="Movement steps">
        {steps.map(({ duration }, i) => {
          const open = i === step;
          return (
            <li key={i} className={open ? 'board-row is-open' : 'board-row'}>
              <button className="board-select" type="button" aria-current={open || undefined} onClick={() => showStep(i)}>
                <Flap text={String(i + 1)} cells={2} size="sm" />
                <span className="board-pose">{i === 0 ? 'Start' : `Step ${i + 1}`}</span>
                <span className="board-state">{i === 0 ? (moves ? 'From here' : 'Still') : `+${seconds(duration)}`}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {step > 0 && (
        <StepTime key={step} step={step} duration={steps[step].duration} onRetime={retimeStep} onCommit={commitEdit} />
      )}

      <button className="btn btn-primary play-motion" type="button" disabled={!moves} onClick={onPlay}>
        <PlayIcon />
        Play movement
      </button>

      <p className="editor-help">
        {moves
          ? 'Pick a step to show it; the finger and Hand tabs edit the step shown. Add step copies it to the next step.'
          : 'Shape the hand where the movement starts, then Add step and change the copy, once for each step.'}{' '}
        Play moves through the steps on one smooth path.
      </p>
    </>
  );
}
