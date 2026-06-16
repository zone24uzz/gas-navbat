import { rget } from '../_redis.js';
import { cors, normalizePhone } from '../_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { phone, password } = req.body || {};
  if (!phone || !password)
    return res.status(400).json({ error: 'Telefon va parolni kiriting' });

  const users = await rget('users') || [];
  const normalized = normalizePhone(phone);
  const user = users.find(u => normalizePhone(u.phone) === normalized && u.password === password);
  if (!user) return res.status(401).json({ error: "Telefon yoki parol noto'g'ri" });

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
}
