import { useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 600);
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 p-2.5 rounded-xl bg-panel border border-edge text-caption hover:text-heading hover:border-accent/40 hover:shadow-[0_0_12px_rgba(5,150,105,0.15)] dark:hover:shadow-[0_0_16px_rgba(52,211,153,0.12)] transition-all duration-300 cursor-pointer shadow-sm"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-4 h-4">
        {/* Sun */}
        <svg
          className={`w-4 h-4 absolute inset-0 transition-all duration-500 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        {/* Moon */}
        <svg
          className={`w-4 h-4 absolute inset-0 transition-all duration-500 ${isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </div>
    </button>
  );
}
