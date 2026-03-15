"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight } from 'lucide-react';
import { getStudents } from '@/lib/google-sheets';

export default function LoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !name) {
      setError('학번과 이름을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const students = await getStudents();
      
      if (students && students.length > 0) {
        const student = students.find(
          (s: any) => s.id === studentId.trim() && s.name === name.trim()
        );

        if (student) {
          localStorage.setItem('studentId', student.id || '');
          localStorage.setItem('studentName', student.name || '');
          if (student.team) localStorage.setItem('studentTeam', student.team);
          router.push('/home');
        } else {
          setError('일치하는 학생 정보가 없습니다. 학번과 이름을 확인해주세요.');
        }
      } else {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('데이터 통신 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '80vh',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
          환영합니다!
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          수학여행 안내 서비스를 시작하려면<br />로그인해 주세요.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
              학번
            </label>
            <div style={{ position: 'relative' }}>
              <User size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="예: 20101"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '48px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
              이름
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="예: 홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '48px' }}
              />
            </div>
          </div>

          {error && (
            <div style={{ color: 'var(--secondary)', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? '로그인 중...' : '시작하기'}
            {!loading && <ArrowRight size={20} style={{ marginLeft: '8px' }} />}
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button 
          onClick={() => router.push('/teacher/login')}
          style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.875rem', 
            textDecoration: 'underline' 
          }}
        >
          선생님이신가요?
        </button>
      </div>
    </div>
  );
}
