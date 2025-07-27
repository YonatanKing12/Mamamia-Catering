// Import components one by one to avoid bundling issues

import { BackToTop } from '@/components/ui/back-to-top';

// Lazy import for better performance
import { Suspense, lazy } from 'react';

const Hero = lazy(() => import('@/components/sections/hero').then(m => ({ default: m.Hero })));
const Story = lazy(() => import('@/components/sections/story').then(m => ({ default: m.Story })));
const Events = lazy(() => import('@/components/sections/events').then(m => ({ default: m.Events })));
const Menu = lazy(() => import('@/components/sections/menu').then(m => ({ default: m.Menu })));
const Gallery = lazy(() => import('@/components/sections/gallery').then(m => ({ default: m.Gallery })));
const Blog = lazy(() => import('@/components/sections/blog').then(m => ({ default: m.Blog })));
const Testimonials = lazy(() => import('@/components/sections/testimonials').then(m => ({ default: m.Testimonials })));
const PriceCalculator = lazy(() => import('@/components/sections/price-calculator').then(m => ({ default: m.PriceCalculator })));
const FAQ = lazy(() => import('@/components/sections/faq').then(m => ({ default: m.FAQ })));
const Contact = lazy(() => import('@/components/sections/contact').then(m => ({ default: m.Contact })));
const Header = lazy(() => import('@/components/layout/header').then(m => ({ default: m.Header })));
const Footer = lazy(() => import('@/components/layout/footer').then(m => ({ default: m.Footer })));

export default function Home() {
  return (
    <div className="min-h-screen bg-warm-white">

      <Suspense fallback={<div className="h-16 bg-dark-brown"></div>}>
        <Header />
      </Suspense>
      <Suspense fallback={<div className="h-screen bg-golden animate-pulse"></div>}>
        <Hero />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-cream animate-pulse"></div>}>
        <Story />
      </Suspense>
      <Suspense fallback={<div className="h-96 animate-pulse"></div>}>
        <Events />
      </Suspense>
      <Suspense fallback={<div className="h-96 animate-pulse"></div>}>
        <Menu />
      </Suspense>
      <Suspense fallback={<div className="h-96 animate-pulse"></div>}>
        <Gallery />
      </Suspense>
      <Suspense fallback={<div className="h-96 animate-pulse"></div>}>
        <Blog />
      </Suspense>
      <Suspense fallback={<div className="h-96 animate-pulse"></div>}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<div className="h-96 animate-pulse"></div>}>
        <PriceCalculator />
      </Suspense>
      <Suspense fallback={<div className="h-96 animate-pulse"></div>}>
        <FAQ />
      </Suspense>
      <Suspense fallback={<div className="h-96 animate-pulse"></div>}>
        <Contact />
      </Suspense>
      <Suspense fallback={<div className="h-32 bg-dark-brown"></div>}>
        <Footer />
      </Suspense>
      <BackToTop />
    </div>
  );
}