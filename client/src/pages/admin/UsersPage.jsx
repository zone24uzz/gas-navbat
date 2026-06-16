import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../components/Icons';
import { useToast } from '../../components/Toast';

export default function UsersPage() {
  const toast = useToast();
  const token = sessionStorage.getItem('admin_token');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users', { headers: { 'x-admin-token': token } })
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.carNumber?.toLowerCase().includes(search.toLowerCase())
  );

  function timeAgo(iso) {
    if (!iso) return '—';
    const d = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (d < 60) return 'Hozirgina';
    if (d < 3600) return `${Math.floor(d / 60)} daqiqa oldin`;
    if (d < 86400) return `${Math.floor(d / 3600)} soat oldin`;
    return new Date(iso).toLocaleDateString('uz-UZ');
  }

  return (
    <div style={{ padding: '28px', position: 'relative', zIndex: 1 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="heading-2" style={{ margin: '0 0 4px' }}>Foydalanuvchilar</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>{users.length} ta ro'yxatdan o'tgan</p>
          </div>
          <button className="btn-ghost" onClick={() => {
            const csv = ['ID,Ism,Telefon,Mashina,Sana', ...users.map(u => `${u.id},${u.name},${u.phone},${u.carNumber},${u.createdAt}`)].join('\n');
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
            a.download = 'users.csv'; a.click();
            toast("CSV yuklandi", 'success');
          }}>
            <Icon name="download" size="sm" /> Export CSV
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div className="glass" style={{ padding: '12px 16px', marginBottom: 20 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div style={{ position: 'relative' }}>
          <Icon name="search" size="sm" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ism, telefon yoki mashina raqami..." className="input" style={{ paddingLeft: 38, margin: 0 }} />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div className="glass" style={{ overflow: 'hidden' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Foydalanuvchi</th>
                <th>Telefon</th>
                <th>Mashina</th>
                <th>Ro'yxatdan o'tgan</th>
                <th>Holat</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <p style={{ fontSize: 36, marginBottom: 8 }}>👥</p>
                  <p style={{ color: 'var(--text2)', fontWeight: 600 }}>{search ? 'Topilmadi' : "Foydalanuvchilar yo'q"}</p>
                </td></tr>
              ) : filtered.map((u, i) => (
                <motion.tr key={u.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'all 0.2s' }}>
                  <td style={{ color: 'var(--text3)', fontWeight: 500 }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--grad)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, color: '#fff',
                        flexShrink: 0,
                      }}>
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.phone}</td>
                  <td>            <span className="badge badge-blue"><Icon name="car" size="xs" /> {u.carNumber || '—'}</span></td>
                  <td style={{ fontSize: 12 }}>{timeAgo(u.createdAt)}</td>
                  <td><span className="badge badge-green">Faol</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{filtered.length} ta ko'rsatilmoqda</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
