/**
 * ═══════════════════════════════════════════════════════════════════════
 *  P-03 · `/kitchen` — המטבח. דף אחד, לא ארבעה.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה הדף הזה מחליף את `/kitchens` ואת שלושת דפי הסניף
 * ─────────────────────────────────────────────────────────────────────
 * ‏spec 01 §4 P-03…P-06 תיאר מפרק מטבחים ושלושה דפי סניף, וכולם נכתבו תחת
 * ההנחה שהקייטרינג יוצא משלושה מטבחים. ההנחה הזאת שגויה: `business.ts`
 * (מקטע המיצוב, 30 ביולי 2026) קובע שהקייטרינג מבושל במטבח של **אחת**
 * מהמסעדות, ו־`SLOTS.cateringKitchenBranch` אינו יודע איזו. ‏`00-spec-review`
 * קובע שהמציאות גוברת על המפרט, ו־`page-meta-extra.ts` כבר מוחק את ארבעת
 * הנתיבים ב־`SUPERSEDED_PATHS`.
 *
 * ההחלטה אינה רק תיקון עובדתי. שלושה דפי סניף על אתר קייטרינג היו הופכים
 * כל אחד מהם לשער כניסה: מי שמחפש «קייטרינג רעננה» היה נוחת על דף שמדבר
 * על מסעדת רעננה — שאינה עושה קייטרינג — וזה מצג שנקרא, ונזכר.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה הדף טוען, ומה הוא נזהר לא לטעון
 * ─────────────────────────────────────────────────────────────────────
 * הטענה, ורק היא: **הקייטרינג מבושל במטבח של מסעדה פעילה** — מטבח שמבשל
 * לסועדים שיושבים בו, ולא מטבח ייצור שנפתח כדי לשרת אירועים. זו עובדה
 * שנמסרה, והיא היחידה שהדף עומד עליה.
 *
 * ומה שאינו נכתב כאן בשום ניסוח:
 *   · **איזו** מסעדה מבשלת — `cateringKitchenRestaurant()` מחזיר `null`,
 *     ולכן אין באתר עיר שנקובה כמוצא האוכל.
 *   · אזור שירות כלשהו, ובוודאי לא כזה שנגזר משלוש נקודות על מפה.
 *   · «כל יום», «הערב», «תוך שעה» — כל אחת מהן היא טענה על שעות ועל
 *     מהירות, ושתי המשבצות ריקות.
 *   · «בואו לטעום» — `tastingPolicy` ריק, ו־`liveMenuUrl` ריק. בלי תפריט
 *     חי של המסעדה אין סימן «מוגש היום», גם לא בגרסה מרוככת.
 *   · «מטבח הדגל». התג הזה קיים ב־`BRANCHES` ומרונדר בדף הבית, אבל כאן —
 *     בדף שכל נושאו הוא איזה מטבח מבשל — הוא היה נקרא כתשובה לשאלה הזאת.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  כשהמשבצת תתמלא, זו מילוי ולא כתיבה מחדש
 * ─────────────────────────────────────────────────────────────────────
 * ברגע ש־`SLOTS.cateringKitchenBranch` יימסר, `cateringKitchenRestaurant()`
 * מחזיר מסעדה, ה־lede של סקשן המסעדות נוקב בשמה, והשורה שלה ברשימה נושאת
 * תג. שום פסקה אינה משתנה, ואין מה לנסח מחדש. אותו דבר לגבי בלוק פרטי
 * המסעדות: `anyRestaurantDetail()` שקרי היום ⇒ הבלוק אינו קיים; כשתגיע
 * כתובת אחת הוא נולד עם שורה אחת, ולא עם ארבעה תאים ריקים.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מספור, באנדים, ומה שאינו כאן
 * ─────────────────────────────────────────────────────────────────────
 * ‏§3.1: הספרות נקבעות **בזמן רינדור לפי מיקום**. `order` למטה הוא המקור
 * היחיד להן, ולכן סקשן שנשמט אינו משאיר חור ברצף — החור הזה הוא האות
 * הרועשת ביותר ל«תבנית עם חלקים חסרים».
 *
 * ‏INV-3 מתיר באנד כהה אחד למסלול, והפוטר כבר נושא אותו. לכן הסקשן המודגש
 * כאן הוא `.sec--alt`, לא `data-band="ink"`.
 *
 * ואין כאן: `Faq` (אין ולו תשובה שנמסרה), `TastingBand`, `GoogleReviews`
 * (אין ביקורת שניתן לייחס), `DriveTimeTable` (זמן נסיעה מאיפה?), ו־`Photo`
 * (אין ולו תצלום אחד; הדף נבנה כדי לעבוד עם אפס תמונות, לא כדי לשאת מסגרת
 * ממלאת מקום).
 */

