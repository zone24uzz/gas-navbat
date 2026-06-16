// ── Station data — Tashkent methane AZS ──────────────────
const stations = [
  { id:'s01', name: "Metan AZS №1 — Chilonzor",    lat: 41.2995, lng: 69.2401, district: "Chilonzor",       load: "free",   open: true  },
  { id:'s02', name: "Metan AZS №2 — Chilonzor",    lat: 41.3050, lng: 69.2280, district: "Chilonzor",       load: "medium", open: false },
  { id:'s03', name: "Metan AZS №3 — Yunusobod",    lat: 41.3620, lng: 69.3310, district: "Yunusobod",       load: "busy",   open: true  },
  { id:'s04', name: "Metan AZS №4 — Yunusobod",    lat: 41.3700, lng: 69.3450, district: "Yunusobod",       load: "free",   open: true  },
  { id:'s05', name: "Metan AZS №5 — Mirzo Ulug'bek", lat: 41.3310, lng: 69.3680, district: "Mirzo Ulug'bek", load: "medium", open: true  },
  { id:'s06', name: "Metan AZS №6 — Mirzo Ulug'bek", lat: 41.3180, lng: 69.3820, district: "Mirzo Ulug'bek", load: "busy",   open: false },
  { id:'s07', name: "Metan AZS №7 — Shayxontohur", lat: 41.3230, lng: 69.2760, district: "Shayxontohur",   load: "free",   open: true  },
  { id:'s08', name: "Metan AZS №8 — Shayxontohur", lat: 41.3350, lng: 69.2640, district: "Shayxontohur",   load: "medium", open: false },
  { id:'s09', name: "Metan AZS №9 — Uchtepa",      lat: 41.3080, lng: 69.2150, district: "Uchtepa",        load: "busy",   open: true  },
  { id:'s10', name: "Metan AZS №10 — Uchtepa",     lat: 41.3150, lng: 69.2050, district: "Uchtepa",        load: "free",   open: true  },
  { id:'s11', name: "Metan AZS №11 — Yakkasaroy",  lat: 41.2880, lng: 69.2720, district: "Yakkasaroy",     load: "medium", open: true  },
  { id:'s12', name: "Metan AZS №12 — Yakkasaroy",  lat: 41.2820, lng: 69.2850, district: "Yakkasaroy",     load: "free",   open: false },
  { id:'s13', name: "Metan AZS №13 — Bektemir",    lat: 41.2650, lng: 69.3550, district: "Bektemir",       load: "busy",   open: true  },
  { id:'s14', name: "Metan AZS №14 — Sergeli",     lat: 41.2480, lng: 69.2980, district: "Sergeli",        load: "free",   open: true  },
  { id:'s15', name: "Metan AZS №15 — Sergeli",     lat: 41.2380, lng: 69.3100, district: "Sergeli",        load: "medium", open: false },
  { id:'s16', name: "Metan AZS №16 — Olmazor",     lat: 41.3450, lng: 69.2520, district: "Olmazor",        load: "free",   open: true  },
  { id:'s17', name: "Metan AZS №17 — Olmazor",     lat: 41.3520, lng: 69.2400, district: "Olmazor",        load: "busy",   open: true  },
  { id:'s18', name: "Metan AZS №18 — Yashnobod",   lat: 41.2960, lng: 69.3280, district: "Yashnobod",      load: "medium", open: true  },
];

const LOAD_CONFIG = {
  free:   { color: "#22c55e", label: "🟢 Navbat yo'q",    bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.4)"  },
  medium: { color: "#f59e0b", label: "🟡 O'rtacha navbat", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.4)" },
  busy:   { color: "#ef4444", label: "🔴 Katta navbat",   bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.35)" },
};

// ── Haversine ─────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

let nearestStation = null;
let userLocation = null;
let leafletMap = null;
let allMarkers = [];
let activeDistrictFilter = 'all';
let activeLoadFilter = 'all';
let activeStatusFilter = 'all';

