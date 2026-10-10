(function () {
  const KEY = 'zlap_user_stories_v1';
  const HEARTS = 'zlap_hearts_v1';
  const SEED = [
    { id: 's1', name: 'נועה', age: 29, city: 'חיפה', date: '2026-09-14', hearts: 41, text: 'גדלתי על הכרמל ואני עדיין עוצרת כל בוקר לראות את המפרץ. כשהייתה לי הצעה לעבור לברלין, הבנתי שאין שם אף אחד שיביא לי מרק כשאני חולה. פה השכנה שלי עושה את זה בלי לשאול. זה למה אני פה.' },
    { id: 's2', name: 'אבי', age: 67, city: 'באר שבע', date: '2026-09-02', hearts: 88, text: 'הגעתי לפה בגיל שש עם מזוודה אחת. אבא שלי נישק את האדמה בנמל. היום יש לי שבעה נכדים שמדברים עברית עם מבטא של המדבר. אני לא הולך לשום מקום.' },
    { id: 's3', name: 'מאיה', age: 22, city: 'תל אביב', date: '2026-10-01', hearts: 23, text: 'כי ביום שישי בשוק הכרמל כולם צועקים ואף אחד לא כועס. כי אפשר לדבר עם זר בתור ולצאת עם חבר. כי פה אני מרגישה שמה שאני עושה משנה.' },
    { id: 's4', name: 'יוסף', age: 41, city: 'ירושלים', date: '2026-08-21', hearts: 56, text: 'אני מורה להיסטוריה. כל שנה אני לוקח כיתה לעיר העתיקה ורואה את העיניים שלהם נפתחות. ההיסטוריה הזאת היא לא בספר, היא מתחת לרגליים. אני רוצה שגם הילדים שלי ירגישו את זה.' },
    { id: 's5', name: 'דנה', age: 34, city: 'קריית שמונה', date: '2026-09-20', hearts: 112, text: 'פונינו מהבית לחודשים ארוכים. חזרנו לגינה מלאה עשבים ולתריס שבור. שתלנו הכל מחדש. הבית הזה שלנו ואנחנו נשארים לשמור עליו.' },
    { id: 's6', name: 'עומר', age: 26, city: 'רמת גן', date: '2026-09-28', hearts: 37, text: 'במילואים הבנתי מי האנשים שלידי. מתכנת, חקלאי, סטודנט ואבא לשלושה, כולם באותו בוץ. אף פעם לא הרגשתי חלק ממשהו גדול כל כך.' },
    { id: 's7', name: 'רחל', age: 78, city: 'נהריה', date: '2026-07-30', hearts: 64, text: 'כל ערב אני הולכת על הטיילת עם חברה מגיל עשר. ראינו את העיר הזאת גדלה מכפר קטן. הים פה הוא הים שלי.' },
    { id: 's8', name: 'איתי', age: 17, city: 'מודיעין', date: '2026-10-05', hearts: 19, text: 'כי סבא שלי נלחם בשביל זה וגם אבא שלי. עכשיו התור שלי לבנות פה משהו טוב יותר. אני רוצה להיות מהנדס ולהישאר.' },
    { id: 's9', name: 'סיוון', age: 38, city: 'אילת', date: '2026-08-11', hearts: 29, text: 'אני צוללת. מתחת למים של מפרץ אילת יש עולם שלם שרוב העולם לא מכיר. וכשאני עולה למעלה אני רואה ארבע מדינות ובית אחד.' },
    { id: 's10', name: 'מוחמד', age: 45, city: 'שפרעם', date: '2026-09-09', hearts: 73, text: 'אני רופא במחלקה לטיפול נמרץ. ראיתי יהודים וערבים מחזיקים ידיים מחוץ לחדר ניתוח. זה הבית של כולנו, ואני פה כדי לשמור עליו בריא.' },
    { id: 's11', name: 'נועה', age: 29, city: 'חיפה', date: '2026-10-07', hearts: 15, text: 'עוד סיבה: הפלאפל ברחוב החלוץ. ברצינות.' },
    { id: 's12', name: 'שירה', age: 31, city: 'קיבוץ בארי', date: '2026-09-17', hearts: 140, text: 'אנחנו נחזור לבנות. כל בית, כל עץ, כל שביל. כי הקהילה הזאת היא המשפחה שלי ואנחנו עוד נצחק פה שוב.' },
  ];
  function read(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  const S = {
    load() {
      const hearts = read(HEARTS, {});
      return [...read(KEY, []), ...SEED]
        .map(s => ({ ...s, liked: !!hearts[s.id], hearts: (s.hearts || 0) + (hearts[s.id] ? 1 : 0) }))
        .sort((a, b) => (b.date + (b.ts || 0)).localeCompare(a.date + (a.ts || 0)));
    },
    add(story) {
      const s = { ...story, id: 'u' + Date.now(), ts: Date.now(), hearts: 0, age: +story.age };
      write(KEY, [s, ...read(KEY, [])]);
      return s;
    },
    toggleHeart(id) { const h = read(HEARTS, {}); h[id] = !h[id]; write(HEARTS, h); },
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
