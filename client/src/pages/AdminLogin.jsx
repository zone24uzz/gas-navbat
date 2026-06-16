import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/Icons';
import AppHeader from '../components/AppHeader';
import RippleButton from '../components/RippleButton';
import { FloatingLabelPhone } from '../components/FloatingLabelInput';
import { useLanguage } from '../context/LanguageContext';

export default function AdminLogin() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('admin_token')) navigate('/admin');
    if (sessionStorage.getItem('station_token')) navigate('/station-admin');
  }, []);

  async function doLogin() {
    const rawPhone = phone.replace(/\s/g, '');
    if (!rawPhone || !password) { setError(t('admin.login.empty_error')); return; }
    setLoading(true); setError('');
    try {
      const stRes = await fetch('/api/auth/station-login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+998' + rawPhone, password }),
      });
      if (stRes.ok) {
        const data = await stRes.json();
        sessionStorage.setItem('station_token', data.token);
        sessionStorage.setItem('station_id', data.stationId);
        sessionStorage.setItem('station_name', data.stationName);
        navigate('/station-admin');
        return;
      }
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+998' + rawPhone, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(t('admin.login.error')); return; }
      sessionStorage.setItem('admin_token', data.token);
      navigate('/admin');
    } catch { setError(t('admin.login.generic_error')); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 68, height: 68, background: 'var(--grad)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px var(--accent-glow)' }}>
              <Icon name="lock" size="xl" style={{ color: '#fff' }} />
            </div>
            <h1 className="heading-display" style={{ margin: '0 0 6px' }}>{t('admin.login.title')}</h1>
            <p style={{ color: 'var(--text3)', fontSize: 14, margin: 0 }}>{t('admin.login.subtitle')}</p>
          </div>
          <div className="glass" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FloatingLabelPhone
              label={t('admin.login.phone')}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              onKeyDown={e => e.key === 'Enter' && doLogin()}
            />
            <div className="floating-label-group">
              <div className={`floating-label-input ${error && error.includes('parol') ? 'has-error' : ''}`}>
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder=" "
                  className="fl-input"
                  style={{ paddingRight: 48 }}
                  onKeyDown={e => e.key === 'Enter' && doLogin()}
                  autoComplete="off"
                />
                <label htmlFor="admin-password" className="fl-label">
                  {t('admin.login.password')}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="btn-icon"
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 3, width: 32, height: 32 }}
                >
                  {showPass ? <Icon name="eye" size="sm" /> : <Icon name="eyeOff" size="sm" />}
                </button>
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
            <Link to="/" style={{ color: 'var(--text3)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-heading)' }}><Icon name="arrowLeft" size="xs" /> {t('admin.login.back')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
