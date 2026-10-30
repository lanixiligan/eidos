# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Today the only user is the maker, Lanix Iligan, shaping handshapes at a desk for
Sema, a sign language learning app. They pose a hand finger by finger, compare
it with a reference, adjust until it is right and save it. Other audiences
(sign language teachers, content creators, anyone posing a hand) are possible
later but are not confirmed.

## Product Purpose
Eidos is a static web studio for posing a 3D hand finger by finger and saving
each pose as JSON. It exists to make the handshapes Sema shows, one pose per
letter, but it stands on its own. Success is a handshape that is exactly right
and reproducible, saved in a file other apps can read.

## Positioning
Exact, finger-by-finger control. Every joint has a readable angle in degrees
that can be dragged, typed or stepped, with no hidden inverse kinematics, so a
pose can be reproduced to the degree. Poses have no angle limits; only the
editor's sliders have ends.

## Operating Context
- Poses are saved in the browser (`localStorage`), then moved into the repo's
  `letters/` folder with Export all (a zip). `letters/index.json` lists them in
  display order.
- The pose JSON is a contract read by Sema and other apps (angles in radians,
  `version` 1, right hand; a left hand is mirrored).
- `src/hand.js` is a separate reusable viewer that other apps import, so the
  editor UI never leaks into it.
- Static site: built with Vite, deployed to GitHub Pages.

## Capabilities and Constraints
- Pose editor per finger and joint, hand rotation, undo and redo, import and
  export of pose files, a transition preview between two poses, left and right
  hands, a sculpted 3D hand with dark and light modes.
- The editor shows degrees and stores radians. Signed angles name their
  positive direction (`+ pinky`). Wrist angles wrap into ±180°.
- No dependencies beyond React and three.js; no TypeScript for now.
- Per-browser settings only; there is no account or server.

## Brand Commitments
- The name is Eidos. Sema is a use case and is never part of the product's
  name.
- The UI is monochrome, black to white only (confirmed by the maker on
  2026-10-31), with colours defined as tokens in `src/style.css`, dark by
  default and a light mode.
- The 3D hand model and its viewer (`src/hand.js`) are not restyled by UI work.
- Tagline and logo are still undecided.

## Evidence on Hand
- 15 letter poses in `letters/` (A–I, K, L, P, W, Y) with `index.json`.
- `docs/POSE_FORMAT.md`, `docs/pose.schema.json` and `docs/screenshot.png`.
- No user research, testimonials or usage data exist. Do not invent any.

## Product Principles
- Exactness over convenience: every value the user sees is the value that is
  stored, and nothing is adjusted behind their back.
- Poses are portable data first; the editor serves the file format, not the
  other way round.
- The hand is the focus. Controls stay out of its way and work at the speed of
  a repeated, careful adjustment.
- Private by default: nothing leaves the browser unless the user exports it.

## Accessibility & Inclusion
No standard or product-specific requirement has been established. Joint values
can already be stepped with the keyboard; treat anything beyond that as an open
decision rather than a requirement.
