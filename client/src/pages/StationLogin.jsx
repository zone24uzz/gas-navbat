import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/Icons';
import AppHeader from '../components/AppHeader';
import RippleButton from '../components/RippleButton';
import { FloatingLabelPhone } from '../components/FloatingLabelInput';
import { useLanguage } from '../context/LanguageContext';

export default function StationLogin() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('station_token')) navigate('/station-admin');
  }, []);

  async function doLogin() {
    const rawPhone = phone.replace(/\s/g, '');
    if (!rawPhone || !password) { setError(t('admin.login.empty_error')); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/station-login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+998' + rawPhone, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(t('admin.login.error')); return; }
      sessionStorage.setItem('station_token', data.token);
      sessionStorage.setItem('station_id', data.stationId);
      sessionStorage.setItem('station_name', data.stationName);
      navigate('/station-admin');
    } catch { setError(t('admin.login.generic_error')); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 68, height: 68, background: 'linear-gradient(135deg,#f97316,#eab308)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(249,115,22,0.3)' }}>
              <Icon name="fuel" size="xl" style={{ color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px', fontFamily: 'var(--font-display)', letterSpacing: '-0.3px' }}>{t('station.login.title')}</h1>
            <p style={{ color: 'var(--text3)', fontSize: 14, margin: 0 }}>{t('station.login.subtitle')}</p>
          </div>
          <div className="glass" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FloatingLabelPhone
              label={t('admin.login.phone')}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              error={error && error.includes('Telefon') ? error : ''}
              required
              onKeyDown={e => e.key === 'Enter' && doLogin()}
            />
            <div className="floating-label-group">
              <div className={`floating-label-input ${error ? 'has-error' : ''}`}>
                <input
                  id="station-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder=" "
                  className="fl-input"
                  onKeyDown={e => e.key === 'Enter' && doLogin()}
                  autoComplete="off"
                />
                <label htmlFor="station-password" className="fl-label">
                  {t('admin.login.password')}
                </label>
              </div>
            </div>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, borderRadius: 'var(--radius-sm)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="alertTriangle" size="sm" style={{ color: '#ef4444', flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}
            <RippleButton
              className="btn-primary"
              onClick={doLogin}
              disabled={loading}
              style={{ width: '100%', padding: 15, fontSize: 15, borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}
            >
              {loading ? (
                <><div className="spinner-sm" /> {t('admin.login.checking')}</>
              ) : (
                <><Icon name="login" size="sm" /> {t('admin.login.submit')}</>
              )}
            </RippleButton>
          </div>
          <p style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/" style={{ color: 'var(--text3)', fontSize: 13, textDecoration: 'none' }}><Icon name="arrowLeft" size="xs" /> {t('admin.login.back')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
