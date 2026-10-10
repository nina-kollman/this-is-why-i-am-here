(function () {
  const HEARTS = 'zlap_hearts_v1';
  function read(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  async function api(path, opts) {
    const r = await fetch(path, opts && { ...opts, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(opts.body) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'משהו השתבש, נסו שוב');
    return data;
  }
  const S = {
    async load() {
      const hearts = read(HEARTS, {});
      const list = await api('/api/stories');
      return list.map(s => ({ ...s, liked: !!hearts[s.id] }));
    },
    // New notes are saved as "pending" and appear on the wall once approved.
    async add(story) {
      await api('/api/stories', { method: 'POST', body: { ...story, age: +story.age } });
    },
    async toggleHeart(id) {
      const h = read(HEARTS, {});
      const like = !h[id];
      await api('/api/hearts', { method: 'POST', body: { id, like } });
      h[id] = like; write(HEARTS, h);
    },
    sentences(t) { return (t || '').split(/[.!?…]+/).map(x => x.trim()).filter(Boolean).length; },
    stats(list) {
      const people = new Set(list.map(s => (s.name.trim() + '|' + s.age + '|' + s.city.trim())));
      return { stories: list.length, people: people.size };
    },
    cities(list) { return [...new Set(list.map(s => s.city))]; },
    fmtDate(d) { const [y, m, dd] = d.split('-'); return `${+dd}.${+m}.${y}`; },
    today() { return new Date().toISOString().slice(0, 10); },
    validate(f) {
      if (!f.text || !f.text.trim()) return 'כתבו את הסיפור שלכם';
      if (S.sentences(f.text) > 10) return 'עד 10 משפטים, בבקשה';
      if (!f.name || !f.name.trim()) return 'איך קוראים לכם?';
      if (!f.age || +f.age < 1 || +f.age > 120) return 'מה הגיל?';
      if (!f.city || !f.city.trim()) return 'מאיזו עיר?';
      return '';
    },
  };
  window.StoryStore = S;
})();
