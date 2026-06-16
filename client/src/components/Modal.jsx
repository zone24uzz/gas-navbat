import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icons';

export default function Modal({ open, onClose, title, children, maxWidth = 480 }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9000,
            padding: 16,
            backdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface-solid)',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth,
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                {title}
              </h3>
              <button
                onClick={onClose}
                className="btn-icon"
                style={{ width: 32, height: 32 }}
              >
                <Icon name="close" size="sm" />
              </button>
            </div>
            <div style={{ padding: '20px 24px 24px' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
