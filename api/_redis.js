// Upstash Redis REST helper — no SDK needed
const BASE = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(...args) {
  const res = await fetch(`${BASE}/${args.map(encodeURIComponent).join('/')}`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  const json = await res.json();
  return json.result;
}

export async function rget(key) {
  const val = await redis('GET', key);
  return val ? JSON.parse(val) : null;
}

export async function rset(key, value) {
  await redis('SET', key, JSON.stringify(value));
}

export async function rdel(key) {
  await redis('DEL', key);
}
