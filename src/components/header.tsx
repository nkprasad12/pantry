import { useThemeSelector } from './use_theme_selector';

export function Header() {
  const ThemeSwitcher = useThemeSelector();

  return (
    <header
      className="row"
      style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}
    >
      <div className="row" style={{ alignItems: 'center', gap: 10 }}>
        <h1 style={{ margin: 0 }}>Your Pantry</h1>
        <img
          src="/icons/icon128.png"
          alt="Pantry logo"
          width={32}
          height={32}
          style={{ display: 'block' }}
        />
      </div>
      <div className="row" style={{ gap: 8, alignItems: 'center' }}>
        {ThemeSwitcher}
      </div>
    </header>
  );
}
