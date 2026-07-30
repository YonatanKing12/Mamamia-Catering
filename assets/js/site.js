/* ═══════════════════════════════════════════════════════════
   מאמא מיה קייטרינג — לוגיקת הדף
   כל מה שצריך לשנות נמצא ב־CFG שלמטה. ראו README.md
   ═══════════════════════════════════════════════════════════ */

const CFG = {
  /* מספר לוואטסאפ בפורמט בינלאומי, בלי + ובלי מקפים.
     דוגמה: 0501234567 בישראל → "972501234567" */
  whatsapp: '',

  /* טלפון להצגה ולחיוץ. אם ממלאים כאן — כל המופעים בדף מתעדכנים לבד. */
  tel: '',

  /* טווח מחיר לסועד, בשקלים.
     כל עוד אחד מהם null — מסך הערכת המחיר לא מוצג כלל,
     כדי שלא יוצג לעולם מספר שלא אושר. מלאו כדי להפעיל. */
  perPerson: { min: null, max: null },

  /* עיגול ההערכה למעלה/למטה לכפולות של: */
  roundTo: 100,
};

/* ─────────── עזרי DOM ─────────── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ─────────── טלפון ─────────── */
(() => {
  if (!CFG.tel || CFG.tel.includes('{{')) return;
  const href = 'tel:' + CFG.tel.replace(/[^\d+]/g, '');
  $$('[data-tel]').forEach(a => {
    a.href = href;
    if (a.textContent.includes('{{')) a.textContent = CFG.tel;
  });
})();

/* ─────────── שנה בפוטר ─────────── */
{
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
}