import * as React from "react";
import { useLocation } from "wouter";
import { Head } from "@/components/seo/head";
import { CtaPair, Ltr, Num, Prose, Rule, SectionHeader } from "@/components/primitives";
import { QuoteBuilder } from "@/components/quote/quote-builder";
import { PHONE, SLOTS, filled, telLink, waLink } from "@/content/business";
import {
  RESTAURANTS,
  RESTAURANT_FACT_LABEL_HE,
  accessibilityFor,
  addressLineFor,
  anyRestaurantDetail,
  cateringKitchenRestaurant,
  chefFor,
  filledFactKeys,
  hoursFor,
  type RestaurantFactKey,
  type RestaurantLocation,
} from "@/content/locations";
import { capturePhoneClick, captureWaIntent, buildWaHref } from "@/lib/lead-client";
import { track } from "@/lib/analytics";
import { kashrutClauseHe, pageMetaExtra, stripEmptyJsonLd } from "@/lib/page-meta-extra";
import { buildBreadcrumbList, buildWebPage, type JsonLdNode } from "@/lib/seo";

const META = pageMetaExtra()["/kitchen"];

/* ═══════════════════ עזרים מקומיים ═══════════════════ */

/**
 * ‏`stripEmptyJsonLd` על כל צומת לפני שהוא נכנס לגרף.
 *
 * ‏`<Head>` מריץ `compact()` ממילא, וזו אינה סיבה לוותר: הבונים ב־`lib/seo.ts`
 * פולטים `null` לכל Slot ריק, והכלל «צומת נבדק במקום שבו הוא נבנה» הוא מה
 * שישרוד גם צומת שייכתב כאן ביד בעוד חצי שנה. `null` בתוך המערך מותר —
 * ‏`<Head>` מסנן אותו.
 */
const clean = (node: JsonLdNode | null): JsonLdNode | null =>
  node ? stripEmptyJsonLd(node) : null;

/**
 * קליק וואטסאפ: קליטה מקדימה ואז ניווט **באותו tick**. ה־href הסטטי נשאר
 * תקין ללא JS ולפתיחה בלשונית חדשה.
 *
 * ‏`WA_LOCATIONS` ב־`shared/lead-schema.ts` היא רשימה סגורה ואין בה ערך
 * למסלול הזה. `hero` ו־`footer` הם המיקומים בעמוד, וזה מה שהשדה מודד —
 * מדווח בדוח החזרה כבקשה להוסיף `kitchen`.
 *
 * ‏TODO(01 §5.7): להעביר ל־`lib/whatsapp.ts openWhatsApp()` כשייווצר.
 */
function useWhatsAppHandoff(location: "hero" | "footer") {
  return React.useCallback(
    (e: React.MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      track("whatsapp_click", { wa_location: location, has_lead: false });
      const ref = captureWaIntent({ waLocation: location });
      track("whatsapp_handoff", { lead_ref: ref, wa_location: location });
      window.location.href = buildWaHref({}, ref);
    },
    [location],
  );
}

const WA_OPENER = "היי, קראתי על המטבח ורוצה הצעה לקייטרינג.";

/* ═══════════════════ 1 · ההירו ═══════════════════ */

/**
 * ‏L-2: אין תמונה מעל הקיפול, ואין כאן גם מסגרת במקומה. L-10: פקד ממולא
 * אחד, שני ghost, והטלפון הוא קישור טקסט מתחת ולא פקד שלישי.
 *
 * סיומת הכשרות מגיעה מ־`kashrutClauseHe()` ולעולם לא נכתבת כליטרל: היא
 * ההצהרה בעלת הסיכון הגבוה ביותר באתר, ומקורה היחיד הוא מודול העובדות.
 */
