/**
 * ═══════════════════════════════════════════════════════════════════════
 *  NextSteps — הבאנד שמעביר מבקר הצידה.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 INV-8, §4 P-07 («העמוד השדרה של הקישור הפנימי לכל עמוד אירוע»),
 * ‎§6.4 / spec 02 §14.2 (`event_page_click`), spec 03 §7.13, §7.15.
 *
 * מבקר שהגיע ל־«קייטרינג לשבעה» ואינו מזמין היום עוזב. מבקר שרואה שיש
 * גם «קייטרינג עסקי» ו«ארוחת חג» מבין שזה עסק ולא דף נחיתה יחיד. זה כל
 * מה שהבאנד הזה עושה, והוא עושה רק את זה.
 *
 * ─── הכלל היחיד שמחזיק אותו (§7.13) ─────────────────────────────
 * **קישור לעמוד שאינו מוגש היום אינו מרונדר.** ‎`shared/routes.ts` הוא
 * הבורר, לא רשימה שנכתבת ביד בכל עמוד: `/menus`, `/kitchens`,
 * ‎`/kitchens/:slug`, `/catering/shiva`, `/catering/fun-day`,
 * ‎`/pasta-bar`, `/areas/:city` ו־`/lp/:campaign` כולם `enabled: false`
 * נכון להיום, וכל אחד מהם יחזיר 404 קשיח. חמישה־עשר עמודים שכל אחד
 * מהם כותב רשימת קישורים משלו יפזרו 404־ים בכל האתר תוך יום; שער אחד
 * שיושב כאן פשוט משמיט אותם, והם חוזרים לבד ברגע ש־`enabled` מתהפך.
 *
 * גם המסלול הנוכחי נשמט: קישור לעמוד שכבר פתוח הוא רעש, ובאנליטיקס הוא
 * מזהם את `event_page_click` בקליקים שאינם מעבר.
 *
 * אין ולו יעד אחד ששורד ⇒ אין באנד, כותרת כלולה. ריק אין פירושו רשת של
 * כרטיסים חסרים — אין פירושו שאין לאן להמשיך היום, וזו תשובה לגיטימית.
 *
 * ─── אין כאן שכנוע ──────────────────────────────────────────────
 * זו לא רצועת CTA שנייה. אין בה כפתור ממולא (L-10 — הבאנד הזה יושב
 * בעמוד שכבר יש בו אחד), אין בה מספרים, אין בה טענה על מה שנמצא בצד
 * השני. כותרת, שורה, וקישור.
 *
 * ─── אנליטיקס ───────────────────────────────────────────────────
 * ‎`event_page_click { target_route, source_page }` הוא מה שקיים באיחוד
 * הסגור של `lib/analytics.ts`. פריט שמצביע על מסעדה מעביר `branch`
 * במפורש ואז נורה `kitchen_page_click` — 00-spec-review §84 מבקש לשנות
 * את שמו ל־`branch_click`, וההתנגשות מדווחת ולא מוכרעת כאן.
 */

import * as React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { isServedPath, normalizePath } from "@shared/routes";
import type { Branch } from "@shared/lead-constants";
import { BandSection, type BandTone } from "./section";

export interface NextStepLink {
  /**
   * יעד. מסלול פנימי (`/catering/business`) עובר את שער `shared/routes.ts`.
   * עוגן (`#quote`) וכתובת חיצונית (`https://…`) עוקפים אותו — אין להם
   * רשומת מסלול, והם באחריות העמוד.
   */
  href: string;
  titleHe: string;
  /** שורה אחת. `null` ⇒ הכרטיס הוא כותרת בלבד, וזו צורה תקינה. */
  descriptionHe?: string | null;
  /**
   * העברה מפורשת ⇒ נורה `kitchen_page_click` במקום `event_page_click`.
   * רלוונטי רק ליעד שהוא עמוד מסעדה.
   */
  branch?: Branch | null;
}

export interface NextStepsProps {
  links: readonly NextStepLink[];
  /** המסלול הנוכחי. נשמר על האירוע, ומשמש לסינון קישור עצמי. */
  sourcePage: string;
  /** תקרה רכה. ארבעה כרטיסים הם השורה; יותר מזה זה מפת אתר. */
  limit?: number;

