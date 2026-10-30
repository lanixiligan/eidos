import { Segmented } from './Segmented.jsx';

const MODES = [
  { value: 'dark', label: 'Dark', title: 'Dark theme with a white hand' },
  { value: 'light', label: 'Light', title: 'Light theme with a black hand' },
];

export function TopBar({ mode, onModeChange }) {
  return (
    <header className="topbar">
      <h1 className="brand">
        Eidos <span>3D hand studio</span>
      </h1>

      <div className="topbar-actions">
        <Segmented label="Appearance" options={MODES} value={mode} onChange={onModeChange} />
      </div>
    </header>
  );
}
