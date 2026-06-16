import React, { useEffect, useRef } from 'react';
import { stations, LOAD_CONFIG } from '../data/stations';

export default function LeafletMap({ onSelectStation, userLocation, height = '100%' }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!window.L || leafletRef.current) return;

    const map = window.L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      zoom: 11,
      center: [41.3111, 69.2797],
    });

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    stations.forEach(s => {
      const cfg = LOAD_CONFIG[s.load];
      const markerColor = s.open ? cfg.color : '#64748b';
      const icon = window.L.divIcon({
        className: '',
        html: `<div style="
          width:32px;height:32px;border-radius:50%;
          background:${markerColor};
          border:3px solid rgba(255,255,255,0.9);
          box-shadow:0 4px 12px rgba(0,0,0,0.4), 0 0 20px ${markerColor}40;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;font-weight:800;color:#fff;
          opacity:${s.open?1:0.55};
          transition:all 0.2s;
        ">${s.open?'⛽':'🔒'}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = window.L.marker([s.lat, s.lng], { icon }).addTo(map);
      marker.bindPopup(buildPopupHtml(s, onSelectStation), {
        maxWidth: 280,
        className: 'custom-popup',
      });
      // Refresh popup content on open so theme changes are always reflected
      marker.on('popupopen', () => {
        const popup = marker.getPopup();
        if (popup) popup.setContent(buildPopupHtml(s, onSelectStation));
      });
      marker._stationData = s;
      markersRef.current.push(marker);
    });

    leafletRef.current = map;
    window._leafletMap = map;

    // Invalidate size after mount
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      leafletRef.current = null;
      window._leafletMap = null;
      markersRef.current = [];
    };
  }, []);

  // Add user location marker
  useEffect(() => {
    if (!leafletRef.current || !userLocation) return;
    const icon = window.L.divIcon({
      className: '',
      html: `<div style="
        width:20px;height:20px;border-radius:50%;
        background:#527FB0;
        border:3px solid #fff;
        box-shadow:0 0 0 4px rgba(82,127,176,0.3), 0 4px 12px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    window.L.marker([userLocation.lat, userLocation.lng], { icon })
      .addTo(leafletRef.current)
      .bindPopup('<div style="text-align:center;font-weight:600;font-size:13px;">📍 Siz shu yerdasiz</div>');
  }, [userLocation]);

  return (
    <div style={{ height, width: '100%', borderRadius: 'inherit', overflow: 'hidden', position: 'relative' }}>
      <div
        ref={mapRef}
        id="leaflet-map"
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.3)',
        borderRadius: 'inherit',
        zIndex: 1000,
      }} />
    </div>
  );
}

function buildPopupHtml(s, onSelectStation) {
  const cfg = LOAD_CONFIG[s.load];
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';

  // Theme-aware colors
  const text       = isLight ? '#0f172a' : '#eef2ff';
  const text2      = isLight ? '#475569' : '#94a3b8';
  const text3      = isLight ? '#64748b' : '#64748b';
  const surface    = isLight ? '#f1f5f9' : '#0e1528';
  const surface2   = isLight ? '#ffffff' : '#0e1528';
  const border     = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
  const border2    = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)';

  const div = document.createElement('div');
  div.style.cssText = `font-family:Inter,system-ui,sans-serif;min-width:220px;color:${text};`;

  const statusBadge = s.open
    ? `<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);color:#34d399;margin-right:6px;">✅ Ochiq</span>`
    : `<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(100,116,139,0.12);border:1px solid rgba(100,116,139,0.3);color:#94a3b8;margin-right:6px;">🔒 Yopiq</span>`;

  div.innerHTML = `
    <div style="padding:4px 0;">
      <p style="margin:0 0 4px;font-size:15px;font-weight:800;color:${text};">${s.name}</p>
      <p style="margin:0 0 10px;font-size:12px;color:${text2};">📍 ${s.district} tumani</p>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;">
        ${statusBadge}
        ${s.open ? `<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${cfg.bg};border:1px solid ${cfg.border};color:${cfg.color};">${cfg.label}</span>` : ''}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
        <div style="background:${surface};border-radius:8px;padding:10px;text-align:center;border:1px solid ${border};">
          <p style="margin:0;font-size:16px;font-weight:800;color:#f97316;">25 000</p>
          <p style="margin:0;font-size:10px;color:${text3};">Yarim balon</p>
        </div>
        <div style="background:${surface};border-radius:8px;padding:10px;text-align:center;border:1px solid ${border};">
          <p style="margin:0;font-size:16px;font-weight:800;color:#10b981;">50 000</p>
          <p style="margin:0;font-size:10px;color:${text3};">To'liq balon</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <button id="popup-route-${s.id}" style="padding:9px;border-radius:8px;border:1px solid ${border2};background:${surface2};color:${text2};font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">🗺 Yo'l</button>
        ${s.open
          ? `<button id="popup-select-${s.id}" style="padding:9px;border-radius:8px;border:none;background:linear-gradient(135deg,#527FB0 0%,#7C9FC9 100%);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 4px 14px rgba(82,127,176,0.3);">✅ Navbat</button>`
          : `<button disabled style="padding:9px;border-radius:8px;border:1px solid ${border};background:${surface};color:${text3};font-size:12px;font-weight:700;cursor:not-allowed;font-family:inherit;">🔒 Yopiq</button>`
        }
      </div>
    </div>`;

  setTimeout(() => {
    const routeBtn = document.getElementById(`popup-route-${s.id}`);
    if (routeBtn) {
      routeBtn.addEventListener('click', () => {
        const ul = window._userLocation;
        if (ul) window.open(`https://www.google.com/maps/dir/${ul.lat},${ul.lng}/${s.lat},${s.lng}`, '_blank');
        else window.open(`https://www.google.com/maps/dir//${s.lat},${s.lng}`, '_blank');
      });
    }
    const selectBtn = document.getElementById(`popup-select-${s.id}`);
    if (selectBtn) {
      selectBtn.addEventListener('click', () => {
        onSelectStation(s.id, s.name);
        window._leafletMap?.closePopup();
      });
    }
  }, 100);

  return div;
}
