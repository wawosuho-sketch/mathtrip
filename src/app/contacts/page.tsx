"use client";

import { useEffect, useState } from 'react';
import { Phone, UserCircle } from 'lucide-react';
import { getContacts } from '@/lib/google-sheets';
import type { Contact } from '@/lib/google-sheets';
import KakaoNoticeButton from '@/components/KakaoNoticeButton';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactsData = async () => {
      try {
        const data = await getContacts();
        if (data && data.length > 0) {
          setContacts(data);
        }
      } catch (err) {
        console.error('Failed to fetch contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContactsData();
  }, []);

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>연락처를 불러오는 중...</div>;
  }

  // Group contacts by type (구분)
  const grouped: Record<string, Contact[]> = {};
  contacts.forEach(c => {
    const key = c.type || '기타';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });

  return (
    <div className="screen-container">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '16px' }}>연락처</h2>
      <KakaoNoticeButton />

      {Object.entries(grouped).map(([type, list]) => (
        <div key={type} style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCircle size={18} /> {type}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {list.map((contact, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: 700 }}>{contact.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{contact.type}</p>
                </div>
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    style={{
                      background: 'var(--primary)',
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

      {contacts.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '40px 0' }}>등록된 연락처가 없습니다.</p>
      )}
    </div>
  );
}