/* ─────────── כותרת דביקה ─────────── */
{
  const head = $('.head');
  const onScroll = () => head.classList.toggle('is-stuck', window.scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─────────── חשיפה בגלילה ─────────── */
{
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(e => e.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en, i) => {
        if (!en.isIntersecting) return;
        setTimeout(() => en.target.classList.add('in'), i * 70);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(e => io.observe(e));
  }
}

/* ─────────── וואטסאפ ─────────── */
const waLink = (text) => {
  if (!CFG.whatsapp) return null;
  return `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}`;
};

/* קישורי "וואטסאפ" כלליים בדף */
$$('[data-wa-plain]').forEach(a => {
  const url = waLink('היי, אני מתעניין/ת בקייטרינג של מאמא מיה לאירוע.');
  if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; }
  else a.addEventListener('click', e => {
    e.preventDefault();
    $('#quote').scrollIntoView({ behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════════════════════════
   מחשבון ההצעה
   ═══════════════════════════════════════════════════════════ */
{
  const form  = $('#calc');
  if (form) {
    const steps = $$('.calc__step', form);
    const bar   = $('#calc-bar');
    const count = $('#calc-count');
    const back  = $('#calc-back');
    const next  = $('#calc-next');
    const nav   = $('.calc__nav', form);
    const done  = $('#calc-done');
    const LAST  = steps.length;               // 5
    const QS    = LAST - 1;                   // 4 שאלות + מסך פרטים
    let cur = 1;

    const src = $('#f-source');
    if (src) src.value = location.href;

    const render = () => {
      steps.forEach(s => { s.hidden = +s.dataset.step !== cur; });
      bar.style.width = (cur / LAST * 100) + '%';
      count.textContent = cur <= QS
        ? `שאלה ${cur} מתוך ${QS}`
        : 'פרטים ליצירת קשר';
      back.hidden = cur === 1;
      next.hidden = cur === LAST;
      nav.hidden  = false;
      if (cur === LAST) showEstimate();
    };

    /* אימות השלב הנוכחי */
    const stepValid = () => {
      const step = steps[cur - 1];
      const radios = $$('input[type=radio]', step);
      if (radios.length) {
        if (radios.some(r => r.checked)) return true;
        step.classList.remove('shake');
        void step.offsetWidth;                 // איפוס האנימציה
        step.classList.add('shake');
        radios[0].focus();
        return false;
      }
      return true;                             // שלב התאריך אינו חובה
    };

    const go = (n) => {
      cur = Math.min(Math.max(n, 1), LAST);
      render();
      const top = form.getBoundingClientRect().top + scrollY - 90;
      if (scrollY > top) scrollTo({ top, behavior: 'smooth' });
    };

    next.addEventListener('click', () => { if (stepValid()) go(cur + 1); });
    back.addEventListener('click', () => go(cur - 1));

    /* בחירה בכפתור מקדמת אוטומטית — פחות חיכוך */
    $$('.opts input[type=radio]', form).forEach(r => {
      r.addEventListener('change', () => {
        if (+r.closest('.calc__step').dataset.step !== cur) return;
        setTimeout(() => { if (cur < LAST) go(cur + 1); }, 220);
      });
    });

    /* Enter לא ישלח את הטופס באמצע התהליך */
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && cur < LAST) { e.preventDefault(); next.click(); }
    });

    /* ─── הערכת טווח ─── */
    const guestRange = () => {
      const r = $('input[name=guests]:checked', form);
      return r ? { min: +r.dataset.min, max: +r.dataset.max } : null;
    };

    const round = (n, to) => Math.round(n / to) * to;

    function showEstimate() {
      const box = $('#est');
      const { min, max } = CFG.perPerson;
      const g = guestRange();
      if (!box || min == null || max == null || !g) { if (box) box.hidden = true; return; }
      const lo = round(g.min * min, CFG.roundTo);
      const hi = round(g.max * max, CFG.roundTo);
      const fmt = n => n.toLocaleString('he-IL');
      $('#est-val').textContent = `${fmt(lo)} – ${fmt(hi)} ₪`;
      box.hidden = false;
    }

    /* ─── בניית הודעת וואטסאפ מהתשובות ─── */
    const val = (name) => {
      const el = form.elements[name];
      if (!el) return '';
      /* קבוצת רדיו מחזירה RadioNodeList — ל־value שלה יש כבר את הנבחר */
      if (!(el instanceof HTMLElement)) return el.value || '';
      if (el.type === 'checkbox') return el.checked ? el.value : '';
      return el.value || '';
    };

    const summary = () => {
      const lines = [
        'היי, הגעתי מהאתר ואשמח להצעה לקייטרינג:',
        '',
        `סוג אירוע: ${val('event_type') || '—'}`,
        `סועדים: ${val('guests') || '—'}`,
        `תאריך: ${val('event_date') || val('date_flexible') || 'עוד לא נקבע'}`,
        `אזור: ${val('area') || '—'}`,
      ];
      if (val('name'))  lines.push(`שם: ${val('name')}`);
      if (val('phone')) lines.push(`טלפון: ${val('phone')}`);
      if (val('note'))  lines.push('', `הערות: ${val('note')}`);
      return lines.join('\n');
    };

    /* ─── שליחה בוואטסאפ ─── */
    $('#wa-send')?.addEventListener('click', () => {
      const url = waLink(summary());
      if (!url) { alert('מספר הוואטסאפ לא הוגדר עדיין באתר.'); return; }
      open(url, '_blank', 'noopener');
    });

    /* ─── שליחת הטופס (Netlify Forms, ללא ניווט) ─── */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const btn = $('button[type=submit]', form);
      const label = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'שולח…';

      try {
        const res = await fetch(form.getAttribute('action') || '/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString(),
        });
        if (!res.ok) throw new Error(res.status);

        steps.forEach(s => s.hidden = true);
        nav.hidden = true;
        done.hidden = false;
        done.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {
        btn.disabled = false;
        btn.textContent = label;
        let msg = $('.calc__err', form);
        if (!msg) {
          msg = document.createElement('p');
          msg.className = 'calc__err';
          msg.style.cssText = 'color:#b0392a;font-size:.9rem;margin:.9rem 0 0';
          $('.calc__send', form).after(msg);
        }
        msg.textContent = 'השליחה נכשלה. אפשר לשלוח בוואטסאפ או להתקשר — ונחזור אליכם מיד.';
      }
    });

    render();
  }
}
