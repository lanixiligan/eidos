import { Fragment, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { EDITOR_GROUPS, groupActions, resetAllFingers } from '../lib/joints.js';
import { FINGER_NUMBERS } from '../pose.js';
import { FileActions } from './FileActions.jsx';
import { Flap } from './Flap.jsx';
import { JointRow } from './JointRow.jsx';
import { MotionPanel } from './MotionPanel.jsx';
import { AlertIcon, ResetIcon } from './icons.jsx';

const tabId = (finger) => `finger-tab-${finger}`;

// After the fingers and the hand, the steps of a movement
const MOTION = 'motion';
const TABS = [...EDITOR_GROUPS, { finger: MOTION, tab: 'Motion', title: 'Movement steps', code: 'M' }];

// Finger tabs, numbered like the fingertips on the hand (the hand is H, the
// movement steps M). Arrow keys move between them, like any tab list.
function FingerTabs({ active, onSelect, onHighlight }) {
  const tabs = useRef({});

  function onKeyDown(e) {
    const offset = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (!offset) return;
    e.preventDefault();
    const i = TABS.findIndex((g) => g.finger === active);
    const next = TABS[(i + offset + TABS.length) % TABS.length].finger;
    onSelect(next);
    tabs.current[next].focus();
  }

  return (
    <div className="tabs" role="tablist" aria-label="Finger" onKeyDown={onKeyDown}>
      {TABS.map(({ finger, tab, title, code }) => {
        const selected = finger === active;
        return (
          <button
            key={finger}
            id={tabId(finger)}
            ref={(el) => {
              tabs.current[finger] = el;
            }}
            className={selected ? 'tab active' : 'tab'}
            type="button"
            role="tab"
            aria-controls="joint-controls"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            title={finger in FINGER_NUMBERS ? `${title} (finger ${FINGER_NUMBERS[finger]})` : title}
            onClick={() => onSelect(finger)}
            onPointerEnter={() => onHighlight(finger, true)}
            onPointerLeave={() => onHighlight(finger, false)}
          >
            <Flap text={String(FINGER_NUMBERS[finger] ?? code ?? 'H')} size="sm" />
            <span className="tab-label">{tab ?? title}</span>
          </button>
        );
      })}
    </div>
  );
}

// "Reset all fingers" throws away the work on five fingers at once, so it sits
// apart from the per-finger resets and asks first, in place. Keep fingers
// takes the focus, Escape cancels, and the focus goes back to the button.
function ResetAllFingers({ onReset }) {
  const [asking, setAsking] = useState(false);
  const opener = useRef(null);
  const keep = useRef(null);
  const asked = useRef(false);

  useEffect(() => {
    if (asking) keep.current.focus();
    else if (asked.current) opener.current.focus();
    asked.current = asking;
  }, [asking]);

  if (!asking) {
    return (
      <div className="footer-row">
        <span className="board-label">All fingers</span>
        <button ref={opener} className="btn" type="button" title="Straighten every finger; asks first" onClick={() => setAsking(true)}>
          <ResetIcon size={14} />
          Reset all fingers…
        </button>
      </div>
    );
  }

  return (
    <div
      className="reset-warning"
      role="alertdialog"
      aria-labelledby="reset-warning-text"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setAsking(false);
      }}
    >
      <p id="reset-warning-text">
        <AlertIcon size={16} />
        <span>Straighten all five fingers? The hand rotation stays, and Ctrl+Z undoes it.</span>
      </p>
      <div className="pair">
        <button ref={keep} className="btn" type="button" onClick={() => setAsking(false)}>
          Keep fingers
        </button>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            setAsking(false);
            onReset();
          }}
        >
          Reset all fingers
        </button>
      </div>
    </div>
  );
}

// The heading over a run of controls: what they are, then their unit
function ControlsHead({ name, unit }) {
  return (
    <div className="joint-head" aria-hidden="true">
      <span>{name}</span>
      <span>{unit}</span>
    </div>
  );
}

