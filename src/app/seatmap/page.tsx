"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bus } from 'lucide-react';
import { getStudents } from '@/lib/google-sheets';
import type { Student } from '@/lib/google-sheets';

export default function SeatmapPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

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

  // Extract coach number (e.g., "6호차" → "06")
  const coachNum = student.coach.replace(/[^0-9]/g, '').padStart(2, '0');
  const basePath = '/mathtrip';
  const imgSrc = `${basePath}/bus/${coachNum}.jpg`;

  return (
    <div className="screen-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          padding: '10px',
          borderRadius: '12px',
          color: 'var(--accent)',
        }}>
          <Bus size={26} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--foreground)' }}>좌석배치도</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{student.coach} · {student.name}</p>
        </div>
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'linear-gradient(135deg, var(--primary-light), var(--primary-dark))',
        color: 'white',
        padding: '4px 14px',
        borderRadius: '16px',
        fontSize: '0.8rem',
        fontWeight: 700,
        marginBottom: '16px',
      }}>
        <Bus size={14} />
        {student.coach} · 차량번호: {student.bus}
      </div>

      <div className="card" style={{
        padding: '12px',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {!imgError ? (
          <img
            src={imgSrc}
            alt={`${student.coach} 좌석배치도`}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              maxWidth: '500px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
        ) : (
          <div style={{
            padding: '40px 20px',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}>
            좌석배치도를 불러올 수 없습니다.
          </div>
        )}
      </div>

      <p style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
        marginTop: '12px',
        lineHeight: 1.5,
      }}>
        좌석은 배정된 번호를 확인하세요.<br />
        이동 중 안전벨트를 반드시 착용해 주세요.
      </p>
    </div>
  );
}
