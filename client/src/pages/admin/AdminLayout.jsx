import React from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import Icon from '../../components/Icons';
import Sidebar from '../../components/Sidebar';

const MOB_NAV = [
  { to:'/admin',           icon:'chart',      label:'Panel', end: true },
  { to:'/admin/stations',  icon:'fuel',       label:'AZS' },
  { to:'/admin/queues',    icon:'list',       label:'Navbat' },
  { to:'/admin/analytics', icon:'chartLine',  label:'Analitika' },
  { to:'/admin/config',    icon:'settings',   label:'Sozlama' },
];

export default function AdminLayout() {
  const token = sessionStorage.getItem('admin_token');
  if (!token) return <Navigate to="/admin-login" replace />;

  return (
    <div className="admin-layout" style={{ position:'relative', zIndex:1 }}>
      <Sidebar />
      <main className="admin-main">
        <Outlet />
      </main>
      {/* Mobile nav */}
      <nav className="mobile-nav">
        {MOB_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none', fontFamily: 'var(--font-heading)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
          >
            <Icon name={item.icon} size="md" />
            <span style={{ fontSize: 10 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