const KitchenHero = () => {
  const onWhatsApp = useWhatsAppHandoff("hero");
  const kashrut = kashrutClauseHe("general");

  return (
    <section className="pb-sec pt-[clamp(2.5rem,7vw,5rem)]">
      <div className="wrap">
        <p className="eyebrow m-0">המטבח</p>

        <h1 className="mt-5 max-w-measure text-4xl">
          מטבח של מסעדה.
          <br />
          לא מטבח ייצור.
        </h1>

        <Prose size="lede" measure="lede" className="mt-7">
          <p>
            קייטרינג מאמאמיה מבושל במטבח של מסעדה איטלקית פעילה — מטבח שמבשל
            לסועדים שיושבים בו, ולא מטבח שנפתח כדי לשרת אירועים.
            {kashrut ? ` ${kashrut}.` : null}
          </p>
        </Prose>

        <CtaPair
          className="mt-9"
          primary={{ label: "בנו תפריט לאירוע", href: "#quote" }}
          secondary={{
            label: "דברו איתנו בוואטסאפ",
            variant: "ghost",
            href: waLink(WA_OPENER),
            target: "_blank",
            onClick: onWhatsApp,
          }}
        />

        <p className="mt-5 text-xs text-fg-subtle">
          או בטלפון{" "}
          <a
            href={telLink()}
            data-tel=""
            className="text-fg no-underline hover:text-accent"
            onClick={() => capturePhoneClick({ callLocation: "kitchen_hero" })}
          >
            <Num>{PHONE.display}</Num>
          </a>
        </p>
      </div>
    </section>
  );
};

/* ═══════════════════ 2 · ההבדל ═══════════════════ */

/**
 * שלוש שורות, וכל אחת מהן נגזרת ישירות מהעובדה היחידה שנמסרה. אין כאן
 * מספר, אין מהירות, אין תדירות ואין אזור — רק מה ההבדל אומר בפועל.
 *
 * השורה השלישית נושאת את השם המשפטי כשהוא מלא, כי זו ההוכחה הזולה ביותר
 * לכך שיש עסק רשום מאחורי הדף. `companyId` ריק, ולכן אין כאן ח.פ.
 */
