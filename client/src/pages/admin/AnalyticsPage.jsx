import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../components/Icons';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

const DAILY = Array.from({length:30}, (_,i) => ({
  date: `${i+1}-may`,
  visits: Math.floor(Math.random()*120+40),
  new: Math.floor(Math.random()*25+5),
}));

const WAIT_DATA = [
  { time:'07:00', min:3 },{ time:'08:00', min:8 },{ time:'09:00', min:18 },
  { time:'10:00', min:22 },{ time:'11:00', min:19 },{ time:'12:00', min:25 },
  { time:'13:00', min:28 },{ time:'14:00', min:21 },{ time:'15:00', min:16 },
  { time:'16:00', min:20 },{ time:'17:00', min:24 },{ time:'18:00', min:30 },
  { time:'19:00', min:22 },{ time:'20:00', min:14 },{ time:'21:00', min:8 },
];

const DISTRICT_DATA = [
  { name:'Chilonzor', count:312 },{ name:'Yunusobod', count:278 },
  { name:"Mirzo Ulug'bek", count:245 },{ name:'Shayxontohur', count:198 },
  { name:'Uchtepa', count:187 },{ name:'Olmazor', count:165 },
  { name:'Sergeli', count:142 },{ name:'Yakkasaroy', count:128 },
];

const PIE_DATA = [
  { name:"Navbat yo'q", value:6, color:'#10b981' },
  { name:"O'rtacha", value:8, color:'#f59e0b' },
  { name:'Band', value:4, color:'#ef4444' },
];

const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--surface-solid)', border:'1px solid var(--border2)', borderRadius:'var(--radius-sm)', padding:'10px 14px', fontSize:12, backdropFilter:'blur(20px)' }}>
      <p style={{ color:'var(--text3)', marginBottom:6 }}>{label}</p>
      {payload.map((p,i) => <p key={i} style={{ color:p.color, margin:'2px 0', fontWeight:600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

function ChartCard({ title, sub, children, delay=0 }) {
  return (
    <motion.div className="glass" style={{ padding:24 }}
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay }}>
      <div style={{ marginBottom:18 }}>
        <p style={{ fontSize:15, fontWeight:700, color:'var(--text)', margin:'0 0 3px', fontFamily:'var(--font-heading)' }}>{title}</p>
        {sub && <p style={{ fontSize:12, color:'var(--text3)', margin:0 }}>{sub}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export default function AnalyticsPage() {
  return (
    <div style={{ padding:'28px', position:'relative', zIndex:1 }}>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ marginBottom:24 }}>
        <h1 className="heading-2" style={{ margin:'0 0 4px' }}>Analitika</h1>
        <p style={{ fontSize:13, color:'var(--text3)', margin:0 }}>May 2025 — real vaqtdagi ko'rsatkichlar</p>
      </motion.div>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { icon:'chartLine', label:'Oylik tashriflar', val:'4,827', delta:'+12%', color:'#527FB0' },
          { icon:'users',      label:'Yangi foydalanuvchilar', val:'342', delta:'+8%', color:'#10b981' },
          { icon:'clock',      label:"O'rtacha kutish", val:'14.2 min', delta:'-5%', color:'#f59e0b' },
          { icon:'chart',      label:'Konversiya', val:'87%', delta:'+3%', color:'#8b5cf6' },
        ].map((k,i) => (
          <motion.div key={i} className="stat-card card-shine"
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}>
            <p style={{ fontSize:11, color:'var(--text3)', marginBottom:12, fontWeight:600, letterSpacing:'0.3px' }}>{k.label}</p>
            <p style={{ fontSize:28, fontWeight:800, color:'var(--text)', margin:'0 0 6px', lineHeight:1 }}>{k.val}</p>
            <span className={k.delta.startsWith('+') ? 'badge-green badge' : 'badge-yellow badge'}>
              {k.delta} o'tgan oyga nisbatan
            </span>
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <ChartCard title="Kunlik tashriflar" sub="Oxirgi 30 kun" delay={0.1}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={DAILY}>
              <defs>
                <linearGradient id="aVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#527FB0" stopOpacity={0.3}/><stop offset="95%" stopColor="#527FB0" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="aNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" interval={6} />
              <YAxis />
              <Tooltip content={<CT />} />
              <Area type="monotone" dataKey="visits" name="Tashriflar" stroke="#527FB0" strokeWidth={2} fill="url(#aVisits)" />
              <Area type="monotone" dataKey="new" name="Yangi" stroke="#10b981" strokeWidth={2} fill="url(#aNew)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="O'rtacha kutish vaqti" sub="Soatlar kesimida (daqiqalar)" delay={0.15}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={WAIT_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" interval={2} />
              <YAxis unit=" min" />
              <Tooltip content={<CT />} />
              <Line type="monotone" dataKey="min" name="Daqiqa" stroke="#f59e0b" strokeWidth={2.5}
                dot={{ fill:'#f59e0b', r:3 }} activeDot={{ r:5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        <ChartCard title="Tumanlar bo'yicha tashriflar" sub="Umumiy tashriflar soni" delay={0.2}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={DISTRICT_DATA} barSize={20}>
              <defs>
                <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C9FC9" /><stop offset="100%" stopColor="#527FB0" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-30} textAnchor="end" height={50} interval={0} fontSize={10} />
              <YAxis />
              <Tooltip content={<CT />} />
              <Bar dataKey="count" name="Tashriflar" fill="url(#bGrad)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Stansiyalar holati" sub="Hozirgi holatlar" delay={0.25}>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                paddingAngle={4} dataKey="value">
                {PIE_DATA.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<CT />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:12 }}>
            {PIE_DATA.map((d,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:d.color, flexShrink:0 }} />
                  <span style={{ fontSize:12, color:'var(--text2)' }}>{d.name}</span>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
