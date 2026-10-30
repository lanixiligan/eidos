# Letter poses

Each letter is one pose JSON file in this folder, named after its button
label (`A.json`, `B.json`, ...), and listed in `index.json` in display order:

```json
["A.json", "B.json"]
```

To add or update letters from the editor, either:

- **One at a time:** shape the pose, name it (e.g. `A`), click
  **Download**, put the file here and list it in `index.json`.
- **All at once:** save each pose under its letter name, click
  **Export all** and unzip it here. The zip holds every letter plus your
  saved poses and a matching `index.json`. A saved pose named like an existing
  letter replaces it.

A file that is missing or not a valid pose is skipped, with the reason logged
in the browser console. The format is described in
[`docs/POSE_FORMAT.md`](../docs/POSE_FORMAT.md).
