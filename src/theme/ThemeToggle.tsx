import type { Theme } from './theme';

export function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const dark = theme === 'dark';
  return (
    <button
      className="topbar-btn"
      type="button"
      onClick={onToggle}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <i className={`fa-solid ${dark ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true" />
      <span>{dark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
