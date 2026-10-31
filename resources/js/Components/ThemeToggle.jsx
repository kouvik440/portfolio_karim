import { useEffect, useState } from 'react';

export default function ThemeToggle({ defaultTheme = 'system', onChange }) {
    const [preference, setPreference] = useState(() => {
        try { const saved = localStorage.getItem('portfolio-theme'); if (['dark', 'light', 'system'].includes(saved)) return saved; } catch {}
        return ['dark', 'light', 'system'].includes(defaultTheme) ? defaultTheme : 'system';
    });
    const [resolvedTheme, setResolvedTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const apply = () => {
            const theme = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
            document.documentElement.dataset.theme = theme;
            setResolvedTheme(theme);
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0d14' : '#f4f5f7');
        };
        apply(); media.addEventListener('change', apply);
        return () => media.removeEventListener('change', apply);
    }, [preference]);
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    function change() { try {localStorage.setItem('portfolio-theme', next);} catch {} setPreference(next); onChange?.(); }
    return <button type="button" className="theme-toggle" onClick={change} aria-label="Mode sombre" aria-pressed={resolvedTheme === 'dark'} title={`Activer le mode ${next === 'dark' ? 'sombre' : 'clair'}`}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{resolvedTheme === 'dark' ? <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" /> : <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>}</svg><span>{resolvedTheme === 'dark' ? 'Sombre' : 'Clair'}</span>
    </button>;
}
