/**
 * ═══════════════════════════════════════════════════════════════════════
 *  BranchStrip — שלוש המסעדות כהקשר מותג. לא כטענה על הקייטרינג.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 03 §7.17, spec 01 §3.1 סקשן 05, P-03…P-06, content/business.ts
 * (המיצוב, 30 ביולי 2026), 00-spec-review A3.
 *
 * ─── מה הרצועה הזאת היא, אחרי תיקון המיצוב ──────────────────────
 * **המסעדות והקייטרינג הם שני עיסוקים נפרדים.** קבוצת המסעדות פועלת
 * לקהל הרחב באופן סדיר; הקייטרינג עובד לפי הזמנה ומבושל במטבח של
 * ‎**אחת** מהן. איזו — טרם נמסר (`SLOTS.cateringKitchenBranch === null`).
 *
 * הרצועה הזאת מציגה את שמות המסעדות, וזה כל מה שהיא מציגה. שמות
 * הסניפים הם עובדה מאומתת ומשמשים הקשר מותג — היכרות עם השם, אמון
 * בקבוצה. **אין לגזור מהם דבר על הקייטרינג**: לא מספר מטבחים, לא אזור
 * שירות, לא קיבולת ולא זמינות. הגרסה הקודמת של האתר גזרה «שלושה מטבחים
 * פעילים» מהשורה הזאת בדיוק; זו הייתה הנחה, היא נמחקה, ואין להחזיר
 * אותה — לא בקופי, לא בכותרת ולא בטקסט של הקישור.
 *
 * הטענה על הקייטרינג יושבת ב־`KitchenNote`, בלשון יחיד, ורק שם.
 *
 * ─── חמש החלטות ─────────────────────────────────────────────────
 *
 *  1. **עמודה נגזמת שורה־שורה.** אין כתובת, אין שעות, אין שם שף — כל
 *     אחד נעלם לחוד, ומה שנשאר הוא שם הסניף, שהוא עובדה מאומתת בפני
 *     עצמה (business.ts). עמודה קצרה וכנה, לעולם לא `—` אנונימי.
 *
 *  2. **אין קישור לעמוד סניף כברירת מחדל.** ‎`/kitchens` (P-03) ו־
 *     ‎`/kitchens/:slug` (P-04) שניהם `enabled: false` ב־`shared/routes.ts`,
 *     חסומים על `branch_addresses` ו־`branch_hours`, ולכן כל קישור אליהם
 *     הוא 404 קשיח על שלושה יעדים בכל מסלול באתר. `defaultBranchEntries()`
 *     מעביר `href` **רק** אם `isServedPath` מאשר אותו, ולכן הרצועה
 *     מתקנת את עצמה ברגע שהשער נפתח, בלי שאיש יזכור לחזור לכאן.
 *
 *  3. **אין כאן שורת כשרות.** §7.17 קובע שמשפט הכשרות מרונדר במילותיו
 *     של הבעלים, במקום אחד בלבד — גיליון הייצור בעמוד המטבחים — ולעולם
 *     לא כתג, לא כחותמת ולא ברוחב האתר. הרצועה הזאת מופיעה כמעט בכל
 *     מסלול, ולכן היא בדיוק המקום שבו «ברוחב האתר» היה קורה.
 *
 *  4. **הבאנד הכהה הוא opt-in.** L-9 מתיר `data-band="ink"` אחד למסלול,
 *     ו־`layout/footer.tsx` כבר נושא אחד. `ink` נשאר `false` כברירת מחדל
 *     כדי ששני באנדים כהים לא ינחתו באותו עמוד בלי שאיש התכוון.
 *
 *  5. **`branch_click` הוא השם הנכון** (01 §6.4), אבל האיחוד הסגור של
 *     ‎`lib/analytics.ts` מכיר היום רק `kitchen_page_click` (02 §14.2).
 *     יורים את מה שקיים; ההתנגשות מדווחת ולא מוכרעת כאן.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { BRANCHES, SLOTS, filled, type BranchId } from "@/content/business";
import { track } from "@/lib/analytics";
import { isServedPath } from "@shared/routes";
import { BandSection, type BandTone } from "./section";

/** `herzliya_pituach` → `herzliya-pituach`. הצורה עם המקף היא הקנונית בכתובות. */
export const branchSlug = (id: BranchId): string => id.replace(/_/g, "-");

/**
 * הנתיב לעמוד הסניף — **או `null` כשהמסלול אינו מוגש היום.**
 * ראו החלטה 2 למעלה. `shared/routes.ts` הוא הבורר, לא הנחה כאן.
 */
export function branchHrefIfServed(id: BranchId): string | null {
  const path = `/kitchens/${branchSlug(id)}`;
  return isServedPath(path) ? path : null;
}

export interface BranchStripEntry {
  id: BranchId;
  nameHe: string;
  /**
   * דגל מותגי בלבד (`BRANCHES[].isFlagship` ב־business.ts).
   * ‎**אינו** אומר שזו המסעדה שמבשלת את הקייטרינג — זה נתון שלא נמסר.
   */
  isFlagship?: boolean;
  /** `null` ⇒ שם הסניף מוצג בלי קישור. זה המצב היום; ראו החלטה 2. */
  href?: string | null;
  addressHe?: string | null;
  hoursHe?: string | null;
  chefHe?: string | null;
  /** שורה חופשית אחת שהעמוד מספק. אין ניסוח שנוצר כאן. */
  noteHe?: string | null;
}

