import { cors, normalizePhone, STATIONS_AUTH, stationToken } from '../_helpers.js';

export default function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { phone, password } = req.body || {};
  const normalized = normalizePhone(phone || '');

  for (const [id, s] of Object.entries(STATIONS_AUTH)) {
    if (normalizePhone(s.phone) === normalized && s.password === password) {
      return res.json({ token: stationToken(id), stationId: id, stationName: s.name });
    }
  }
  res.status(401).json({ error: "Telefon yoki parol noto'g'ri" });
}
