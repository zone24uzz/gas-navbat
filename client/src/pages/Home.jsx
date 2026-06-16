import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AppHeader from '../components/AppHeader';
import LeafletMap from '../components/LeafletMap';
import ReviewModal from '../components/ReviewModal';
import Icon from '../components/Icons';
import FloatingLabelInput, { FloatingLabelPhone } from '../components/FloatingLabelInput';
import { stations, haversine } from '../data/stations';
import { useToast } from '../components/Toast';
import { useLanguage } from '../context/LanguageContext';

const GAS_OPTS = [
  { val:'Yarim balon (~20L)',      icon:'battery', labelKey:'gas.half',  priceKey:'gas.half_sub', col:'#f97316' },
  { val:"To'liq balon (~40L)",     icon:'zap',     labelKey:'gas.full',  priceKey:'gas.full_sub', col:'#10b981' },
  { val:"Miqdorni ko'rsataman",    icon:'edit',    labelKey:'gas.custom', priceKey:'gas.custom_sub', col:'var(--text3)' },
  { val:'Shoshilinch (ozgina)',     icon:'rocket',  labelKey:'gas.urgent', priceKey:'gas.urgent_sub', col:'var(--accent)' },
];

const ARRIVAL_OPTS = [
  { val:'now',    icon:'zap',         labelKey:'arrival.now',   descKey:'arrival.now_desc' },
  { val:'15min',  icon:'clock',       labelKey:'arrival.15min', descKey:'arrival.15min_desc' },
  { val:'30min',  icon:'clock',       labelKey:'arrival.30min', descKey:'arrival.30min_desc' },
  { val:'1hour',  icon:'clock',       labelKey:'arrival.1hour', descKey:'arrival.1hour_desc' },
  { val:'custom', icon:'edit',        labelKey:'arrival.custom', descKey:'arrival.custom_desc' },
];

const STATS_CONFIG = [
  { icon:'fuel',     labelKey:'stats.total', color:'#527FB0', value: 18 },
  { icon:'circle',   labelKey:'stats.open', color:'#10b981', value: 10 },
  { icon:'users',    labelKey:'stats.online', color:'#7C9FC9', value: null },
  { icon:'car',      labelKey:'stats.active', color:'#f59e0b', value: null },
  { icon:'timer',    labelKey:'stats.avgwait', color:'#8b5cf6', value: '12 min' },
  { icon:'check',    labelKey:'stats.today', color:'#ec4899', value: null },
];

function Counter({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (typeof value !== 'number') { setDisplay(value); return; }
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(value / 30));
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(interval); }
      else setDisplay(start);
    }, duration / 30);
    return () => clearInterval(interval);
  }, [value]);
  return <>{typeof display === 'number' ? display.toLocaleString() : display}{suffix}</>;
}

