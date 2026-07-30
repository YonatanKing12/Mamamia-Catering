import { Button } from '@/components/ui/button';
import { useScroll } from '@/hooks/use-scroll';

export const BackToTop = () => {
  const { isScrolledDown, scrollToTop } = useScroll();

  if (!isScrolledDown) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-8 left-8 w-12 h-12 bg-golden text-white rounded-full shadow-lg hover:bg-dark-golden hover-lift z-40"
      aria-label="חזור למעלה"
    >
      <i className="fas fa-chevron-up"></i>
    </Button>
  );
};
