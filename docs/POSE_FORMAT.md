# Pose format (version 1)

A pose is one JSON file describing how every finger of the hand is bent. The
editor writes these files, and apps such as Sema read them. [`pose.schema.json`](pose.schema.json)
is the same contract as a JSON Schema, and [`pose.js`](../src/pose.js) has the
reference validator (`normalizePose`) and writer (`serializePose`).

```json
{
  "version": 1,
  "pinky":  [1.31, 1.7, 0.25],
  "ring":   [1.37, 1.7, 0.2],
  "middle": [1.41, 1.7, 0.18],
  "index":  [1.39, 1.7, 0.67],
  "thumb":  [0.79, 0.69],
  "spread": { "index": -0.15, "middle": -0.03, "ring": -0.1, "pinky": 0.13, "thumb": -0.22 },
  "rotate": { "thumb": 0, "index": 0, "middle": 0, "ring": 0, "pinky": 0 },
  "wrist": { "turn": 0, "tilt": 0, "twist": 0 },
  "move": { "side": 0, "up": 0, "forward": 0 }
}
```

## Fields

All angles are in **radians** (the editor shows degrees; 1 rad ≈ 57.3°).

| Field | Shape | Meaning |
| --- | --- | --- |
| `version` | `1` | Format version. Optional when reading (files from before versioning have none); always written. |
| `index`, `middle`, `ring`, `pinky` | `[base, middle, tip]` | Bend of the base knuckle, middle joint and fingertip joint. `0` is straight, positive curls toward the palm. |
| `thumb` | `[bend, tip]` | `bend` folds the thumb into the palm, `tip` curls the last joint. |
| `spread.index` … `spread.pinky` | number | Sideways tilt of each finger at the knuckle. Positive tilts toward the pinky side, negative toward the thumb. |
| `spread.thumb` | number | Thumb swing. Positive carries it across the palm, negative moves it out. Optional, defaults to `0`. |
| `rotate.thumb` | number | Rotates the whole thumb about its own length. Positive turns the pad in, toward the fingers (as when pinching); negative turns it out. Optional, defaults to `0`. |
| `rotate.index` … `rotate.pinky` | number | Rotates each finger about its own length, from the base knuckle. Positive turns the pad toward the thumb side, negative toward the pinky side. Easiest to see on a bent finger. Optional, defaults to `0`. |
| `wrist.turn` | number | Turns the whole hand in the plane of the palm. Positive turns the fingers toward the pinky side, negative toward the thumb side; `±π` (180°) points them down. Optional, defaults to `0`. |
| `wrist.tilt` | number | Tips the whole hand forward or back. Positive tips the fingers toward the palm side, negative toward the back of the hand. Optional, defaults to `0`. |
| `wrist.twist` | number | Rotates the whole hand about the forearm. Positive turns the palm toward the thumb side, negative toward the pinky side. Optional, defaults to `0`. |
| `move.side` | number | Moves the whole hand sideways, in hand lengths. Positive moves it out, away from the body's middle (to the signer's right for a right hand); negative moves it in. Optional, defaults to `0`. |
| `move.up` | number | Moves the whole hand up (positive) or down (negative), in hand lengths. Optional, defaults to `0`. |
| `move.forward` | number | Moves the whole hand forward, toward the viewer (positive), or back toward the signer (negative), in hand lengths. Optional, defaults to `0`. |
| `motion` | list of steps | The rest of a movement, for signs that move (J, Z). Optional; see [Movement](#movement). |

With all three `wrist` angles at `0` the hand is upright: fingers up, palm
facing the viewer. When several are set they apply in the order twist, then
tilt, then turn, each about the axes of the upright hand (three.js Euler order
`ZXY`), pivoting about the middle of the hand. A left hand mirrors the
rotation along with the fingers.

`move` is measured in hand lengths, from the wrist to the tip of the middle
finger, so it doesn't depend on the size the hand is drawn at. With all three
at `0` the hand is in its resting place. Its directions belong to the
signer, not the hand: a rotated hand still moves out, up and forward the same
way. A left hand mirrors `side` along with everything else.

There are no limits: any finite number is valid. The editor's sliders have
ends for convenience, but any angle can be typed into the editor, past
anatomically plausible ones too. The editor wraps
the three `wrist` angles into −π … π, since they are full turns; readers
should accept any value.

## Movement

Most poses are still. A sign that moves, such as J or Z, adds `motion`: the
steps after the first, in order. The pose's own fields are the first step, so
a reader that doesn't play movements shows the hand where the movement starts.

```json
{
  "version": 1,
  "pinky": [0, 0, 0],
  "…": "the rest of the first step, as above",
  "motion": [
    { "duration": 400, "pose": { "pinky": [0, 0, 0], "…": "step 2" } },
    { "duration": 300, "pose": { "pinky": [0, 0, 0], "…": "step 3" } }
  ]
}
```

| Field | Shape | Meaning |
| --- | --- | --- |
| `motion[i].duration` | number | Milliseconds to move from the step before into this one. Above `0`. |
| `motion[i].pose` | pose | The whole hand at this step: the same fields as a pose, without `version` or `motion`, and the same defaults. |

A player starts on the first step and moves through the others, each in its
duration. The editor's player eases in at the start and out at the end, and
runs through the steps on a smooth curve (Catmull-Rom) rather than stopping
at each one. It turns each `wrist` angle the short way round from the step
before. An empty `motion` list is the same as none.

## Left and right hands

Poses are written for a **right hand**. A left hand shows the same pose
mirrored, so there is never a separate left-hand file.

## The letters folder

`letters/` holds one pose per file (`A.json`, `B.json`, …), and
`letters/index.json` lists the files in display order (a browser cannot list a
folder by itself):

```json
["A.json", "B.json"]
```

Entries without `.json` are accepted (`"A"` means `A.json`). A file that is
missing or invalid is skipped, with the reason logged in the browser console.

## Compatibility

Readers should accept files with no `version` or with `version: 1`, and reject
any other version. A future change that alters the meaning of a field will
bump the version. The optional fields (`rotate`, `wrist`, `move`, `motion`)
can be left out, and a reader that ignores `move` or `motion` still shows a
sensible still pose.
