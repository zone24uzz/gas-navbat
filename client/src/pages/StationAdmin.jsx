import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/Icons';
import AppHeader from '../components/AppHeader';
import { useLanguage } from '../context/LanguageContext';

export default function StationAdmin() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const token = sessionStorage.getItem('station_token');
  const stationId = sessionStorage.getItem('station_id');
  const stationName = sessionStorage.getItem('station_name');
  const headers = { 'Content-Type': 'application/json', 'x-station-token': token };

  const [queue, setQueue] = useState([]);
  const [sections, setSections] = useState({});
  const [reviews, setReviews] = useState([]);
  const [gasAvailable, setGasAvailable] = useState(true);
  const [gasMessage, setGasMessage] = useState('');
  const [gasEta, setGasEta] = useState('');
  const [gasSaved, setGasSaved] = useState(false);
  const [sectionCount, setSectionCount] = useState(3);
  const [servedCount, setServedCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !stationId) { navigate('/station-login'); return; }
    loadAll();
    loadGasStatus();
    const interval = setInterval(loadAll, 3000);
    return () => clearInterval(interval);
  }, []);

  async function loadAll() {
    await Promise.all([loadQueue(), loadSections(), loadReviews()]);
    loadHistory();
    setLoading(false);
  }

  async function loadQueue() {
    try { setQueue(await fetch(`/api/station/queue?stationId=${stationId}`).then(r => r.json())); } catch {}
  }

  async function loadSections() {
    try { setSections(await fetch('/api/station/admin/sections', { headers }).then(r => r.json())); } catch {}
  }

  async function loadReviews() {
    try { setReviews(await fetch('/api/station/admin/reviews', { headers }).then(r => r.json())); } catch {}
  }

  async function loadGasStatus() {
    try {
      const s = await fetch(`/api/station/gas-status?stationId=${stationId}`).then(r => r.json());
      setGasAvailable(s.available);
      setGasMessage(s.message || '');
      setGasEta(s.eta || '');
    } catch {}
  }

  function loadHistory() {
    const all = JSON.parse(localStorage.getItem('refuel_history') || '[]');
    setHistory(all.filter(r => r.stationName === stationName));
  }

  async function assignToSection(userId, section) {
    const res = await fetch('/api/station/admin/assign', { method: 'POST', headers, body: JSON.stringify({ userId, section }) });
    if (res.ok) { setServedCount(c => c + 1); await loadAll(); }
  }

  async function clearSection(key) {
    const user = sections[key];
    await fetch('/api/station/admin/sections', { method: 'POST', headers, body: JSON.stringify({ section: key }) });
    if (user) {
      const hist = JSON.parse(localStorage.getItem('refuel_history') || '[]');
      hist.unshift({ name: user.name || user.phone?.slice(-4) || '—', carNumber: user.carNumber || '—', gasAmount: user.gasAmount || '—', section: key, stationName, time: new Date().toISOString() });
      if (hist.length > 500) hist.splice(500);
      localStorage.setItem('refuel_history', JSON.stringify(hist));
      loadHistory();
    }
    setSections(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  async function clearQueue() {
    if (!confirm(t('station.confirm_clear_queue'))) return;
    await fetch('/api/station/admin/clear', { method: 'POST', headers });
    await loadAll();
  }

  async function saveGasStatus() {
    await fetch('/api/station/admin/gas-status', { method: 'POST', headers, body: JSON.stringify({ available: gasAvailable, message: gasMessage, eta: gasEta }) });
    setGasSaved(true);
    setTimeout(() => setGasSaved(false), 2000);
  }

  function clearHistory() {
    if (!confirm(t('station.history.confirm_clear'))) return;
    const all = JSON.parse(localStorage.getItem('refuel_history') || '[]');
    localStorage.setItem('refuel_history', JSON.stringify(all.filter(r => r.stationName !== stationName)));
    loadHistory();
  }

  function logout() {
    sessionStorage.removeItem('station_token');
    sessionStorage.removeItem('station_id');
    sessionStorage.removeItem('station_name');
    navigate('/station-login');
  }

  const busySections = Object.keys(sections).length;
  const todayCount = history.filter(r => new Date(r.time).toDateString() === new Date().toDateString()).length;
  const reviewAvg = reviews.length ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1) : null;

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  return (
    <div style={{ paddingBottom: 32 }}>
      <AppHeader
        maxWidth="1100px"
        rightContent={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right', marginRight: 4 }}>
              <p style={{ color: 'var(--text)', fontWeight: 800, fontSize: 14, margin: 0, lineHeight: 1.2 }}>{stationName || 'AZS Admin'}</p>
              <p style={{ color: 'var(--text3)', fontSize: 10, margin: 0 }}>{t('station.panel')}</p>
            </div>
            <span className="badge badge-blue" style={{ fontSize: 10 }}><Icon name="fuel" size="xs" /> AZS ADMIN</span>
            <button onClick={logout} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 11 }}><Icon name="logout" size="xs" /> {t('station.logout')}</button>
          </div>
        }
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px' }}>
        {/* Stats */}
        <motion.div {...fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { val: queue.length, key: 'station.stats.queue', color: 'var(--accent)' },
            { val: servedCount, key: 'station.stats.served', color: 'var(--accent2)' },
            { val: busySections, key: 'station.stats.busy', color: '#f97316' },
            { val: todayCount, key: 'station.stats.today', color: '#8b5cf6' },
          ].map((s, i) => (
            <motion.div key={i} className="stat-card card-shine" style={{ padding: 18, textAlign: 'center' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}>
              <p style={{ fontSize: 36, fontWeight: 800, color: s.color, margin: '0 0 4px', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>{s.val}</p>
              <p style={{ color: 'var(--text3)', fontSize: 12, fontWeight: 600, margin: 0 }}>{t(s.key)}</p>
            </motion.div>
          ))}
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Gas status */}
          <motion.div className="glass" style={{ padding: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 14px', fontFamily: 'var(--font-heading)' }}><Icon name="fuel" size="sm" /> {t('station.gas.title')}</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {[true, false].map(val => (
                <button key={String(val)} onClick={() => setGasAvailable(val)}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10,
                    border: `2px solid ${gasAvailable === val ? (val ? '#22c55e' : '#ef4444') : 'var(--border)'}`,
                    background: gasAvailable === val ? (val ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.06)') : 'var(--surface2)',
                    color: gasAvailable === val ? (val ? '#15803d' : '#dc2626') : 'var(--text)',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}>
                  {val ? <><Icon name="check" size="xs" style={{ color: '#15803d' }} /> {t('station.gas.yes')}</> : <><Icon name="close" size="xs" style={{ color: '#dc2626' }} /> {t('station.gas.no')}</>}
                </button>
              ))}
            </div>
            <input value={gasMessage} onChange={e => setGasMessage(e.target.value)} type="text" placeholder={t('station.gas.message_placeholder')} className="input" style={{ marginBottom: 8 }} />
            <input value={gasEta} onChange={e => setGasEta(e.target.value)} type="text" placeholder={t('station.gas.eta_placeholder')} className="input" style={{ marginBottom: 12 }} />
            <button className="btn-primary" onClick={saveGasStatus} style={{ width: '100%', padding: 12, fontSize: 14, borderRadius: 10 }}>
              {gasSaved ? <><Icon name="check" size="sm" /> {t('station.gas.saved')}</> : <><Icon name="save" size="sm" /> {t('station.gas.save')}</>}
            </button>
          </motion.div>

          {/* Sections */}
          <motion.div className="glass" style={{ padding: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-heading)' }}><Icon name="boxes" size="sm" /> {t('station.sections')}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{t('station.sections.count')}</span>
                <select value={sectionCount} onChange={e => setSectionCount(Number(e.target.value))} className="select" style={{ padding: '6px 10px' }}>
                  {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {Array.from({ length: sectionCount }, (_, i) => {
                const key = `Sektsiya ${i + 1}`;
                const user = sections[key];
                return (
                  <div key={key} style={{
                    padding: 12, borderRadius: 'var(--radius-xs)',
                    background: user ? 'rgba(16,185,129,0.05)' : 'var(--surface)',
                    border: `1px solid ${user ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: user ? 'var(--grad)' : 'var(--surface2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: user ? '#fff' : 'var(--text3)',
                      flexShrink: 0,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{key}</p>
                      {user ? (
                        <>
                          <p style={{ margin: '1px 0 0', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{user.name || <><Icon name="phone" size="xs" /> {user.phone?.slice(-4) || '—'}</>}</p>
                          <p style={{ margin: 0, fontSize: 11, color: 'var(--text3)' }}><Icon name="car" size="xs" /> {user.carNumber || '—'} · <Icon name="fuel" size="xs" /> {user.gasAmount || '—'}</p>
                        </>
                      ) : (
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text3)' }}>{t('station.sections.empty')}</p>
                      )}
                    </div>
                    {user && (
                      <button onClick={() => clearSection(key)} style={{
                        fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 6,
                        border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit',
                      }}><Icon name="check" size="xs" /> {t('station.sections.done')}</button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Queue & History */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <motion.div className="glass" style={{ overflow: 'hidden' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-heading)' }}><Icon name="list" size="sm" /> {t('station.queue')}</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="badge badge-blue">{queue.length} {t('stations.queue')}</span>
                <button onClick={clearQueue} className="btn-danger" style={{ padding: '5px 10px', fontSize: 11 }}><Icon name="trash" size="xs" /> {t('station.queue.clear')}</button>
              </div>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto', padding: '8px 12px' }}>
              {queue.length === 0 ? (
                <div className="empty-state">
                  <Icon name="car" size="xl" style={{ marginBottom: 8, color: 'var(--text3)' }} />
                  <p style={{ color: 'var(--text3)', fontSize: 13 }}>{t('station.queue.empty')}</p>
                </div>
              ) : queue.map((u, i) => (
                <motion.div key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-xs)', borderBottom: '1px solid var(--border)' }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                    background: i === 0 ? 'var(--grad)' : 'var(--surface2)',
                    color: i === 0 ? '#fff' : 'var(--text3)',
                  }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{u.name || <><Icon name="phone" size="xs" /> {u.phone?.slice(-4) || '—'}</>}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text3)' }}><Icon name="car" size="xs" /> {u.carNumber || '—'} · <Icon name="clock" size="xs" /> {u.joinedAt ? new Date(u.joinedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '—'}{u.arrivalTime ? <span> · {u.arrivalTime}</span> : ''}{u.gasAmount ? <span> · <Icon name="fuel" size="xs" /> {u.gasAmount}</span> : ''}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: sectionCount }, (_, s) => {
                      const key = `Sektsiya ${s + 1}`;
                      const occupied = !!sections[key];
                      return (
                        <button key={key} disabled={occupied} onClick={() => assignToSection(u.id, key)}
                          style={{
                            padding: '3px 7px', borderRadius: 5, fontSize: 10, fontWeight: 700, fontFamily: 'inherit',
                            border: `1px solid ${occupied ? 'var(--border)' : 'var(--accent)'}`,
                            background: occupied ? 'transparent' : 'rgba(82,127,176,0.08)',
                            color: occupied ? 'var(--text4)' : 'var(--accent)',
                            cursor: occupied ? 'not-allowed' : 'pointer', opacity: occupied ? 0.4 : 1,
                          }}>
                          S{s + 1}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* History */}
          <motion.div className="glass" style={{ overflow: 'hidden' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-heading)' }}><Icon name="history" size="sm" /> {t('station.history')}</p>
                <p style={{ fontSize: 11, color: 'var(--text3)', margin: '2px 0 0' }}>{t('station.history.browser')}</p>
              </div>
              <button onClick={clearHistory} className="btn-danger" style={{ padding: '5px 10px', fontSize: 11 }}><Icon name="trash" size="xs" /> {t('station.history.clear')}</button>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {history.length === 0 ? (
                <div className="empty-state">
                  <Icon name="clock" size="xl" style={{ marginBottom: 8, color: 'var(--text3)' }} />
                  <p style={{ color: 'var(--text3)', fontSize: 13 }}>{t('station.history.empty')}</p>
                </div>
              ) : history.slice(0, 15).map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                  <Icon name="fuel" size="sm" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text)', fontSize: 12 }}>{r.name}</p>
                    <p style={{ margin: 0, color: 'var(--text3)', fontSize: 11 }}><Icon name="car" size="xs" /> {r.carNumber}</p>
                  </div>
                  <span style={{ color: 'var(--text3)', fontSize: 11, textAlign: 'right' }}>
                    {new Date(r.time).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <motion.div className="glass" style={{ padding: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-heading)' }}><Icon name="star" size="sm" /> {t('station.reviews')}</p>
            {reviewAvg && <span className="badge badge-yellow"><Icon name="star" size="xs" /> {reviewAvg} {t('station.reviews.avg')} ({reviews.length} {t('station.reviews.ta')})</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reviews.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 14, padding: '16px 0' }}>{t('station.reviews.empty')}</p>
            ) : [...reviews].reverse().slice(0, 5).map((r, i) => (
              <div key={i} className="queue-item" style={{ gap: 10 }}>
                <div style={{ fontSize: 20, flexShrink: 0, color: '#fbbf24' }}>
                  {Array.from({ length: 5 }, (_, j) => (
                    <Icon key={j} name="star" size="sm" style={{ fill: j < r.stars ? '#fbbf24' : 'none', color: j < r.stars ? '#fbbf24' : 'var(--text4)' }} />
                  ))}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {r.comment && <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>"{r.comment}"</p>}
                  <p style={{ margin: r.comment ? '2px 0 0' : 0, fontSize: 11, color: 'var(--text3)' }}>{r.section || ''} · {new Date(r.time).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
