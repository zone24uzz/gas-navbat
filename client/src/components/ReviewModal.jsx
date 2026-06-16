import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icons';
import { useLanguage } from '../context/LanguageContext';

export default function ReviewModal({ section, stationId, userId, onClose }) {
  const { t } = useLanguage();
  const [selectedStar, setSelectedStar] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    if (!selectedStar) return;
    const endpoint = stationId ? '/api/station/review' : '/api/review';
    const body = stationId
      ? { stationId, userId, stars: selectedStar, comment }
      : { userId, stars: selectedStar, comment };
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSubmitted(true);
    setTimeout(onClose, 2000);
  }

  const displayStar = hoveredStar || selectedStar;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 20,
          backdropFilter: 'blur(8px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{
            background: 'var(--surface-solid)',
            borderRadius: 20,
            padding: '28px 24px',
            maxWidth: 380,
            width: '100%',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border2)',
            textAlign: 'center',
          }}
        >
          {submitted ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                style={{ marginBottom: 12 }}
              >
                <Icon name="party" size="2xl" />
              </motion.div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px', fontFamily: 'var(--font-heading)' }}>
                {t('review.thanks_title')}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text2)', margin: 0 }}>
                {t('review.thanks_desc')}
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  width: 64, height: 64,
                  background: 'var(--grad)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 24px var(--accent-glow)',
                }}
              >
                <Icon name="star" size="xl" style={{ color: '#fff' }} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px', fontFamily: 'var(--font-heading)' }}>
                {t('review.title')}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text3)', margin: '0 0 20px' }}>
                {section} · {t('review.desc')}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <motion.button
                    key={n}
                    onClick={() => setSelectedStar(n)}
                    onMouseEnter={() => setHoveredStar(n)}
                    onMouseLeave={() => setHoveredStar(0)}
                    whileHover={{ scale: 1.3, rotate: [0, -10, 10, -5, 0] }}
                    whileTap={{ scale: 0.85 }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      lineHeight: 1,
                      padding: 2,
                      transition: 'none',
                    }}
                  >
                    <Icon
                      name="star"
                      size="2xl"
                      style={{
                        color: n <= displayStar ? '#fbbf24' : 'var(--text4)',
                        fill: n <= displayStar ? '#fbbf24' : 'none',
                        transition: 'all 0.15s',
                      }}
                    />
                  </motion.button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={t('review.comment_placeholder')}
                className="input"
                style={{
                  resize: 'none',
                  height: 80,
                  padding: 12,
                  borderRadius: 12,
                }}
              />

              <button
                onClick={submit}
                disabled={!selectedStar}
                className="btn-primary"
                style={{
                  width: '100%',
                  marginTop: 12,
                  padding: 14,
                  fontSize: 15,
                  borderRadius: 12,
                  opacity: selectedStar ? 1 : 0.4,
                  cursor: selectedStar ? 'pointer' : 'not-allowed',
                }}
              >
                {t('review.submit')}
              </button>
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: 11,
                  background: 'none',
                  color: 'var(--text3)',
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {t('review.skip')}
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