const DifferenceSection = ({ num }: { num?: string }) => {
  const legal = filled(SLOTS.legalName) ? SLOTS.legalName : null;

  const rows: Array<{ title: string; body: React.ReactNode }> = [
    {
      title: "אותו מטבח, לא מערך שני",
      body: "האוכל לאירוע יוצא מהמטבח שמבשל למסעדה. לא הוקם מערך נפרד לאירועים, ולא נשכר מטבח חיצוני.",
    },
    {
      title: "מנה שכבר עברה שולחן",
      body: "מה שמגיע לאירוע הוא מה שהמטבח מבשל לסועדים שלו. האירוע שלכם אינו הפעם הראשונה שהמנה הזאת יוצאת מהמטבח.",
    },
    {
      title: "יש עסק מאחורי זה",
      body: (
        <>
          קייטרינג מאמאמיה אינו מטבח רפאים ואינו בישול ביתי. מאחוריו עומדת
          מסעדה איטלקית שפועלת לקהל הרחב
          {legal ? <>, ומאחוריה ישות רשומה — {legal}</> : null}.
        </>
      ),
    },
  ];

  return (
    <section id="difference" className="sec">
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="ההבדל"
          title="מה זה אומר, בפועל"
          lede="מטבח של מסעדה ומטבח שנפתח כדי לשרת אירועים אינם אותו דבר. אלה שלושת ההבדלים."
        />

        <ul className="m-0 list-none p-0">
          {rows.map((row, i) => (
            <li key={row.title} className="m-0">
              {i > 0 ? <Rule /> : null}
              <div className="max-w-body py-[1.7rem] pe-6">
                <h3 className="m-0 font-serif text-lg font-bold">{row.title}</h3>
                <p className="mt-2 text-xs leading-[1.6] text-fg-muted">{row.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

/* ═══════════════════ 3 · המסעדות ═══════════════════ */

/** ערך תא לשורת עובדה. `null` ⇒ השורה אינה קיימת, ולא תא ריק. */
function factValue(key: RestaurantFactKey, r: RestaurantLocation): React.ReactNode {
  if (key === "address") return addressLineFor(r.id);

  if (key === "hours") {
    const h = hoursFor(r.id);
    if (!h) return null;
    if (h.textHe) return h.textHe;
    if (!h.rows) return null;
    /* טווח שעות הוא שני רצפי ספרות עם מקף — הוא מתהפך ב־RTL, ולכן הוא
       יושב במכולת LTR שלמה ולא ב־bdi (§4, כללי דו־כיווניות). */
    return h.rows.map((row) => (
      <span key={row.labelHe} className="block">
        {row.labelHe}{" "}
        <Ltr>
          <Num>{`${row.opens}–${row.closes}`}</Num>
        </Ltr>
      </span>
    ));
  }

  if (key === "chef") {
    const chef = chefFor(r.id);
    if (!chef) return null;
    return filled(chef.roleHe) ? `${chef.nameHe}, ${chef.roleHe}` : chef.nameHe;
  }

  const a = accessibilityFor(r.id);
  if (!a) return null;
  const parts = [a.parkingHe, a.entranceHe, a.toiletHe, a.seatingHe, a.liftHe].filter(
    (v): v is string => filled(v),
  );
  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * המסעדות כהקשר מותג בלבד.
 *
 * ה־lede הוא המקום היחיד בדף שמזכיר כמה מסעדות יש, והוא נזהר בדיוק בנקודה
 * אחת: «מבושל במטבח של אחת מהן». לא «במטבחים שלנו», לא «בשלושת המטבחים»,
 * ולא רמז לאזור שנפרש ביניהן. כשהמשבצת תימסר — המשפט נוקב בשם, והתג
 * ברשימה מסמן את השורה.
 *
 * בלוק פרטי המסעדה מרונדר רק למי שיש לה ולו שורת עובדה אחת. היום אין לאף
 * אחת, ולכן הרשימה היא שלושה שמות — ושם מסעדה הוא עובדה מאומתת בפני עצמה.
 */
const RestaurantsSection = ({ num }: { num?: string }) => {
  const kitchen = cateringKitchenRestaurant();
  const showFacts = anyRestaurantDetail();

  if (RESTAURANTS.length === 0) return null;

  const lede = kitchen
    ? `מסעדות איטלקיות שפועלות לקהל הרחב. הקייטרינג הוא עיסוק נפרד שעובד לפי הזמנה, והוא מבושל במטבח של המסעדה ב${kitchen.cityHe}.`
    : "מסעדות איטלקיות שפועלות לקהל הרחב. הקייטרינג הוא עיסוק נפרד שעובד לפי הזמנה, והוא מבושל במטבח של אחת מהן.";

  return (
    <section id="restaurants" className="sec sec--alt">
      <div className="wrap">
        <SectionHeader
          num={num}
          eyebrow="הקשר"
          title="המסעדות שמאחורי הקייטרינג"
          lede={lede}
        />

        <ul className="m-0 list-none p-0">
          {RESTAURANTS.map((r, i) => {
            const keys = showFacts ? filledFactKeys(r.id) : [];
            const isCateringKitchen = kitchen !== null && kitchen.id === r.id;

            return (
              <li key={r.id} className="m-0">
                {i > 0 ? <Rule /> : null}
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 py-[1.6rem]">
                  <h3 className="m-0 font-serif text-2xl font-medium">{r.nameHe}</h3>

                  {isCateringKitchen ? (
                    <span className="rounded-pill border border-solid border-rule-control px-3 py-[.3rem] text-2xs font-semibold text-fg-subtle">
                      המטבח שמבשל את הקייטרינג
                    </span>
                  ) : null}

                  {keys.length > 0 ? (
                    <dl className="m-0 basis-full">
                      {keys.map((key) => {
                        const value = factValue(key, r);
                        if (!value) return null;
                        return (
                          <div
                            key={key}
                            className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs first:mt-2"
                          >
                            <dt className="m-0 min-w-[9rem] text-fg-subtle">
                              {RESTAURANT_FACT_LABEL_HE[key]}
                            </dt>
                            <dd className="m-0 text-fg-muted">{value}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

/* ═══════════════════ 4 · התפריט שלכם ═══════════════════ */

/**
 * ‏`showHeader={false}` והכותרת נכתבת כאן: המספר נקבע **לפי מיקום** (§3.1),
 * ורק העמוד יודע באיזה מיקום הבנאי יושב אצלו.
 *
 * העוגן `#quote` יושב על העטיפה ולא על הבנאי, כדי שקפיצה מה־CTA בהירו
 * ומהפס הדביק תנחת על הכותרת ולא מתחתיה.
 *
 * ‏`sourcePage` הוא prop חובה (02 §3.9) — הוא מה שמצמיד את הודעת האיסוף
 * ואת הייחוס לטופס בכל מסלול. `onSubmitted` מנווט ל־`/thanks?ref=`: מעבר
 * מסלול ולא החלפה במקום (02 §5.1).
 *
 * הפסקה מתחת ל־lede היא מסלול הוואטסאפ השני בעמוד. הוא כאן ולא רק בהירו
 * כי מי שגלל עד הטופס ובחר לא למלא אותו הוא בדיוק מי שצריך ערוץ שני.
 */
const QuoteSection = ({ num }: { num?: string }) => {
  const [, navigate] = useLocation();
  const onWhatsApp = useWhatsAppHandoff("footer");

  return (
    <div id="quote" className="border-y border-solid border-[color:var(--rule)] bg-paper-3">
      <div className="wrap pt-sec">
        <SectionHeader
          num={num}
          title="התפריט שלכם"
          lede="ארבע שאלות על האירוע, ואז פרטים ליצירת קשר. אין שדה תקציב, ואין מה למלא כדי לראות מחיר."
        />

        <p className="mb-8 text-xs text-fg-subtle">
          מעדיפים לכתוב?{" "}
          <a
            href={waLink(WA_OPENER)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg no-underline hover:text-accent"
            onClick={onWhatsApp}
          >
            דברו איתנו בוואטסאפ
          </a>
        </p>
      </div>

      <QuoteBuilder
        id="quote-builder"
        sourcePage="/kitchen"
        showHeader={false}
        className="!pt-0"
        onSubmitted={(ref, answers) =>
          navigate(`/thanks?ref=${encodeURIComponent(ref)}`, { state: { ref, answers } })
        }
      />
    </div>
  );
};

/* ═══════════════════ העמוד ═══════════════════ */

export default function Kitchen() {
  /* ‎§3.1 — מקור המספור היחיד. סקשן שנשמט אינו משאיר חור ברצף. */
  const showRestaurants = RESTAURANTS.length > 0;
  const order = ["difference", showRestaurants ? "restaurants" : null, "quote"].filter(
    (k): k is string => k !== null,
  );
  const num = (key: string) => {
    const i = order.indexOf(key);
    return i < 0 ? undefined : String(i + 1).padStart(2, "0");
  };

  return (
    <>
      <Head
        meta={META}
        jsonLd={[
          /* ‏`WebPage` + `BreadcrumbList` בלבד.
           *
           * אין כאן `Restaurant`: הצומת הזה נושא `@id` של `/kitchens/{slug}`,
           * נתיב שנמחק ב־`SUPERSEDED_PATHS`, והוא דורש כתובת ושעות שאינן
           * קיימות. אין כאן `Organization`: הישות קנונית בדף הבית, ו־`about`
           * שב־`buildWebPage` מפנה אליה ב־`@id` — קשת בגרף עדיפה על עותק שני.
           * אין `FAQPage` (אין תשובה שנמסרה) ואין `Service` (הוא של `/catering`). */
          clean(buildWebPage(META)),
          clean(buildBreadcrumbList(META.breadcrumb)),
        ]}
      />

      <KitchenHero />
      <DifferenceSection num={num("difference")} />
      {showRestaurants ? <RestaurantsSection num={num("restaurants")} /> : null}
      <QuoteSection num={num("quote")} />
    </>
  );
}
