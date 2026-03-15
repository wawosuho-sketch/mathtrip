"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bus, BedDouble, LogOut, Briefcase, AlertCircle } from 'lucide-react';
import { getStudents, getExternal } from '@/lib/google-sheets';
import type { Student, External } from '@/lib/google-sheets';

export default function TeacherDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [externals, setExternals] = useState<External[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'search' | 'bus' | 'room' | 'external'>('search');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtering States
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState('');

  useEffect(() => {
    if (localStorage.getItem('teacherAuth') !== 'true') {
      router.push('/teacher/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [studentsData, externalsData] = await Promise.all([
          getStudents(),
          getExternal()
        ]);
        
        if (studentsData && studentsData.length > 0) {
          setStudents(studentsData);
        }
        if (externalsData && externalsData.length > 0) {
          setExternals(externalsData);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('teacherAuth');
    router.push('/teacher/login');
  };

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>데이터를 불러오는 중...</div>;

  // Filter derivations
  const buses = Array.from(new Set(students.map(s => s.bus).filter(Boolean))).sort();
  const rooms1 = Array.from(new Set(students.map(s => s.room1).filter(Boolean))).sort();
  const rooms2 = Array.from(new Set(students.map(s => s.room2).filter(Boolean))).sort();

  const searchResults = searchQuery.trim() 
    ? students.filter(s => s.name.includes(searchQuery) || s.id.includes(searchQuery))
    : [];

  const busRoster = selectedBus 
    ? students.filter(s => s.bus === selectedBus)
    : [];

  const roomRoster = selectedRoom 
    ? students.filter(s => selectedDay === 1 ? s.room1 === selectedRoom : s.room2 === selectedRoom)
    : [];

  return (
    <div className="app-container" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div style={{ background: 'var(--primary)', color: 'white', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>선생님 대시보드</h1>
          <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>전체 학생 데이터: {students.length}명</p>
        </div>
        <button onClick={handleLogout} style={{ color: 'white', opacity: 0.8, padding: '8px' }}>
          <LogOut size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={() => setActiveTab('search')} style={{ flex: 1, padding: '16px 0', borderBottom: activeTab === 'search' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'search' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'search' ? 600 : 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <Search size={20} /> 학생 검색
        </button>
        <button onClick={() => setActiveTab('bus')} style={{ flex: 1, padding: '16px 0', borderBottom: activeTab === 'bus' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'bus' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'bus' ? 600 : 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <Bus size={20} /> 호차 명단
        </button>
        <button onClick={() => setActiveTab('room')} style={{ flex: 1, padding: '16px 0', borderBottom: activeTab === 'room' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'room' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'room' ? 600 : 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <BedDouble size={20} /> 방 명단
        </button>
        <button onClick={() => setActiveTab('external')} style={{ flex: 1, padding: '16px 0', borderBottom: activeTab === 'external' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'external' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'external' ? 600 : 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <Briefcase size={20} /> 외부요원
        </button>
      </div>

      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        {/* Tab 1: Search */}
        {activeTab === 'search' && (
          <div className="animation-fade">
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="학생 이름 또는 학번으로 검색"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '48px', height: '52px' }}
              />
            </div>

            {searchQuery && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>검색 결과 ({searchResults.length}명)</p>
                {searchResults.map(s => (
                  <div key={s.id} className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{s.name}</h4>
                        {s.note && <AlertCircle size={16} color="var(--accent)" />}
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--background)', padding: '2px 8px', borderRadius: '12px' }}>{s.id}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem' }}>
                      <div style={{ background: 'var(--background)', padding: '8px', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>버스</span>
                        <strong>{s.car}</strong> ({s.bus})
                      </div>
                      <div style={{ background: 'var(--background)', padding: '8px', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>1일차 방</span>
                        <strong>{s.room1 || '-'}</strong>
                      </div>
                      <div style={{ background: 'var(--background)', padding: '8px', borderRadius: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>2일차 방</span>
                        <strong>{s.room2 || '-'}</strong>
                      </div>
                    </div>
                    {s.note && (
                      <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--accent)', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{s.note}</span>
                      </div>
                    )}
                    {(s.studentPhone || s.parentPhone) && (
                      <div style={{ marginTop: '8px', padding: '10px', background: 'var(--background)', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {s.studentPhone && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>학생 연락처:</span> <a href={`tel:${s.studentPhone}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>📞 {s.studentPhone}</a></div>}
                        {s.parentPhone && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>학부모 연락처:</span> <a href={`tel:${s.parentPhone}`} style={{ color: 'var(--secondary)', fontWeight: 600, textDecoration: 'none' }}>📞 {s.parentPhone}</a></div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Bus */}
        {activeTab === 'bus' && (
          <div className="animation-fade">
            <select 
              value={selectedBus} 
              onChange={e => setSelectedBus(e.target.value)}
              className="input-field"
              style={{ marginBottom: '24px', height: '52px' }}
            >
              <option value="">차량을 선택하세요</option>
              {buses.map(b => <option key={b} value={b}>{b} 호차</option>)}
            </select>

            {selectedBus && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>탑승 명단</h3>
                  <span style={{ background: 'var(--primary-light)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>총 {busRoster.length}명</span>
                </div>
                
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {busRoster.map((s, idx) => (
                    <div key={s.id} style={{ display: 'flex', padding: '12px 16px', borderBottom: idx !== busRoster.length - 1 ? '1px solid var(--border-color)' : 'none', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: 'var(--background)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600 }}>{s.name}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.id}</span>
                          {s.note && <span style={{ fontSize: '0.75rem', background: 'var(--accent)', color: 'white', padding: '2px 6px', borderRadius: '12px' }}>특이사항</span>}
                        </div>
                        {(s.studentPhone || s.parentPhone) && (
                           <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                             {s.studentPhone && <div>학생: <a href={`tel:${s.studentPhone}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{s.studentPhone}</a></div>}
                             {s.parentPhone && <div>부모: <a href={`tel:${s.parentPhone}`} style={{ color: 'var(--secondary)', textDecoration: 'none' }}>{s.parentPhone}</a></div>}
                           </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Room */}
        {activeTab === 'room' && (
          <div className="animation-fade">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button 
                onClick={() => { setSelectedDay(1); setSelectedRoom(''); }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 600, background: selectedDay === 1 ? 'var(--primary)' : 'var(--card-bg)', color: selectedDay === 1 ? 'white' : 'var(--text-muted)', border: `1px solid ${selectedDay === 1 ? 'var(--primary)' : 'var(--border-color)'}` }}
              >
                1일차
              </button>
              <button 
                onClick={() => { setSelectedDay(2); setSelectedRoom(''); }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 600, background: selectedDay === 2 ? 'var(--secondary)' : 'var(--card-bg)', color: selectedDay === 2 ? 'white' : 'var(--text-muted)', border: `1px solid ${selectedDay === 2 ? 'var(--secondary)' : 'var(--border-color)'}` }}
              >
                2일차
              </button>
            </div>

            <select 
              value={selectedRoom} 
              onChange={e => setSelectedRoom(e.target.value)}
              className="input-field"
              style={{ marginBottom: '24px', height: '52px' }}
            >
              <option value="">방 번호를 선택하세요</option>
              {(selectedDay === 1 ? rooms1 : rooms2).map(r => <option key={r} value={r}>{r}호</option>)}
            </select>

            {selectedRoom && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>배정 명단 (점호용)</h3>
                  <span style={{ background: selectedDay === 1 ? 'var(--primary-light)' : 'var(--secondary)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>총 {roomRoster.length}명</span>
                </div>
                
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {roomRoster.map((s, idx) => (
                    <div key={s.id} style={{ display: 'flex', padding: '12px 16px', borderBottom: idx !== roomRoster.length - 1 ? '1px solid var(--border-color)' : 'none', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: 'var(--background)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600 }}>{s.name}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.id}</span>
                          {s.note && <span style={{ fontSize: '0.75rem', background: 'var(--accent)', color: 'white', padding: '2px 6px', borderRadius: '12px' }}>특이사항</span>}
                        </div>
                        {(s.studentPhone || s.parentPhone) && (
                           <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                             {s.studentPhone && <div>학생: <a href={`tel:${s.studentPhone}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{s.studentPhone}</a></div>}
                             {s.parentPhone && <div>부모: <a href={`tel:${s.parentPhone}`} style={{ color: 'var(--secondary)', textDecoration: 'none' }}>{s.parentPhone}</a></div>}
                           </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: External */}
        {activeTab === 'external' && (
          <div className="animation-fade">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>외부 지원 인력</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {externals.length > 0 ? (
                externals.map((ext, idx) => (
                  <div key={idx} className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{ext.name}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'rgba(79, 70, 229, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>{ext.type}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}><strong>담당업무/차량:</strong> {ext.role}</p>
                    {ext.phone && (
                      <a href={`tel:${ext.phone}`} style={{ display: 'inline-flex', padding: '6px 12px', background: 'var(--background)', color: 'var(--foreground)', borderRadius: '16px', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
                        📞 {ext.phone}
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>등록된 외부요원이 없습니다.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .animation-fade {
          animation: fadeUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
