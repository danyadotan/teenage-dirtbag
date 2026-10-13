import { useEffect, useState } from 'react';
import { api } from '@appdeploy/client';
import { ArrowLeft, ArrowRight, BookOpen, Check, CircleDollarSign, Compass, HeartHandshake, Lightbulb, LoaderCircle, LockKeyhole, MessageCircleHeart, NotebookPen, RefreshCw, ShieldCheck, Sparkles, Trash2, Users, X } from 'lucide-react';

type Page = 'home' | 'bored' | 'thought' | 'friend' | 'notes' | 'earn' | 'volunteer';
type Mode = Exclude<Page, 'home' | 'notes'> | 'note';
type Lang = 'en' | 'he';
type Note = { id: number; title: string; body: string; date: string };
type Option = { value: string; label: string };
const storageKey = 'sidequest-notes-v1';
const languageKey = 'sidequest-language-v1';
const lockKey = 'sidequest-device-lock-v1';
const credentialKey = 'sidequest-device-credential-v1';

const copy = {
  en: {
    language: 'עברית', languageAria: 'Switch to Hebrew', today: 'Today', reset: 'Reset', wingman: 'Wingman', notesNav: 'Notes', smallMoves: 'Small moves count', lockAria: 'Privacy and device lock', lockTitle: 'Keep Sidequest private', lockText: 'Use Face ID, Touch ID, or your device passcode as a privacy screen for Sidequest. Notes are saved only in this browser and are not encrypted.', lockOn: 'Device lock is on', lockOff: 'Device lock is off', enableLock: 'Enable device lock', lockNow: 'Lock now', removeLock: 'Remove device lock', unlock: 'Unlock Sidequest', unlockHint: 'Your private notes and conversations are hidden.', unsupportedLock: 'Device lock is not available in this browser. Try opening Sidequest directly in Safari or Chrome.', lockFailed: 'The device check was cancelled or could not be completed.', lockReady: 'Device lock is now on.', close: 'Close',
    eyebrow: 'Your time is yours', hero: 'What would make the next', heroTime: '20 minutes', heroEnd: 'worth it?', heroText: 'You do not need to feel motivated. Pick the kind of help you need right now.',
    cards: {
      bored: ['Build your edge', 'One challenge sized to your time, energy, subject, or hobby.'],
      thought: ['Swap the story', 'Separate facts from the story and build a fairer version.'],
      friend: ['Friendship wingman', 'Prepare, handle, or repair a social moment in your own voice.'],
      notes: ['Write it down', 'Capture the raw version first. Sharpen it only when you want.'],
      earn: ['Make your first dollar', 'Find one safe opportunity based on what you can already do.'],
      volunteer: ['Be useful to someone', 'Match your time and strengths to one real way to help.']
    },
    saved: 'saved', nextMove: 'One clear next move', privateLead: 'Private by default.', privateText: 'No profile needed. Notes stay on this device.',
    allPaths: 'All paths', pageEyebrow: 'A next move, not a life plan',
    headings: { home: 'Sidequest', bored: 'Build your edge', thought: 'Swap the story', friend: 'Friendship wingman', notes: 'Notes studio', earn: 'Your first dollar', volunteer: 'Help someone' },
    oneSentence: 'Give me one sentence to work with. Messy is fine.', aiError: 'The AI could not answer just now. Your text is still here—try again.', writeFirst: 'Write something first—even one rough line.',
    have: 'I have', energy: 'My energy is', times: ['5 min', '15 min', '30 min', '60 min'], energies: [['low', 'low'], ['medium', 'medium'], ['high', 'high']],
    boredPlaceholder: 'A subject, hobby, or future field—or type Surprise me', boredButton: 'Give me one challenge', edgeRule: 'The edge rule', edgeText: 'Choose something that leaves evidence: a draft, attempt, question, recording, explanation, or tiny finished object.', proof: 'Proof beats “I should practice.”',
    thoughtNotice: 'You do not have to make the thought disappear. We’ll make it less powerful and find a fairer story.', thoughtPlaceholder: 'Write the thought exactly as it sounds in your head. No editing needed.', thoughtButton: 'Help me swap this story', safety: 'This is a thinking tool, not emergency support. If you may hurt yourself or someone else, tell a trusted adult now or contact local emergency help.',
    friendWhen: 'When do you need help?', moments: [['before', 'before'], ['right now', 'right now'], ['after', 'after']], friendPlaceholder: 'What happened—or what are you worried might happen?', friendButton: 'Help with this moment', friendGoal: 'The goal is not to perform perfectly. It’s to make the next social move clearer and still sound like you.',
    optionalTitle: 'Optional title', notePlaceholder: 'Start rough. A thought, story, idea, caption, argument, scene…', save: 'Save privately', sharpen: 'Sharpen', review: 'Review', showcase: 'Showcase', working: 'Working on the words…', savedHere: 'Saved on this device', emptyNotes: 'Nothing needs to be polished before it belongs here.', deleteAria: 'Delete', deleteConfirm: 'Delete this note?',
    answer: 'Your next move', thinking: 'Thinking with you…', fitYou: 'Make it fit you',
    earnIntro: 'Money starts with solving one small problem for one real person.', earnPlaceholder: 'What are you good at—or willing to learn?', earnButton: 'Find my safest first move', earnSafety: 'Never share your address, school, ID, passwords, or banking details. Involve a trusted adult before meeting anyone, taking payment, or joining a platform.',
    helpIntro: 'Helping is easier when the task is specific, close, and fits your energy.', helpPlaceholder: 'What do you care about? How much time do you have?', helpButton: 'Match me with one action',
    tags: ['Today • Local', 'Skills • Useful', 'Creative • Project', 'Start small'],
    money: [['Teach one small skill', 'Help a younger student with one topic you know well. Start with someone your family knows.'], ['Make a digital asset', 'Design a study sheet, template, icon pack, or printable—with adult help choosing a marketplace.'], ['Offer a local service', 'Pet care, plant watering, organizing, photos, or basic tech help—with a parent-aware plan.'], ['Build proof first', 'Make one sample for a real person, learn what helped, then shape a tiny offer.']],
    help: [['Give 30 minutes nearby', 'Help an older neighbor with a phone, groceries, a dog walk, or a small task.'], ['Use your strongest subject', 'Tutor a younger student through a school, community center, or family connection.'], ['Help an animal', 'Ask a shelter about age rules, donation sorting, fostering support, or awareness posts.'], ['Create something useful', 'Make a poster, translate, edit a short video, or photograph an event for a nonprofit.']]
  },
  he: {
    language: 'EN', languageAria: 'Switch to English', today: 'היום', reset: 'איפוס', wingman: 'חברוּת', notesNav: 'פתקים', smallMoves: 'צעדים קטנים נחשבים', lockAria: 'פרטיות ונעילת המכשיר', lockTitle: 'לשמור על Sidequest פרטי', lockText: 'אפשר להשתמש ב-Face ID, ב-Touch ID או בקוד המכשיר כמסך פרטיות ל-Sidequest. הפתקים נשמרים רק בדפדפן הזה ואינם מוצפנים.', lockOn: 'נעילת המכשיר פעילה', lockOff: 'נעילת המכשיר כבויה', enableLock: 'להפעיל נעילת מכשיר', lockNow: 'לנעול עכשיו', removeLock: 'להסיר את הנעילה', unlock: 'לפתוח את Sidequest', unlockHint: 'הפתקים והשיחות הפרטיים שלך מוסתרים.', unsupportedLock: 'נעילת המכשיר אינה זמינה בדפדפן הזה. כדאי לפתוח את Sidequest ישירות ב-Safari או ב-Chrome.', lockFailed: 'בדיקת המכשיר בוטלה או לא הושלמה.', lockReady: 'נעילת המכשיר פעילה עכשיו.', close: 'סגירה',
    eyebrow: 'הזמן שלך שייך לך', hero: 'מה יהפוך את', heroTime: '20 הדקות הבאות', heroEnd: 'לשוות את זה?', heroText: 'לא צריך לחכות למוטיבציה. פשוט בחרו את סוג העזרה שמתאים לרגע הזה.',
    cards: {
      bored: ['לבנות יתרון', 'אתגר אחד שמתאים לזמן, לאנרגיה, לתחום הלימוד או לתחביב שלך.'],
      thought: ['להחליף את הסיפור', 'להפריד בין עובדות לסיפור ולבנות גרסה הוגנת יותר.'],
      friend: ['עזרה ברגע חברתי', 'להתכונן, להתמודד או לתקן רגע חברתי — בקול שלך.'],
      notes: ['לכתוב את זה', 'לתפוס קודם את הגרסה הגולמית. לחדד רק כשמתאים לך.'],
      earn: ['להרוויח את הכסף הראשון', 'למצוא הזדמנות בטוחה אחת על בסיס מה שכבר אפשר לעשות.'],
      volunteer: ['לעזור למישהו', 'לחבר בין הזמן והחוזקות שלך לבין דרך אמיתית אחת לעזור.']
    },
    saved: 'נשמרו', nextMove: 'צעד ברור אחד קדימה', privateLead: 'פרטי כברירת מחדל.', privateText: 'לא צריך פרופיל. הפתקים נשארים במכשיר הזה.',
    allPaths: 'כל המסלולים', pageEyebrow: 'הצעד הבא, לא תוכנית לכל החיים',
    headings: { home: 'Sidequest', bored: 'לבנות יתרון', thought: 'להחליף את הסיפור', friend: 'עזרה ברגע חברתי', notes: 'סטודיו לכתיבה', earn: 'הכסף הראשון שלך', volunteer: 'לעזור למישהו' },
    oneSentence: 'תנו לי משפט אחד לעבוד איתו. הוא ממש לא חייב להיות מסודר.', aiError: 'ה-AI לא הצליח לענות כרגע. הטקסט עדיין כאן — אפשר לנסות שוב.', writeFirst: 'כדאי לכתוב משהו קודם — אפילו שורה גולמית אחת.',
    have: 'יש לי', energy: 'רמת האנרגיה שלי', times: ['5 דקות', '15 דקות', '30 דקות', '60 דקות'], energies: [['low', 'נמוכה'], ['medium', 'בינונית'], ['high', 'גבוהה']],
    boredPlaceholder: 'תחום לימוד, תחביב או תחום עתידי — או פשוט: הפתיעו אותי', boredButton: 'תנו לי אתגר אחד', edgeRule: 'כלל היתרון', edgeText: 'בחרו משהו שמשאיר הוכחה: טיוטה, ניסיון, שאלה, הקלטה, הסבר או תוצר קטן וגמור.', proof: 'הוכחה טובה יותר מ״אני צריך להתאמן״.',
    thoughtNotice: 'לא צריך לגרום למחשבה להיעלם. נחליש את הכוח שלה ונמצא סיפור הוגן יותר.', thoughtPlaceholder: 'כתבו את המחשבה בדיוק כפי שהיא נשמעת בראש. אין צורך לערוך.', thoughtButton: 'עזרו לי להחליף את הסיפור', safety: 'זהו כלי לחשיבה, לא סיוע במצב חירום. אם יש סכנה שתפגעו בעצמכם או במישהו אחר, פנו עכשיו למבוגר שסומכים עליו או למוקד החירום המקומי.',
    friendWhen: 'מתי נדרשת העזרה?', moments: [['before', 'לפני'], ['right now', 'ממש עכשיו'], ['after', 'אחרי']], friendPlaceholder: 'מה קרה — או ממה אתם חוששים שיקרה?', friendButton: 'עזרו לי עם הרגע הזה', friendGoal: 'המטרה היא לא לבצע הכול בצורה מושלמת. המטרה היא להפוך את הצעד החברתי הבא לברור יותר, ועדיין להישמע כמוך.',
    optionalTitle: 'כותרת (לא חובה)', notePlaceholder: 'אפשר להתחיל גולמי. מחשבה, סיפור, רעיון, כיתוב, טיעון, סצנה…', save: 'לשמור בפרטיות', sharpen: 'לחדד', review: 'לקבל משוב', showcase: 'להציג', working: 'עובדים יחד על המילים…', savedHere: 'נשמר במכשיר הזה', emptyNotes: 'שום דבר לא חייב להיות מלוטש כדי שיהיה לו מקום כאן.', deleteAria: 'מחיקת', deleteConfirm: 'למחוק את הפתק הזה?',
    answer: 'הצעד הבא שלך', thinking: 'חושבים איתך…', fitYou: 'להתאים את זה אליך',
    earnIntro: 'כסף מתחיל בפתרון בעיה קטנה אחת לאדם אמיתי אחד.', earnPlaceholder: 'במה אתם טובים — או מה אתם מוכנים ללמוד?', earnButton: 'מצאו לי צעד ראשון בטוח', earnSafety: 'לעולם אל תשתפו כתובת, בית ספר, תעודה מזהה, סיסמאות או פרטי בנק. שתפו מבוגר שסומכים עליו לפני מפגש, קבלת תשלום או הצטרפות לפלטפורמה.',
    helpIntro: 'קל יותר לעזור כשהמשימה ברורה, קרובה ומתאימה לרמת האנרגיה שלך.', helpPlaceholder: 'מה חשוב לכם? כמה זמן יש לכם?', helpButton: 'התאימו לי פעולה אחת',
    tags: ['היום • קרוב לבית', 'כישורים • שימושי', 'יצירה • פרויקט', 'להתחיל בקטן'],
    money: [['ללמד מיומנות קטנה', 'לעזור לתלמיד צעיר יותר בנושא אחד שאתם מכירים היטב. התחילו עם מישהו שהמשפחה מכירה.'], ['ליצור מוצר דיגיטלי', 'לעצב דף לימוד, תבנית, חבילת אייקונים או קובץ להדפסה — בעזרת מבוגר בבחירת מקום המכירה.'], ['להציע שירות מקומי', 'טיפול בחיות, השקיית עציצים, ארגון, צילום או עזרה טכנית בסיסית — בתוכנית שמבוגר מכיר.'], ['לבנות הוכחה קודם', 'להכין דוגמה אחת לאדם אמיתי, ללמוד מה עזר לו ואז לעצב הצעה קטנה.']],
    help: [['לתת 30 דקות קרוב לבית', 'לעזור לשכן מבוגר עם הטלפון, קניות, טיול עם הכלב או משימה קטנה.'], ['להשתמש במקצוע החזק שלך', 'לעזור לתלמיד צעיר דרך בית הספר, מרכז קהילתי או קשר משפחתי.'], ['לעזור לבעל חיים', 'לשאול עמותה על מגבלות גיל, מיון תרומות, תמיכה באומנה או פרסומי מודעות.'], ['ליצור משהו שימושי', 'להכין פוסטר, לתרגם, לערוך סרטון קצר או לצלם אירוע עבור עמותה.']]
  }
};