  id?: string;
  num?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  tone?: BandTone;
  className?: string;
}

/** `/catering/business?x=1#y` → `/catering/business`. */
function pathOf(href: string): string {
  return href.split(/[?#]/, 1)[0] ?? href;
}

/** עוגן או כתובת מוחלטת — לא מסלול, ולכן לא עובר את שער המסלולים. */
function isInternalRoute(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

export function NextSteps({
  links,
  sourcePage,
  limit = 4,
  id,
  num,
  eyebrow,
  title = "מה עוד יוצא מהמטבח",
  lede,
  tone = "paper",
  className,
}: NextStepsProps) {
  const [location] = useLocation();

  const here = React.useMemo(
    () => new Set([normalizePath(sourcePage), normalizePath(location)]),
    [sourcePage, location],
  );

  const visible = React.useMemo(() => {
    const seen = new Set<string>();
    const out: NextStepLink[] = [];

    for (const link of links) {
      if (!link.href || !link.titleHe) continue;

      if (isInternalRoute(link.href)) {
        const path = normalizePath(pathOf(link.href));
        /* השער. מסלול חסום או לא מוכר פשוט אינו קיים בבאנד הזה. */
        if (!isServedPath(path)) continue;
        /* קישור לעמוד שאנחנו כבר בו. */
        if (here.has(path)) continue;
        if (seen.has(path)) continue;
        seen.add(path);
      } else {
        if (seen.has(link.href)) continue;
        seen.add(link.href);
      }

      out.push(link);
    }

    return limit > 0 ? out.slice(0, limit) : out;
  }, [links, here, limit]);

  /* INV-2: אין לאן להמשיך היום ⇒ אין באנד, ואין כותרת מעל כלום. */
  if (visible.length === 0) return null;

  const fire = (link: NextStepLink) => {
    if (link.branch) {
      track("kitchen_page_click", { branch: link.branch, source_page: sourcePage });
      return;
    }
    track("event_page_click", {
      target_route: normalizePath(pathOf(link.href)),
      source_page: sourcePage,
    });
  };

  return (
    <BandSection
      id={id}
      num={num}
      eyebrow={eyebrow}
      title={title}
      lede={lede}
      tone={tone}
      tight
      className={className}
    >
      {/* ‎nav עם שם נגיש: זו ניווט ולא תוכן, וקורא מסך צריך להבדיל. */}
      <nav aria-label="להמשיך מכאן">
        {/* המרזבים הם הקווים (§3.4 טכניקה 2). עמודה אחת בנייד. */}
        <ul
          className={cn(
"m-0 grid list-none gap-px overflow-hidden rounded border border-solid p-0",
"border-[color:var(--rule)] bg-[color:var(--rule)]",
"[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]",
          )}
        >
          {visible.map((link) => {
            const inner = (
              <>
                <span className="block font-serif text-lg font-medium leading-dish">
                  {link.titleHe}
                </span>
                {link.descriptionHe ? (
                  <span className="mt-2 block max-w-dish text-xs leading-[1.5] text-fg-muted">
                    {link.descriptionHe}
                  </span>
                ) : null}
              </>
            );

            /* כל הכרטיס הוא יעד המגע — 44px הוא רצפה, לא תקרה. הצבע
               אינו נושא המידע: הכותרת מסומנת בקו תחתון בריחוף/מיקוד. */
            const cls = cn(
"flex min-h-[44px] flex-col bg-bg p-card no-underline",
"transition-colors duration-state ease-house",
"hover:bg-[color:var(--surface-hover)] hover:text-accent",
            );

            return (
              <li key={link.href} className="m-0">
                {isInternalRoute(link.href) ? (
                  <Link href={link.href} className={cls} onClick={() => fire(link)}>
                    {inner}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className={cls}
                    onClick={() => fire(link)}
                    {...(link.href.startsWith("#")
                      ? {}
                      : { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    {inner}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </BandSection>
  );
}
