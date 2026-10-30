import { useRef, useState } from 'react';
import { PlayIcon, RedoIcon, ResetIcon, UndoIcon } from './icons.jsx';
import { Segmented } from './Segmented.jsx';
import { TransitionPopover } from './TransitionPopover.jsx';

const SIDES = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

// The 3D hand (drawn into #stage by hand.js) and the toolbar under it
export function Stage({ stageRef, history, side, onSideChange, numbers, onNumbersChange, onResetView, transition }) {
  const transitionBtn = useRef(null);
  const [transitionOpen, setTransitionOpen] = useState(false);

  return (
    <main className="stage-wrap">
      <div id="stage" ref={stageRef} />

      <p className="stage-hint">Drag to rotate, middle-drag to move, scroll to zoom</p>

      <div className="stage-toolbar" role="toolbar" aria-label="Editor and view">
        <button className="btn btn-icon" type="button" aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!history.canUndo} onClick={history.undo}>
          <UndoIcon />
        </button>
        <button className="btn btn-icon" type="button" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" disabled={!history.canRedo} onClick={history.redo}>
          <RedoIcon />
        </button>
        <span className="toolbar-divider" aria-hidden="true" />
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