function StatCard({ icon, label, value, color, index }) {
  return (
    <motion.div
      className="stat-card card-shine"
      initial={{ opacity: 0, y: 20, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.3 + index * 0.06, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -8, scale: 1.02, rotateX: 4 }}
      style={{ perspective: 600 }}
    >
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${color}15`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name={icon} size="lg" style={{ color }} />
        </div>
        <div className="glow-dot glow-dot-green" />
      </div>
      <p className="heading-2" style={{
        color: 'var(--text)',
        margin: '0 0 4px', lineHeight: 1, letterSpacing: '-1px',
      }}>
        <Counter value={value} />
      </p>
      <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0, fontWeight: 500 }}>{label}</p>
    </motion.div>
  );
}

function StationCard({ station, index, onSelect }) {
  const colors = { free: '#10b981', medium: '#f59e0b', busy: '#ef4444' };
  const { t } = useLanguage();
  const queues = { free: Math.floor(Math.random()*5), medium: Math.floor(Math.random()*10+5), busy: Math.floor(Math.random()*15+10) };
  const c = colors[station.load];
  const q = queues[station.load];

  return (
    <motion.div
      className="glass card-shine"
      style={{ padding: 20, cursor: 'pointer', position: 'relative', overflow: 'hidden', display:'flex', flexDirection:'column', perspective: 600, transformStyle: 'preserve-3d' }}
      initial={{ opacity: 0, y: 20, rotateX: 5 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -10, scale: 1.03, rotateX: 4, rotateY: -4, transition: { duration: 0.3 } }}
      onClick={() => onSelect(station.id, station.name)}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${c}, transparent)`, opacity: station.open ? 1 : 0.3, zIndex: 1 }} />
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom: 16 }}>
        <div className="float-3d--fast" style={{ width: 44, height: 44, borderRadius: 12, background: `${c}12`, border: `1px solid ${c}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="fuel" size="xl" style={{ color: c }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: `${c}15`, color: c, border: `1px solid ${c}25`, fontFamily: "var(--font-heading)", display: 'flex', alignItems: 'center', gap: 4 }}>
          {station.open ? 'Ochiq' : <><Icon name="lock" size="xs" /> Yopiq</>}
        </span>
      </div>
      <div style={{ flex:1, transformStyle: 'preserve-3d' }}>
        <p className="heading-4" style={{ color: 'var(--text)', margin: '0 0 4px' }}>{station.name}</p>
        <p style={{ fontSize: 12, color: 'var(--text3)', margin: '0 0 16px', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="mapPin" size="xs" /> {station.district} tumani
        </p>
        {station.open && (
          <div className="shimmer-overlay" style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text3)', marginBottom: 16, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)', fontFamily: 'var(--font-heading)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="car" size="xs" /> {q} {t('stations.queue')}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="clock" size="xs" /> ~{q * 3 + 2} {t('stations.wait')}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="star" size="xs" /> {(3.5 + Math.random() * 1.5).toFixed(1)}</span>
          </div>
        )}
      </div>
      <button className="btn-primary" style={{ width: '100%', padding: '9px', fontSize: 12, borderRadius: 'var(--radius-sm)', marginTop:'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={(e) => { e.stopPropagation(); onSelect(station.id, station.name); }}>
        <Icon name="car" size="sm" /> {t('stations.join')}
      </button>
    </motion.div>
  );
}

export default function Home() {
  const toast = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [selectedGas, setSelectedGas] = useState(null);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [joining, setJoining] = useState(false);
  const [selectedArrival, setSelectedArrival] = useState('now');
  const [customArrivalTime, setCustomArrivalTime] = useState('');
  const [gasStatus, setGasStatus] = useState(null);
  const [reviewReq, setReviewReq] = useState(null);
  const [botUsername, setBotUsername] = useState('');
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramPolling, setTelegramPolling] = useState(false);
  const [activeUser, setActiveUser] = useState(() => JSON.parse(sessionStorage.getItem('gazqueue_user') || 'null'));
  const pollCountRef = useRef(0);
  const [station, setStation] = useState({
    id: localStorage.getItem('selected_station_id') || '',
    name: localStorage.getItem('selected_station_name') || '',
  });
  const [liveStats, setLiveStats] = useState(STATS_CONFIG.map(s => ({
    ...s, label: t(s.labelKey),
    value: s.value === null ? (s.labelKey === 'stats.open' ? 10 : s.labelKey === 'stats.online' ? 47 : s.labelKey === 'stats.active' ? 0 : s.labelKey === 'stats.today' ? 247 + Math.floor(Math.random()*30) : s.value) : s.value,
  })));
  const [userLoc, setUserLoc] = useState(null);
  const [nearestDist, setNearestDist] = useState('—');
  const [nearestTime, setNearestTime] = useState('—');
  const queueRef = useRef(null);
  const pollRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserLoc(loc); window._userLocation = loc;
      const sorted = [...stations].map(s => ({ ...s, dist: haversine(loc.lat, loc.lng, s.lat, s.lng) })).sort((a, b) => a.dist - b.dist);
      const n = sorted[0]; const d = n.dist;
      setNearestDist(d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`);
      setNearestTime(`~${Math.round(d / 40 * 60)} min`);
    });
  }, []);

  // Poll Telegram linking status
  useEffect(() => {
    if (!telegramPolling || !phone) return;
    const rawPhone = '+998' + phone.replace(/\s/g, '');
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/telegram-check/${encodeURIComponent(rawPhone)}`).then(r => r.json());
        if (res.verified) {
          setTelegramPolling(false);
          setShowTelegramModal(false);
          toast(<><Icon name="check" size="sm" /> Telegram ulandi! Endi bildirishnomalarni olasiz</>, 'success');
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [telegramPolling, phone, toast]);

  // Fetch bot username on mount
  useEffect(() => {
    fetch('/api/bot-username').then(r => r.json()).then(d => setBotUsername(d.username || 'GazQueueBot')).catch(() => {});
  }, []);

  const pollQueue = useCallback(async () => {
    if (!station.id) return;
    try {
      const q = await fetch(`/api/station/queue?stationId=${station.id}`).then(r => r.json());
      setQueue(q);
      setLiveStats(prev => prev.map(s => s.labelKey === 'stats.active' ? { ...s, value: q.length } : s));
      if (activeUser) {
        pollCountRef.current++;
        const stillInQueue = q.find(u => u.id === activeUser.id);
        if (!stillInQueue && pollCountRef.current >= 3) {
          setActiveUser(null);
          sessionStorage.removeItem('gazqueue_user');
        } else if (stillInQueue) {
          pollCountRef.current = 0;
        }
        const rev = await fetch(`/api/review-check/${activeUser.id}`).then(r => r.json());
        if (rev) setReviewReq(rev);
      }
    } catch {}
  }, [station.id, activeUser]);

  useEffect(() => {
    if (!station.id) return;
    fetch(`/api/station/gas-status?stationId=${station.id}`).then(r => r.json()).then(setGasStatus).catch(() => {});
  }, [station.id]);

  useEffect(() => {
    pollQueue();
    clearInterval(pollRef.current);
    pollRef.current = setInterval(pollQueue, 3000);
    return () => clearInterval(pollRef.current);
  }, [pollQueue]);

  useEffect(() => {
    const t = setInterval(() => {
      setLiveStats(prev => prev.map(s => {
        if (s.labelKey === 'stats.online' && typeof s.value === 'number') return { ...s, value: Math.max(30, s.value + (Math.random() > 0.5 ? 1 : -1)) };
        if (s.labelKey === 'stats.today' && typeof s.value === 'number') return { ...s, value: s.value + (Math.random() > 0.7 ? 1 : 0) };
        return s;
      }));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  function selectStation(id, name) {
    localStorage.setItem('selected_station_id', id);
    localStorage.setItem('selected_station_name', name);
    setStation({ id, name });
    setTimeout(() => queueRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
    toast(<><Icon name="checkCircle" size="sm" /> {name} tanlandi</>, 'success');
  }

  function formatPhone(val) {
    let v = val.replace(/\D/g, '');
    if (v.length > 9) v = v.slice(0, 9);
    let result = '';
    if (v.length > 0) result = v.slice(0, 2);
    if (v.length > 2) result += ' ' + v.slice(2, 5);
    if (v.length > 5) result += ' ' + v.slice(5, 7);
    if (v.length > 7) result += ' ' + v.slice(7, 9);
    return result;
  }

  async function handleJoin() {
    if (!station.id) { toast(<><Icon name="xCircle" size="sm" /> Avval xaritadan stansiya tanlang</>, 'error'); return; }
    const rawPhone = phone.replace(/\s/g, '');
    if (!name.trim()) { toast(<><Icon name="xCircle" size="sm" /> Ismingizni kiriting</>, 'error'); return; }
    if (!carNumber.trim()) { toast(<><Icon name="xCircle" size="sm" /> Mashina raqamini kiriting</>, 'error'); return; }
    if (rawPhone.length < 9) { toast(<><Icon name="xCircle" size="sm" /> Telefon raqamingizni kiriting</>, 'error'); return; }
    if (!selectedGas) { toast(<><Icon name="xCircle" size="sm" /> Gaz miqdorini tanlang</>, 'error'); return; }
    setJoining(true);
    const body = { stationId: station.id, name: name.trim(), carNumber: carNumber.trim(), phone: '+998' + rawPhone, gasAmount: selectedGas, arrivalTime: selectedArrival };
    try {
      const res = await fetch('/api/station/join', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { toast(<><Icon name="xCircle" size="sm" /> {data.error}</>, 'error'); return; }
      data.user.stationId = station.id;
      setActiveUser(data.user);
      sessionStorage.setItem('gazqueue_user', JSON.stringify(data.user));
      toast(<><Icon name="party" size="sm" /> Navbatga muvaffaqiyatli yozildingiz!</>, 'success');
      if (!data.telegramLinked) {
        setShowTelegramModal(true);
        setTelegramPolling(true);
      }
      pollQueue();
    } catch { toast(<><Icon name="xCircle" size="sm" /> Xatolik yuz berdi</>, 'error'); }
    finally { setJoining(false); }
  }

  async function handleLeave() {
    if (!activeUser) return;
    await fetch('/api/station/leave', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stationId: activeUser.stationId || station.id, id: activeUser.id }),
    });
    setActiveUser(null);
    sessionStorage.removeItem('gazqueue_user');
    toast(<><Icon name="info" size="sm" /> Navbatdan chiqdingiz</>, 'info');
    pollQueue();
  }

  const myPos = activeUser ? queue.findIndex(u => u.id === activeUser.id) : -1;

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, paddingBottom: 80 }}>
      <AppHeader
        rightContent={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {activeUser && (
              <button onClick={() => navigate('/profile')} className="btn-secondary" style={{ padding: '7px 14px', fontSize: 13, gap: 8 }}>
                <Icon name="phone" size="sm" /> {activeUser.phone?.slice(-4)}
              </button>
            )}
          </div>
        }
      />

      <section ref={heroRef} style={{ padding: '60px 20px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(82,127,176,0.08)', border: '1px solid rgba(82,127,176,0.2)', borderRadius: 99, padding: '5px 14px', marginBottom: 20 }}>
              <span className="glow-dot glow-dot-green" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{t('hero.badge')}</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30, rotateX: -10 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="heading-display heading-display--xl"
              style={{ margin: '0 0 16px', perspective: 600 }}>
              {t('hero.title1')}<br /><span className="gradient-text">{t('hero.title2')}</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
              className="body-text--lg"
              style={{ color: 'var(--text2)', margin: '0 0 32px', maxWidth: 480 }}>
              {t('hero.desc')}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              <motion.button
                className="btn-primary"
                onClick={() => queueRef.current?.scrollIntoView({ behavior: 'smooth' })}
                style={{ padding: '16px 32px', fontSize: 16, gap: 10, borderRadius: 14 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {t('hero.btn.queue')}
              </motion.button>
              <motion.button
                className="btn-secondary"
                onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ padding: '16px 32px', fontSize: 16, borderRadius: 14 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {t('hero.btn.find')}
              </motion.button>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[{ icon: 'zap', key: 'hero.trust.realtime' }, { icon: 'lock', key: 'hero.trust.secure' }, { icon: 'smartphone', key: 'hero.trust.mobile' }].map(b => (
                <motion.div key={b.key}
                  className="hover-lift"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text3)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'default' }}
                  whileHover={{ x: 4 }}
                >
                  <div className="float-3d" style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={b.icon} size="sm" style={{ color: 'var(--text3)' }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}>{t(b.key)}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {liveStats.map((s, i) => (<StatCard key={i} {...s} index={i} />))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="map-section" style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 24 }}>
            <p className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="mapPin" size="sm" /> {t('map.title')}
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px' }}>{t('map.title')}</h2>
            <p style={{ fontSize: 14, color: 'var(--text2)', margin: 0 }}>{t('map.desc')}</p>
          </motion.div>
          <motion.div className="glass" style={{ overflow: 'hidden', borderRadius: 'var(--radius)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: 2, lineHeight:'28px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="filter" size="xs" /> {t('map.filter')}
              </span>
              {[{ key: 'map.free', color: '#10b981' }, { key: 'map.medium', color: '#f59e0b' }, { key: 'map.busy', color: '#ef4444' }].map(f => (
                <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--surface2)', borderRadius: 99, border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, display: 'inline-block', boxShadow: `0 0 6px ${f.color}` }} />
                  {t(f.key)}
                </div>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, fontSize: 12, color: 'var(--text3)', alignItems:'center', lineHeight:'28px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="pin" size="xs" /> {t('map.nearest_label')} <b style={{ color: 'var(--text)', fontWeight: 700 }}>{nearestDist}</b></span>
                <span style={{ color: 'var(--border2)' }}>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="navigation" size="xs" /> {t('map.route_label')} <b style={{ color: 'var(--text)', fontWeight: 700 }}>{nearestTime}</b></span>
              </div>
            </div>
            <div style={{ height: 440, position: 'relative' }}>
              <LeafletMap onSelectStation={selectStation} userLocation={userLoc} />
            </div>
          </motion.div>
        </div>
      </section>

      <section style={{ padding: '0 20px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 24 }}>
            <p className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="fuel" size="sm" /> {t('stations.title')}
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px' }}>{t('stations.title')}</h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {stations.slice(0, 6).map((s, i) => (<StationCard key={s.id} station={s} index={i} onSelect={selectStation} />))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 20px 40px' }} ref={queueRef}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 24 }}>
            <p className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="car" size="sm" /> {t('queue.title')}
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px' }}>{t('queue.title')}</h2>
          </motion.div>
          <motion.div className="glass card-shine" style={{ padding: 28, borderRadius: 'var(--radius)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ y: -4 }}>
            {station.id ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(82,127,176,0.06)', border: '1px solid rgba(82,127,176,0.15)', borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--grad-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="fuel" size="md" style={{ color: 'var(--text2)' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{t('queue.selected')}</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{station.name}</p>
                </div>
                <button onClick={() => { setStation({ id: '', name: '' }); localStorage.removeItem('selected_station_id'); localStorage.removeItem('selected_station_name'); }} className="btn-icon" style={{ marginLeft: 'auto', width: 28, height: 28 }}>
                  <Icon name="close" size="sm" />
                </button>
              </div>
            ) : (
              <div style={{ padding: '14px 16px', marginBottom: 20, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: 13, color: '#fbbf24', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name="arrowUp" size="sm" /> {t('queue.select_prompt')}
              </div>
            )}

            {gasStatus && station.id && (
              <div style={{ padding: '12px 16px', marginBottom: 20, borderRadius: 'var(--radius-sm)', background: gasStatus.available ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${gasStatus.available ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Icon name={gasStatus.available ? 'checkCircle' : 'xCircle'} size="md" style={{ color: gasStatus.available ? '#34d399' : '#f87171', marginTop: 1, flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: gasStatus.available ? '#34d399' : '#f87171' }}>
                    {gasStatus.available ? t('queue.gas_yes') : t('queue.gas_no')}{!gasStatus.available && gasStatus.eta && ` · ${gasStatus.eta} da keladi`}
                  </p>
                  {gasStatus.message && <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text3)' }}>{gasStatus.message}</p>}
                </div>
              </div>
            )}

            <AnimatePresence>
              {activeUser && myPos !== -1 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: '14px 18px', marginBottom: 20, borderRadius: 'var(--radius-sm)', background: myPos === 0 ? 'rgba(16,185,129,0.08)' : 'rgba(82,127,176,0.06)', border: `1px solid ${myPos === 0 ? 'rgba(16,185,129,0.2)' : 'rgba(82,127,176,0.15)'}`, textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: myPos === 0 ? '#34d399' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {myPos === 0 ? <><Icon name="party" size="md" /> {t('queue.you')} {t('queue.first')}!</> : <><Icon name="car" size="md" /> {t('queue.you')} #{myPos + 1} {t('queue.position')} — {myPos} {t('queue.ahead')}</>}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="list" size="sm" /> {t('queue.status')}
                </p>
                <span className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="car" size="xs" /> {queue.length} {t('stations.queue')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
                {queue.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center' }}>
                    <p style={{ marginBottom: 8 }}>
                      <Icon name={station.id ? 'car' : 'mapPin'} size="3xl" style={{ color: 'var(--text3)' }} />
                    </p>
                    <p style={{ color: 'var(--text3)', fontSize: 13, margin: 0 }}>{station.id ? t('queue.empty') : t('queue.select_prompt')}</p>
                  </div>
                ) : queue.map((u, i) => {
                  const isMe = activeUser && u.id === activeUser.id;
                  return (
                    <motion.div key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: `1px solid ${isMe ? 'var(--accent)' : i === 0 ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`, background: isMe ? 'rgba(82,127,176,0.06)' : i === 0 ? 'rgba(16,185,129,0.04)' : 'var(--surface)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'var(--grad)' : 'var(--surface2)', border: i === 0 ? 'none' : '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: i === 0 ? '#fff' : 'var(--text3)', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
                          {u.name || <><Icon name="phone" size="xs" /> {(u.phone?.slice(-4) || '—')}</>}
                        </span>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Icon name="car" size="xs" /> {u.carNumber || '—'}</span>
                          {u.joinedAt && <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>· <Icon name="clock" size="xs" /> {new Date(u.joinedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>}
                          {u.arrivalTime && <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>· <Icon name="clipboard" size="xs" /> {u.arrivalTime}</span>}
                        </div>
                      </div>
                      {isMe && <span className="badge badge-blue">{t('queue.you')}</span>}
                      {i === 0 && !isMe && <span className="badge badge-green">{t('queue.first')}</span>}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="divider" style={{ marginBottom: 20 }} />

            {!activeUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FloatingLabelInput
                  label={t('queue.name')}
                  icon="user"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />

                <FloatingLabelInput
                  label={t('queue.car')}
                  icon="car"
                  value={carNumber}
                  onChange={e => setCarNumber(e.target.value)}
                  required
                />

                <FloatingLabelPhone
                  label="Telefon"
                  value={phone}
                  onChange={e => setPhone(formatPhone(e.target.value))}
                  required
                />
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: -8, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Icon name="alertTriangle" size="xs" style={{ color: 'var(--text3)' }} /> Telefon raqam bir martalik. Navbatda faqat bir marta qatnasha olasiz.
                </p>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t('queue.gas_amount')} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                    {GAS_OPTS.map(opt => (
                      <button key={opt.val} onClick={() => setSelectedGas(opt.val)}
                        style={{ padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', border: `1px solid ${selectedGas === opt.val ? 'var(--accent)' : 'var(--border)'}`, background: selectedGas === opt.val ? 'rgba(82,127,176,0.08)' : 'var(--surface2)', transition: 'all 0.15s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Icon name={opt.icon} size="md" style={{ color: opt.col }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{t(opt.labelKey)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 11, color: opt.col, fontWeight: 600 }}>{t(opt.priceKey)}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label                    style={{ fontSize: 11, fontWeight: 600, color: 'var(--text4)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="clock" size="xs" /> {t('arrival.title')} <span style={{ color: '#527FB0', fontWeight: 400, textTransform: 'none', fontFamily: 'var(--font-body)' }}>({t('arrival.subtitle')})</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: 6 }}>
                    {ARRIVAL_OPTS.map(opt => (
                      <button key={opt.val} onClick={() => { setSelectedArrival(opt.val); if (opt.val !== 'custom') setCustomArrivalTime(''); }}
                        style={{ padding: '10px 6px', borderRadius: 'var(--radius-sm)', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit', border: `1px solid ${selectedArrival === opt.val ? 'var(--accent)' : 'var(--border)'}`, background: selectedArrival === opt.val ? 'rgba(82,127,176,0.08)' : 'var(--surface2)', transition: 'all 0.15s', fontSize: 11 }}>
                        <div style={{ marginBottom: 2, display: 'flex', justifyContent: 'center' }}>
                          <Icon name={opt.icon} size="md" style={{ color: selectedArrival === opt.val ? 'var(--accent)' : 'var(--text3)' }} />
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>{t(opt.labelKey)}</div>
                        <div style={{ color: 'var(--text3)', fontSize: 9, marginTop: 1 }}>{t(opt.descKey)}</div>
                      </button>
                    ))}
                  </div>
                  {selectedArrival === 'custom' && (
                    <input type="time" value={customArrivalTime} onChange={e => setCustomArrivalTime(e.target.value)} className="input" style={{ marginTop: 8, width: '100%' }} />
                  )}
                </div>

                <motion.button className="btn-primary" onClick={handleJoin} disabled={joining}
                  style={{ width: '100%', padding: 14, fontSize: 15, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {joining ? t('queue.loading') : <><Icon name="car" size="md" /> {t('queue.join_btn')}</>}
                </motion.button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>{station.name} {t('queue.at_station')}</p>
                <motion.button className="btn-danger" onClick={handleLeave} style={{ width: '100%', padding: 13, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                ><Icon name="logout" size="md" /> {t('queue.leave_btn')}</motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <nav className="mobile-nav">
        {[
          { icon: 'home', key: 'mob.home', action: () => heroRef.current?.scrollIntoView({ behavior: 'smooth' }) },
          { icon: 'mapPin', key: 'mob.azs', action: () => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' }) },
          { icon: 'car', key: 'mob.queue', action: () => queueRef.current?.scrollIntoView({ behavior: 'smooth' }) },
          { icon: 'bell', key: 'mob.notif', action: () => navigate('/notifications') },
          { icon: 'user', key: 'mob.profile', action: () => navigate(activeUser ? '/profile' : '/') },
        ].map((item, i) => (
          <button key={i} className="mobile-nav-item" onClick={item.action}>
            <Icon name={item.icon} size="lg" />
            {t(item.key)}
          </button>
        ))}
      </nav>

      {/* Telegram linking modal */}
      <AnimatePresence>
        {showTelegramModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, padding: 16,
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
                border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-xl)',
                maxWidth: 420,
                width: '100%',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '32px 28px', textAlign: 'center' }}>
                <div style={{
                  width: 72, height: 72,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0088cc 0%, #00bfff 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 24px rgba(0,136,204,0.3)',
                }}>
                  <Icon name="send" size="2xl" style={{ color: '#fff' }} />
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Icon name="smartphone" size="md" /> Telegramga ulaning
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', margin: '0 0 24px', lineHeight: 1.6 }}>
                  Navbat holati haqida bildirishnomalarni olish uchun
                  Telegram botga telefon raqamingizni ulang.
                </p>

                <div style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  marginBottom: 20,
                  textAlign: 'left',
                }}>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="clipboard" size="xs" /> Qo'llanma
                  </p>
                  <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
                    <li>Telegramni oching</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      @{botUsername || 'GazQueueBot'} qidiring va botni boshlang
                      <button
                        onClick={() => window.open(`https://t.me/${botUsername || 'GazQueueBot'}`, '_blank')}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '4px 10px',
                          borderRadius: 6, border: '1px solid var(--accent)',
                          background: 'var(--accent-bg)', color: 'var(--accent)',
                          fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        <Icon name="external" size="xs" /> Ochish
                      </button>
                    </li>
                    <li>
                      <code style={{ background: 'var(--surface)', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                        /link +998{phone || 'XXXXXXXXX'}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(`/link +998${phone.replace(/\s/g, '')}`)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          marginLeft: 6, padding: '2px 8px', border: 'none',
                          borderRadius: 4, background: 'var(--surface2)',
                          color: 'var(--text3)', fontSize: 11, cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        <Icon name="copy" size="xs" /> Nusxalash
                      </button>
                      <br />
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>— buyrug'ini yuboring</span>
                    </li>
                  </ol>
                </div>

                <div style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(82,127,176,0.06)',
                  border: '1px solid rgba(82,127,176,0.15)',
                  display: 'flex', alignItems: 'center', gap: 12,
                  marginBottom: 24,
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid var(--accent)',
                    borderTopColor: 'transparent',
                    animation: 'spin 1s linear infinite',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                    Telegram ulanishini kutmoqda...
                  </span>
                </div>
              </div>

              <div style={{
                padding: '16px 28px',
                borderTop: '1px solid var(--border)',
                display: 'flex', justifyContent: 'center',
              }}>
                <button
                  onClick={() => {
                    setShowTelegramModal(false);
                    setTelegramPolling(false);
                    toast(<><Icon name="alertTriangle" size="sm" /> Telegram ulanmasa bildirishnomalar kelmaydi</>, 'warning');
                  }}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--text3)', fontSize: 13,
                    cursor: 'pointer', fontFamily: 'inherit',
                    textDecoration: 'underline', textUnderlineOffset: 3,
                  }}
                >
                  Keyinroq ulayman
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {reviewReq && activeUser && (
        <ReviewModal section={reviewReq.section || 'Sektsiya'} stationId={activeUser.stationId || station.id} userId={activeUser.id} onClose={() => setReviewReq(null)} />
      )}
    </div>
  );
}
