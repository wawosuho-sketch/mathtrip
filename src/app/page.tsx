"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      // Check if logged in (mock)
      const isLogged = localStorage.getItem('studentId');
      if (isLogged) {
        router.push('/home');
      } else {
        router.push('/login');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  if (!mounted) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
      color: 'white',
      padding: '24px',
      textAlign: 'center',
      margin: '-24px', // negate container padding
      marginBottom: '-90px',
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.05em' }}>
        2026 수학여행
      </h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
        언제 어디서나 간편하게 스마트폰으로!
      </p>
      
      <div style={{
        marginTop: '40px',
        width: '40px',
        height: '40px',
        border: '4px solid rgba(255,255,255,0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
