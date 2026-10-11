import { createHash } from 'node:crypto';
import { sql, countSentences } from './_db.js';

const MAX_PER_HOUR = 5;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const sha = v => createHash('sha256').update(v).digest('hex');

function clean(v, max) {
  return String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const rows = await sql`
        select id, name, age, city, text, story_year as year
        from stories
        where status = 'approved'
        order by story_year desc, created_at desc
        limit 500`;
      res.setHeader('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=30');
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const b = req.body || {};

      const text = String(b.text ?? '').trim().slice(0, 1500);
      const name = clean(b.name, 60);
      const city = clean(b.city, 60);
      const age = Math.round(Number(b.age));
      const thisYear = new Date().getFullYear();
      const year = Math.round(Number(b.year)) || thisYear;

      if (!text) return res.status(400).json({ error: 'כתבו את הסיפור שלכם' });
      if (countSentences(text) > 10) return res.status(400).json({ error: 'עד 10 משפטים, בבקשה' });
      if (!name) return res.status(400).json({ error: 'איך קוראים לכם?' });
      if (!(year >= 1900 && year <= thisYear)) return res.status(400).json({ error: 'איזו שנה?' });
      if (!(age >= 1 && age <= 120)) return res.status(400).json({ error: 'מה הגיל?' });
      if (!city) return res.status(400).json({ error: 'מאיזו עיר?' });

      const owner = String(b.owner ?? '');
      if (owner.length < 16 || owner.length > 100) return res.status(400).json({ error: 'משהו השתבש, נסו שוב' });

      const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      const ipHash = createHash('sha256').update(ip + (process.env.IP_SALT || '')).digest('hex');

      const [{ n }] = await sql`
        select count(*)::int as n from stories
        where ip_hash = ${ipHash} and created_at > now() - interval '1 hour'`;
      if (n >= MAX_PER_HOUR) return res.status(429).json({ error: 'יותר מדי פתקים, נסו שוב מאוחר יותר' });

      const [row] = await sql`
        insert into stories (text, name, age, city, story_year, ip_hash, owner_hash, status)
        values (${text}, ${name}, ${age}, ${city}, ${year}, ${ipHash}, ${sha(owner)}, 'approved')
        returning id, name, age, city, text, story_year as year`;
      return res.status(201).json(row);
    }

    if (req.method === 'DELETE') {
      const b = req.body || {};
      const id = String(b.id ?? '');
      const owner = String(b.owner ?? '');
      if (!UUID.test(id) || owner.length < 16) return res.status(400).json({ error: 'בקשה לא תקינה' });
      const rows = await sql`
        delete from stories where id = ${id} and owner_hash = ${sha(owner)} returning id`;
      if (!rows.length) return res.status(403).json({ error: 'אפשר למחוק רק פתקים שכתבתם' });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    console.error(e);
    const detail = process.env.VERCEL_ENV === 'production' ? undefined : String(e?.message || e);
    return res.status(500).json({ error: 'משהו השתבש, נסו שוב', detail });
  }
}
