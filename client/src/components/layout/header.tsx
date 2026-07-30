/**
 * Header — 03 §7.28, 01 §5.3.
 *
 * ארבעה פריטי ניווט ברמת המסלול, טלפון כקישור טקסט, ו־primary אחד בגודל sm.
 * שמונה עמודי האירועים אינם כאן במתכוון (01 §5.3): תפריט של שמונה פריטים הוא
 * שטיח קישורים בכל עמוד, ואף אחד לא פותח אותו.
 *
 * המשוב היחיד לגלילה הוא קו השיער התחתון שנדלק מעל 8px (§7.28). אין צל, אין
 * לוגו שמתכווץ, אין היפוך צבע. הרקע אטום: הבריף אוסר אפקט זכוכית, ולכן
 * ה־backdrop-filter שמופיע ב־§7.28 לא נשלח — מדווח בדוח החזרה.
 *
 * המגירה בנייד בנויה על @radix-ui/react-dialog (§10.3): מותקנת רק כשהיא פתוחה,
 * לוכדת Tab, נסגרת ב־Escape ומחזירה פוקוס למפעיל. הפקד הפותח הוא מילה ולא
 * גליף — §7.33 לא מתיר גליף המבורגר, וטקסט נותן שם נגיש בחינם.
 * ה־CTA יושב בראש המגירה, לא מתחת לשישה פריטים מחוץ להישג האגודל.
 *
 * אין כאן שום עובדה עסקית מלבד הטלפון ושמות הסניפים — שתי העובדות המאומתות.
 */

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link, useLocation } from "wouter";
import { Button, Num, Rule } from "@/components/primitives";
import { BRANCHES, PHONE, telLink } from "@/content/business";
import { cn } from "@/lib/utils";

/** ‎/kitchens/herzliya-pituach — טבלת התעתיק קבועה ב־01 §1. */
const branchHref = (id: string) => `/kitchens/${id.replace(/_/g, "-")}`;

const ROUTE_NAV = [
  { href: "/menus", label: "התפריטים" },
  { href: "/kitchens", label: "המטבחים" },
  { href: "/catering", label: "לאיזה אירועים" },
] as const;

const LEGAL_NAV = [
  { href: "/privacy", label: "פרטיות" },
  { href: "/terms", label: "תקנון" },
  { href: "/accessibility", label: "נגישות" },
] as const;

export interface HeaderProps {
  /**
   * `שאלות` הוא עוגן בעמוד במסלולים שיש בהם FAQ, וקישור מלא בכל השאר.
   * ברירת המחדל נגזרת מהמסלול הנוכחי ואינה מניחה FAQ בעמודים שאינם הבית.
   */
  faqHref?: string;
}

