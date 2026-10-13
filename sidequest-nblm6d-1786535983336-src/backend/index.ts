import { ai, router, json, error } from '@appdeploy/sdk';
const systems: Record<string, string> = {
  bored: 'Create exactly one safe, time-boxed challenge for a teenager. If no subject is supplied, choose an interesting cross-disciplinary challenge. It must leave proof of work. Use four short sections: Challenge; First move under 2 minutes; Finish line; Why it builds an edge. Never shame or give a long list.',
  thought: 'Be a calm cognitive reframing companion for a teenager, not a therapist. Use: What the mind is saying; Fact vs guess; A fairer believable story; One small action. If input suggests self-harm, abuse, danger, or harm to others, prioritize telling a trusted adult now and contacting local emergency support.',
  friend: 'Be a just-in-time friendship wingman for a teenager. Help without manipulation, surveillance, pretending, or pressure. Give one next move, a natural message, and one thing not to overthink. Respect consent. For bullying, coercion, sexual pressure, threats, or unsafe meetings, involve a trusted adult.',
  note: 'Be a precise teen writing editor. Preserve their voice. Based on the request, sharpen, give two improvements, or identify the strongest showcase format and first step. Do not invent achievements or make it corporate.',
  earn: 'Help a teenager make a safe first dollar. Give one legal, age-appropriate, low-cost opportunity: tiny offer; first customer; 20-minute proof step; adult safety check; realistic starter price range. Never suggest gambling, trading, crypto, debt, adult content, deception, unsafe meetings, personal-data sharing, or evading age rules.',
  volunteer: 'Match a teenager to one realistic way to help. Give one action, who to contact, a first message, and a small commitment. Respect age rules and recommend a trusted adult for unfamiliar groups, travel, or meetings.'
};
const surpriseFallback: Record<'he' | 'en', string[]> = {
  he: [
    'האתגר\nבחרו חפץ יומיומי שנמצא לידכם וגַלו החלטת עיצוב אחת שמישהו קיבל לגביו.\n\nהצעד הראשון — פחות משתי דקות\nצלמו את החפץ וכתבו: ״למה הוא נראה או עובד דווקא כך?״\n\nקו הסיום\nמצאו הסבר אפשרי אחד והכינו שלוש שורות או הקלטה של 30 שניות שמסבירות אותו.\n\nלמה זה בונה יתרון\nכך מתאמנים לראות החלטות נסתרות, לשאול שאלה טובה ולהפוך סקרנות לתוצר שאפשר להראות.',
    'האתגר — יום הפוך 🔄\nרוצים לשגע את ההורים? בבקשה רגילה ובטוחה אחת, החליפו את ה״לא״ או ההתעלמות שהם כבר מצפים להם ב־״כן, בכיף״. ואז עצרו לרגע וצפו בפרצוף. חבל שאין מצלמה נסתרת שתצלם את ההלם — אבל לא מצלמים בלי רשות 😄\n\nהצעד הראשון — פחות משתי דקות\nבחרו בקשה קטנה אחת שבדרך כלל מעוררת אצלכם ״לא״ אוטומטי: לפנות משהו, להביא משהו או להתחיל משימה קצרה. כשהיא מגיעה, ענו: ״כן, בכיף״. לא אומרים כן למשהו מסוכן, לא נעים או שחוצה גבול.\n\nקו הסיום\nנסו את ההיפוך בשלוש בקשות רגילות במהלך היום ושימו לב מה משתנה בתגובה של ההורים — וגם בתחושה שלכם.\n\nלמה זה בונה יתרון\nזה ניסוי קטן בשבירת דפוס תקשורתי: כשמשנים תגובה צפויה אחת, אפשר לראות בזמן אמת איך כל האינטראקציה משתנה. זה לא שיעור בציות; זו דרך לגלות כמה כוח יש לתגובה שבוחרים.'
  ],
  en: [
    'Challenge\nChoose an everyday object near you and uncover one design decision someone made about it.\n\nFirst move — under two minutes\nTake a photo and write: “Why does it look or work this way?”\n\nFinish line\nFind one plausible explanation and make a three-line note or 30-second recording that explains it.\n\nWhy this builds an edge\nYou practice noticing hidden decisions, asking a strong question, and turning curiosity into something you can show.',
    'Challenge — Reverse Day 🔄\nWant to confuse your parents? For one ordinary, safe request, replace the “no” or silence they expect with “Yes, happily.” Then pause and watch their face. If only there were a hidden camera for the shock — but do not record anyone without permission 😄\n\nFirst move — under two minutes\nChoose one small request that normally triggers an automatic no: putting something away, bringing something over, or starting a short task. When it comes, say: “Yes, happily.” Never say yes to anything unsafe, uncomfortable, or beyond your boundaries.\n\nFinish line\nTry the reversal with three ordinary requests today and notice what changes in your parents’ response — and in how you feel.\n\nWhy this builds an edge\nIt is a tiny communication experiment: change one expected response and watch the whole interaction shift in real time. This is not a lesson in obedience; it is a way to discover how much power lives in the response you choose.'
  ]
};
function pickSurprise(language: 'he' | 'en') { const options = surpriseFallback[language]; return options[Math.floor(Math.random() * options.length)]; }
function completeBoredomAnswer(text: string) { const trimmed = text.trim(); return trimmed.length >= 150 && (trimmed.match(/\n/g) || []).length >= 3; }
export const handler = router({
  'GET /api/_healthcheck': [async () => json({ message: 'Success' })],
  'POST /api/coach': [async ({ body }) => {
    const data = body as { mode?: string; text?: string; extra?: string; language?: string };
    if (!data.mode || !systems[data.mode]) return error('Unknown mode', 400);
    if (!data.text?.trim()) return error('Text is required', 400);
    if (data.text.length > 5000) return error('Text is too long', 400);
    const language = data.language === 'he' ? 'he' : 'en';
    const surpriseRequest = data.mode === 'bored' && ['surprise me', 'הפתיעו אותי', 'הפתיע אותי'].includes(data.text.trim().toLowerCase());
    if (surpriseRequest) return json({ answer: pickSurprise(language), fallback: true });
    const languageRule = language === 'he' ? 'Answer only in natural, age-appropriate Hebrew. Use short, clear sections and inclusive plural phrasing where practical.' : 'Answer only in natural, age-appropriate English. Use short, clear sections.';
    try {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const retryRule = attempt ? ' The previous answer was incomplete. Return all four sections and finish every sentence.' : '';
        const result = await ai.generate({ system: systems[data.mode] + ' ' + languageRule + retryRule, prompt: 'Context: ' + (data.extra || 'none') + '\nTeen input: ' + data.text.trim(), thinkingMode: 'FAST', temperature: attempt ? 0.35 : 0.5, maxTokens: 900 });
        if (data.mode !== 'bored' || completeBoredomAnswer(result.text)) return json({ answer: result.text });
      }
      return json({ answer: pickSurprise(language), fallback: true });
    } catch (caught) {
      console.error('AI coach failed', caught);
      if (data.mode === 'bored') return json({ answer: pickSurprise(language), fallback: true });
      return error('AI coach unavailable', 503);
    }
  }]
});