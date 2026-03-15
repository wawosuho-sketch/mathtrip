"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Phone, ShieldAlert, BookOpen } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  
  // Don't show bottom nav on splash, login, or teacher pages
  if (
    !pathname ||
    pathname === '/' || 
    pathname === '/login' || 
    pathname.startsWith('/teacher')
  ) {
    return null;
  }

  const links = [
    { href: '/home', icon: Home, label: '내 정보', external: false },
    { href: '/schedule', icon: Calendar, label: '일정표', external: false },
    { href: '/contacts', icon: Phone, label: '연락처', external: false },
    { href: '/emergency', icon: ShieldAlert, label: '비상연락', external: false },
    { href: '/manual', icon: BookOpen, label: '매뉴얼', external: false },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      backgroundColor: 'var(--card-bg)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '12px 0 calc(12px + env(safe-area-inset-bottom))',
      zIndex: 50,
      boxShadow: '0 -4px 12px rgba(0,0,0,0.03)'
    }}>
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        
        const content = (
          <>
            <div style={{
              backgroundColor: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
              padding: '6px 14px',
              borderRadius: '24px',
              marginBottom: '4px',
              transition: 'background-color 0.2s ease'
            }}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: isActive ? 600 : 400 }}>
              {link.label}
            </span>
          </>
        );

        const style = {
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          color: isActive ? 'var(--primary)' : 'var(--text-muted)',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          flex: 1
        };

        if (link.external) {
           return (
             <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" style={style}>
               {content}
             </a>
           );
        }

        return (
          <Link key={link.href} href={link.href} style={style}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
