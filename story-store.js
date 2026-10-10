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
    // New notes are saved as "pending" and appear on the wall once approved.
    async add(story) {
      await api('/api/stories', { method: 'POST', body: { ...story, age: +story.age, year: +story.year } });
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
