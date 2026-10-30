---
name: Eidos
description: A hand studio set like a departure board, in black and white.
colors:
  ground: "#0b0b0b"
  board: "#1f1f1e"
  board-raised: "#282827"
  board-hover: "#31312f"
  rule: "#353533"
  rule-strong: "#52524f"
  text: "#f4f4f2"
  text-muted: "#b5b5b2"
  text-faint: "#91918e"
  accent: "#f4f4f2"
  accent-hover: "#ffffff"
  on-accent: "#0b0b0b"
  track: "#353533"
  flap-top: "#111110"
  flap-bottom: "#090909"
  flap-ink: "#f4f4f2"
  flap-faint: "#7c7c79"
  ground-light: "#e6e6e3"
  board-light: "#f6f6f4"
  board-raised-light: "#ffffff"
  board-hover-light: "#eaeae7"
  rule-light: "#d8d8d4"
  rule-strong-light: "#a9a9a5"
  text-light: "#111111"
  text-muted-light: "#464644"
  text-faint-light: "#5e5e5b"
  accent-light: "#111111"
  accent-hover-light: "#333333"
  on-accent-light: "#ffffff"
  track-light: "#d0d0cc"
  flap-top-light: "#1d1d1c"
  flap-bottom-light: "#141413"
  flap-split-light: "#464644"
typography:
  flap-lg:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1
  flap-md:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1
  flap-sm:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1
  name-input:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "26px"
    fontWeight: 700
  value-input:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "22px"
    fontWeight: 700
  joint-name:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.45
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  button:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "15px"
    fontWeight: 600
    letterSpacing: "0.08em"
  hint:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  readout:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "14px"
    fontWeight: 500
  board-label:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.12em"
  tab-label:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.12em"
  name-input-compact:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "20px"
    fontWeight: 700
  tab-label-compact:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.06em"
rounded:
  none: "0px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  flap-cell-lg:
    backgroundColor: "{colors.flap-top}"
    textColor: "{colors.flap-ink}"
    typography: "{typography.flap-lg}"
    rounded: "{rounded.none}"
    width: "30px"
    height: "42px"
  flap-cell-md:
    backgroundColor: "{colors.flap-top}"
    textColor: "{colors.flap-ink}"
    typography: "{typography.flap-md}"
    rounded: "{rounded.none}"
    width: "24px"
    height: "34px"
  flap-cell-sm:
    backgroundColor: "{colors.flap-top}"
    textColor: "{colors.flap-ink}"
    typography: "{typography.flap-sm}"
    rounded: "{rounded.none}"
    width: "18px"
    height: "26px"
  button:
    backgroundColor: "{colors.board-raised}"
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    height: "36px"
    padding: "0 14px"
  button-hover:
    backgroundColor: "{colors.board-hover}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    height: "36px"
    padding: "0 14px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  board-row:
    textColor: "{colors.text}"
    typography: "{typography.body}"
    height: "44px"
    padding: "0 16px"
  board-row-open:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  finger-tab:
    textColor: "{colors.text-muted}"
    typography: "{typography.tab-label}"
    height: "72px"
  finger-tab-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  segmented-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    height: "34px"
  status-strip:
    backgroundColor: "{colors.board}"
    textColor: "{colors.text}"
    typography: "{typography.hint}"
    height: "44px"
    padding: "8px 20px"
---

# Design System: Eidos

## Overview

**Creative North Star: "The Departure Board"**

Eidos is set like a rail concourse board. The pose name, its save state, every
finger number and every joint angle sit in black split-flap cells, one
character per cell, and a changed character flips into place, cascading along
its row. Around the cells is a steel-grey board ruled in 1px lines, labelled in
small condensed caps tracked wide. The 3D hand fills the middle of the room
and is the one rounded, organic form on screen.

The board is exact and plain: no hue, no rounded corners, no gradients beyond
the stage's vignette and the two leaves of a flap. State is printed, not
coloured: the open row and the selected tab invert to the strongest white, a
filled square means saved and a hollow one doesn't. Readable at a distance is
the point, so body copy is 15px Barlow and angles are 24px flap figures.

Motion belongs to the flaps alone. Discrete changes (opening a letter, typing
or stepping an angle, undo, saving) flip their cells; dragging a slider changes
the figures without a flip, so scrubbing never turns into noise.

