/**
 * ═══════════════════════════════════════════════════════════════════════
 *  BranchStrip — שלושת המטבחים כשורה, וכל אחד מהם קישור.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 03 §7.17, spec 01 §3.1 סקשן 05, P-03…P-06.
 *
 * זה המקום שבו הבידול מפסיק להיות טענה. «קייטרינג ממטבח מסעדה» הוא
 * משפט שכל אחד יכול לכתוב; שלוש מסעדות עם שם, כתובת ועמוד משלהן הן דבר
 * שאפשר לבדוק. לכן הבאנד הזה יושב כמעט בכל מסלול, והוא זה שנושא את
 * הקישורים הפנימיים אל עמודי המטבחים.
 *
 * ─── ארבע החלטות ────────────────────────────────────────────────
 *
 *  1. **עמודה נגזמת שורה־שורה.** אין כתובת, אין שעות, אין שם שף — כל
 *     אחד נעלם לחוד, ומה שנשאר הוא שם הסניף, שהוא עובדה מאומתת בפני
 *     עצמה (business.ts). עמודה קצרה וכנה, לעולם לא `—` אנונימי.
 *
 *  2. **אין כאן שורת כשרות.** §7.17 קובע שמשפט הכשרות מרונדר במילותיו
 *     של הבעלים, במקום אחד בלבד — גיליון הייצור בעמוד המטבחים — ולעולם
 *     לא כתג, לא כחותמת ולא ברוחב האתר. הרצועה הזאת מופיעה כמעט בכל
 *     מסלול, ולכן היא בדיוק המקום שבו «ברוחב האתר» היה קורה.
 *
 *  3. **הבאנד הכהה הוא opt-in.** L-9 מתיר `data-band="ink"` אחד למסלול,
 *     ו־`layout/footer.tsx` כבר נושא אחד. `ink` נשאר `false` כברירת מחדל
 *     כדי ששני באנדים כהים לא ינחתו באותו עמוד בלי שאיש התכוון.
 *
 *  4. **`branch_click` הוא השם הנכון** (01 §6.4), אבל האיחוד הסגור של
 *     ‎`lib/analytics.ts` מכיר היום רק `kitchen_page_click` (02 §14.2).
 *     יורים את מה שקיים; ההתנגשות מדווחת ולא מוכרעת כאן.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { BRANCHES, SLOTS, filled, type BranchId } from "@/content/business";
import { track } from "@/lib/analytics";
import { BandSection, type BandTone } from "./section";

/** `herzliya_pituach` → `herzliya-pituach`. הצורה עם המקף היא הקנונית בכתובות. */
export const branchSlug = (id: BranchId): string => id.replace(/_/g, "-");

export interface BranchStripEntry {
  id: BranchId;
  nameHe: string;
  isFlagship?: boolean;
  /** `null` ⇒ שם הסניף מוצג בלי קישור. */
  href?: string | null;
  addressHe?: string | null;
  hoursHe?: string | null;
  chefHe?: string | null;
  /** שורה חופשית אחת — «המטבח שמבשל את האזור הזה», וכדומה. */
  noteHe?: string | null;
}

/**
 * הרשומות שהמערכת יכולה להרכיב לבד היום: שמות שלושת הסניפים, ומה שמלא
 * ב־SLOTS. הכול חוץ מהשמות הוא `null` נכון לעכשיו, וזה המצב התקין.
 * עמוד שיש לו נתונים עשירים יותר (content/locations.ts) מעביר `entries` משלו.
 */
export function defaultBranchEntries(): BranchStripEntry[] {
  return BRANCHES.map((branch) => ({
    id: branch.id,
    nameHe: branch.name,
    isFlagship: branch.isFlagship,
    href: `/kitchens/${branchSlug(branch.id)}`,
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
  /** תווית הקישור בתוך כל עמודה. */
  linkLabelHe?: string;
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
  linkLabelHe = "המטבח הזה",
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
                {branch.isFlagship ? (
                  /* ‎.tag הוא הפיל היחיד במערכת (L-11). */
                  <span className="rounded-pill border border-solid border-[color:var(--rule)] px-3 py-[.3rem] text-2xs font-semibold text-fg-subtle">
                    מטבח הדגל
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
