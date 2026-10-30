// Line icons, drawn in the current text colour
function Icon({ size = 16, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function UndoIcon() {
  return (
    <Icon>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </Icon>
  );
}

export function RedoIcon() {
  return (
    <Icon>
      <path d="m15 14 5-5-5-5" />
      <path d="M20 9H10a6 6 0 0 0 0 12h3" />
    </Icon>
  );
}

export function PlayIcon() {
  return (
    <Icon>
      <path d="m6 4 14 8-14 8z" />
    </Icon>
  );
}

export function ResetIcon({ size }) {
  return (
    <Icon size={size}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </Icon>
  );
}

export function CloseIcon({ size }) {
  return (
    <Icon size={size}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

// Status line marks: done, or something to look at
export function CheckIcon({ size }) {
  return (
    <Icon size={size}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
}

export function AlertIcon({ size }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </Icon>
  );
}
