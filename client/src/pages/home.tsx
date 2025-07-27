import { Hero } from '@/components/sections/hero';
import { Story } from '@/components/sections/story';
import { Events } from '@/components/sections/events';
import { Menu } from '@/components/sections/menu';
import { Gallery } from '@/components/sections/gallery';
import { Blog } from '@/components/sections/blog';
import { Testimonials } from '@/components/sections/testimonials';
import { PriceCalculator } from '@/components/sections/price-calculator';
import { FAQ } from '@/components/sections/faq';
import { Contact } from '@/components/sections/contact';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { BackToTop } from '@/components/ui/back-to-top';

export default function Home() {
  return (
    <div className="min-h-screen bg-warm-white">
      <AccessibilityToolbar />
      <Header />
      <Hero />
      <Story />
      <Events />
      <Menu />
      <Gallery />
      <Blog />
      <Testimonials />
      <PriceCalculator />
      <FAQ />
      <Contact />
      <Footer />
      <BackToTop />
    </div>
  );
}