export const Header = ({ faqHref }: HeaderProps) => {
  const [location] = useLocation();
  const [stuck, setStuck] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  /* קו השיער נדלק מעל 8px. rAF כדי שלא נכתוב state בכל אירוע גלילה. */
  React.useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setStuck(window.scrollY > 8);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* מעבר מסלול סוגר את המגירה — אחרת היא נשארת פתוחה מעל העמוד החדש. */
  React.useEffect(() => setOpen(false), [location]);

  const nav = [
    ...ROUTE_NAV,
    { href: faqHref ?? (location === "/" ? "#faq" : "/catering#faq"), label: "שאלות" },
  ];

  const current = (href: string) =>
    !href.startsWith("#") && (location === href || location.startsWith(`${href}/`))
      ? ("page" as const)
      : undefined;

  const close = () => setOpen(false);

  const phone = (
    <a
      href={telLink()}
      data-tel=""
      className={
        "inline-flex min-h-[44px] items-center text-sm font-medium " +
        "text-fg no-underline transition-colors duration-state ease-house hover:text-accent"
      }
    >
      <Num>{PHONE.display}</Num>
    </a>
  );

  return (
    <header
      className={cn(
        /* .head — גיליון ההדפסה (§11) מסתיר את הכותרת דרך שם המחלקה הזה. */
        "head sticky top-0 z-[80] bg-bg",
        "border-b border-solid transition-colors duration-slow ease-house",
        /* צבע כערך מפורש: `rule` מוגדר בקונפיג גם ב־borderWidth (2px) וגם
           ב־colors, ולכן המחלקה הקצרה `border-b-rule` פולטת גם רוחב 2px. */
        stuck ? "border-b-[color:var(--rule)]" : "border-b-transparent",
      )}
      data-stuck={stuck ? "" : undefined}
    >
      <div className="wrap flex min-h-[74px] items-center gap-8">
        <Link
          href="/"
          className="flex flex-none items-baseline gap-2 text-fg no-underline"
          aria-label="מאמא מיה קייטרינג · לעמוד הבית"
        >
          <span className="font-serif text-[1.4rem] font-bold leading-none tracking-[-.02em]">
            מאמא מיה
          </span>
          <span className="eyebrow">קייטרינג</span>
        </Link>

        <nav
          aria-label="ניווט ראשי"
          className="me-auto hidden items-center gap-[1.9rem] min-[860px]:flex"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current(item.href)}
              className={cn(
                "border-b border-solid pb-1 text-sm no-underline",
                "transition-colors duration-state ease-house",
                current(item.href)
                  ? "border-b-accent text-fg"
                  : "border-b-transparent text-fg-muted hover:border-b-accent hover:text-fg",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-none items-center gap-5 min-[860px]:flex">
          {phone}
          <Link href="/quote" asChild>
            <Button href="/quote" size="sm">
              קבלו הצעה
            </Button>
          </Link>
        </div>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className={
                "ms-auto inline-flex min-h-[44px] items-center rounded border border-solid " +
                "border-rule-control px-4 font-sans text-sm font-semibold text-fg " +
                "transition-colors duration-state ease-house hover:border-accent hover:text-accent " +
                "min-[860px]:hidden"
              }
            >
              ניווט
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[90] bg-[color-mix(in_srgb,var(--ink)_55%,transparent)]" />
            <Dialog.Content
              aria-describedby={undefined}
              className={
                "fixed inset-y-0 end-0 z-[95] flex w-[min(88vw,24em)] flex-col gap-6 " +
                "overflow-y-auto overscroll-contain border-s border-solid " +
                "border-s-[color:var(--rule)] " +
                "bg-bg px-gutter py-6"
              }
            >
              <div className="flex items-center justify-between gap-4">
                <Dialog.Title className="eyebrow m-0">ניווט</Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className={
                      "inline-flex min-h-[44px] items-center rounded border border-solid " +
                      "border-rule-control px-3 font-sans text-sm font-semibold text-fg " +
                      "transition-colors duration-state ease-house hover:border-accent hover:text-accent"
                    }
                  >
                    סגירה
                  </button>
                </Dialog.Close>
              </div>

              {/* ה־CTA ראשון, בהישג האגודל (§7.28). */}
              <div className="flex flex-col gap-3">
                {/* onClick יושב על Link ולא על Button: wouter מבצע
                    cloneElement(children,{onClick,href}) ודורס את המטפל של הילד. */}
                <Link href="/quote" asChild onClick={close}>
                  <Button href="/quote" fullWidth>
                    קבלו הצעה
                  </Button>
                </Link>
                <span className="flex justify-center">{phone}</span>
              </div>

              <Rule />

              <nav aria-label="ניווט האתר" className="flex flex-col">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    aria-current={current(item.href)}
                    className={cn(
                      "flex min-h-[48px] items-center text-base no-underline",
                      "transition-colors duration-state ease-house",
                      current(item.href) ? "text-fg" : "text-fg-muted hover:text-fg",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <Rule />

              <div className="flex flex-col">
                <h2 className="eyebrow m-0 pb-2">המטבחים</h2>
                {BRANCHES.map((branch) => (
                  <Link
                    key={branch.id}
                    href={branchHref(branch.id)}
                    onClick={close}
                    className={
                      "flex min-h-[48px] items-center text-base text-fg-muted no-underline " +
                      "transition-colors duration-state ease-house hover:text-fg"
                    }
                  >
                    {branch.name}
                  </Link>
                ))}
              </div>

              {location === "/menus" ? (
                <>
                  <Rule />
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      window.requestAnimationFrame(() => window.print());
                    }}
                    className={
                      "flex min-h-[48px] items-center text-start text-sm font-semibold " +
                      "text-fg-muted transition-colors duration-state ease-house hover:text-fg"
                    }
                  >
                    הדפיסו את התפריט
                  </button>
                </>
              ) : null}

              <Rule />

              <nav aria-label="קישורים משפטיים" className="flex flex-wrap gap-x-5 gap-y-1 pb-2">
                {LEGAL_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={
                      "inline-flex min-h-[44px] items-center text-xs text-fg-subtle no-underline " +
                      "transition-colors duration-state ease-house hover:text-fg"
                    }
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
};

export default Header;