**Key Characteristics:**
- Black flap cells set into a steel-grey board; the split and hinge notches are
  gaps showing the board behind (a dark seam on the pale light-mode board).
- Condensed caps for labels and buttons only; content stays in sentence case.
- Zero radius and 1px rules everywhere in the interface.
- Selection and primary actions invert to the strongest white (black in light).
- The board's departure-row rhythm: code, pose, state; ← and → step through it.

## Colors

Black to white, nothing else. The values below are dark mode; each has a
`-light` counterpart in the frontmatter.

### Primary
- **Board White** (`accent` #f4f4f2, hover #ffffff): the open board row, the
  selected finger tab, the chosen segment, the Save button, slider fills and
  thumbs. In light mode it becomes Board Black (#111111) with `on-accent` white
  text.

### Neutral
- **Flap Black** (`flap-top` #111110 over `flap-bottom` #090909): every flap
  cell, in both modes (#1d1d1c / #141413 in light). Its ink is `flap-ink`
  #f4f4f2; a placeholder is `flap-faint` #7c7c79.
- **Steel Board** (`board` #1f1f1e): the top bar, library, editor, status strip,
  toolbar and popover. **Raised Steel** (#282827) fills buttons and selects;
  **Worn Steel** (#31312f) is their hover.
- **Concourse Dark** (`ground` #0b0b0b): the edge of the stage vignette.
- **Rule** (#353533) and **Firm Rule** (#52524f): 1px dividers and control
  outlines.
- **Paint** (`text` #f4f4f2), **Dim Paint** (`text-muted` #b5b5b2) and **Faint
  Paint** (`text-faint` #91918e): content, labels and states, hints and limits.

### Named Rules
**The Black Flap Rule.** Flaps are darker than the board they sit in, in both
modes. Never draw a flap lighter than its board: it reads as an empty grey box.

**The Inversion Rule.** The open, selected or primary thing inverts to Board
White. Nothing else may be that bright, so it always means "this one".

**The No-Hue Rule.** No colour carries meaning. Problems are said in words and
marked with the alert icon at 600 weight; danger is the text colour.

## Typography

**Display Font:** Barlow Condensed 700 (with Arial Narrow), in flap cells only.
**Body Font:** Barlow (with system-ui).
**Label Font:** Barlow Condensed 600, uppercase, tracked 0.08–0.12em.

**Character:** A condensed grotesk built for signage, paired with its own
regular-width sibling for reading. Both are self-hosted from `src/fonts/`
(SIL OFL), so nothing loads from a third party.

### Hierarchy
- **Flap** (700; 30px name, 24px angles, 18px codes and states): characters in
  cells.
- **Joint name** (600, 16px): the joint rows.
- **Body** (400–500, 15px, 1.45): board rows, field text.
- **Button** (600, 15px, caps, 0.08em): every button and segment.
- **Hint** (400, 14px, 1.5): help, the status strip, notes.
- **Readout** (condensed 500, 14px): slider limits.
- **Board label** (condensed 600, 13px, caps, 0.12em; 12px in finger tabs):
  column heads, section heads, field labels.
- Compact sizes on phones: 20px name flaps, 11px tab labels, 12px and 14px small
  flaps.

### Named Rules
**The Caps Are Labels Rule.** Condensed caps name things (columns, sections,
buttons). What the maker wrote or reads (pose names, joint names, messages)
stays in sentence case at reading size.

## Layout

A three-column board under a 72px top bar: the library (300px), the stage
(fluid) and the editor (440px). The top bar is the pose's line: EIDOS in small
flaps, POSE and its name in large flaps, the save state as a mark and flaps,
then the mode switch. A 44px status strip runs across the top of the stage,
and the toolbar is docked along its foot as a matching board line: undo, redo
and Save, a rule, then the view (Left/Right, Numbers, Transition, Reset view).

The library is a board: a CODE / POSE / STATE head, then 44px rows for letters
and for poses saved in this browser, and a foot with the arrow-key hint,
Import, Export all and Delete all site data. The editor stacks six 72px finger
tabs, the shown finger's shortcuts, a JOINT / ANGLE head, the joint rows, the
key hint, and a footer of two labelled rows: THIS POSE (Download, Copy JSON)
and ALL FINGERS (Reset all fingers…).

Spacing runs 6, 8, 12, 16 and 20px. Below 860px everything stacks under a
two-line 104px top bar, the stage pinned beneath it at 50dvh; each stacked panel
takes its full content height. On touch screens (`pointer: coarse`) buttons
grow to 44px, board rows to 52px and the slider thumb to 14×32px. The docked
toolbar wraps onto a second row when the stage is narrow, never over the hand.

## Elevation & Depth

Flat. Panels are separated by 1px rules, not shadows; the only depth is in the
flap itself (a darker lower leaf and a split).

### Shadow Vocabulary
- **Float** (`--shadow`: 0 8px 24px at 0.5 alpha, 0.14 in light): the
  transition popover, which hangs over the hand.
- **Thumb** (`--shadow-thumb`: 0 1px 3px): the slider thumb on its track.

### Named Rules
**The Ruled Board Rule.** Separate with a 1px rule or an inverted fill, never
with a card, a gap or a shadow.

## Shapes

Square. No radius anywhere in the interface, controls included (`border-radius:
0` is set on buttons, inputs and selects). The slider thumb is a 10×24px bar.
The round fingertip badges belong to the 3D hand (`src/hand.js`), not to this
system.

## Components

### Flap cells (signature)
- **Structure:** one character per cell; sizes sm 18×26, md 24×34, lg 30×42; 2px
  between cells. A 1px split across the middle and 2px hinge notches at its
  ends, both in `--flap-split` (the board colour in dark mode, #464644 in light).
- **Motion:** a changed character mounts a new cell that turns down from
  rotateX(-90deg) over 0.28s, delayed 32ms per cell along the row. `still`
  (during a slider drag) and reduced motion skip it.
- **Editing:** the name and each angle have a text field laid over their cells,
  invisible until focused; focused, it shows as a flap-black field with a white
  outline, and blur returns to cells.

### Board rows
- **Style:** code in two small flaps, pose in body text, state in board-label
  caps on the right; 44px tall, 1px rules between. Hover is Worn Steel; the open
  pose inverts and its state reads OPEN. A saved row has a drawn × delete that
  appears on hover or focus (always on touch).

### Finger tabs
- **Style:** six equal cells, each a small flap number (H for the hand) over a
  caps label; the selected tab inverts.

### Joint rows
- **Style:** joint name and direction hint on the left, the angle in five md
  flaps on the right; below, a 4px track filled in Board White to a 10×24px bar
  thumb, with condensed limits underneath.

### Buttons and segments
- **Style:** square, 36px, condensed caps. Default is Raised Steel with a Firm
  Rule outline; primary (Save) is Board White; a pressed toggle is a soft fill
  with a white outline. Segments sit in one outlined strip; the chosen one
  inverts. Link buttons are caps with a 1px underline.

### Asking first
- **Style:** an action that throws away more than the shown finger (Reset all
  fingers) sits apart from the per-finger shortcuts and asks in place: a
  Raised Steel box with a 2px Board White frame, the alert mark and a 600-weight
  question saying what changes, what stays and that Ctrl+Z undoes it, then
  Keep (focused) and the action as the primary button. Escape keeps.

### Status strip
- **Style:** one board line over the hand. At rest it shows how to move the view
  in Faint Paint; a result appears with a drawn check at full strength, eases in
  over 0.18s and settles to Dim Paint after 5s; a problem shows the alert mark at
  600 weight and stays. It is a polite live region.

## Do's and Don'ts

### Do:
- **Do** set every changing value the maker reads at a glance (name, save
  state, angles, finger numbers, board codes) in flap cells.
- **Do** keep flaps darker than their board, in both modes.
- **Do** invert to Board White for the open, selected or primary thing.
- **Do** separate with 1px rules and keep every corner square.
- **Do** use condensed caps for labels and buttons, sentence case for content.
- **Do** flip on discrete changes only; let a dragged slider change cells still.
- **Do** keep an action that changes more than the shown finger away from the
  per-finger shortcuts, and ask in place before it runs.

### Don't:
- **Don't** add a hue: no amber for warnings, no red for danger.
- **Don't** round a corner or add a card or shadow to group things.
- **Don't** set long text (messages, help, names in rows) in caps or in flaps.
- **Don't** animate anything but the flaps, the status strip's arrival and the
  finger highlight flash.
- **Don't** use text glyphs as icons; draw them.
