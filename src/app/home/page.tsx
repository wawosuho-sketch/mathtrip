"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import KakaoNoticeButton from '@/components/KakaoNoticeButton';
import { Bus, MapPin, UtensilsCrossed, Star, Crown } from 'lucide-react';
import { getStudents } from '@/lib/google-sheets';
import type { Student } from '@/lib/google-sheets';

export default function HomePage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    const studentName = localStorage.getItem('studentName');

    if (!studentId || !studentName) {
      router.push('/login');
      return;
    }

    const fetchStudentData = async () => {
      try {
        const students = await getStudents();
        if (students && students.length > 0) {
          const found = students.find(
            (s: Student) => s.id === studentId && s.name === studentName
          );
          if (found) {
            setStudent(found);
          } else {
            localStorage.clear();
            router.push('/login');
          }
        }
      } catch (err) {
        console.error('Failed to fetch student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [router]);

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>데이터를 불러오는 중...</div>;
  }

  if (!student) return null;

  // Parse meal team members
  const mealMembers = student.mealTeam
    ? student.mealTeam.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="screen-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)' }}>내 정보</h2>
            <span style={{ 
              background: 'linear-gradient(135deg, var(--primary-light), var(--primary-dark))',
              color: 'white',
              padding: '2px 10px', 
              borderRadius: '12px', 
              fontSize: '0.75rem', 
              fontWeight: 700,
            }}>
              {student.coach}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>환영합니다, {student.name} 학생!</p>
        </div>
        <div style={{
          background: 'var(--primary-light)',
          color: 'white',
          padding: '8px 14px',
          borderRadius: '20px',
          fontWeight: 700,
          fontSize: '0.85rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {student.id}
        </div>
      </div>

      <KakaoNoticeButton coach={student.coach} />

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', marginTop: '8px' }}>나의 배정 정보</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Bus/Coach Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent)', flexShrink: 0 }}>
            <Bus size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>이동 차량</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {student.coach}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>차량번호: {student.bus}</p>
          </div>
        </div>

        {/* Room 1 Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary)', flexShrink: 0 }}>
            <MapPin size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>1일차 숙소</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.5px' }}>{student.room1 || '-'}</p>
              {student.room1Leader && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent)',
                  padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700,
                }}>
                  <Crown size={11} /> 방장
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Room 2 Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--secondary)', flexShrink: 0 }}>
            <MapPin size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>2일차 숙소</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.5px' }}>{student.room2 || '-'}</p>
              {student.room2Leader && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent)',
                  padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700,
                }}>
                  <Crown size={11} /> 방장
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Meal Team Card */}
        {mealMembers.length > 0 && (
          <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '12px', color: '#22c55e', flexShrink: 0 }}>
                <UtensilsCrossed size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>식사팀</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{mealMembers.length}명</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '2px' }}>
              {mealMembers.map((member, idx) => (
                <span key={idx} style={{
                  background: member === student.name ? 'rgba(34, 197, 94, 0.15)' : 'var(--background)',
                  color: member === student.name ? '#22c55e' : 'var(--foreground)',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: member === student.name ? 700 : 500,
                  border: member === student.name ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border-color)',
                }}>
                  {member === student.name && <Star size={10} style={{ marginRight: '3px', verticalAlign: '-1px' }} />}
                  {member}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button 
          onClick={() => {
            localStorage.clear();
            router.push('/login');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            textDecoration: 'underline',
            padding: '8px'
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
