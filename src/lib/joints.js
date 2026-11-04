// The editor's joint controls and their angle math.
//
// Editor controls work in the pose format's units (radians, hand lengths) but
// read out and turn in whole degrees or hundredths of a hand length, with a
// direction word where the sign alone would be ambiguous. The pose has no
// limits. Sliders need ends, so each joint has a range that covers the
// letters; typed values can go past it.
import { FINGER_NUMBERS, clonePose, normalizePose } from '../pose.js';

// What one shown step is worth in the pose, and how it reads
const ANGLE = { scale: Math.PI / 180, suffix: '°' };
const LENGTH = { scale: 0.01, suffix: '%' }; // hundredths of a hand length
export const unitOf = (control) => control.unit ?? ANGLE;

const formatBend = (v) => `${Math.round(v / ANGLE.scale)}°`;
// Values are shown signed, so the joint name says which way is positive
const direction = (positive, negative, unit = ANGLE) => ({
  hint: `+ ${positive}`,
  format: (v) => {
    const n = Math.round(v / unit.scale);
    return n === 0 ? `0${unit.suffix}` : `${Math.abs(n)}${unit.suffix} ${n > 0 ? positive : negative}`;
  },
});

// "Reset" returns a finger (or the whole hand) to a flat open hand: straight
// fingers with a natural spread, upright
const RESET_POSE = normalizePose({
  pinky: [0, 0, 0],
  ring: [0, 0, 0],
  middle: [0, 0, 0],
  index: [0, 0, 0],
  thumb: [-0.1, 0],
  spread: { index: -0.18, middle: -0.05, ring: 0.08, pinky: 0.22, thumb: 0 },
});

const fingerControls = (key) => [
  { label: 'Base knuckle', min: -20, max: 120,
    title: 'Base knuckle bend: 0° is straight, higher curls toward the palm',
    get: (p) => p[key][0], set: (p, v) => (p[key][0] = v), format: formatBend },
  { label: 'Middle joint', min: 0, max: 130,
    title: 'Middle joint bend: 0° is straight, higher curls toward the palm',
    get: (p) => p[key][1], set: (p, v) => (p[key][1] = v), format: formatBend },
  { label: 'Tip joint', min: -10, max: 110,
    title: 'Fingertip joint bend: 0° is straight, higher curls toward the palm',
    get: (p) => p[key][2], set: (p, v) => (p[key][2] = v), format: formatBend },
  { label: 'Spread', min: -60, max: 110,
    title: 'Sideways tilt: negative toward the thumb, positive toward the pinky',
    get: (p) => p.spread[key], set: (p, v) => (p.spread[key] = v), ...direction('pinky', 'thumb') },
  { label: 'Rotate', min: -120, max: 120,
    title: 'Rotation about the finger\'s own length: positive turns the pad toward the thumb, negative toward the pinky',
    get: (p) => p.rotate[key], set: (p, v) => (p.rotate[key] = v), ...direction('thumb', 'pinky') },
];

// Whole-hand rotation, so a pose can point sideways or down, and position,
// so a movement can carry the hand. Rotations are full turns, so they wrap
// around at ±180° instead of growing past it. A control with a `section`
// starts a new heading: [name, what its values are].
const WRIST_GROUP = { finger: 'wrist', tab: 'Hand', title: 'Hand', head: 'Rotation', controls: [
  { label: 'Turn', min: -180, max: 180, wrap: true,
    title: 'Turn in the palm\'s plane: 180° points the fingers down',
    get: (p) => p.wrist.turn, set: (p, v) => (p.wrist.turn = v), ...direction('pinky', 'thumb') },
  { label: 'Tilt', min: -180, max: 180, wrap: true,
    title: 'Tilt: fingers toward the palm side or toward the back of the hand',
    get: (p) => p.wrist.tilt, set: (p, v) => (p.wrist.tilt = v), ...direction('palm', 'back') },
  { label: 'Twist', min: -180, max: 180, wrap: true,
    title: 'Twist about the forearm: palm toward the thumb side or the pinky side',
    get: (p) => p.wrist.twist, set: (p, v) => (p.wrist.twist = v), ...direction('thumb', 'pinky') },
  { label: 'Side', min: -100, max: 100, unit: LENGTH, section: ['Position', '% of hand length'],
    title: 'Move the whole hand sideways: out, away from the body\'s middle, or in',
    get: (p) => p.move.side, set: (p, v) => (p.move.side = v), ...direction('out', 'in', LENGTH) },
  { label: 'Height', min: -100, max: 100, unit: LENGTH,
    title: 'Move the whole hand up or down',
    get: (p) => p.move.up, set: (p, v) => (p.move.up = v), ...direction('up', 'down', LENGTH) },
  { label: 'Depth', min: -100, max: 100, unit: LENGTH,
    title: 'Move the whole hand forward, toward the viewer, or back',
    get: (p) => p.move.forward, set: (p, v) => (p.move.forward = v), ...direction('forward', 'back', LENGTH) },
] };

