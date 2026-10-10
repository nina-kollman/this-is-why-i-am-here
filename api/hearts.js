import { sql } from './_db.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }
  try {
    const { id, like } = req.body || {};
    if (!UUID.test(id)) return res.status(400).json({ error: 'bad id' });
    const delta = like ? 1 : -1;
    const rows = await sql`
      update stories set hearts = greatest(hearts + ${delta}, 0)
      where id = ${id} and status = 'approved'
      returning hearts`;
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    return res.status(200).json({ hearts: rows[0].hearts });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'error' });
  }
}