// ── Leaflet map init ──────────────────────────────────────
function initMap() {
  const mapEl = document.getElementById('leaflet-map');
  if (!mapEl || leafletMap) return;

  leafletMap = L.map('leaflet-map', { zoomControl: true, scrollWheelZoom: false }).setView([41.3111, 69.2797], 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18,
  }).addTo(leafletMap);

  stations.forEach(s => {
    const cfg = LOAD_CONFIG[s.load];
    const markerColor = s.open ? cfg.color : '#94a3b8';
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:28px;height:28px;border-radius:50%;
        background:${markerColor};
        border:3px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
        font-size:12px;font-weight:800;color:#fff;
        opacity:${s.open ? 1 : 0.55};
      ">${s.open ? '⛽' : '🔒'}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16],
    });

    const marker = L.marker([s.lat, s.lng], { icon }).addTo(leafletMap);
    marker.bindPopup(buildPopup(s), { maxWidth: 240 });
    marker._stationData = s;
    allMarkers.push(marker);
  });

  // User location marker
  if (userLocation) addUserMarker();
}

function buildPopup(s) {
  const cfg = LOAD_CONFIG[s.load];
  const statusBadge = s.open
    ? `<span style="display:inline-block;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.4);color:#15803d;margin-right:6px;">✅ Ochiq</span>`
    : `<span style="display:inline-block;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(148,163,184,0.15);border:1px solid rgba(148,163,184,0.4);color:#64748b;margin-right:6px;">🔒 Yopiq</span>`;
  return `
    <div style="font-family:system-ui,sans-serif;min-width:200px;">
      <p style="margin:0 0 4px;font-size:14px;font-weight:800;color:#1e293b;">${s.name}</p>
      <p style="margin:0 0 8px;font-size:12px;color:#64748b;">📍 ${s.district} tumani</p>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">
        ${statusBadge}
        ${s.open ? `<span style="display:inline-block;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:700;background:${cfg.bg};border:1px solid ${cfg.border};color:${cfg.color};">${cfg.label}</span>` : ''}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;">
        <div style="background:#f8fafc;border-radius:8px;padding:8px;text-align:center;">
          <p style="margin:0;font-size:16px;font-weight:800;color:#f97316;">25 000</p>
          <p style="margin:0;font-size:10px;color:#64748b;">Yarim balon</p>
        </div>
        <div style="background:#f8fafc;border-radius:8px;padding:8px;text-align:center;">
          <p style="margin:0;font-size:16px;font-weight:800;color:#22c55e;">50 000</p>
          <p style="margin:0;font-size:10px;color:#64748b;">To'liq balon</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        <button onclick="openRouteTo(${s.lat},${s.lng})"
          style="padding:8px;border-radius:8px;border:1.5px solid #e2e8f0;background:#f8fafc;color:#475569;font-size:12px;font-weight:700;cursor:pointer;">
          🗺 Yo'l
        </button>
        ${s.open ? `<button onclick="selectStation('${s.id}','${s.name.replace(/'/g,"\\'")}');leafletMap.closePopup();"
          style="padding:8px;border-radius:8px;border:none;background:#4f6ef7;color:#fff;font-size:12px;font-weight:700;cursor:pointer;">
          ✅ Navbat
        </button>` : `<button disabled style="padding:8px;border-radius:8px;border:none;background:#e2e8f0;color:#94a3b8;font-size:12px;font-weight:700;cursor:not-allowed;">Yopiq</button>`}
      </div>
    </div>`;
}

function addUserMarker() {
  if (!leafletMap || !userLocation) return;
  const icon = L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#4f6ef7;border:3px solid #fff;box-shadow:0 0 0 4px rgba(79,110,247,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
  L.marker([userLocation.lat, userLocation.lng], { icon })
    .addTo(leafletMap)
    .bindPopup('<b>Siz shu yerdasiz</b>');
}

// ── Filters ───────────────────────────────────────────────
function applyFilters() {
  allMarkers.forEach(m => {
    const s = m._stationData;
    const districtOk = activeDistrictFilter === 'all' || s.district === activeDistrictFilter;
    const loadOk     = activeLoadFilter === 'all' || s.load === activeLoadFilter;
    const statusOk   = activeStatusFilter === 'all' || (activeStatusFilter === 'open' ? s.open : !s.open);
    if (districtOk && loadOk && statusOk) {
      if (!leafletMap.hasLayer(m)) m.addTo(leafletMap);
    } else {
      if (leafletMap.hasLayer(m)) leafletMap.removeLayer(m);
    }
  });

  // Update count badge
  const visible = allMarkers.filter(m => leafletMap.hasLayer(m)).length;
  const badge = document.getElementById('map-count-badge');
  if (badge) badge.textContent = `${visible} ta AZS`;
}