function encodeId(buffer: ArrayBuffer) { return btoa(String.fromCharCode(...new Uint8Array(buffer))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function decodeId(value: string) { const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4); return Uint8Array.from(atob(padded), character => character.charCodeAt(0)); }
function randomBytes(size: number) { const bytes = new Uint8Array(size); crypto.getRandomValues(bytes); return bytes; }

function App() {
  const [lang, setLang] = useState<Lang>(() => localStorage.getItem(languageKey) === 'he' ? 'he' : 'en');
  const [page, setPage] = useState<Page>('home');
  const [input, setInput] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [time, setTime] = useState('15');
  const [energy, setEnergy] = useState('medium');
  const [moment, setMoment] = useState('before');
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [lockEnabled, setLockEnabled] = useState(() => localStorage.getItem(lockKey) === 'on');
  const [locked, setLocked] = useState(() => localStorage.getItem(lockKey) === 'on');
  const [lockMessage, setLockMessage] = useState('');
  const c = copy[lang];
  const rtl = lang === 'he';
  useEffect(() => { try { setNotes(JSON.parse(localStorage.getItem(storageKey) || '[]')); } catch { setNotes([]); } }, []);
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem(languageKey, lang); document.documentElement.lang = lang; document.documentElement.dir = rtl ? 'rtl' : 'ltr'; document.title = rtl ? 'Sidequest — הצעד הבא שלך' : 'Sidequest — make the next move count'; }, [lang, rtl]);
  useEffect(() => { let hiddenAt = 0; const protect = () => { if (document.hidden) hiddenAt = Date.now(); else if (lockEnabled && hiddenAt && Date.now() - hiddenAt > 15000) setLocked(true); }; document.addEventListener('visibilitychange', protect); return () => document.removeEventListener('visibilitychange', protect); }, [lockEnabled]);
  async function enableDeviceLock() {
    setLockMessage('');
    if (!window.PublicKeyCredential || !navigator.credentials) { setLockMessage(c.unsupportedLock); return; }
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) { setLockMessage(c.unsupportedLock); return; }
      const credential = await navigator.credentials.create({ publicKey: { challenge: randomBytes(32), rp: { name: 'Sidequest' }, user: { id: randomBytes(24), name: 'sidequest-private-user', displayName: 'Sidequest private space' }, pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }], authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' }, timeout: 60000, attestation: 'none' } }) as PublicKeyCredential | null;
      if (!credential) throw new Error('No credential');
      localStorage.setItem(credentialKey, encodeId(credential.rawId)); localStorage.setItem(lockKey, 'on'); setLockEnabled(true); setLocked(false); setLockMessage(c.lockReady);
    } catch { setLockMessage(c.lockFailed); }
  }
  async function unlockDevice() {
    setLockMessage(''); const stored = localStorage.getItem(credentialKey);
    if (!stored || !window.PublicKeyCredential || !navigator.credentials) { setLockMessage(c.unsupportedLock); return; }
    try { const credential = await navigator.credentials.get({ publicKey: { challenge: randomBytes(32), allowCredentials: [{ id: decodeId(stored), type: 'public-key', transports: ['internal'] }], userVerification: 'required', timeout: 60000 } }); if (!credential) throw new Error('No credential'); setLocked(false); }
    catch { setLockMessage(c.lockFailed); }
  }
  function removeDeviceLock() { localStorage.removeItem(lockKey); localStorage.removeItem(credentialKey); setLockEnabled(false); setLocked(false); setLockMessage(''); }
  const open = (next: Page) => { setPage(next); setInput(''); setAnswer(''); setMessage(''); window.scrollTo(0, 0); };
  async function ask(mode: Mode, text: string, extra = '') {
    if (!text.trim()) { setMessage(c.oneSentence); return; }
    setBusy(true); setMessage(''); setAnswer('');
    try { const result = await api.post('/api/coach', { mode, text, extra, language: lang }); setAnswer(result.data.answer); }
    catch { setMessage(c.aiError); }
    finally { setBusy(false); }
  }
  function save() {
    if (!body.trim()) { setMessage(c.writeFirst); return; }
    setNotes([{ id: Date.now(), title: title.trim() || body.trim().split(/\s+/).slice(0, 6).join(' '), body: body.trim(), date: new Date().toLocaleDateString(rtl ? 'he-IL' : 'en-US') }, ...notes]);
    setTitle(''); setBody(''); setMessage(''); setAnswer('');
  }
  const pathCards = [
    ['bored', c.cards.bored[0], c.cards.bored[1], Lightbulb, 'lime'],
    ['thought', c.cards.thought[0], c.cards.thought[1], RefreshCw, 'violet'],
    ['friend', c.cards.friend[0], c.cards.friend[1], MessageCircleHeart, 'blue'],
    ['notes', c.cards.notes[0], c.cards.notes[1], NotebookPen, 'orange'],
    ['earn', c.cards.earn[0], c.cards.earn[1], CircleDollarSign, 'green'],
    ['volunteer', c.cards.volunteer[0], c.cards.volunteer[1], HeartHandshake, 'pink']
  ] as const;
  const timeOptions: Option[] = c.times.map((label, index) => ({ value: ['5', '15', '30', '60'][index], label }));
  const energyOptions: Option[] = c.energies.map(([value, label]) => ({ value, label }));
  const momentOptions: Option[] = c.moments.map(([value, label]) => ({ value, label }));
  const BackIcon = rtl ? ArrowRight : ArrowLeft;
  const NextIcon = rtl ? ArrowLeft : ArrowRight;
  return <div className="app" dir={rtl ? 'rtl' : 'ltr'}>
    <header><button className="brand" onClick={() => open('home')}><b className="brand-icon"><img src="./sidequest-icon.svg" alt=""/></b>Sidequest</button><nav>{[['home', c.today], ['thought', c.reset], ['friend', c.wingman], ['notes', c.notesNav]].map(([id, label]) => <button className={page === id ? 'on' : ''} onClick={() => open(id as Page)} key={id}>{label}</button>)}</nav><div className="header-tools"><span className="small"><Sparkles size={14}/> {c.smallMoves}</span><button className={'lock-button ' + (lockEnabled ? 'enabled' : '')} aria-label={c.lockAria} onClick={() => { setPrivacyOpen(true); setLockMessage(''); }}><LockKeyhole size={17}/></button><button className="language" aria-label={c.languageAria} onClick={() => setLang(rtl ? 'en' : 'he')}>{c.language}</button></div></header>
    {privacyOpen && !locked && <div className="modal-backdrop" role="presentation"><section className="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title"><button className="modal-close" aria-label={c.close} onClick={() => setPrivacyOpen(false)}><X/></button><span className="lock-emblem"><LockKeyhole/></span><h2 id="privacy-title">{c.lockTitle}</h2><p>{c.lockText}</p><div className={'lock-status ' + (lockEnabled ? 'on' : '')}><span></span>{lockEnabled ? c.lockOn : c.lockOff}</div>{lockMessage && <p className="lock-message">{lockMessage}</p>}<div className="lock-actions">{!lockEnabled ? <button className="dark" onClick={enableDeviceLock}><LockKeyhole/>{c.enableLock}</button> : <><button className="dark" onClick={() => { setPrivacyOpen(false); setLocked(true); }}><LockKeyhole/>{c.lockNow}</button><button className="secondary" onClick={removeDeviceLock}>{c.removeLock}</button></>}</div></section></div>}
    {locked && <div className="lock-screen"><div className="lock-card"><span className="lock-emblem"><LockKeyhole/></span><h1>Sidequest</h1><p>{c.unlockHint}</p>{lockMessage && <p className="lock-message">{lockMessage}</p>}<button className="dark" onClick={unlockDevice}><LockKeyhole/>{c.unlock}</button></div></div>}
    <main aria-hidden={locked ? 'true' : undefined}>{page === 'home' ? <section className="home"><div className="hero"><label>{c.eyebrow}</label><h1>{c.hero}<br/><i>{c.heroTime}</i> {c.heroEnd}</h1><p>{c.heroText}</p></div><div className="grid">{pathCards.map(([id, name, description, Icon, tone]) => <button className={'card ' + tone} onClick={() => open(id)} key={id}><span><Icon size={22}/></span><NextIcon/><h2>{name}</h2><p>{description}</p><small>{id === 'notes' ? notes.length + ' ' + c.saved : c.nextMove}</small></button>)}</div><div className="privacy"><ShieldCheck size={18}/><b>{c.privateLead}</b> {c.privateText}</div></section> :
      <section className="page"><button className="back" onClick={() => open('home')}><BackIcon/> {c.allPaths}</button><label>{c.pageEyebrow}</label><h1>{c.headings[page]}</h1>
        {page === 'bored' && <div className="two"><div><Choice label={c.have} options={timeOptions} value={time} set={setTime}/><Choice label={c.energy} options={energyOptions} value={energy} set={setEnergy}/><Prompt value={input} set={setInput} placeholder={c.boredPlaceholder} button={c.boredButton} thinking={c.thinking} busy={busy} message={message} go={() => ask('bored', input || (rtl ? 'הפתיעו אותי' : 'Surprise me'), 'time=' + time + '; energy=' + energy)}/></div><aside><h3>{c.edgeRule}</h3><p>{c.edgeText}</p><b><Check/> {c.proof}</b></aside><Answer text={answer} label={c.answer}/></div>}
        {page === 'thought' && <div className="narrow"><div className="notice">{c.thoughtNotice}</div><Prompt value={input} set={setInput} placeholder={c.thoughtPlaceholder} button={c.thoughtButton} thinking={c.thinking} busy={busy} message={message} go={() => ask('thought', input)}/><Answer text={answer} label={c.answer}/><p className="safety">{c.safety}</p></div>}
        {page === 'friend' && <div className="narrow"><Choice label={c.friendWhen} options={momentOptions} value={moment} set={setMoment}/><Prompt value={input} set={setInput} placeholder={c.friendPlaceholder} button={c.friendButton} thinking={c.thinking} busy={busy} message={message} go={() => ask('friend', input, 'moment=' + moment)}/><Answer text={answer} label={c.answer}/><div className="notice last">{c.friendGoal}</div></div>}
        {page === 'notes' && <div className="notes"><div className="editor"><input value={title} onChange={event => setTitle(event.target.value)} placeholder={c.optionalTitle}/><textarea value={body} onChange={event => setBody(event.target.value)} placeholder={c.notePlaceholder}/>{message && <p className="error">{message}</p>}<div className="actions"><button className="dark" onClick={save}><Check/> {c.save}</button><button onClick={() => ask('note', body, 'request=sharpen')}><Sparkles/> {c.sharpen}</button><button onClick={() => ask('note', body, 'request=review')}><BookOpen/> {c.review}</button><button onClick={() => ask('note', body, 'request=showcase')}><Compass/> {c.showcase}</button></div>{busy && <p className="working"><LoaderCircle className="spin"/> {c.working}</p>}<Answer text={answer} label={c.answer}/></div><div className="saved"><h3>{c.savedHere} <b>{notes.length}</b></h3>{notes.length === 0 && <p>{c.emptyNotes}</p>}{notes.map(note => <article key={note.id}><div><h4>{note.title}</h4><p>{note.body}</p><small>{note.date}</small></div><button aria-label={c.deleteAria + ' ' + note.title} onClick={() => { if (window.confirm(c.deleteConfirm)) setNotes(notes.filter(item => item.id !== note.id)); }}><Trash2/></button></article>)}</div></div>}
        {page === 'earn' && <Directory items={c.money} tags={c.tags} intro={c.earnIntro} fit={c.fitYou} input={input} setInput={setInput} answer={answer} answerLabel={c.answer} busy={busy} message={message} thinking={c.thinking} placeholder={c.earnPlaceholder} button={c.earnButton} go={() => ask('earn', input)} safety={c.earnSafety}/>}
        {page === 'volunteer' && <Directory items={c.help} tags={c.tags} intro={c.helpIntro} fit={c.fitYou} input={input} setInput={setInput} answer={answer} answerLabel={c.answer} busy={busy} message={message} thinking={c.thinking} placeholder={c.helpPlaceholder} button={c.helpButton} go={() => ask('volunteer', input)}/>}</section>}
    </main><div className="bottom">{[['home', c.today, Compass], ['thought', c.reset, RefreshCw], ['friend', c.wingman, Users], ['notes', c.notesNav, NotebookPen]].map(([id, label, Icon]) => <button className={page === id ? 'on' : ''} onClick={() => open(id as Page)} key={id as string}>{typeof Icon !== 'string' && <Icon size={20}/>}<small>{label as string}</small></button>)}</div>
  </div>;
}
function Choice({ label, options, value, set }: { label: string; options: Option[]; value: string; set: (value: string) => void }) { return <div className="choice"><b>{label}</b><div>{options.map(item => <button className={value === item.value ? 'on' : ''} onClick={() => set(item.value)} key={item.value}>{item.label}</button>)}</div></div>; }
function Prompt({ value, set, placeholder, button, thinking, busy, message, go }: { value: string; set: (value: string) => void; placeholder: string; button: string; thinking: string; busy: boolean; message: string; go: () => void }) { return <div className="prompt"><textarea value={value} onChange={event => set(event.target.value)} placeholder={placeholder}/>{message && <p className="error">{message}</p>}<button className="dark" onClick={go} disabled={busy}>{busy ? <><LoaderCircle className="spin"/>{thinking}</> : <>{button}<ArrowRight className="action-arrow"/></>}</button></div>; }
function Answer({ text, label }: { text: string; label: string }) { return text ? <div className="answer"><b><Sparkles/> {label}</b><div>{text}</div></div> : null; }
function Directory({ items, tags, intro, fit, input, setInput, answer, answerLabel, busy, message, thinking, placeholder, button, go, safety }: { items: string[][]; tags: string[]; intro: string; fit: string; input: string; setInput: (value: string) => void; answer: string; answerLabel: string; busy: boolean; message: string; thinking: string; placeholder: string; button: string; go: () => void; safety?: string }) { return <><p className="intro">{intro}</p><div className="directory">{items.map(([name, description], index) => <div key={name}><small>{tags[index]}</small><h3>{name}</h3><p>{description}</p></div>)}</div><div className="match"><h2>{fit}</h2><Prompt value={input} set={setInput} placeholder={placeholder} button={button} thinking={thinking} busy={busy} message={message} go={go}/><Answer text={answer} label={answerLabel}/>{safety && <p className="safety"><ShieldCheck/> {safety}</p>}</div></>; }
export default App;
