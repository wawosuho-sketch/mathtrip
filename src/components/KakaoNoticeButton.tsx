import { MessageCircle } from 'lucide-react';

export default function KakaoNoticeButton() {
  const kakaoUrl = process.env.NEXT_PUBLIC_KAKAOTALK_URL || '#';

  if (!kakaoUrl || kakaoUrl === '#') {
    return (
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        color: 'var(--accent)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '16px',
        fontSize: '0.85rem',
        textAlign: 'center',
        fontWeight: 600
      }}>
        카카오톡 공지방 링크가 설정되지 않았습니다. (.env.local 확인)
      </div>
    );
  }

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
        background: '#FEE500', // Kakao Yellow
        color: '#191919',      // Kakao Black/Brown
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: '1rem',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.2s',
      }}
    >
      <MessageCircle size={22} color="#191919" />
      긴급 공지사항 확인하기 (카카오톡)
    </a>
  );
}
