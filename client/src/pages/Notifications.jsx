import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/Icons';
import AppHeader from '../components/AppHeader';
import { useLanguage } from '../context/LanguageContext';

function timeAgo(iso, t) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return t('notif.just_now');
  if (diff < 3600) return `${Math.floor(diff / 60)} ${t('notif.min_ago')}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ${t('notif.hour_ago')}`;
  return new Date(iso).toLocaleDateString('uz-UZ');
}

function iconFor(body) {
  if (body.includes('✅')) return { bg: 'rgba(16,185,129,0.10)', name: 'check' };
  if (body.includes('🚗')) return { bg: 'rgba(82,127,176,0.10)', name: 'car' };
  if (body.includes('🎫')) return { bg: 'rgba(139,92,246,0.10)', name: 'ticket' };
  return { bg: 'var(--surface2)', name: 'bell' };
}

export default function Notifications() {
  const { t } = useLanguage();
  const [myUser] = useState(() => JSON.parse(sessionStorage.getItem('gazqueue_user') || 'null'));
  const [notifs, setNotifs] = useState([]);

  async function loadNotifs() {
    if (!myUser) return;
    try {
      const data = await fetch(`/api/notifications/${myUser.id}`).then(r => r.json());
      setNotifs(data);
    } catch {}
  }

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 5000);
    return () => clearInterval(interval);
  }, []);

  async function readAll() {
    if (!myUser) return;
    await fetch(`/api/notifications/${myUser.id}/read-all`, { method: 'POST' });
    loadNotifs();
  }

  return (
    <div style={{ paddingBottom: 'calc(68px + 16px)' }}>
      <AppHeader
        maxWidth="640px"
        rightContent={
          <button onClick={readAll} className="btn-ghost" style={{ padding: '7px 12px', fontSize: 12 }}>
            <Icon name="check" size="xs" /> {t('notif.read_all')}
          </button>
        }
      />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
          <h1 className="heading-2" style={{ margin: '0 0 4px' }}><Icon name="bell" size="md" /> {t('notif.title')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>
            {!myUser ? '' : `${notifs.filter(n => !n.read).length} ta o'qilmagan`}
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!myUser ? (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <div style={{ width: 72, height: 72, background: 'rgba(82,127,176,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon name="user" size="xl" style={{ color: 'var(--accent)' }} />
              </div>
              <p style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>{t('notif.login.title')}</p>
              <Link to="/" className="btn-primary" style={{ marginTop: 12, padding: '11px 24px', fontSize: 14, textDecoration: 'none' }}>{t('notif.login.btn')}</Link>
            </div>
          ) : notifs.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <div style={{ width: 72, height: 72, background: 'var(--surface2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '1px solid var(--border)' }}>
                <Icon name="bell" size="xl" style={{ color: 'var(--text3)' }} />
              </div>
              <p style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>{t('notif.empty.title')}</p>
              <p style={{ color: 'var(--text3)', fontSize: 13, margin: 0 }}>{t('notif.empty.desc')}</p>
            </div>
          ) : (
            notifs.map((n, i) => {
              const ic = iconFor(n.body);
              return (
                <motion.div key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 20 }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '16px 18px', borderRadius: 'var(--radius-sm)',
                    background: n.read ? 'var(--surface)' : 'rgba(82,127,176,0.04)',
                    border: `1px solid ${n.read ? 'var(--border)' : 'rgba(82,127,176,0.15)'}`,
                    cursor: 'default',
                  }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: ic.bg, border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon name={ic.name} size="md" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14, margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>{n.title}</p>
                    <p style={{ color: 'var(--text2)', fontSize: 13, margin: '0 0 6px' }}>{n.body}</p>
                    <p style={{ color: 'var(--text3)', fontSize: 11, margin: 0 }}>{timeAgo(n.time, t)}</p>
                  </div>
                  {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 6 }} />}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      <nav className="mobile-nav" style={{ fontFamily: 'var(--font-heading)' }}>
        {[
          { icon: 'home', label: 'Asosiy', to: '/' },
          { icon: 'pin',  label: 'AZS', to: '/' },
          { icon: 'car',  label: 'Navbat', to: '/' },
          { icon: 'bell', label: 'Bildirishnoma', to: '/notifications' },
          { icon: 'user', label: 'Profil', to: '/profile' },
        ].map((item, i) => (
          <Link key={i} to={item.to} className="mobile-nav-item" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Icon name={item.icon} size="md" />
            <span style={{ fontSize: 10 }}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
