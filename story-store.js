(function () {
  async function api(path, opts) {
    const r = await fetch(path, opts && { ...opts, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(opts.body) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'משהו השתבש, נסו שוב');
    return data;
  }
  const S = {
    async load() {
      return api('/api/stories');
    },
    // No accounts: each browser holds a secret owner token. The server stores only its hash,
    // and a note can be deleted only with the token it was written with.
    owner() {
      try {
        let t = localStorage.getItem('wallOwner');
        if (!t) { t = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()) + '-' + Math.random().toString(36).slice(2); localStorage.setItem('wallOwner', t); }
        return t;
      } catch { return S._ownerMem || (S._ownerMem = String(Math.random()).slice(2) + Date.now() + 'xxxxxxxx'); }
    },
    mineIds() { try { return JSON.parse(localStorage.getItem('wallMine') || '[]'); } catch { return []; } },
    async add(story) {
      const row = await api('/api/stories', { method: 'POST', body: { ...story, age: +story.age, year: +story.year, owner: S.owner() } });
      try { localStorage.setItem('wallMine', JSON.stringify([...S.mineIds(), row.id])); } catch {}
      return row;
    },
    async remove(id) {
      await api('/api/stories', { method: 'DELETE', body: { id, owner: S.owner() } });
      try { localStorage.setItem('wallMine', JSON.stringify(S.mineIds().filter(x => x !== id))); } catch {}
    },
    sentences(t) { return (t || '').split(/[.!?…]+/).map(x => x.trim()).filter(Boolean).length; },
    stats(list) {
      const people = new Set(list.map(s => (s.name.trim() + '|' + s.age + '|' + s.city.trim())));
      return { stories: list.length, people: people.size };
    },
    cities(list) { return [...new Set(list.map(s => s.city))]; },
    thisYear() { return new Date().getFullYear(); },
    validate(f) {
      if (!f.text || !f.text.trim()) return 'כתבו את הסיפור שלכם';
      if (S.sentences(f.text) > 10) return 'עד 10 משפטים, בבקשה';
      if (!f.name || !f.name.trim()) return 'איך קוראים לכם?';
      if (!f.age || +f.age < 1 || +f.age > 120) return 'מה הגיל?';
      if (!f.city || !f.city.trim()) return 'מאיזו עיר?';
      if (!f.year || +f.year < 1900 || +f.year > S.thisYear()) return 'איזו שנה?';
      return '';
    },
  };
  window.StoryStore = S;
})();
