import { rget, rset } from '../_redis.js';
import { cors, normalizePhone } from '../_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { name, phone, carNumber, password } = req.body || {};
  if (!name || !phone || !carNumber || !password)
    return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });

  const users = await rget('users') || [];
  const normalized = normalizePhone(phone);

  if (users.find(u => normalizePhone(u.phone) === normalized))
    return res.status(409).json({ error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" });

  const user = {
    id: Date.now().toString(),
    name: name.trim(),
    phone: normalized,
    carNumber: carNumber.trim().toUpperCase(),
    password,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  await rset('users', users);

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
}
