"use client";

import { MessageCircle } from 'lucide-react';

const COACH_KAKAO_URLS: Record<string, string> = {
  '1호차': 'https://open.kakao.com/o/gos8dfsi',
  '2호차': 'https://open.kakao.com/o/g3AAefsi',
  '3호차': 'https://open.kakao.com/o/gFcWefsi',
  '4호차': 'https://open.kakao.com/o/giwhffsi',
  '5호차': 'https://open.kakao.com/o/giQzffsi',
  '6호차': 'https://open.kakao.com/o/geDOffsi',
};

interface KakaoNoticeButtonProps {
  coach?: string; // optional: if provided, links to coach-specific chat
}

export default function KakaoNoticeButton({ coach }: KakaoNoticeButtonProps) {
  // Use coach-specific URL if available, otherwise fall back to env variable
  const kakaoUrl = (coach && COACH_KAKAO_URLS[coach]) 
    || process.env.NEXT_PUBLIC_KAKAOTALK_URL 
    || '#';

  if (!kakaoUrl || kakaoUrl === '#') {
    return null;
  }

  const label = coach 
    ? `${coach} 공지방 확인하기 (카카오톡)` 
    : '긴급 공지사항 확인하기 (카카오톡)';

  return (
    <a 
      href={kakaoUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: '#FEE500',
        color: '#191919',
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: '0.95rem',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.2s',
      }}
    >
      <MessageCircle size={22} color="#191919" />
      {label}
    </a>
  );
}
