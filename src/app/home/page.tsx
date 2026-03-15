"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import KakaoNoticeButton from '@/components/KakaoNoticeButton';
import { User, MapPin, Bus, CalendarClock, AlertCircle } from 'lucide-react';
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
            // Data might have changed or login invalid
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

  return (
    <div className="screen-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)' }}>내 정보</h2>
            {student.team && (
              <span style={{ 
                background: student.team.includes('A') ? 'rgba(236, 72, 153, 0.15)' : 'rgba(79, 70, 229, 0.15)', 
                color: student.team.includes('A') ? 'var(--secondary)' : 'var(--primary)',
                padding: '2px 10px', 
                borderRadius: '12px', 
                fontSize: '0.8rem', 
                fontWeight: 700,
                border: `1px solid ${student.team.includes('A') ? 'rgba(236,72,153,0.3)' : 'rgba(79,70,229,0.3)'}`
              }}>
                {student.team}팀
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>환영합니다, {student.name} 학생!</p>
        </div>
        <div style={{
          background: 'var(--primary-light)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontWeight: 700,
          fontSize: '0.875rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {student.id}
        </div>
      </div>

      <KakaoNoticeButton />

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', marginTop: '8px' }}>나의 배정 정보</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Bus Assignment Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent)' }}>
            <Bus size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>이동 차량</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {student.car} <span style={{ fontWeight: 400, fontSize: '0.9rem', color: 'var(--text-muted)' }}>(차량번호: {student.bus})</span>
            </p>
          </div>
        </div>

        {/* Room 1 Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
            <MapPin size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>1일차 숙소 방 번호</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.5px' }}>{student.room1}</p>
          </div>
        </div>

        {/* Room 2 Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--secondary)' }}>
            <MapPin size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>2일차 숙소 방 번호</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.5px' }}>{student.room2}</p>
          </div>
        </div>

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