export const EDITOR_GROUPS = [
  { finger: 'thumb', title: 'Thumb', controls: [
    { label: 'Base bend', min: -30, max: 130,
      title: 'Thumb base bend: higher folds the thumb into the palm',
      get: (p) => p.thumb[0], set: (p, v) => (p.thumb[0] = v), format: formatBend },
    { label: 'Tip joint', min: -20, max: 100,
      title: 'Thumb tip bend: higher curls the thumb tip',
      get: (p) => p.thumb[1], set: (p, v) => (p.thumb[1] = v), format: formatBend },
    { label: 'Swing', min: -100, max: 60,
      title: 'Thumb swing: negative moves it out, positive carries it across the palm',
      get: (p) => p.spread.thumb, set: (p, v) => (p.spread.thumb = v), ...direction('across', 'out') },
    { label: 'Rotate', min: -120, max: 120,
      title: 'Thumb rotation about its own length: positive turns the pad toward the fingers, negative turns it away',
      get: (p) => p.rotate.thumb, set: (p, v) => (p.rotate.thumb = v), ...direction('in', 'out') },
  ] },
  { finger: 'index', title: 'Index', controls: fingerControls('index') },
  { finger: 'middle', title: 'Middle', controls: fingerControls('middle') },
  { finger: 'ring', title: 'Ring', controls: fingerControls('ring') },
  { finger: 'pinky', title: 'Pinky', controls: fingerControls('pinky') },
  WRIST_GROUP,
];

// Wrap whole degrees into (-180, 180], for full turns
const wrapDegrees = (d) => {
  const r = ((((d + 180) % 360) + 360) % 360) - 180;
  return r === -180 ? 180 : r;
};
// Next multiple of the step size from n, so -6 + 5 gives -5 (then 0)
export const stepFrom = (n, amount) => {
  const size = Math.abs(amount);
  return amount > 0 ? (Math.floor(n / size) + 1) * size : (Math.ceil(n / size) - 1) * size;
};
// Wrap a full-turn angle (radians) into (-180°, 180°]
const wrapAngle = (rad) => {
  const turn = 2 * Math.PI;
  const r = (((rad + Math.PI) % turn) + turn) % turn - Math.PI;
  return r === -Math.PI ? Math.PI : r;
};

export const controlName = (group, control) => `${group.title} ${control.label.toLowerCase()}`;

// The whole number shown for a joint (full turns read within ±180°)
export function shownValue(control, pose) {
  const n = Math.round(control.get(pose) / unitOf(control).scale);
  return control.wrap ? wrapDegrees(n) : n;
}

// Write a shown value (degrees, or hundredths of a hand length) into a pose
export function setValue(control, pose, value) {
  const v = value * unitOf(control).scale;
  control.set(pose, control.wrap ? wrapAngle(v) : v);
}

function resetFinger(pose, finger) {
  if (finger === 'wrist') {
    pose.wrist = { ...RESET_POSE.wrist };
    pose.move = { ...RESET_POSE.move };
  } else if (finger === 'thumb') {
    pose.thumb = [...RESET_POSE.thumb];
    pose.spread.thumb = RESET_POSE.spread.thumb;
    pose.rotate.thumb = RESET_POSE.rotate.thumb;
  } else {
    pose[finger] = [...RESET_POSE[finger]];
    pose.spread[finger] = RESET_POSE.spread[finger];
    pose.rotate[finger] = RESET_POSE.rotate[finger];
  }
}

// Every finger straight; the hand rotation and position stay
export const resetAllFingers = (pose) => ({ ...clonePose(RESET_POSE), wrist: pose.wrist, move: pose.move });

// Shortcuts beside the finger tabs, for the shown finger only: each sets
// some fields of the pose and keeps the rest
export function groupActions({ finger, tab, title }) {
  const actions = [];
  if (finger === 'wrist') {
    actions.push({ text: 'Point down', title: 'Turn the hand so the fingers point down',
      apply: (p) => (p.wrist.turn = Math.PI) });
  }
  actions.push({
    text: `Reset ${(tab ?? title).toLowerCase()}`,
    title: finger in FINGER_NUMBERS ? `Straighten the ${title.toLowerCase()}` : 'Upright hand in its resting place',
    apply: (p) => resetFinger(p, finger),
  });
  return actions;
}
