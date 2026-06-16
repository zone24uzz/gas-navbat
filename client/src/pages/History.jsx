import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/Icons';
import AppHeader from '../components/AppHeader';
import { useLanguage } from '../context/LanguageContext';

export default function History() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) navigate('/admin-login');
    loadHistory();
  }, []);

  function loadHistory() {
    setHistory(JSON.parse(localStorage.getItem('refuel_history') || '[]'));
  }

  function isToday(iso) { return new Date(iso).toDateString() === new Date().toDateString(); }
  function isThisWeek(iso) { return new Date(iso) >= new Date(Date.now() - 7 * 86400000); }

  function clearHistory() {
    if (!confirm(t('history.confirm_clear'))) return;
    localStorage.removeItem('refuel_history');
    loadHistory();
  }

  const filtered = history.filter(r => {
    if (filter === 'today' && !isToday(r.time)) return false;
    if (filter === 'week' && !isThisWeek(r.time)) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.carNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const todayCount = history.filter(r => isToday(r.time)).length;
  const topAmount = (() => {
    if (!history.length) return '—';
    const counts = {};
    history.forEach(r => { counts[r.gasAmount] = (counts[r.gasAmount] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0].split('(')[0].trim() : '—';
  })();

  return (
    <div style={{ paddingBottom: 32 }}>
      <AppHeader
        maxWidth="900px"
        rightContent={
          <button onClick={clearHistory} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 11 }}>
            <Icon name="trash" size="xs" /> {t('history.clear')}
          </button>
        }
      />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
          <h1 className="heading-2" style={{ margin: '0 0 4px' }}><Icon name="history" size="md" /> {t('history.title')}</h1>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { val: todayCount, key: 'history.stats.today', color: 'var(--accent)' },
            { val: history.length, key: 'history.stats.total', color: 'var(--accent2)' },
            { val: topAmount, key: 'history.stats.top', color: '#f97316', small: true },
          ].map((s, i) => (
            <motion.div key={i} className="stat-card card-shine" style={{ padding: 18, textAlign: 'center' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}>
              <p style={{ fontSize: s.small ? 20 : 32, fontWeight: 800, color: s.color, margin: '0 0 4px', lineHeight: 1 }}>{s.val}</p>
              <p style={{ color: 'var(--text3)', fontSize: 12, fontWeight: 600, margin: 0 }}>{t(s.key)}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Icon name="filter" size="sm" style={{ color: 'var(--text2)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{t('history.filter')}</span>
          {[['all', 'history.filter.all'], ['today', 'history.filter.today'], ['week', 'history.filter.week']].map(([v, k]) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{
                padding: '7px 14px', borderRadius: 9, border: '1.5px solid var(--border)',
                background: filter === v ? 'rgba(82,127,176,0.08)' : 'var(--surface2)',
                fontSize: 12, fontWeight: 600, color: filter === v ? 'var(--accent)' : 'var(--text2)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {t(k)}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ position: 'relative' }}>
            <Icon name="search" size="xs" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text"
              placeholder={t('history.search')} className="input" style={{ width: 200, padding: '7px 12px 7px 36px', margin: 0 }} />
          </div>
        </div>

        {/* Table */}
        <div className="glass" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <Icon name="clipboard" size="2xl" style={{ marginBottom: 12, color: 'var(--text3)' }} />
                <p style={{ fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>{t('history.empty.title')}</p>
                <p style={{ color: 'var(--text3)', fontSize: 13, margin: 0 }}>{t('history.empty.desc')}</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    {['history.table.number', 'history.table.name', 'history.table.car', 'history.table.gas', 'history.table.section', 'history.table.time'].map(h => (
                      <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{t(h)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const d = new Date(r.time);
                    const today = isToday(r.time);
                    return (
                      <tr key={i}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = today ? 'rgba(82,127,176,0.02)' : ''}
                        style={{ borderBottom: '1px solid var(--border)', background: today ? 'rgba(82,127,176,0.02)' : '', transition: 'background 0.2s', cursor: 'default' }}>
                        <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>{filtered.length - i}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.name}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}><Icon name="car" size="xs" /> {r.carNumber}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#f97316', fontWeight: 600 }}><Icon name="fuel" size="xs" /> {r.gasAmount}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, color: 'var(--text3)' }}>{r.section || '—'}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12 }}>
                          <span style={{ color: today ? 'var(--accent)' : 'var(--text3)', fontWeight: today ? 700 : 400 }}>
                            {today ? t('history.today') : d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                          </span>
                          <span style={{ color: 'var(--text3)' }}> · {d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
