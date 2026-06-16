import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../components/Icons';
import { useToast } from '../../components/Toast';

const TABS = ['Asosiy', 'Stansiyalar', 'Navbatlar', "Xabarnomalar", 'Xavfsizlik', 'Loglar'];

const MOCK_LOGS = [
  { time:'14:32:11', user:'Admin', action:"Navbat tozalandi", type:'warning' },
  { time:'14:28:05', user:'Admin', action:"S02 stansiyasi tahrirlandi", type:'info' },
  { time:'14:20:44', user:'Operator', action:"Foydalanuvchi navbatdan chiqarildi", type:'info' },
  { time:'13:55:30', user:'Admin', action:"Gaz holati yangilandi", type:'success' },
  { time:'13:40:12', user:'Admin', action:"Yangi stansiya qo'shildi", type:'success' },
  { time:'12:15:08', user:'System', action:"Avtomatik navbat tozalash", type:'warning' },
];

function Section({ title, children }) {
  return (
    <div className="glass" style={{ padding: 24, marginBottom: 16 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 18px', paddingBottom: 12, borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-heading)' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
      <div onClick={() => onChange(!value)} className={`toggle ${value ? 'active' : ''}`}>
        <div className="toggle-knob" />
      </div>
    </div>
  );
}

export default function ConfigPage() {
  const toast = useToast();
  const [tab, setTab] = useState('Asosiy');
  const [cfg, setCfg] = useState({
    siteName: 'GazQueue', email: 'admin@gazqueue.uz', phone: '+998909995526',
    maxQueue: 50, autoClean: true, waitTimer: 30,
    telegram: false, sms: false, push: true,
    telegramToken: '', telegramChatId: '',
    newPassword: '', confirmPassword: '',
  });

  function save() { toast('Sozlamalar saqlandi', 'success'); }
  function set(key, val) { setCfg(p => ({ ...p, [key]: val })); }

  return (
    <div style={{ padding: '28px', position: 'relative', zIndex: 1 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 className="heading-2" style={{ margin: '0 0 4px' }}>Sozlamalar</h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>Tizim konfiguratsiyasi</p>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: 4, flexWrap: 'wrap', border: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text2)',
            }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 640 }}>
        {/* Asosiy */}
        {tab === 'Asosiy' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Section title={<><Icon name="globe" size="sm" /> Sayt ma'lumotlari</>}>
              <Field label="Sayt nomi"><input value={cfg.siteName} onChange={e => set('siteName', e.target.value)} className="input" /></Field>
              <Field label="Admin email"><input value={cfg.email} onChange={e => set('email', e.target.value)} className="input" type="email" /></Field>
              <Field label="Telefon" hint="Aloqa uchun asosiy raqam"><input value={cfg.phone} onChange={e => set('phone', e.target.value)} className="input" /></Field>
            </Section>
            <button className="btn-primary" onClick={save} style={{ width: '100%', padding: 14, fontSize: 14 }}>💾 Saqlash</button>
          </motion.div>
        )}

        {/* Stansiyalar */}
        {tab === 'Stansiyalar' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Section title={<><Icon name="fuel" size="sm" /> Stansiyalar boshqaruvi</>}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <button className="btn-primary" style={{ flex: 1, padding: 12, fontSize: 13 }} onClick={() => toast("Import funksiyasi tez kunda", 'info')}>
                  📥 JSON Import
                </button>
                <button className="btn-secondary" style={{ flex: 1, padding: 12, fontSize: 13 }} onClick={() => {
                  const data = JSON.stringify({ stations: 18 }, null, 2);
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
                  a.download = 'stations.json'; a.click();
                  toast("Eksport qilindi", 'success');
                }}>
                  📤 JSON Export
                </button>
              </div>
              <div style={{ padding: 16, background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text3)' }}>
                📊 Jami: <b style={{ color: 'var(--text)' }}>18 ta</b> stansiya · <span style={{ color: '#10b981' }}>10 ta ochiq</span> · <span style={{ color: '#ef4444' }}>8 ta yopiq</span>
              </div>
            </Section>
            <button className="btn-primary" onClick={save} style={{ width: '100%', padding: 14 }}>💾 Saqlash</button>
          </motion.div>
        )}

        {/* Navbatlar */}
        {tab === 'Navbatlar' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Section title={<><Icon name="car" size="sm" /> Navbat sozlamalari</>}>
              <Field label="Maksimal navbat hajmi" hint="Bir stansiyada maksimal avtomobil soni">
                <input type="number" value={cfg.maxQueue} onChange={e => set('maxQueue', +e.target.value)} className="input" />
              </Field>
              <Field label="Kutish vaqt limiti (daqiqa)" hint="Shu vaqtdan oshsa foydalanuvchi avtomatik chiqariladi">
                <input type="number" value={cfg.waitTimer} onChange={e => set('waitTimer', +e.target.value)} className="input" />
              </Field>
              <Toggle value={cfg.autoClean} onChange={v => set('autoClean', v)} label="Tunda avtomatik navbat tozalash (00:00)" />
            </Section>
            <button className="btn-primary" onClick={save} style={{ width: '100%', padding: 14 }}>💾 Saqlash</button>
          </motion.div>
        )}

        {/* Xabarnomalar */}
        {tab === 'Xabarnomalar' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Section title={<><Icon name="bell" size="sm" /> Xabarnoma kanallari</>}>
              <Toggle value={cfg.push} onChange={v => set('push', v)} label="Push xabarnomalar" />
              <Toggle value={cfg.telegram} onChange={v => set('telegram', v)} label="Telegram Bot" />
              <Toggle value={cfg.sms} onChange={v => set('sms', v)} label="SMS xabarnomalar" />
            </Section>
            {cfg.telegram && (
              <Section title={<><Icon name="message" size="sm" /> Telegram Bot sozlamalari</>}>
                <Field label="Bot Token" hint="@BotFather dan olingan token">
                  <input value={cfg.telegramToken} onChange={e => set('telegramToken', e.target.value)} className="input" placeholder="1234567890:ABCdef..." />
                </Field>
                <Field label="Chat ID" hint="Xabarlar yuboriladigan kanal yoki guruh ID">
                  <input value={cfg.telegramChatId} onChange={e => set('telegramChatId', e.target.value)} className="input" placeholder="-100..." />
                </Field>
                <button className="btn-secondary" style={{ width: '100%', padding: 11, fontSize: 13 }} onClick={() => toast("Test xabarnoma yuborildi!", 'success')}>
                  📨 Test xabarnoma yuborish
                </button>
              </Section>
            )}
            <button className="btn-primary" onClick={save} style={{ width: '100%', padding: 14 }}>💾 Saqlash</button>
          </motion.div>
        )}

        {/* Xavfsizlik */}
        {tab === 'Xavfsizlik' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Section title={<><Icon name="lock" size="sm" /> Parolni yangilash</>}>
              <Field label="Yangi parol"><input type="password" value={cfg.newPassword} onChange={e => set('newPassword', e.target.value)} className="input" placeholder="Yangi parol" /></Field>
              <Field label="Parolni tasdiqlang"><input type="password" value={cfg.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className="input" placeholder="Qayta kiriting" /></Field>
            </Section>
            <Section title={<><Icon name="users" size="sm" /> Operator rollari</>}>
              {['Super Admin', 'Operator', 'Viewer'].map(role => (
                <div key={role} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{role}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text3)' }}>
                      {role === 'Super Admin' ? "To'liq huquqlar" : role === 'Operator' ? "Ko'rish va boshqarish" : "Faqat ko'rish"}
                    </p>
                  </div>
                  <span className={`badge ${role === 'Super Admin' ? 'badge-blue' : role === 'Operator' ? 'badge-green' : 'badge-gray'}`}>
                    {role === 'Super Admin' ? '1 ta' : role === 'Operator' ? '3 ta' : '2 ta'}
                  </span>
                </div>
              ))}
            </Section>
            <button className="btn-primary" onClick={() => { if (cfg.newPassword !== cfg.confirmPassword) { toast("Parollar mos kelmadi", 'error'); return; } toast("Parol yangilandi", 'success'); }} style={{ width: '100%', padding: 14 }}>🔒 Saqlash</button>
          </motion.div>
        )}

        {/* Loglar */}
        {tab === 'Loglar' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--text)', fontSize: 13 }}>Amallar logi</p>
                <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => toast("Log tozalandi", 'success')}>🗑 Tozalash</button>
              </div>
              {MOCK_LOGS.map((log, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 14, color: log.type === 'success' ? '#10b981' : log.type === 'warning' ? '#f59e0b' : '#60a5fa' }}>
                    {log.type === 'success' ? '✅' : log.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{log.action}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text3)' }}>{log.user}</p>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace' }}>{log.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
