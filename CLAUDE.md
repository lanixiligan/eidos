# Eidos

A static web studio for posing a 3D hand finger by finger and saving each pose
as JSON. Built to make the handshapes for Sema (a sign language app), but it
stands on its own: Sema is a use case and never part of the product's name.

## Run and check

- `npm install`, then `npm run dev` (Vite) and open <http://localhost:5173>.
  `npm run build` writes the static site to `dist/`, and `npm run preview`
  serves that build. Node 22.12 or newer.
- React and three.js come from npm, and Vite bundles them. three.js is pinned
  to an exact version (`0.186.1`), so upgrade it on purpose.
- There are no tests. To check a change, run `npm run check` (ESLint,
  `scripts/check-letters.js` and a production build, the same steps CI runs).
  Then load the page and watch the console. Every file in `letters/` should
  load. The only errors expected are 404s for letters that `index.json` lists
  but that don't exist yet.

## Layout

- `index.html`: the page shell. Its inline script sets `data-mode` before
  first paint, and `src/main.jsx` mounts the app into `#app`, the page grid.
- `src/App.jsx`: the state the panels share (pose library, files, transition
  preview, view settings, page-wide shortcuts), in numbered sections.
- `src/components/`: one component per panel: `TopBar` (pose name, save
  state, mode), `Library` (the letter board, with Import and Export all),
  `Stage` (status strip, the toolbar with undo, redo, Save and the view
  controls, and `TransitionPopover`) and
  `PoseEditor` (`JointRow`, `MotionPanel` for the movement steps,
  `FileActions`). `Flap` sets text in split-flap
  cells for all of them.
- `src/fonts/`: Barlow and Barlow Condensed (SIL OFL, `OFL.txt`), served with
  the page so nothing loads from a font host.
- `src/hooks/`: `usePoseEditor` (the pose being edited, with undo and redo,
  and which of its movement steps the tabs edit),
  `useHand` (creates the 3D hand and keeps it in sync with React state) and
  `useCommitEvent`.
- `src/lib/`: plain modules: joint controls and angle math (`joints.js`), the
  pose library and letter loading (`library.js`), pose files (`files.js`) and
  settings (`settings.js`).
- `src/hand.js`: the reusable 3D viewer (`createHand`). It has no editor or
  React code, because other apps import it. Its default model URL is
  `../models/hand-right.glb`, relative to the module (Vite bundles the file).
- `src/pose.js`: the pose format (`normalizePose`, `serializePose`) and
  `RELAXED_POSE`, the hand at rest that `hand.js` spreads fingers from.
- `src/zip.js`: the zip writer for Export all.
- `letters/`: one pose per letter plus `index.json`, which lists them in
  display order. A browser can't list a folder, so a file not listed there
  doesn't show. The app fetches these files at run time, so a plugin in
  `vite.config.js` copies the folder into the build as is.
- `scripts/check-letters.js`: checks that every letter file is a valid pose
  and is listed in `index.json`.
- `.github/workflows/deploy.yml`: on pull requests and pushes, runs the lint,
  the letter check and a build. On `main` it also deploys to GitHub Pages.
- `docs/`: `POSE_FORMAT.md`, `pose.schema.json` and the README screenshot.
- `models/`: the WebXR generic-hand glTF (MIT, © Amazon) and its license.

## The pose format is a contract

Sema and other apps read these files. Angles are in radians, `version` is 1,
and a pose describes a right hand (a left hand is mirrored). On screen,
`hand.js` draws each hand as its mirror image, the way a learner copies a
signer who faces them; that is display only. Any change to
the format must update all four of these together: `src/pose.js`
(`normalizePose`/`serializePose`), `docs/POSE_FORMAT.md`,
`docs/pose.schema.json` and the README example. A breaking change bumps
`POSE_VERSION`. Poses have no angle limits; only the editor's sliders have
ends.

## Conventions

- React function components in `.jsx`, hooks and plain modules in `.js`. No
  TypeScript for now, and no dependencies beyond React and three.js. Keep
  `hand.js`, `pose.js` and `zip.js` free of React. Match the existing style:
  2-space indent, single quotes, short comments that say why, and the
  matching section headers in `App.jsx`.
- UI is monochrome (black to white) and set like a departure board; see
  `docs/DESIGN.md`. Colours are tokens on `:root` in `src/style.css`, dark by
  default, with light overrides under `:root[data-mode="light"]`. Use the
  tokens, not raw colours. No rounded corners.
- The editor shows degrees and stores radians. Signed angles name their
  positive direction (`+ pinky`). Wrist angles wrap into ±180°.
- Every edit made by hand goes through `editPose(change)` or `loadPose(pose)`
  from `usePoseEditor` (or its step actions), which clear the selected
  library button. `editPose` changes the step shown: `editor.pose` is that
  step, `editor.document` the whole pose with its `motion`, for files and
  saving. A finished
  edit calls `commitEdit()`, which adds one undo step. Poses in that state are
  replaced, never mutated.
- The 3D hand is outside React. Components reach it only through `useHand`,
  whose effects push state into it.
- Per-browser settings live in `localStorage`, behind `readSetting` and
  `writeSetting` in `src/lib/settings.js` (storage may be unavailable). The
  keys are `hand-mode`, `hand-side`, `hand-transition-ms` and `hand-poses.v1`
  (saved poses). A new key also goes in the list in `settings.js`, so
  **Delete all site data** removes it.
- When the editor UI changes, update the README's feature list, and retake
  `docs/screenshot.png` if the change is visible.
