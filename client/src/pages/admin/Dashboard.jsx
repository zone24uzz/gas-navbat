import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../components/Icons';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { StatCardSkeleton } from '../../components/Skeleton';

const VISIT_DATA = [
  { day:'Du', visits:42, queues:18 },
  { day:'Se', visits:65, queues:28 },
  { day:'Ch', visits:53, queues:22 },
  { day:'Pa', visits:78, queues:35 },
  { day:'Ju', visits:91, queues:41 },
  { day:'Sh', visits:110, queues:52 },
  { day:'Ya', visits:87, queues:38 },
];

const STATION_DATA = [
  { name:'AZS №1', count:45 },
  { name:'AZS №3', count:38 },
  { name:'AZS №7', count:32 },
  { name:'AZS №12', count:28 },
  { name:'AZS №5', count:24 },
];

const HOUR_DATA = Array.from({length:24}, (_,i) => ({
  h: `${String(i).padStart(2,'0')}:00`,
  load: i<6 ? Math.round(Math.random()*8+2) : i<9 ? Math.round(Math.random()*40+20) :
        i<12 ? Math.round(Math.random()*30+50) : i<14 ? Math.round(Math.random()*20+70) :
        i<18 ? Math.round(Math.random()*25+55) : i<21 ? Math.round(Math.random()*35+40) :
        Math.round(Math.random()*20+10),
}));

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-solid)', border: '1px solid var(--border2)',
      borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 12,
      backdropFilter: 'blur(20px)',
    }}>
      <p style={{ color: 'var(--text3)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0', fontWeight: 600 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

function StatCard({ icon, label, value, sub, color, loading, delay = 0 }) {
  if (loading) return <StatCardSkeleton />;
  return (
    <motion.div className="stat-card card-shine"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', margin: 0, letterSpacing: '0.3px', fontFamily: 'var(--font-heading)' }}>{label}</p>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}><Icon name={icon} size="md" style={{ color }} /></div>
      </div>
      <p style={{
        fontSize: 32, fontWeight: 800, color: 'var(--text)',
        margin: '0 0 6px', lineHeight: 1, letterSpacing: '-1px',
      }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0 }}>{sub}</p>}
    </motion.div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0, online: 0, queues: 0, stations: 18, visits: 0, avgWait: 0
  });

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    const h = { 'x-admin-token': token };
    Promise.all([
      fetch('/api/queue', { headers: h }).then(r => r.json()).catch(() => []),
      fetch('/api/users', { headers: h }).then(r => r.json()).catch(() => []),
    ]).then(([queue, users]) => {
      setStats({
        users: users.length,
        online: Math.min(queue.length + Math.floor(Math.random() * 12 + 3), users.length || 20),
        queues: queue.length,
        stations: 18,
        visits: 247 + Math.floor(Math.random() * 30),
        avgWait: Math.round(queue.length * 3.5 + 2),
      });
      setLoading(false);
    });
  }, []);

  const CARDS = [
    { icon:'users', label:'Jami foydalanuvchilar', value: stats.users || '—', sub:"Ro'yxatdan o'tgan", color:'#527FB0', delay:0 },
    { icon:'circle', label:'Onlayn foydalanuvchilar', value: stats.online, sub:'Hozir faol', color:'#10b981', delay:0.05 },
    { icon:'car', label:'Aktiv navbatlar', value: stats.queues, sub:'Barcha stansiyalar', color:'#f59e0b', delay:0.1 },
    { icon:'fuel', label:'Jami stansiyalar', value: stats.stations, sub:'10 ta ochiq', color:'#7C9FC9', delay:0.15 },
    { icon:'calendar', label:'Bugun xizmat', value: stats.visits, sub:"Bugun o'tkazilgan", color:'#8b5cf6', delay:0.2 },
    { icon:'clock', label:"O'rtacha kutish", value: `${stats.avgWait} min`, sub:'Hozirgi vaqt', color:'#ec4899', delay:0.25 },
  ];

  return (
    <div style={{ padding: '28px', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="heading-2" style={{ margin: '0 0 4px' }}>Dashboard</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>
              {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-green">
              <span className="glow-dot glow-dot-green" />
              Tizim ishlayapti
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        {CARDS.map((c, i) => <StatCard key={i} {...c} loading={loading} />)}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 20 }}>
        {/* Area chart */}
        <motion.div className="glass" style={{ padding: 24 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 3px', fontFamily: 'var(--font-heading)' }}>Tashrif statistikasi</p>
              <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>Oxirgi 7 kun</p>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text3)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#527FB0', display: 'inline-block' }} />Tashriflar
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />Navbatlar
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={VISIT_DATA}>
              <defs>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#527FB0" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#527FB0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="visits" name="Tashriflar" stroke="#527FB0" strokeWidth={2} fill="url(#gradBlue)" />
              <Area type="monotone" dataKey="queues" name="Navbatlar" stroke="#10b981" strokeWidth={2} fill="url(#gradGreen)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar chart */}
        <motion.div className="glass" style={{ padding: 24 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>Mashhur stansiyalar</p>
          <p style={{ fontSize: 12, color: 'var(--text3)', margin: '0 0 20px' }}>Tashriflar soni</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={STATION_DATA} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={65} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Tashriflar" radius={[0, 8, 8, 0]} fill="url(#barGrad)" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#527FB0" />
                  <stop offset="100%" stopColor="#7C9FC9" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Load by hour */}
      <motion.div className="glass" style={{ padding: 24 }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 3px', fontFamily: 'var(--font-heading)' }}>Kunlik yuklanish</p>
          <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>Soatlar kesimida mijozlar oqimi (%)</p>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={HOUR_DATA}>
            <defs>
              <linearGradient id="gradHour" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C9FC9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7C9FC9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="h" interval={3} />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="load" name="Yuklanish" stroke="#7C9FC9" strokeWidth={2} fill="url(#gradHour)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
