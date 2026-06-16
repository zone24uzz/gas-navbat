import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../components/Icons';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { stations } from '../../data/stations';

const STATUS_MAP = {
  free:   { label:"Navbat yo'q",   cls:'badge-green',  dot:'glow-dot-green' },
  medium: { label:"O'rtacha",      cls:'badge-yellow', dot:'glow-dot-yellow' },
  busy:   { label:'Band',          cls:'badge-red',    dot:'glow-dot-red' },
};

export default function StationsPage() {
  const toast = useToast();
  const [list, setList] = useState(stations.map((s, i) => ({
    ...s,
    address: `${s.district} tumani, Toshkent`,
    queue: Math.floor(Math.random() * 20),
    wait: Math.floor(Math.random() * 25 + 2),
    rating: (3.5 + Math.random() * 1.5).toFixed(1),
  })));
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = list.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.district.toLowerCase().includes(search.toLowerCase())
  );

  function toggleStatus(id) {
    setList(prev => prev.map(s => s.id !== id ? s : { ...s, open: !s.open }));
    toast("Holat yangilandi", 'success');
  }

  function deleteStation(id) {
    if (!confirm("Stansiyani o'chirishni tasdiqlaysizmi?")) return;
    setList(prev => prev.filter(s => s.id !== id));
    toast("Stansiya o'chirildi", 'success');
  }

  const openCount = list.filter(s => s.open).length;

  return (
    <div style={{ padding: '28px', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="heading-2" style={{ margin: '0 0 4px' }}>Stansiyalar</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>{list.length} ta jami · {openCount} ta ochiq</p>
          </div>
          <button className="btn-primary" onClick={() => setAddOpen(true)} style={{ gap: 8 }}>
            <Icon name="plus" size="sm" /> Stansiya qo'shish
          </button>
        </div>
      </motion.div>

      {/* Search + filters */}
      <motion.div className="glass" style={{ padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Icon name="search" size="sm" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Stansiya nomi yoki tuman..." className="input" style={{ paddingLeft: 38, margin: 0 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Hammasi', 'Ochiq', 'Yopiq'].map(f => (
            <button key={f} className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>{f}</button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div className="glass" style={{ overflow: 'hidden' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Stansiya</th>
                <th>Tuman</th>
                <th>Navbat</th>
                <th>Kutish vaqti</th>
                <th>Reyting</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const st = STATUS_MAP[s.load];
                return (
                  <motion.tr key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ scale: 1.005, backgroundColor: 'var(--surface)' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--grad-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="fuel" size="sm" /></div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{s.name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: 'var(--text3)' }}>{s.address}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-blue" style={{ fontSize: 11 }}>{s.district}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className={`glow-dot ${st.dot}`} />
                        <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{s.queue} ta</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{s.wait} min</td>                        <td><span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13 }}><Icon name="star" size="xs" style={{ color: '#fbbf24', fill: '#fbbf24' }} /> {s.rating}</span></td>
                    <td>
                      <span className={`badge ${s.open ? 'badge-green' : 'badge-gray'}`}>
                        {s.open ? 'Ochiq' : 'Yopiq'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setEditItem(s)}><Icon name="edit" size="sm" /></button>
                        <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => toggleStatus(s.id)}>{s.open ? <Icon name="lock" size="sm" /> : <Icon name="check" size="sm" />}</button>
                        <button className="btn-icon" style={{ width: 32, height: 32, color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }} onClick={() => deleteStation(s.id)}><Icon name="trash" size="sm" /></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <p style={{ fontSize: 36, marginBottom: 12 }}>🔍</p>
              <p style={{ color: 'var(--text2)', fontWeight: 600 }}>Stansiya topilmadi</p>
              <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>Qidiruv so'rovini o'zgartiring</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={`Tahrirlash: ${editItem?.name}`}>
        {editItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Nomi</label>
              <input defaultValue={editItem.name} className="input" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Manzil</label>
              <input defaultValue={editItem.address} className="input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Kenglik</label>
                <input defaultValue={editItem.lat} className="input" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Uzunlik</label>
                <input defaultValue={editItem.lng} className="input" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => { toast("Saqlandi", 'success'); setEditItem(null); }}>Saqlash</button>
              <button className="btn-ghost" onClick={() => setEditItem(null)}>Bekor</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yangi stansiya qo'shish">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {['Nomi', 'Manzil', 'Tuman', 'Kenglik (lat)', 'Uzunlik (lng)'].map(lbl => (
            <div key={lbl}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>{lbl}</label>
              <input className="input" placeholder={lbl} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => { toast("Stansiya qo'shildi", 'success'); setAddOpen(false); }}>Qo'shish</button>
            <button className="btn-ghost" onClick={() => setAddOpen(false)}>Bekor</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
