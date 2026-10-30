import { useImperativeHandle, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { EDITOR_GROUPS, groupActions, resetAllFingers } from '../lib/joints.js';
import { FINGER_NUMBERS } from '../pose.js';
import { FileActions } from './FileActions.jsx';
import { JointRow } from './JointRow.jsx';
import { ResetIcon } from './icons.jsx';

// Finger tabs, numbered like the fingertips on the hand (the hand rotation
// gets ↻). Arrow keys move between them, like any tab list.
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
    <div className="segmented tabs" role="tablist" aria-labelledby="finger-label" onKeyDown={onKeyDown}>
      {EDITOR_GROUPS.map(({ finger, tab, title }) => {
        const selected = finger === active;
        return (
          <button
            key={finger}
            ref={(el) => {
              tabs.current[finger] = el;
            }}
            className={selected ? 'active' : undefined}
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
            <span className="tab-number" aria-hidden="true">
              {FINGER_NUMBERS[finger] ?? '↻'}
            </span>
            {tab ?? title}
          </button>
        );
      })}
    </div>
  );
}

// The pose editor panel. `ref` gets { jumpToFinger(finger) }, used when a
// fingertip number on the hand is clicked.
export function PoseEditor({ ref, editor, name, onNameChange, onHighlight, files }) {
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
  }

  return (
    <aside className="inspector" aria-label="Pose editor">
      <div className="inspector-header">
        <h2>Pose editor</h2>
      </div>

      <div className="inspector-body">
        <div className="field">
          <label className="field-label" htmlFor="pose-name">
            Name
          </label>
          <input
            id="pose-name"
            className="text-input"
            type="text"
            placeholder="e.g. A"
            maxLength={24}
            autoComplete="off"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') files.onSave();
            }}
          />
        </div>

        <div className="field">
          <div className="field-head">
            <span id="finger-label" className="field-label">
              Finger
            </span>
            <span className="field-actions">
              {groupActions(group).map((action) => (
                <button key={action.text} className="link-btn" type="button" title={action.title} onClick={() => runAction(action.apply)}>
                  {action.text}
                </button>
              ))}
            </span>
          </div>
          <FingerTabs active={activeFinger} onSelect={selectFinger} onHighlight={onHighlight} />
        </div>

        {/* Lights up the shown finger on the hand while pointed at or focused */}
        <div
          id="joint-controls"
          ref={joints}
          className="joint-controls"
          role="tabpanel"
          aria-labelledby="finger-label"
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
            />
          ))}
        </div>

        <div className="editor-help">
          <button className="btn btn-small" type="button" title="Straighten every finger; the hand rotation stays" onClick={resetAll}>
            <ResetIcon size={14} />
            Reset all fingers
          </button>
        </div>
      </div>

      <FileActions {...files} />
    </aside>
  );
}
