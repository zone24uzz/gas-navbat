import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icons';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((msg, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  }, []);

  const icons = { success: 'check', error: 'close', info: 'info', warning: 'warning' };

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.85, rotateX: -10 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, x: 80, scale: 0.85, rotateX: 10 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className={`toast toast-${t.type}`}
              style={{ perspective: 600, transformStyle: 'preserve-3d' }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: t.type === 'success' ? 'rgba(16,185,129,0.15)' :
                           t.type === 'error' ? 'rgba(239,68,68,0.15)' :
                           t.type === 'warning' ? 'rgba(245,158,11,0.15)' : 'rgba(82,127,176,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name={icons[t.type]} size="sm" style={{
                  color: t.type === 'success' ? '#10b981' :
                         t.type === 'error' ? '#ef4444' :
                         t.type === 'warning' ? '#f59e0b' : '#527FB0',
                }} />
              </span>
              <span style={{ flex: 1 }}>{t.msg}</span>
              <button
                onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text3)',
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: 2,
                  opacity: 0.6,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.target.style.opacity = '1'}
                onMouseLeave={e => e.target.style.opacity = '0.6'}
              >
                <Icon name="close" size="xs" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }
