// A row of buttons where one is chosen
export function Segmented({ label, options, value, onChange }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          className={option.value === value ? 'active' : undefined}
          type="button"
          title={option.title}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
