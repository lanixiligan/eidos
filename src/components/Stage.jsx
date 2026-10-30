import { useRef, useState } from 'react';
import { AlertIcon, CheckIcon, PlayIcon, ResetIcon } from './icons.jsx';
import { Segmented } from './Segmented.jsx';
import { TransitionPopover } from './TransitionPopover.jsx';

const SIDES = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

// The message strip over the hand: what the last action did, or how to move
// the view when nothing has happened yet. A new message shows at full
// strength, then settles unless it's a problem; the key restarts that.
function StatusStrip({ status }) {
  const StatusIcon = status.problem ? AlertIcon : CheckIcon;
  return (
    <div className="status-strip" role="status" aria-live="polite">
      {status.text ? (
        <p key={status.id} className={status.problem ? 'status is-problem' : 'status'}>
          <StatusIcon size={14} />
          <span>{status.text}</span>
        </p>
      ) : (
        <p className="status-hint">Drag to turn, middle-drag to move, scroll to zoom</p>
      )}
    </div>
  );
}

// The 3D hand (drawn into #stage by hand.js), the message strip and the
// view toolbar under it
export function Stage({ stageRef, status, side, onSideChange, numbers, onNumbersChange, onResetView, transition }) {
  const transitionBtn = useRef(null);
  const [transitionOpen, setTransitionOpen] = useState(false);

  return (
    <main className="stage-wrap">
      <div id="stage" ref={stageRef} />

      <StatusStrip status={status} />

      <div className="stage-toolbar" role="toolbar" aria-label="View">
        <Segmented label="Hand" options={SIDES} value={side} onChange={onSideChange} />
        <button className="btn" type="button" aria-pressed={numbers} title="Show a number on each fingertip" onClick={() => onNumbersChange(!numbers)}>
          Numbers
        </button>
        <button
          id="transition-btn"
          ref={transitionBtn}
          className="btn"
          type="button"
          popoverTarget="transition-popover"
          aria-expanded={transitionOpen}
          title="Transition settings: play one pose into another"
        >
          <PlayIcon />
          <span className="btn-label">Transition</span>
        </button>
        <button className="btn btn-icon" type="button" aria-label="Reset view" title="Reset view" onClick={onResetView}>
          <ResetIcon />
        </button>
      </div>

      <TransitionPopover id="transition-popover" anchorRef={transitionBtn} onOpenChange={setTransitionOpen} {...transition} />
    </main>
  );
}
