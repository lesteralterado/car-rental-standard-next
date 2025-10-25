'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/providers/layout/header';
import Footer from '@/app/components/providers/layout/footer';
import InquiryForm from '@/app/components/InquiryForm';
import useAuth from '@/hooks/useAuth';

export default function InquiryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !loading && !user) {
      router.push('/');
    }
  }, [isMounted, loading, user, router]);

  // Show loading during SSR and initial client render
  if (!isMounted || loading) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <h1>Loading...</h1>
      </div>
    );
  }

  // Redirect to home if not logged in
  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <InquiryForm />
      </main>
      <Footer />
    </>
  );
}