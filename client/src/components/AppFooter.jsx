import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icons';
import { useLanguage } from '../context/LanguageContext';

const ICONS = {
  admin: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  station: 'M12 2l9 4.5v9L12 20l-9-4.5v-9L12 2zm0 2.4L5.5 7.5v6L12 16.5l6.5-3v-6L12 4.4z',
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  guest: 'M3 10h2l1 2h13l1-2h2M5 10V6a1 1 0 011-1h3m4 0h3a1 1 0 011 1v4M9 5V3m6 2V3',
};

export default function AppFooter({ onScrollToQueue, onNearestAzs }) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const hasAdminToken = !!sessionStorage.getItem('admin_token');
  const hasStationToken = !!sessionStorage.getItem('station_token');
  const hasUser = !!sessionStorage.getItem('gazqueue_user');

  let accountLink, accountLabel, accountIcon;
  if (hasAdminToken) {
    accountLink = '/admin';
    accountLabel = t('footer.admin');
    accountIcon = ICONS.admin;
  } else if (hasStationToken) {
    accountLink = '/station-admin';
    accountLabel = t('footer.station');
    accountIcon = ICONS.station;
  } else if (hasUser) {
    accountLink = '/profile';
    accountLabel = t('footer.profile');
    accountIcon = ICONS.user;
  } else {
    accountLink = '/admin-login';
    accountLabel = t('footer.login');
    accountIcon = ICONS.guest;
  }

  return (
    <footer className="app-footer" style={{ fontFamily: 'var(--font-heading)' }}>
      <button
        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
        onClick={() => {
          if (location.pathname !== '/') navigate('/');
          else onScrollToQueue?.();
        }}
      >
        <Icon name="list" size="lg" />
        <span>{t('footer.queue')}</span>
      </button>

      <button className="nav-item" onClick={onNearestAzs}>
        <Icon name="mapPin" size="lg" />
        <span>{t('footer.azs')}</span>
      </button>

      <Link to="/notifications" className={`nav-item ${location.pathname === '/notifications' ? 'active' : ''}`} style={{ position:'relative' }}>
        <Icon name="bell" size="lg" />
        <span>{t('footer.notifications')}</span>
      </Link>

      <Link to={accountLink} className={`nav-item ${['/admin','/station-admin','/profile','/'].some(p => location.pathname === p || location.pathname.startsWith(p + '/')) ? 'active' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" style={{ width:22, height:22 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={accountIcon}/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        {accountLabel}
      </Link>
    </footer>
  );
}
