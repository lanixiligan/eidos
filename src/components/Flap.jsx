// Text set in split-flap cells, like a departure board. Each cell is keyed by
// its place and its character, so a changed character mounts a new cell that
// flips in; the delay grows along the row, so a new value cascades. `still`
// changes the characters without flipping (while a slider is dragged), and
// `placeholder` shows dimmed while `text` is empty.
// The cells are decoration: give the same text to screen readers elsewhere.
export function Flap({ text, cells = 0, align = 'left', size = 'md', still = false, placeholder = '' }) {
  const empty = !text && Boolean(placeholder);
  const chars = [...(empty ? placeholder : text)];
  const pad = Math.max(0, cells - chars.length);
  const shown = align === 'right' ? [...Array(pad).fill(' '), ...chars] : [...chars, ...Array(pad).fill(' ')];
  const classes = ['flap', `flap-${size}`, still && 'is-still', empty && 'is-placeholder'].filter(Boolean).join(' ');
  return (
    <span className={classes} aria-hidden="true">
      {shown.map((ch, i) => (
        <span key={`${i}:${ch}`} className="flap-cell" style={{ '--i': i }}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  );
}
