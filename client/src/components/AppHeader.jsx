import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icons';
import ThemeToggle from './ThemeToggle';
import { useLanguage } from '../context/LanguageContext';

export default function AppHeader({ rightContent, maxWidth = '1200px', transparent = false }) {
  const { lang, setLang, t, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header
      className="app-header"
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        background: transparent ? 'transparent' : undefined,
        borderBottom: transparent ? 'none' : undefined,
      }}
    >
      <div
        style={{
          maxWidth,
          margin: '0 auto',
          width: '100%',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'var(--grad)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px var(--accent-glow)',
              flexShrink: 0,
            }}
          >
            <Icon name="fuel" size="sm" style={{ color: '#fff' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--text)', letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>
            {t('app.name')}
          </span>
        </Link>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 36 }}>
          {/* Language switcher */}
          <div ref={ref} style={{ position: 'relative' }}>
            <button
              onClick={() => setOpen(!open)}
              className="btn-icon"
              title={languages[lang]?.label}
              style={{ fontSize: 13, fontWeight: 700, width: 'auto', padding: '0 10px', gap: 4, fontFamily: 'inherit' }}
            >
              {languages[lang]?.flag} {languages[lang]?.label}
            </button>
            {open && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 4,
                  background: 'var(--surface-solid)',
                  border: '1px solid var(--border2)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-lg)',
                  overflow: 'hidden',
                  minWidth: 150,
                  zIndex: 999,
                  transform: 'rotateX(0deg)',
                  perspective: 600,
                }}
              >
                {Object.entries(languages).map(([code, l]) => (
                  <button
                    key={code}
                    onClick={() => { setLang(code); setOpen(false); }}
                    onMouseEnter={e => e.currentTarget.style.background = lang === code ? 'var(--surface3)' : 'var(--surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = lang === code ? 'var(--surface3)' : 'transparent'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '10px 14px',
                      border: 'none',
                      borderBottom: '1px solid var(--border)',
                      background: lang === code ? 'var(--surface3)' : 'transparent',
                      color: lang === code ? 'var(--accent)' : 'var(--text2)',
                      fontSize: 13,
                      fontWeight: lang === code ? 700 : 500,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-heading)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                    {lang === code && (
                      <Icon name="check" size="xs" style={{ marginLeft: 'auto', color: 'var(--accent)' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ThemeToggle />
          {rightContent}
        </div>
      </div>
    </header>
  );
}
