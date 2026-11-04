import { useMemo, useReducer } from 'react';
import { clonePose, motionSteps, stillPose } from '../pose.js';

const HISTORY_LIMIT = 100;
// How long a new movement step takes to reach, from the step before (ms)
export const NEW_STEP_DURATION = 400;

const samePose = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const stepCount = (pose) => 1 + (pose.motion?.length ?? 0);
const clampStep = (pose, step) => Math.min(step, stepCount(pose) - 1);

// The fields of step `i` in a (cloned) pose, to write into: the pose itself
// for the first step, else that step of its motion
const stepFields = (pose, i) => (i === 0 ? pose : pose.motion[i - 1].pose);

// A pose from its list of steps, [{ duration, pose }] (see motionSteps): the
// first step's duration has no use and goes
function fromSteps(steps) {
  const [first, ...rest] = steps;
  const pose = clonePose(first.pose);
  if (rest.length) pose.motion = rest;
  return pose;
}

// Change the list of steps, then show step `show` of the result
function editSteps(state, change) {
  const steps = motionSteps(state.pose);
  const show = change(steps);
  if (show === undefined) return state;
  return { ...state, pose: fromSteps(steps), step: show, active: null };
}

// The pose being edited (with its movement steps, if any), the step shown
// and edited, the library button it came from (null once it is edited by
// hand), and undo / redo snapshots taken whenever an edit is finished.
// Poses in this state are never mutated, only replaced.
function reducer(state, action) {
  switch (action.type) {
    case 'select':
      return { ...state, pose: clonePose(action.pose), step: 0, active: action.key };
    case 'edit': {
      const pose = clonePose(state.pose);
      action.change(stepFields(pose, state.step));
      return { ...state, pose, active: null };
    }
    case 'load':
      return { ...state, pose: clonePose(action.pose), step: 0, active: null };
    case 'mark':
      return { ...state, active: action.key };
    case 'show':
      return { ...state, step: Math.max(0, clampStep(state.pose, action.step)) };
    case 'addStep':
      // A copy of the last step, at the end, to carry the movement on
      return editSteps(state, (steps) => {
        steps.push({ duration: NEW_STEP_DURATION, pose: clonePose(steps.at(-1).pose) });
        return steps.length - 1;
      });
    case 'cloneStep':
      // A copy of the shown step, right after it
      return editSteps(state, (steps) => {
        steps.splice(state.step + 1, 0, { duration: NEW_STEP_DURATION, pose: clonePose(steps[state.step].pose) });
        return state.step + 1;
      });
    case 'deleteStep':
      // Deleting the first step makes the second the start
      return editSteps(state, (steps) => {
        if (steps.length < 2) return undefined;
        steps.splice(state.step, 1);
        return Math.max(0, state.step - 1);
      });
    case 'moveStep':
      // Swap the shown step with the one before or after it. The times stay
      // where they are, so the rhythm of the movement keeps its shape.
      return editSteps(state, (steps) => {
        const other = state.step + action.offset;
        if (other < 0 || other >= steps.length) return undefined;
        [steps[state.step].pose, steps[other].pose] = [steps[other].pose, steps[state.step].pose];
        return other;
      });
    case 'retime': {
      if (state.step === 0) return state;
      const pose = clonePose(state.pose);
      pose.motion[state.step - 1].duration = action.duration;
      return { ...state, pose, active: null };
    }
    case 'commit':
      if (samePose(state.pose, state.committed)) return state;
      return {
        ...state,
        undo: [...state.undo, state.committed].slice(-HISTORY_LIMIT),
        redo: [],
        committed: state.pose,
      };
    case 'undo':
    case 'redo': {
      const [from, to] = action.type === 'undo' ? ['undo', 'redo'] : ['redo', 'undo'];
      if (!state[from].length) return state;
      const pose = state[from].at(-1);
      return {
        ...state,
        pose,
        step: clampStep(pose, state.step),
        active: null,
        committed: pose,
        [from]: state[from].slice(0, -1),
        [to]: [...state[to], state.pose],
      };
    }
    default:
      throw new Error(`unknown editor action "${action.type}"`);
  }
}

function initialState(initialPose) {
  const pose = clonePose(initialPose);
  return { pose, step: 0, active: null, committed: pose, undo: [], redo: [] };
}

// Every edit made by hand goes through editPose(change) (or loadPose(pose)),
// which clears the selected library button. A finished edit calls
// commitEdit(), which adds one undo step. `pose` is the step shown (a still
// pose), `document` the whole pose with its movement, for files and saving.
export function usePoseEditor(initialPose) {
  const [state, dispatch] = useReducer(reducer, initialPose, initialState);
  const actions = useMemo(
    () => ({
      /** Start from a library pose and show its button as selected. */
      selectPose: (key, pose) => dispatch({ type: 'select', key, pose }),
      /** Change some fields of the shown step: `change` gets a copy to write into. */
      editPose: (change) => dispatch({ type: 'edit', change }),
      /** Replace the whole pose, movement and all (import, paste). */
      loadPose: (pose) => dispatch({ type: 'load', pose }),
      /** Show a library button as selected, without changing the pose. */
      markActive: (key) => dispatch({ type: 'mark', key }),
      /** Show and edit movement step `step` (0 is the first). */
      showStep: (step) => dispatch({ type: 'show', step }),
      /** Add a copy of the last step at the end, and show that. */
      addStep: () => dispatch({ type: 'addStep' }),
      /** Add a copy of the shown step right after it, and show that. */
      cloneStep: () => dispatch({ type: 'cloneStep' }),
      /** Swap the shown step with the next (offset 1) or the one before (-1). */
      moveStep: (offset) => dispatch({ type: 'moveStep', offset }),
      /** Delete the shown step (the last one left stays). */
      deleteStep: () => dispatch({ type: 'deleteStep' }),
      /** Set how long the shown step takes to reach from the one before (ms). */
      retimeStep: (duration) => dispatch({ type: 'retime', duration }),
      commitEdit: () => dispatch({ type: 'commit' }),
      undo: () => dispatch({ type: 'undo' }),
      redo: () => dispatch({ type: 'redo' }),
    }),
    []
  );
  // A new object only when the pose or the shown step changes, since the
  // hand eases to it whenever it does
  const shown = useMemo(() => stillPose(stepFields(state.pose, state.step)), [state.pose, state.step]);
  return {
    pose: shown,
    document: state.pose,
    step: state.step,
    canUndo: state.undo.length > 0,
    canRedo: state.redo.length > 0,
    active: state.active,
    ...actions,
  };
}
