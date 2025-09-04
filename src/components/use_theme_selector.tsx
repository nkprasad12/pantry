import { useState, useLayoutEffect } from 'react';

function ThemeSwitcher({ theme, setTheme }: { theme: string; setTheme: (t: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{ fontSize: 18, cursor: 'pointer', opacity: theme === 'dark' ? 1 : 0.5 }}
        title="Switch to dark theme"
        onClick={() => theme !== 'dark' && setTheme('dark')}
        aria-label="Switch to dark theme"
      >
        🌙
      </span>
      <span
        style={{ fontSize: 18, cursor: 'pointer', opacity: theme === 'light' ? 1 : 0.5 }}
        title="Switch to light theme"
        onClick={() => theme !== 'light' && setTheme('light')}
        aria-label="Switch to light theme"
      >
        🔆
      </span>
    </div>
  );
}

export function useThemeSelector() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('theme');
      const useLight = stored === 'light' || stored === 'fun';
      return useLight ? 'light' : 'dark';
    }
    return 'dark';
  });
  // Wrap setTheme to persist
  const setTheme = (t: string) => {
    // If user selects 'fun', treat as 'light'
    const mapped = t === 'fun' ? 'light' : t;
    setThemeState(mapped);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', mapped);
    }
  };

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Also update meta theme-color for mobile
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      if (theme === 'light') meta.setAttribute('content', '#2a183a');
      else meta.setAttribute('content', '#0f766e');
    }
  }, [theme]);

  return <ThemeSwitcher theme={theme} setTheme={setTheme} />;
}
