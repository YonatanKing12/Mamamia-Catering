/**
 * ═══════════════════════════════════════════════════════════════════════
 *  Gallery — צילומי אירועים אמיתיים. עצלה, רספונסיבית, נעולת יחס.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * הגרסה הקודמת של האתר נבנתה בלי צילום כלל, מתוך היגיון של בריף
 * («לא זוהר, אותנטי»). ‎`docs/spec/04-visual-reference.md` §1 מתעד למה
 * ההיגיון הזה נפל: הוא נשען על מחקר שקרא כותרות ותקצירים ולא ראה אף
 * עיצוב. בקטגוריית האוכל התמונה **היא** המוצר.
 *
 * ‎`GALLERY` ב־`content/proof.ts` ריקה, ולכן הקומפוננטה מחזירה `null`
 * ואינה תופסת מקום. אין ריבוע אפור, אין שלד טעינה, ואין תמונת סטוק
 * «כדי לראות איך זה נראה» — צילום סטוק בעמוד קייטרינג הוא בדיוק ההפך
 * מהוכחה. השער נמצא ב־`galleryImages()`, והוא דורש חמישה דברים:
 * קובץ · מידות אמיתיות · תיאור חלופי · הצהרה שזה אירוע אמיתי · הסכמה
 * כשרואים אנשים.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  שלוש החלטות ביצועים, וכולן משפיעות על לידים
 * ─────────────────────────────────────────────────────────────────────
 *
 *  1. **היחס ננעל בקונטיינר, לא נגזר מהקובץ.** ‎`aspect-[4/3]` יושב על
 *     ה־`<div>` העוטף, ולכן המקום שמור לפני שהבייט הראשון ירד. יחד עם
 *     ‎`width`/`height` על ה־`<img>` זה מה שמאפס CLS. CLS הוא אות דירוג
 *     ב־Core Web Vitals וגם רכיב בציון הנחיתה בגוגל אדס — כלומר תמונה
 *     שדוחפת את העמוד עולה כסף פעמיים.
 *
 *  2. **`loading="lazy"` על הכול, `decoding="async"` על הכול.** לגלריה
 *     אין תמונת LCP: היא לעולם אינה הראשונה במסך. הפריווילגיה של
 *     `priority`/`fetchpriority=high` שמורה לתמונת ההירו, ויש בה אחת
 *     לכל מסלול (‎`primitives/photo-frame.tsx`).
 *
 *  3. **`srcSet` + `sizes`.** תעבורת קייטרינג בישראל היא ברובה נייד;
 *     הגשת קובץ ‎1600px למסך ‎390px היא בזבוז של שניות. ‎`sizes` נכתב לכל
 *     משבצת פריסה בנפרד ולעולם לא גלובלית, ולכן הוא נגזר כאן ממספר
 *     העמודות בפועל.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  למה לא `PhotoFrame`
 * ─────────────────────────────────────────────────────────────────────
 * ‎`primitives/photo-frame.tsx` הוא הפרימיטיב הנכון לתמונה **בודדת**
 * בזרימת העמוד, והוא אוכף כיתוב חובה בטיפוס. הוא אינו תומך ב־`srcSet`,
 * ו־`sizes` בלעדיו חסר משמעות. בגלריה, שבה כל תמונה מוגשת ברוחב עמודה
 * ולא ברוחב עמוד, זה ההבדל בין ‎40KB ל־‎400KB לתמונה. הפער דווח.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/primitives";
import { galleryImages, type GalleryImage, type GalleryRatio } from "@/content/proof";

/* מחרוזות מלאות, לא מורכבות בזמן ריצה — סורק התוכן של Tailwind קורא
   קוד מקור ולא ערכים מחושבים. */
const RATIO: Record<GalleryRatio, string> = {
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "1/1": "aspect-[1/1]",
  "4/5": "aspect-[4/5]",
};

const COLUMNS: Record<2 | 3, string> = {
  2: "min-[640px]:grid-cols-2",
  3: "min-[640px]:grid-cols-2 min-[980px]:grid-cols-3",
};

/**
 * ‎`sizes` נגזר ממספר העמודות, כי זה מה שהוא מתאר: כמה רוחב תופסת
 * התמונה בכל נקודת שבירה. ערך שגוי כאן גרוע מהיעדרו — הדפדפן בוחר
 * מועמד לפי המספר הזה ולא לפי המציאות.
 */
const SIZES: Record<2 | 3, string> = {
  2: "(min-width: 640px) 46vw, 92vw",
  3: "(min-width: 980px) 31vw, (min-width: 640px) 46vw, 92vw",
};

function GalleryFigure({
  item,
  sizes,
}: {
  item: GalleryImage;
  sizes: string;
}) {
  return (
    <figure className="m-0">
      <div className={cn("overflow-hidden rounded-card bg-bg-alt", RATIO[item.ratio])}>
        <img
          src={item.src}
          {...(item.srcSet ? { srcSet: item.srcSet } : {})}
          sizes={sizes}
          alt={item.alt}
          width={item.width}
          height={item.height}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      {item.captionHe ? (
        <figcaption className="mt-[.6rem] text-xs leading-[1.6] text-fg-subtle">
          {item.captionHe}
        </figcaption>
      ) : null}
    </figure>
  );
}

export interface GalleryProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  lede?: React.ReactNode;
  headingAs?: "h2" | "h3";
  /** מקסימום תמונות. השמטה ⇒ כולן. */
  limit?: number;
  /** מספר העמודות במסך רחב. קובע גם את `sizes`. */
  columns?: 2 | 3;
}

export function Gallery({
  title,
  eyebrow,
  lede,
  headingAs = "h2",
  limit,
  columns = 3,
  className,
  ...rest
}: GalleryProps) {
  const images = galleryImages(limit);

  /* אין תמונה שעברה את השער ⇒ אין גלריה. זה המצב היום. */
  if (images.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-[1.2rem]", className)} {...rest}>
      {title ? (
        <SectionHeader title={title} eyebrow={eyebrow} lede={lede} as={headingAs} />
      ) : null}

      <ul className={cn("m-0 grid list-none gap-[.8rem] p-0", COLUMNS[columns])}>
        {images.map((item) => (
          <li key={item.id}>
            <GalleryFigure item={item} sizes={SIZES[columns]} />
          </li>
        ))}
      </ul>
    </div>
  );
}