function setDistrictFilter(val, el) {
  activeDistrictFilter = val;
  document.querySelectorAll('.map-filter-district').forEach(b => b.classList.remove('mf-active'));
  el.classList.add('mf-active');
  applyFilters();
}

function setLoadFilter(val, el) {
  activeLoadFilter = val;
  document.querySelectorAll('.map-filter-load').forEach(b => b.classList.remove('mf-active'));
  el.classList.add('mf-active');
  applyFilters();
}

function setStatusFilter(val, el) {
  activeStatusFilter = val;
  document.querySelectorAll('.map-filter-status').forEach(b => b.classList.remove('mf-active'));
  el.classList.add('mf-active');
  applyFilters();
}

// ── Station selection ─────────────────────────────────────
function selectStation(stationId, stationName) {
  localStorage.setItem('selected_station_id', stationId);
  localStorage.setItem('selected_station_name', stationName);

  const label = document.getElementById('selected-station-label');
  if (label) label.textContent = stationName;
  const banner = document.getElementById('selected-station-banner');
  if (banner) banner.style.display = 'block';
  const hint = document.getElementById('no-station-hint');
  if (hint) hint.style.display = 'none';

  // Reload gas status for this station
  if (typeof loadGasStatusBanner === 'function') loadGasStatusBanner();
  // Reload queue
  if (typeof pollQueue === 'function') pollQueue();

  const queueSection = document.getElementById('queue-section');
  if (queueSection) {
    queueSection.scrollIntoView({ behavior: 'smooth' });
    queueSection.style.boxShadow = '0 0 0 3px rgba(79,110,247,0.3)';
    setTimeout(() => queueSection.style.boxShadow = '', 1500);
  }
}

// ── Route helpers ─────────────────────────────────────────
function openRouteTo(lat, lng) {
  if (userLocation) {
    window.open(`https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`, '_blank');
  } else {
    window.open(`https://www.google.com/maps/dir//${lat},${lng}`, '_blank');
  }
}

function openRoute() {
  if (nearestStation) {
    openRouteTo(nearestStation.lat, nearestStation.lng);
    return;
  }
  if (!navigator.geolocation) { alert("Geolokatsiya qo'llab-quvvatlanmaydi"); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    const sorted = stations
      .map(s => ({ ...s, dist: haversine(latitude, longitude, s.lat, s.lng) }))
      .sort((a, b) => a.dist - b.dist);
    openRouteTo(sorted[0].lat, sorted[0].lng);
  }, () => alert("Geolokatsiya ruxsat berilmagan"));
}

document.getElementById('btn-nearest-azs')?.addEventListener('click', openRoute);
document.getElementById('btn-footer-azs')?.addEventListener('click', openRoute);

// ── Auto-detect location on load ──────────────────────────
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    userLocation = { lat: latitude, lng: longitude };
    const sorted = stations
      .map(s => ({ ...s, dist: haversine(latitude, longitude, s.lat, s.lng) }))
      .sort((a, b) => a.dist - b.dist);
    nearestStation = sorted[0];
    const d = nearestStation.dist;
    document.getElementById('nearest-dist').textContent =
      d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
    document.getElementById('nearest-time').textContent =
      `~${Math.round(d / 40 * 60)} min`;
    if (leafletMap) addUserMarker();
  }, () => {
    document.getElementById('nearest-dist').textContent = '?';
    document.getElementById('nearest-time').textContent = '?';
  });
}

// Init map after DOM ready (Leaflet loaded via CDN in HTML)
document.addEventListener('DOMContentLoaded', () => {
  if (typeof L !== 'undefined') initMap();
});
// Also try immediately (script is at bottom of body)
if (typeof L !== 'undefined') initMap();
