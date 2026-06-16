import { cors, normalizePhone, ADMIN_PHONE, ADMIN_PASSWORD, ADMIN_TOKEN } from '../_helpers.js';

export default function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { phone, password } = req.body || {};
  if (normalizePhone(phone || '') === ADMIN_PHONE && password === ADMIN_PASSWORD) {
    return res.json({ token: ADMIN_TOKEN });
  }
  res.status(401).json({ error: "Noto'g'ri ma'lumotlar" });
}
