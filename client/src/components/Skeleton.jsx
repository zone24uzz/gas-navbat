import React from 'react';

export function Skeleton({ w = '100%', h = 16, rounded = 'var(--radius-xs)', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width: w, height: h, borderRadius: rounded, flexShrink: 0, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)', transform: 'skewX(-25deg)', animation: 'shimmer 1.6s ease-in-out infinite' }} />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card" style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <Skeleton w={100} h={12} />
        <Skeleton w={36} h={36} rounded={10} />
      </div>
      <Skeleton w={80} h={32} />
      <Skeleton w={120} h={10} />
    </div>
  );
}

export function TextSkeleton({ lines = 3 }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {Array.from({length: lines}).map((_, i) => (
        <Skeleton key={i} w={`${70 + Math.random() * 30}%`} h={12} />
      ))}
    </div>
  );
}
