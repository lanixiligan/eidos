import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { EDITOR_GROUPS, groupActions, resetAllFingers } from '../lib/joints.js';
import { FINGER_NUMBERS } from '../pose.js';
import { FileActions } from './FileActions.jsx';
import { Flap } from './Flap.jsx';
import { JointRow } from './JointRow.jsx';
import { AlertIcon, ResetIcon } from './icons.jsx';

const tabId = (finger) => `finger-tab-${finger}`;

// Finger tabs, numbered like the fingertips on the hand (the hand rotation
// is H). Arrow keys move between them, like any tab list.
function FingerTabs({ active, onSelect, onHighlight }) {
  const tabs = useRef({});

  function onKeyDown(e) {
    const offset = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (!offset) return;
    e.preventDefault();
    const i = EDITOR_GROUPS.findIndex((g) => g.finger === active);
    const next = EDITOR_GROUPS[(i + offset + EDITOR_GROUPS.length) % EDITOR_GROUPS.length].finger;
    onSelect(next);
    tabs.current[next].focus();
  }

  return (
    <div className="tabs" role="tablist" aria-label="Finger" onKeyDown={onKeyDown}>
      {EDITOR_GROUPS.map(({ finger, tab, title }) => {
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
            <Flap text={String(FINGER_NUMBERS[finger] ?? 'H')} size="sm" />
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

// The pose editor panel. `ref` gets { jumpToFinger(finger) }, used when a
// fingertip number on the hand is clicked.
export function PoseEditor({ ref, editor, onHighlight, onReport, files }) {
  const { pose, editPose, loadPose, commitEdit } = editor;
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

  function resetAll() {
    loadPose(resetAllFingers(pose));
    commitEdit();
    onReport('Straightened all five fingers. Ctrl+Z undoes it.');
  }

  return (
    <aside className="inspector" aria-labelledby="pose-editor-title">
      <h2 id="pose-editor-title" className="visually-hidden">
        Pose editor
      </h2>

      <FingerTabs active={activeFinger} onSelect={selectFinger} onHighlight={onHighlight} />

      <div className="inspector-body">
        {/* The shown finger's shortcuts; resetting every finger lives in the
            footer, away from them */}
        <div className="finger-actions">
          {groupActions(group).map((action) => (
            <button key={action.text} className="link-btn" type="button" title={action.title} onClick={() => runAction(action.apply)}>
              {action.text}
            </button>
          ))}
        </div>

        <div className="joint-head" aria-hidden="true">
          <span>Joint</span>
          <span>Angle</span>
        </div>

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
            <JointRow
              key={`${activeFinger}-${control.label}`}
              group={group}
              control={control}
              pose={pose}
              editPose={editPose}
              commitEdit={commitEdit}
              onReport={onReport}
            />
          ))}
        </div>

        {/* The ways to set an angle that a slider doesn't show */}
        <p className="editor-help">
          Click an angle to type it exactly. <kbd>↑</kbd> <kbd>↓</kbd> step it by 5°, or 1° with <kbd>Shift</kbd>.
          Double-click a joint name to set it to 0°.
        </p>
      </div>

      <div className="inspector-footer">
        <FileActions {...files} />
        <ResetAllFingers onReset={resetAll} />
      </div>
    </aside>
  );
}
