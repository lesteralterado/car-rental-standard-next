'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/providers/layout/header'
import Footer from '@/app/components/providers/layout/footer'
import HeroSection from '@/app/components/providers/home/hero-section'
import FeaturedCars from '@/app/components/providers/home/featured-cars'
import AboutSection from './components/providers/home/about'
import Testimonials from '@/app/components/providers/home/testimonials'
import ContactSection from './components/providers/home/contact'
import FAQSection from './components/providers/home/faq'
import LoginForm from './components/LoginForm'
import useAuth from '@/hooks/useAuth';
import { Heading1 } from 'lucide-react'
// import ServicesSection from '@/components/home/services-section'
// import TestimonialsSection from '@/components/home/testimonials-section'
// import StatsSection from '@/components/home/stats-section'
// import NewsletterSection from '@/components/home/newsletter-section'
// import ChatWidget from '@/components/shared/chat-widget'
// import NewsletterModal from '@/components/shared/newsletter-modal'

export default function HomePage() {
  const { user, profile, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !loading && user && isAdmin) {
      router.push('/admin');
    }
  }, [isMounted, loading, user, isAdmin, router]);

  // Show loading during SSR and initial client render
  if (!isMounted || loading) {
    return (
      <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p'>
        <h1>Loading...</h1>
      </div>
    );
  }

  // Don't render anything for admins as they will be redirected
  if (user && isAdmin) {
    return null;
  }

  if (user) {
    return (
      <>
        <Header />
        <main className="overflow-hidden">
          <HeroSection />
          <FeaturedCars />
          <AboutSection />
          <Testimonials />
          <ContactSection />
          <FAQSection />
          {/* <StatsSection /> */}
          {/* <ServicesSection />
          <TestimonialsSection />
          <NewsletterSection /> */}
        </main>
        <Footer />
        {/* <ChatWidget />
        <NewsletterModal /> */}
      </>
    );
  }

  return <LoginForm />;
}