import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Icon from './Icons';
import ThemeToggle from './ThemeToggle';
import { useLanguage } from '../context/LanguageContext';

const NAV = [
  { to:'/admin',          icon:'chart',     key:'admin.nav.dashboard', end: true },
  { to:'/admin/stations', icon:'fuel',      key:'admin.nav.stations' },
  { to:'/admin/queues',   icon:'list',      key:'admin.nav.queues' },
  { to:'/admin/users',    icon:'users',     key:'admin.nav.users' },
  { to:'/admin/analytics',icon:'chartLine', key:'admin.nav.analytics' },
  { to:'/admin/config',   icon:'settings',  key:'admin.nav.settings' },
];

export default function Sidebar() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  function logout() {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('station_token');
    navigate('/admin-login');
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:36, height:36, borderRadius:10, background:'var(--grad)',
            display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0, boxShadow:'0 4px 14px var(--accent-glow)'
          }}>
            <Icon name="fuel" size="sm" style={{ color:'#fff' }} />
          </div>
          <div>
            <p style={{ fontWeight:800, fontSize:15, color:'var(--text)', margin:0, lineHeight:1.2, fontFamily:'var(--font-heading)' }}>{t('app.name')}</p>
            <p style={{ fontSize:10, color:'var(--text3)', margin:0, fontWeight:500, letterSpacing:'0.3px', fontFamily:'var(--font-heading)' }}>{t('admin.panel')}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{
        flex:1, padding:'16px 10px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto'
      }}>
        <p style={{
          fontSize:10, fontWeight:700, color:'var(--text4)', textTransform:'uppercase',
          letterSpacing:'1px', padding:'4px 10px 8px', marginTop:0,
          fontFamily:'var(--font-heading)'
        }}>
          {t('admin.nav.main')}
        </p>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{ fontFamily:'var(--font-heading)' }}
          >
            <Icon name={item.icon} size="sm" style={{ width:22, textAlign:'center' }} />
            {t(item.key)}
          </NavLink>
        ))}

        <div style={{ flex:1 }} />
        <div className="divider" style={{ margin:'8px 0' }} />
        <p style={{
          fontSize:10, fontWeight:700, color:'var(--text4)', textTransform:'uppercase',
          letterSpacing:'1px', padding:'4px 10px 6px',
          fontFamily:'var(--font-heading)'
        }}>
          {t('admin.nav.account')}
        </p>
        <div style={{ padding:'6px 10px', display:'flex', alignItems:'center', gap:8 }}>
          <ThemeToggle />
          <button onClick={logout} className="btn-ghost" style={{ flex:1, padding:'8px 12px', fontSize:12 }}>
            <Icon name="logout" size="sm" /> {t('admin.logout')}
          </button>
        </div>
      </nav>
    </aside>
  );
}
