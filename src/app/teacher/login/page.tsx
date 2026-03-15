"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react';

export default function TeacherLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default mock password for demonstration purposes "1234"
    if (password === '1234') {
      localStorage.setItem('teacherAuth', 'true');
      router.push('/teacher/dashboard');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="screen-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '80vh' }}>
      
      <button 
        onClick={() => router.push('/login')}
        style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={20} /> 학생 로그인으로
      </button>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ background: 'rgba(79, 70, 229, 0.1)', display: 'inline-block', padding: '16px', borderRadius: '50%', color: 'var(--primary)', marginBottom: '16px' }}>
          <Lock size={32} />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--foreground)' }}>
          선생님 전용 로그인
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          관리자 비밀번호를 입력해주세요. <br/>(기본 데모 비밀번호: 1234)
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
            />
          </div>

          {error && (
            <div style={{ color: 'var(--secondary)', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            로그인 <ArrowRight size={20} style={{ marginLeft: '8px' }} />
          </button>
        </form>
      </div>
    </div>
  );
}
