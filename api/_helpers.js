// Shared helpers
export const ADMIN_PHONE    = '+998909995526';
export const ADMIN_PASSWORD = 'komron2013';
export const ADMIN_TOKEN    = 'gazqueue-admin-token';

export const VAPID_PUBLIC  = 'BFv2gHyM-ILVNIDQBMbEThm4OO5eXWjvebp9UA0M_Jl7YOzIYdJPdeHAPGVk1f9jld5UQxBAyG0g1Kv4a-vmIp8';
export const VAPID_PRIVATE = 'hBY4j5qJAsxKgiw6DkCxLOnbnJe-0thNuUEhG68BbTU';

// Per-station admin credentials
// id → { phone, password, name }
export const STATIONS_AUTH = {
  's01': { phone: '+998901112233', password: 'azs101', name: 'Metan AZS №1 — Chilonzor' },
  's02': { phone: '+998902223344', password: 'azs202', name: 'Metan AZS №2 — Chilonzor' },
  's03': { phone: '+998903334455', password: 'azs303', name: 'Metan AZS №3 — Yunusobod' },
  's04': { phone: '+998904445566', password: 'azs404', name: 'Metan AZS №4 — Yunusobod' },
  's05': { phone: '+998905556677', password: 'azs505', name: "Metan AZS №5 — Mirzo Ulug'bek" },
  's06': { phone: '+998906667788', password: 'azs606', name: "Metan AZS №6 — Mirzo Ulug'bek" },
  's07': { phone: '+998907778899', password: 'azs707', name: 'Metan AZS №7 — Shayxontohur' },
  's08': { phone: '+998908889900', password: 'azs808', name: 'Metan AZS №8 — Shayxontohur' },
  's09': { phone: '+998909990011', password: 'azs909', name: 'Metan AZS №9 — Uchtepa' },
  's10': { phone: '+998901010101', password: 'azs110', name: 'Metan AZS №10 — Uchtepa' },
  's11': { phone: '+998902020202', password: 'azs211', name: 'Metan AZS №11 — Yakkasaroy' },
  's12': { phone: '+998903030303', password: 'azs312', name: 'Metan AZS №12 — Yakkasaroy' },
  's13': { phone: '+998904040404', password: 'azs413', name: 'Metan AZS №13 — Bektemir' },
  's14': { phone: '+998905050505', password: 'azs514', name: 'Metan AZS №14 — Sergeli' },
  's15': { phone: '+998906060606', password: 'azs615', name: 'Metan AZS №15 — Sergeli' },
  's16': { phone: '+998907070707', password: 'azs716', name: 'Metan AZS №16 — Olmazor' },
  's17': { phone: '+998908080808', password: 'azs817', name: 'Metan AZS №17 — Olmazor' },
  's18': { phone: '+998909090909', password: 'azs918', name: 'Metan AZS №18 — Yashnobod' },
};

export function stationToken(id) {
  return `gazqueue-station-${id}`;
}

export function verifyStationToken(token) {
  // returns stationId or null
  for (const [id] of Object.entries(STATIONS_AUTH)) {
    if (stationToken(id) === token) return id;
  }
  return null;
}

export function normalizePhone(phone) {
  return phone.replace(/\s/g, '');
}

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-token,x-station-token');
}

export function adminAuth(req, res) {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Ruxsat yo'q" });
    return false;
  }
  return true;
}

export function stationAuth(req, res) {
  const token = req.headers['x-station-token'];
  const id = verifyStationToken(token);
  if (!id) {
    res.status(401).json({ error: "Ruxsat yo'q" });
    return null;
  }
  return id;
}
