export type ThemeOption = 'light' | 'dark' | 'auto';

/**
 * Apply the desired theme to the documentElement.
 * - light  → removes `dark` class
 * - dark   → adds `dark` class
 * - auto   → follows system preference
 */
export const applyTheme = (theme: ThemeOption) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const root = document.documentElement;

  const setDark = (enable: boolean) => {
    if (enable) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  if (theme === 'auto') {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(systemDark);
  } else {
    setDark(theme === 'dark');
  }
}; 