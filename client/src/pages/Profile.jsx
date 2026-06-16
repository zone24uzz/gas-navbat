import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/Icons';
import AppHeader from '../components/AppHeader';
import { useToast } from '../components/Toast';
import { useLanguage } from '../context/LanguageContext';
import { stations } from '../data/stations';

const TABS = [
  { id: 'overview', icon: 'user',     key: 'profile.overview' },
  { id: 'queue',    icon: 'car',      key: 'profile.queue' },
  { id: 'history',  icon: 'clock',    key: 'profile.history' },
  { id: 'favorites',icon: 'star',     key: 'profile.favorites' },
  { id: 'settings', icon: 'settings', key: 'profile.settings' },
];

function timeAgo(iso, t) {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return t('notif.just_now');
  if (diff < 3600) return `${Math.floor(diff / 60)} ${t('notif.min_ago')}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ${t('notif.hour_ago')}`;
  return new Date(iso).toLocaleDateString();
}

export default function Profile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  const [myUser, setMyUser] = useState(() =>
    JSON.parse(sessionStorage.getItem('gazqueue_user') || 'null')
  );
  const [tab, setTab] = useState('overview');
  const [queueInfo, setQueueInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem('gazqueue_favorites') || '[]')
  );
  const [notifs, setNotifs] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCar, setEditCar] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!myUser) {
      setLoading(false);
      return;
    }
    (async () => {
      await loadData();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [myUser]);

  async function loadData() {
    loadHistory();
    await Promise.all([checkQueue(), loadNotifs()]);
  }

  function loadHistory() {
    const all = JSON.parse(localStorage.getItem('refuel_history') || '[]');
    setHistory(all.filter(r => r.userId === myUser?.id).slice(0, 20));
  }

  async function checkQueue() {
    const userId = myUser?.id;
    if (!userId) { setQueueInfo(null); return; }
    const userStationId = myUser?.stationId;
    if (userStationId) {
      const s = stations.find(st => st.id === userStationId);
      if (s) {
        try {
          const q = await fetch(`/api/station/queue?stationId=${s.id}`).then(r => r.json());
          const found = q.find(u => u.id === userId);
          if (found) {
            const pos = q.findIndex(u => u.id === found.id);
            setQueueInfo({ station: s, position: pos + 1, total: q.length, user: found });
            return;
          }
        } catch {}
      }
    }
    try {
      const results = await Promise.all(
        stations.map(async (s) => {
          try {
            const q = await fetch(`/api/station/queue?stationId=${s.id}`).then(r => r.json());
            const found = q.find(u => u.id === userId);
            if (found) {
              const pos = q.findIndex(u => u.id === found.id);
              return { station: s, position: pos + 1, total: q.length, user: found };
            }
          } catch {}
          return null;
        })
      );
      const found = results.find(r => r !== null);
      if (found) setQueueInfo(found);
      else setQueueInfo(null);
    } catch { setQueueInfo(null); }
  }

  async function loadNotifs() {
    if (!myUser) return;
    try {
      const data = await fetch(`/api/notifications/${myUser.id}`).then(r => r.json());
      setNotifs(data.slice(0, 5));
    } catch {}
  }

  function toggleFavorite(stationId) {
    setFavorites(prev => {
      const next = prev.includes(stationId)
        ? prev.filter(id => id !== stationId)
        : [...prev, stationId];
      localStorage.setItem('gazqueue_favorites', JSON.stringify(next));
      toast(
        prev.includes(stationId) ? 'Sevimlilardan olib tashlandi' : "Sevimlilarga qo'shildi",
        'success'
      );
      return next;
    });
  }

  async function handleLeave() {
    if (!queueInfo) return;
    await fetch('/api/station/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stationId: queueInfo.station.id, id: queueInfo.user.id }),
    });
    setQueueInfo(null);
    toast('Navbatdan chiqdingiz', 'info');
  }

  function handleSaveProfile() {
    toast("Profil yangilandi", 'success');
  }

  function logout() {
    sessionStorage.removeItem('gazqueue_user');
    navigate('/');
    toast("Tizimdan chiqildi", 'info');
  }

  const favStations = stations.filter(s => favorites.includes(s.id));
  const unreadCount = notifs.filter(n => !n.read).length;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', zIndex: 1 }}>
        <AppHeader rightContent={<Link to="/" style={{ color: 'var(--text2)', fontSize: 13, textDecoration: 'none' }}><Icon name="arrowLeft" size="xs" /> {t('header.back')}</Link>} />
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 20px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass" style={{ padding: 24, marginBottom: 16 }}>
              <div className="skeleton" style={{ width: '60%', height: 20, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: '100%', height: 14, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '80%', height: 14 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!myUser) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 80, position: 'relative', zIndex: 1 }}>
        <AppHeader
          rightContent={
            <Link to="/" className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12, textDecoration: 'none' }}>
              <Icon name="arrowLeft" size="xs" /> {t('header.back')}
            </Link>
          }
        />
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ width: 80, height: 80, background: 'var(--grad)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px var(--accent-glow)' }}>
              <Icon name="car" size="xl" style={{ color: '#fff' }} />
            </div>
            <h2 className="heading-2" style={{ margin: '0 0 12px' }}>
              {t('profile.queue_none')}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', margin: '0 0 32px', lineHeight: 1.6 }}>
              {t('profile.queue_none_desc')}
            </p>
            <Link to="/" className="btn-primary" style={{ padding: '14px 32px', fontSize: 15, textDecoration: 'none', borderRadius: 12 }}>
              <Icon name="car" size="sm" /> {t('profile.queue_join')}
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 80, position: 'relative', zIndex: 1 }}>
      <AppHeader
        rightContent={
          <Link to="/" className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12, textDecoration: 'none' }}>
            <Icon name="arrowLeft" size="xs" /> {t('header.back')}
          </Link>
        }
      />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 20px' }}>
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 28 }}
        >
          <div className="glass" style={{
            padding: '24px 28px',
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 24px var(--accent-glow)' }}>
              <Icon name="phone" size="xl" style={{ color: '#fff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '0 0 4px', fontFamily: 'var(--font-display)', letterSpacing: '-0.3px' }}>
                <Icon name="phone" size="sm" /> {myUser?.phone || '—'}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'var(--text3)' }}>
                <span><Icon name="fuel" size="xs" /> {queueInfo ? `${queueInfo.station.name} · #${queueInfo.position}/${queueInfo.total}` : t('profile.stats.none')}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={logout} className="btn-danger" style={{ padding: '8px 14px', fontSize: 12 }}>
                <Icon name="logout" size="xs" /> {t('profile.logout')}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 24,
          background: 'var(--surface2)', borderRadius: 'var(--radius-sm)',
          padding: 4, border: '1px solid var(--border)', flexWrap: 'wrap',
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '9px 14px', borderRadius: 8, fontSize: 12,
                fontWeight: 600, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: tab === t.id ? 'var(--surface-solid)' : 'transparent',
                color: tab === t.id ? 'var(--accent)' : 'var(--text3)',
                boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
              }}>
              <Icon name={t.icon} size="xs" /> {t(t.key)}
              {t.id === 'queue' && queueInfo && (
                <Icon name="circle" size="xs" style={{ fill: '#10b981', color: '#10b981' }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Overview Tab */}
            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[
                    { icon: 'car', key: 'profile.stats.queue', val: queueInfo ? `${queueInfo.position}/${queueInfo.total}` : t('profile.stats.none'), color: queueInfo ? '#10b981' : 'var(--text3)' },
                    { icon: 'clock', key: 'profile.stats.visits', val: history.length || 0, color: '#527FB0' },
                    { icon: 'star', key: 'profile.stats.favorites', val: favorites.length || 0, color: '#f59e0b' },
                  ].map((s, i) => (
                    <motion.div key={i} className="stat-card card-shine" style={{ padding: 16, textAlign: 'center' }}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4, scale: 1.02 }}>
                      <Icon name={s.icon} size="xl" style={{ marginBottom: 6, color: s.color }} />
                      <p style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: '0 0 2px', lineHeight: 1 }}>{s.val}</p>
                      <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0 }}>{t(s.key)}</p>
                    </motion.div>
                  ))}
                </div>

                {queueInfo && (
                  <motion.div className="glass" style={{
                    padding: 20, borderLeft: '4px solid #10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
                  }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}><Icon name="fuel" size="xs" /> {t('profile.active_queue')}</p>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{queueInfo.station.name}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text3)' }}>#{queueInfo.position} o'rin · {queueInfo.total} ta navbatda</p>
                    </div>
                    <button className="btn-primary" onClick={() => setTab('queue')} style={{ padding: '8px 16px', fontSize: 12 }}><Icon name="arrowRight" size="xs" /> {t('profile.view')}</button>
                  </motion.div>
                )}

                {/* Recent Notifications */}
                <div className="glass" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-heading)' }}><Icon name="bell" size="sm" /> {t('profile.recent_notifs')}</p>
                    <Link to="/notifications" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>{t('profile.see_all')}</Link>
                  </div>
                  {notifs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <Icon name="bell" size="xl" style={{ marginBottom: 8, color: 'var(--text3)' }} />
                      <p style={{ color: 'var(--text3)', fontSize: 13, margin: 0 }}>{t('notif.empty.title')}</p>
                    </div>
                  ) : notifs.map((n, i) => (
                    <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: i < notifs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: n.read ? 'var(--surface2)' : 'rgba(82,127,176,0.10)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name={n.body?.includes('✅') ? 'check' : n.body?.includes('🚗') ? 'car' : 'bell'} size="sm" style={{ color: 'var(--accent)' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{n.body}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text3)' }}>{timeAgo(n.time, t)}</p>
                      </div>
                      {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 6 }} />}
                    </div>
                  ))}
                </div>

                {favStations.length > 0 && (
                  <div className="glass" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-heading)' }}><Icon name="star" size="sm" /> {t('profile.fav_stations')}</p>
                      <button onClick={() => setTab('favorites')} style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{t('profile.see_all')}</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {favStations.slice(0, 3).map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>
                          <Icon name="fuel" size="sm" />
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.name}</span>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: s.open ? 'rgba(16,185,129,0.10)' : 'rgba(148,163,184,0.10)', color: s.open ? '#34d399' : 'var(--text3)', fontWeight: 600 }}>
                            {s.open ? t('profile.open') : t('profile.closed')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Queue Tab */}
            {tab === 'queue' && (
              <div className="glass" style={{ padding: 24 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 16px', fontFamily: 'var(--font-heading)' }}><Icon name="car" size="sm" /> {t('profile.my_queue')}</p>
                {queueInfo ? (
                  <div>
                    <div style={{ padding: 20, background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 'var(--radius-sm)', marginBottom: 20, textAlign: 'center' }}>
                      <Icon name="car" size="2xl" style={{ marginBottom: 8, color: '#34d399' }} />
                      <p style={{ fontSize: 16, fontWeight: 800, color: '#34d399', margin: '0 0 6px' }}>{t('profile.queue_active')}</p>
                      <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0 }}>{queueInfo.station.name}</p>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1 }}>#{queueInfo.position}</p>
                          <p style={{ fontSize: 11, color: 'var(--text3)', margin: '4px 0 0' }}>{t('profile.queue_position')}</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1 }}>{queueInfo.total}</p>
                          <p style={{ fontSize: 11, color: 'var(--text3)', margin: '4px 0 0' }}>{t('profile.queue_total')}</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', margin: 0, lineHeight: 1 }}>~{queueInfo.position * 4}</p>
                          <p style={{ fontSize: 11, color: 'var(--text3)', margin: '4px 0 0' }}>{t('profile.queue_minutes')}</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={handleLeave} className="btn-danger" style={{ width: '100%', padding: 12, fontSize: 14 }}><Icon name="logout" size="sm" /> {t('profile.queue_leave')}</button>
                  </div>
                ) : (
                  <div className="empty-state">
                    <Icon name="car" size="2xl" style={{ marginBottom: 12, color: 'var(--text3)' }} />
                    <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text2)', margin: '0 0 8px' }}>{t('profile.queue_none')}</p>
                    <p style={{ fontSize: 13, color: 'var(--text3)', margin: '0 0 20px' }}>{t('profile.queue_none_desc')}</p>
                    <Link to="/" className="btn-primary" style={{ padding: '11px 24px', fontSize: 13, textDecoration: 'none' }}><Icon name="car" size="sm" /> {t('profile.queue_join')}</Link>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {tab === 'history' && (
              <div className="glass" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-heading)' }}><Icon name="clock" size="sm" /> {t('profile.history_title')}</p>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{history.length} ta</span>
                </div>
                {history.length === 0 ? (
                  <div className="empty-state">
                    <Icon name="clock" size="2xl" style={{ marginBottom: 12, color: 'var(--text3)' }} />
                    <p style={{ color: 'var(--text2)', fontWeight: 600, margin: '0 0 4px' }}>{t('profile.history_empty')}</p>
                    <p style={{ color: 'var(--text3)', fontSize: 13, margin: 0 }}>{t('profile.history_empty_desc')}</p>
                  </div>
                ) : (
                  <div>
                    {history.map((r, i) => {
                      const d = new Date(r.time);
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 20px',
                          borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
                          transition: 'background 0.15s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--grad-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon name="fuel" size="sm" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.name || (r.stationName || 'AZS')}</p>
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text3)' }}><Icon name="car" size="xs" /> {r.carNumber} · <Icon name="fuel" size="xs" /> {r.gasAmount} · <Icon name="pin" size="xs" /> {r.section || '—'}</p>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text3)' }}>
                            <p style={{ margin: 0, fontWeight: 600, color: d.toDateString() === new Date().toDateString() ? 'var(--accent)' : 'var(--text3)' }}>
                              {d.toDateString() === new Date().toDateString() ? 'Bugun' : d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })}
                            </p>
                            <p style={{ margin: '2px 0 0' }}>{d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {tab === 'favorites' && (
              <div className="glass" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-heading)' }}><Icon name="star" size="sm" /> {t('profile.fav_title')}</p>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{favStations.length} ta</span>
                </div>
                {favStations.length === 0 ? (
                  <div className="empty-state">
                    <Icon name="star" size="2xl" style={{ marginBottom: 12, color: 'var(--text3)' }} />
                    <p style={{ color: 'var(--text2)', fontWeight: 600, margin: '0 0 4px' }}>{t('profile.fav_empty')}</p>
                    <p style={{ color: 'var(--text3)', fontSize: 13, margin: '0 0 20px' }}>{t('profile.fav_empty_desc')}</p>
                    <Link to="/" className="btn-primary" style={{ padding: '11px 24px', fontSize: 13, textDecoration: 'none' }}><Icon name="pin" size="sm" /> {t('profile.fav_open_map')}</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {favStations.map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--grad-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon name="fuel" size="md" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{s.name}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text3)' }}><Icon name="pin" size="xs" /> {s.district} tumani · {s.open ? t('profile.fav_station_open') : t('profile.fav_station_closed')}</p>
                        </div>
                        <button onClick={() => toggleFavorite(s.id)} className="btn-ghost" style={{ padding: '6px 10px', border: '1px solid rgba(245,158,11,0.2)' }}>
                          <Icon name="star" size="sm" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {tab === 'settings' && (
              <div>
                <motion.div className="glass" style={{ padding: 24, marginBottom: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 18px', paddingBottom: 12, borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-heading)' }}><Icon name="user" size="sm" /> {t('profile.settings_profile')}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label htmlFor="profile-name" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>{t('profile.settings_name')}</label>
                      <input id="profile-name" value={editName} onChange={e => setEditName(e.target.value)} className="input" placeholder="Ismingiz" />
                    </div>
                    <div>
                      <label htmlFor="profile-car" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>{t('profile.settings_car')}</label>
                      <input id="profile-car" value={editCar} onChange={e => setEditCar(e.target.value.toUpperCase())} className="input" placeholder="01A123BC" style={{ letterSpacing: '2px' }} />
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0 }}>{t('profile.settings_phone_note')}</p>
                    <button onClick={handleSaveProfile} className="btn-primary" style={{ width: '100%', padding: 12, fontSize: 13 }}>
                      <Icon name="save" size="sm" /> {t('profile.settings_save')}
                    </button>
                  </div>
                </motion.div>

                <motion.div className="glass" style={{ padding: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{t('profile.settings_app_version')}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>v2.0.0</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{t('profile.settings_language')}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>🇺🇿 O'zbek</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{t('profile.settings_member_since')}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{myUser?.createdAt ? new Date(myUser.createdAt).toLocaleDateString('uz-UZ') : '—'}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Nav */}
      <nav className="mobile-nav" style={{ fontFamily: 'var(--font-heading)' }}>
        {[
          { icon: 'home',     label: 'Asosiy', to: '/' },
          { icon: 'pin',      label: 'AZS', to: '/' },
          { icon: 'car',      label: 'Navbat', to: '/' },
          { icon: 'bell',     label: 'Bildirishnoma', to: '/notifications' },
          { icon: 'user',     label: 'Profil', to: '/profile' },
        ].map((item, i) => (
          <Link key={i} to={item.to} className="mobile-nav-item" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, ...(item.to === '/profile' ? { color: 'var(--accent)' } : {}) }}>
            <Icon name={item.icon} size="md" />
            <span style={{ fontSize: 10 }}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