/**
 * הרשומות שהמערכת יכולה להרכיב לבד היום: שמות שלוש המסעדות, ומה שמלא
 * ב־SLOTS. הכול חוץ מהשמות הוא `null` נכון לעכשיו, וזה המצב התקין —
 * וגם `href`, כי P-04 חסום. עמוד שיש לו נתונים עשירים יותר
 * ‎(content/locations.ts) מעביר `entries` משלו.
 */
export function defaultBranchEntries(): BranchStripEntry[] {
  return BRANCHES.map((branch) => ({
    id: branch.id,
    nameHe: branch.name,
    isFlagship: branch.isFlagship,
    href: branchHrefIfServed(branch.id),
    addressHe: filled(SLOTS.addresses) ? SLOTS.addresses[branch.id] : null,
    hoursHe: filled(SLOTS.openingHours) ? SLOTS.openingHours[branch.id] : null,
    chefHe: filled(SLOTS.chefs) ? SLOTS.chefs[branch.id] : null,
  }));
}

export interface BranchStripProps {
  /** ברירת מחדל: `defaultBranchEntries()`. */
  entries?: readonly BranchStripEntry[];
  /** לאנליטיקס. */
  sourcePage: string;
  /** תווית הקישור בתוך כל עמודה. מוצגת רק כשיש `href`. */
  linkLabelHe?: string;
  /**
   * תווית הדגל. `null` ⇒ אין תג בכלל.
   * לא «מטבח הדגל»: זה נקרא כטענה שזה המטבח שמבשל את הקייטרינג.
   */
  flagshipLabelHe?: string | null;
  /** מקדם את הסניף הזה לראש הרשימה (P-04…P-06, P-08). */
  featured?: BranchId | null;
  /** באנד כהה. ראו החלטה 3 למעלה — הדליקו רק במסלול שאין בו אחר. */
  ink?: boolean;

  id?: string;
  num?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  tone?: BandTone;
  className?: string;
}

export function BranchStrip({
  entries,
  sourcePage,
  linkLabelHe = "עמוד המסעדה",
  flagshipLabelHe = "מסעדת הדגל",
  featured = null,
  ink = false,
  id = "kitchens",
  num,
  eyebrow,
  title,
  lede,
  tone,
  className,
}: BranchStripProps) {
  const all = entries ?? defaultBranchEntries();

  const ordered = featured
    ? [...all.filter((b) => b.id === featured), ...all.filter((b) => b.id !== featured)]
    : [...all];

  /* שם סניף הוא עובדה מאומתת; בלי ולו סניף אחד אין רצועה. */
  if (ordered.length === 0) return null;

  return (
    <BandSection
      id={id}
      num={num}
      eyebrow={eyebrow}
      title={title}
      lede={lede}
      tone={tone ?? (ink ? "ink" : "alt")}
      bandId="kitchens"
      className={className}
    >
      {/* המרזבים הם הקווים (§3.4 טכניקה 2). עמודה אחת בנייד. */}
      <div
        className={cn(
"grid gap-px overflow-hidden rounded border border-solid",
"border-[color:var(--rule)] bg-[color:var(--rule)]",
"[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]",
        )}
      >
        {ordered.map((branch) => {
          const meta = [branch.addressHe, branch.hoursHe, branch.chefHe].filter(Boolean);

          return (
            <div key={branch.id} className="flex flex-col bg-bg p-card">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <h3 className="m-0 font-serif text-xl font-medium leading-sub">
                  {branch.nameHe}
                </h3>
                {branch.isFlagship && flagshipLabelHe ? (
                  /* ‎.tag הוא הפיל היחיד במערכת (L-11). */
                  <span className="rounded-pill border border-solid border-[color:var(--rule)] px-3 py-[.3rem] text-2xs font-semibold text-fg-subtle">
                    {flagshipLabelHe}
                  </span>
                ) : null}
              </div>

              {/* כתובת · שעות · שף — כל אחד נגזם לחוד, ואין כאן תא ריק. */}
              {meta.length > 0 ? (
                <ul className="m-0 mt-4 list-none p-0">
                  {meta.map((line, i) => (
                    <li key={i} className="mb-[.35rem] text-xs text-fg-muted">
                      {line}
                    </li>
                  ))}
                </ul>
              ) : null}

              {branch.noteHe ? (
                <p className="m-0 mt-4 max-w-none text-sm text-fg-muted">{branch.noteHe}</p>
              ) : null}

              {branch.href ? (
                <p className="m-0 mt-auto max-w-none pt-6">
                  <a
                    href={branch.href}
                    onClick={() =>
                      track("kitchen_page_click", {
                        branch: branch.id,
                        source_page: sourcePage,
                      })
                    }
                    className="inline-flex min-h-[44px] items-center text-sm font-semibold underline decoration-rule underline-offset-[.22em] hover:decoration-accent"
                  >
                    {linkLabelHe}
                    {/* שם הסניף בשם הנגיש: שלושה קישורים זהים באותו באנד
                        הם כשל 2.4.4. */}
                    <span className="sr-only"> — {branch.nameHe}</span>
                  </a>
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </BandSection>
  );
}
