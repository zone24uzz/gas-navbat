import React from 'react';
import Icon from './Icons';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      className="btn-icon"
      onClick={toggle}
      title={theme === 'light' ? "Qorong'u rejim" : "Yorug' rejim"}
      onMouseEnter={e => e.currentTarget.style.transform = 'rotate(180deg) scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1)'}
      style={{ transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', transformStyle: 'preserve-3d' }}
    >
      <span style={{ display: 'inline-block', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {theme === 'light' ? <Icon name="moon" size="md" /> : <Icon name="sun" size="md" />}
      </span>
    </button>
  );
}
