import { VAPID_PUBLIC } from './_helpers.js';
import { cors } from './_helpers.js';

export default function handler(req, res) {
  cors(res);
  res.json({ key: VAPID_PUBLIC });
}
