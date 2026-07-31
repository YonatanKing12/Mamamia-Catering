/**
 * ═══════════════════════════════════════════════════════════════════════
 *  שני השלבים הראשונים — מספר סועדים, ואז חבילה.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * הסדר אינו שרירותי. מספר הסועדים הוא הנתון היחיד שהמבקר יודע בוודאות
 * ברגע שהוא נוחת, והוא ה«כן» הקטן שפותח את השאר. חבילה לפניו הייתה
 * מבקשת ממנו להחליט לפני שיש לו קנה מידה.
 *
 * ─── מספר סועדים ────────────────────────────────────────────────
 * ‎`inputMode="numeric"` ולא `type="number"` (spec 03 §7.3): המקלדת
 * הנכונה בלי החצים, בלי גלילה שמשנה ערך בטעות, ובלי `valueAsNumber`
 * שמחזיר `NaN` על קלט חלקי.
 *
 * **אין כאן מינימום ואין מקסימום.** ‎`SLOTS.minGuests` ו־`SLOTS.maxGuests`
 * הם `null`, ולכן אין רף מוצג ואין חסימה. `guestBandNote()` מ־
 * ‎`quote-config` מחזירה `null` בדיוק מאותה סיבה, והשורה נשמטת. התקרה
 * ‎`GUESTS_INPUT_CEILING` היא שפיות קלט, לא הצהרת קיבולת — היא לעולם
 * אינה מוצגת למבקר.
 *
 * ─── עוגן הפוקוס ────────────────────────────────────────────────
 * לשלב שיש לו כותרת גלויה מסומנת `data-step-heading`, והמעטפת מעבירה
 * אליה פוקוס במעבר שלב. שלב שכולו `fieldset` — בחירת חבילה — **אינו**
 * מקבל כותרת נסתרת נוספת: קורא מסך שמקבל פוקוס על כותרת נסתרת שמכפילה
 * את ה־`legend` שומע את אותו טקסט פעמיים. המעטפת נופלת אחורה לפקד
 * הראשון, וזה גם הדפוס של `quote-builder`.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Field, RadioCard, RadioCardGroup, TextInput } from "@/components/primitives";
import { GUEST_BAND_DISPLAY, guestBandNote } from "@/components/quote";
import type { GuestBand } from "@shared/lead-constants";
import { COPY } from "./copy";
import type { CateringPackage } from "@/content/packages";
import { GUESTS_INPUT_CEILING } from "./use-configurator";

/* ═══════════════════ שלב 1 · מספר סועדים ═══════════════════ */

export interface GuestsStepProps {
  guests: number | null;
  guestBand: GuestBand | null;
  onChange(value: number | null): void;
  error?: string;
  headingId: string;
  className?: string;
}

export function GuestsStep({
  guests,
  guestBand,
  onChange,
  error,
  headingId,
  className,
}: GuestsStepProps) {
  const [raw, setRaw] = React.useState(guests !== null ? String(guests) : "");

  /* שינוי מבחוץ — «להתחיל תפריט חדש», שחזור מהסשן — חייב להגיע לשדה. */
  React.useEffect(() => {
    setRaw(guests !== null ? String(guests) : "");
  }, [guests]);

  const handle = (value: string) => {
    const digits = value.replace(/[^\d]/g, "").slice(0, 5);
    setRaw(digits);
    const n = digits === "" ? null : Number(digits);
    onChange(n !== null && n > 0 ? Math.min(n, GUESTS_INPUT_CEILING) : null);
  };

  const note = guestBandNote(guestBand);

  return (
    <div className={cn("grid max-w-lede gap-4", className)}>
      <h3
        id={headingId}
        data-step-heading=""
        tabIndex={-1}
        className="text-xl font-bold leading-sub outline-none"
      >
        {COPY.guestsLegend}
      </h3>

      <Field id="cfg-guests" label={COPY.guestsLabel} hint={COPY.guestsHint} error={error} required>
        {(control) => (
          <TextInput
            {...control}
            kind="text"
            inputMode="numeric"
            autoComplete="off"
            dir="ltr"
            className="num max-w-[10rem] text-end"
            value={raw}
            onChange={(e) => handle(e.target.value)}
          />
        )}
      </Field>

      {/* התווית של הטווח — עזר קריאה בלבד. אינה מינימום ואינה מדרגת מחיר. */}
      {guestBand ? (
        <p className="text-xs text-fg-subtle">{GUEST_BAND_DISPLAY[guestBand]}</p>
      ) : null}

      {/* מרונדרת אך ורק כשהבעלים מסר מינימום או מקסימום. היום: null. */}
      {note ? <p className="max-w-body text-xs text-fg-muted">{note}</p> : null}
    </div>
  );
}

/* ═══════════════════ שלב 2 · חבילה ═══════════════════ */

export interface PackageStepProps {
  packages: CateringPackage[];
  value: string | null;
  onChange(id: string): void;
  error?: string;
  headingId: string;
  className?: string;
}

export function PackageStep({
  packages,
  value,
  onChange,
  error,
  headingId,
  className,
}: PackageStepProps) {
  /* חבילה אחת בלבד אינה שאלה. היא מוצגת כעובדה ונבחרת מאליה — בורר
     עם אפשרות אחת הוא הקשה מיותרת במסלול המרה. */
  const single = packages.length === 1;
  const onlyId = single ? packages[0].id : null;

  React.useEffect(() => {
    if (onlyId && value !== onlyId) onChange(onlyId);
  }, [onChange, onlyId, value]);

  if (single) {
    const pkg = packages[0];
    return (
      <div className={cn("grid max-w-lede gap-2", className)}>
        <h3
          id={headingId}
          data-step-heading=""
          tabIndex={-1}
          className="text-xl font-bold leading-sub outline-none"
        >
          {pkg.nameHe}
        </h3>
        {pkg.descriptionHe ? (
          <p className="max-w-body text-sm text-fg-muted">{pkg.descriptionHe}</p>
        ) : null}
      </div>
    );
  }

  return (
    <RadioCardGroup
      id={headingId}
      legend={COPY.packageLegend}
      error={error}
      className={className}
    >
      {packages.map((pkg) => (
        <RadioCard
          key={pkg.id}
          name="cfg-package"
          value={pkg.id}
          checked={value === pkg.id}
          onChange={() => onChange(pkg.id)}
          label={pkg.nameHe}
          description={pkg.descriptionHe ?? undefined}
        />
      ))}
    </RadioCardGroup>
  );
}
