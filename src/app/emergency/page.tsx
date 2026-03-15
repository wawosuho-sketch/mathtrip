"use client";

import { useEffect, useState } from 'react';
import { Phone, Building2, ShieldAlert } from 'lucide-react';
import { getEmergencyContacts } from '@/lib/google-sheets';
import type { Contact } from '@/lib/google-sheets';
import KakaoNoticeButton from '@/components/KakaoNoticeButton';

export default function EmergencyPage() {
  const [orgs, setOrgs] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactsData = async () => {
      try {
        const data = await getEmergencyContacts();
        if (data && data.length > 0) {
          setOrgs(data);
        }
      } catch (err) {
        console.error('Failed to fetch emergency contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContactsData();
  }, []);

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>비상연락망을 불러오는 중...</div>;
  }

  // Group by type
  const grouped: Record<string, Contact[]> = {};
  orgs.forEach(c => {
    const key = c.type || '기타';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });

  return (
    <div className="screen-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <ShieldAlert size={28} color="var(--accent)" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)' }}>비상 연락처</h2>
      </div>
      
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
        위급 상황 발생 시 아래 기관으로 즉시 연락 바랍니다.
      </p>

      <KakaoNoticeButton />

      {Object.entries(grouped).map(([type, list]) => (
        <div key={type} style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={18} /> {type}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {list.map((contact, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderLeft: '4px solid var(--accent)' }}>
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: 700 }}>{contact.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{contact.type}</p>
                </div>
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    style={{
                      background: 'var(--accent)',
                      color: 'white',
                      padding: '8px 14px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      boxShadow: 'var(--shadow-sm)',
                      textDecoration: 'none'
                    }}
                  >
                    <Phone size={14} /> 통화
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {orgs.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '40px 0' }}>등록된 비상 연락처가 없습니다.</p>
      )}
    </div>
  );
}