// The pose editor panel. `ref` gets { jumpToFinger(finger) }, used when a
// fingertip number on the hand is clicked. onPlayMotion plays the movement.
export function PoseEditor({ ref, editor, onHighlight, onReport, onPlayMotion, files }) {
  const { pose, editPose, commitEdit } = editor;
  const stepCount = 1 + (editor.document.motion?.length ?? 0);
  const [activeFinger, setActiveFinger] = useState(EDITOR_GROUPS[0].finger);
  const joints = useRef(null);
  const group = EDITOR_GROUPS.find((g) => g.finger === activeFinger);

  function selectFinger(finger) {
    onHighlight(activeFinger, false);
    setActiveFinger(finger);
  }

  useImperativeHandle(ref, () => ({
    // Open that finger's tab and point at its joints
    jumpToFinger(finger) {
      flushSync(() => selectFinger(finger));
      const el = joints.current;
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      el.classList.remove('is-flashing');
      void el.offsetWidth; // restart the flash animation
      el.classList.add('is-flashing');
      el.querySelector('input').focus({ preventScroll: true });
    },
  }));

  // Shortcuts beside the finger tabs set some fields and keep the rest
  function runAction(apply) {
    editPose(apply);
    commitEdit();
  }

  // Only the shown step: the other steps of a movement stay
  function resetAll() {
    editPose((p) => Object.assign(p, resetAllFingers(p)));
    commitEdit();
    onReport('Straightened all five fingers. Ctrl+Z undoes it.');
  }

  return (
    <aside className="inspector" aria-labelledby="pose-editor-title">
      <h2 id="pose-editor-title" className="visually-hidden">
        Pose editor
      </h2>

      <FingerTabs active={activeFinger} onSelect={selectFinger} onHighlight={onHighlight} />

      {activeFinger === MOTION ? (
        <div className="inspector-body" role="tabpanel" aria-labelledby={tabId(MOTION)}>
          <MotionPanel editor={editor} onPlay={onPlayMotion} />
        </div>
      ) : (
        <div className="inspector-body">
          {/* The shown finger's shortcuts; resetting every finger lives in the
              footer, away from them */}
          <div className="finger-actions">
            {groupActions(group).map((action) => (
              <button key={action.text} className="link-btn" type="button" title={action.title} onClick={() => runAction(action.apply)}>
                {action.text}
              </button>
            ))}
            {/* In a movement, the tabs edit the step picked under Motion */}
            {stepCount > 1 && (
              <span className="board-label step-note">
                Step {editor.step + 1} of {stepCount}
              </span>
            )}
          </div>

          <ControlsHead name={group.head ?? 'Joint'} unit="Angle" />

          {/* Lights up the shown finger on the hand while pointed at or focused */}
          <div
            id="joint-controls"
            ref={joints}
            className="joint-controls"
            role="tabpanel"
            aria-labelledby={tabId(activeFinger)}
            onPointerEnter={() => onHighlight(activeFinger, true)}
            onPointerLeave={(e) => {
              if (!e.currentTarget.contains(document.activeElement)) onHighlight(activeFinger, false);
            }}
            onFocus={() => onHighlight(activeFinger, true)}
            onBlur={(e) => {
              const el = e.currentTarget;
              if (!el.contains(e.relatedTarget) && !el.matches(':hover')) onHighlight(activeFinger, false);
            }}
          >
            {group.controls.map((control) => (
              <Fragment key={`${activeFinger}-${control.label}`}>
                {control.section && <ControlsHead name={control.section[0]} unit={control.section[1]} />}
                <JointRow group={group} control={control} pose={pose} editPose={editPose} commitEdit={commitEdit} onReport={onReport} />
              </Fragment>
            ))}
          </div>

          {/* The ways to set an angle that a slider doesn't show */}
          <p className="editor-help">
            Click a value to type it exactly. <kbd>↑</kbd> <kbd>↓</kbd> step it by 5, or 1 with <kbd>Shift</kbd>.
            Double-click a joint name to set it to 0.
          </p>
        </div>
      )}

      <div className="inspector-footer">
        <FileActions {...files} />
        <ResetAllFingers onReset={resetAll} />
      </div>
    </aside>
  );
}
