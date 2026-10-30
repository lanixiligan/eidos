import { useMemo, useReducer } from 'react';
import { clonePose } from '../pose.js';

const HISTORY_LIMIT = 100;

const samePose = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// The pose being edited, the library button it came from (null once it is
// edited by hand), and undo / redo snapshots taken whenever an edit is
// finished. Poses in this state are never mutated, only replaced.
function reducer(state, action) {
  switch (action.type) {
    case 'select':
      return { ...state, pose: clonePose(action.pose), active: action.key };
    case 'edit': {
      const pose = clonePose(state.pose);
      action.change(pose);
      return { ...state, pose, active: null };
    }
    case 'load':
      return { ...state, pose: clonePose(action.pose), active: null };
    case 'mark':
      return { ...state, active: action.key };
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
  return { pose, active: null, committed: pose, undo: [], redo: [] };
}

// Every edit made by hand goes through editPose(change) (or loadPose(pose)),
// which clears the selected library button. A finished edit calls
// commitEdit(), which adds one undo step.
export function usePoseEditor(initialPose) {
  const [state, dispatch] = useReducer(reducer, initialPose, initialState);
  const actions = useMemo(
    () => ({
      /** Start from a library pose and show its button as selected. */
      selectPose: (key, pose) => dispatch({ type: 'select', key, pose }),
      /** Change some fields: `change` gets a copy of the pose to write into. */
      editPose: (change) => dispatch({ type: 'edit', change }),
      /** Replace the whole pose (import, paste, reset). */
      loadPose: (pose) => dispatch({ type: 'load', pose }),
      /** Show a library button as selected, without changing the pose. */
      markActive: (key) => dispatch({ type: 'mark', key }),
      commitEdit: () => dispatch({ type: 'commit' }),
      undo: () => dispatch({ type: 'undo' }),
      redo: () => dispatch({ type: 'redo' }),
    }),
    []
  );
  return {
    pose: state.pose,
    active: state.active,
    canUndo: state.undo.length > 0,
    canRedo: state.redo.length > 0,
    ...actions,
  };
}
