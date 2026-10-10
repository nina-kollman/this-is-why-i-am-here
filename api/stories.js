import { createHash } from 'node:crypto';
import { sql, countSentences } from './_db.js';

const MAX_PER_HOUR = 5;

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
      res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=60');
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

      const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      const ipHash = createHash('sha256').update(ip + (process.env.IP_SALT || '')).digest('hex');

      const [{ n }] = await sql`
        select count(*)::int as n from stories
        where ip_hash = ${ipHash} and created_at > now() - interval '1 hour'`;
      if (n >= MAX_PER_HOUR) return res.status(429).json({ error: 'יותר מדי פתקים, נסו שוב מאוחר יותר' });

      await sql`
        insert into stories (text, name, age, city, story_year, ip_hash)
        values (${text}, ${name}, ${age}, ${city}, ${year}, ${ipHash})`;
      return res.status(201).json({ ok: true, pending: true });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'משהו השתבש, נסו שוב' });
  }
}
