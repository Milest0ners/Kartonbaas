import { Suspense } from 'react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GsapProvider from '@/components/GsapProvider';
import Hero from '@/components/sections/Hero';
import HowItWorks from '@/components/sections/HowItWorks';
import Pricing from '@/components/sections/Pricing';
import Examples from '@/components/sections/Examples';
import Reviews from '@/components/sections/Reviews';
import About from '@/components/sections/About';
import Blog from '@/components/sections/Blog';
import FAQ from '@/components/sections/FAQ';
import Order from '@/components/sections/Order';
import SuccessBanner from '@/components/SuccessBanner';

export default function Page() {
  return (
    <GsapProvider>
      <Header />
      <AnnouncementBar />
      <main id="main-content">
        <Suspense fallback={null}>
          <SuccessBanner />
        </Suspense>
        <Hero />
        <HowItWorks />
        <Pricing />
        <Order />
        <Examples />
        <Reviews />
        <About />
        <Blog />
        <FAQ />
      </main>
      <Footer />
    </GsapProvider>
  );
}
