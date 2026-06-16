import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../components/Icons';
import { useToast } from '../../components/Toast';
import Modal from '../../components/Modal';

export default function QueuesPage() {
  const toast = useToast();
  const token = sessionStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', 'x-admin-token': token };

  const [queue, setQueue] = useState([]);
  const [sections, setSections] = useState({});
  const [sectionCount, setSectionCount] = useState(3);
  const [confirmClear, setConfirmClear] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  async function load() {
    try {
      const [q, s] = await Promise.all([
        fetch('/api/queue').then(r => r.json()),
        fetch('/api/admin/sections', { headers }).then(r => r.json()),
      ]);
      setQueue(q); setSections(s); setLoading(false);
    } catch {}
  }

  async function assign(userId, section) {
    await fetch('/api/admin/assign', { method: 'POST', headers, body: JSON.stringify({ userId, section }) });
    toast(`${section}ga tayinlandi`, 'success');
    load();
  }

  async function removeUser(id) {
    await fetch('/api/leave', { method: 'POST', headers, body: JSON.stringify({ id }) });
    toast("Foydalanuvchi chiqarildi", 'info');
    load();
  }

  async function clearAll() {
    await fetch('/api/admin/clear', { method: 'POST', headers });
    toast("Navbat tozalandi", 'success');
    setConfirmClear(false); load();
  }

  async function clearSection(key) {
    await fetch('/api/admin/sections/clear', { method: 'POST', headers, body: JSON.stringify({ section: key }) });
    toast(`${key} bo'shatildi`, 'info');
    load();
  }

  const busy = Object.keys(sections).length;

  return (
    <div style={{ padding: '28px', position: 'relative', zIndex: 1 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="heading-2" style={{ margin: '0 0 4px' }}>Navbat boshqaruvi</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>{queue.length} ta kutmoqda · {busy} sektsiya band</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 14px' }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>Seksiya:</span>
              <select value={sectionCount} onChange={e => setSectionCount(Number(e.target.value))} className="select" style={{ padding: '4px 8px', border: 'none', background: 'transparent' }}>
                {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button className="btn-danger" onClick={() => setConfirmClear(true)}><Icon name="trash" size="xs" /> Tozalash</button>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Queue list */}
        <motion.div className="glass" style={{ overflow: 'hidden' }}
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: 14, fontFamily: 'var(--font-heading)' }}>Navbat ro'yxati</p>
            <span className="badge badge-blue"><Icon name="car" size="xs" /> {queue.length} kishi</span>
          </div>
          <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Yuklanmoqda...</div>
            ) : queue.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: 40, marginBottom: 12 }}>🚗</p>
                <p style={{ color: 'var(--text2)', fontWeight: 600 }}>Navbat bo'sh</p>
                <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 4 }}>Yangi mijozlar kutilmoqda</p>
              </div>
            ) : queue.map((u, i) => (
              <motion.div key={u.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i === 0 ? 'var(--grad)' : 'var(--surface2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800,
                  color: i === 0 ? '#fff' : 'var(--text3)',
                  border: i === 0 ? 'none' : '1px solid var(--border)',
                  flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{u.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text3)' }}>
                    🚗 {u.carNumber || '—'} · 🕐 {new Date(u.joinedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    {u.arrivalTime ? ` · 📋 ${u.arrivalTime}` : ''}
                    {u.gasAmount ? ` · ⛽ ${u.gasAmount}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {Array.from({ length: sectionCount }, (_, s) => {
                    const key = `Sektsiya ${s + 1}`;
                    const occ = !!sections[key];
                    return (
                      <button key={key} onClick={() => !occ && assign(u.id, key)}
                        style={{
                          padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: 'inherit',
                          border: `1px solid ${occ ? 'var(--border)' : 'var(--accent)'}`,
                          background: occ ? 'transparent' : 'rgba(82,127,176,0.08)',
                          color: occ ? 'var(--text4)' : 'var(--accent)',
                          cursor: occ ? 'not-allowed' : 'pointer', opacity: occ ? 0.35 : 1,
                        }}>
                        {occ ? `S${s + 1}✗` : `→S${s + 1}`}
                      </button>
                    );
                  })}
                  <button onClick={() => removeUser(u.id)} className="btn-danger" style={{ padding: '4px 7px', fontSize: 10 }}><Icon name="close" size="xs" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <p className="section-label" style={{ fontFamily: 'var(--font-heading)' }}>Seksiyalar holati</p>
          </motion.div>
          {Array.from({ length: sectionCount }, (_, i) => {
            const key = `Sektsiya ${i + 1}`;
            const user = sections[key];
            return (
              <motion.div key={key} className="glass" style={{ padding: 16 }}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: user ? 12 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: user ? 'var(--grad)' : 'var(--surface2)',
                      border: user ? 'none' : '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: user ? '#fff' : 'var(--text3)',
                      flexShrink: 0,
                    }}>{i + 1}</div>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{key}</p>
                      {!user && <p style={{ margin: 0, fontSize: 12, color: 'var(--text3)' }}>Bo'sh</p>}
                    </div>
                  </div>
                  {user && (
                    <button onClick={() => clearSection(key)}
                      style={{
                        padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                        border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.08)',
                        color: '#34d399', cursor: 'pointer',
                      }}>✓ Tayyor</button>
                  )}
                </div>
                {user && (
                  <div style={{ paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{user.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text3)' }}>🚗 {user.carNumber || '—'}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="Navbatni tozalash" maxWidth={380}>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>
          Barcha {queue.length} ta foydalanuvchi navbatdan o'chiriladi. Tasdiqlaysizmi?
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-danger" style={{ flex: 1, padding: '11px' }} onClick={clearAll}>Ha, tozalash</button>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmClear(false)}>Bekor</button>
        </div>
      </Modal>
    </div>
  );
}
