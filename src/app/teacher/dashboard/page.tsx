"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bus, BedDouble, LogOut, ShieldCheck, AlertCircle, ChevronDown, Crown, X } from 'lucide-react';
import { getStudents, getExternal, getSafeEdu } from '@/lib/google-sheets';
import type { Student, External, SafeEdu } from '@/lib/google-sheets';

export default function TeacherDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [externals, setExternals] = useState<External[]>([]);
  const [safeEduData, setSafeEduData] = useState<SafeEdu[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'search' | 'bus' | 'room' | 'external' | 'safety'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [openSafeCategory, setOpenSafeCategory] = useState<string | null>(null);
  const [openSafeItem, setOpenSafeItem] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem('teacherAuth') !== 'true') { router.push('/teacher/login'); return; }
    const fetchData = async () => {
      try {
        const [s, e, se] = await Promise.all([getStudents(), getExternal(), getSafeEdu()]);
        if (s.length > 0) setStudents(s);
        if (e.length > 0) setExternals(e);
        if (se.length > 0) setSafeEduData(se);
      } catch { console.error('Failed to fetch'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [router]);

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>데이터를 불러오는 중...</div>;

  const coaches = Array.from(new Set(students.map(s => s.coach).filter(Boolean))).sort();
  const rooms1 = Array.from(new Set(students.map(s => s.room1).filter(Boolean))).sort();
  const rooms2 = Array.from(new Set(students.map(s => s.room2).filter(Boolean))).sort();
  const searchResults = searchQuery.trim() ? students.filter(s => s.name.includes(searchQuery) || s.id.includes(searchQuery)) : [];
  const busRoster = selectedBus ? students.filter(s => s.coach === selectedBus).sort((a, b) => a.id.localeCompare(b.id)) : [];
  const roomStudents = selectedRoom ? students.filter(s => selectedDay === 1 ? s.room1 === selectedRoom : s.room2 === selectedRoom) : [];
  const safeCategories = Array.from(new Set(safeEduData.map(s => s.category)));
  const currentRooms = selectedDay === 1 ? rooms1 : rooms2;

  const tabStyle = (t: string) => ({
    flex: 1, padding: '10px 2px', borderBottom: activeTab === t ? '2px solid var(--primary)' : '2px solid transparent',
    color: activeTab === t ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === t ? 600 : 400,
    display: 'flex' as const, flexDirection: 'column' as const, alignItems: 'center' as const, gap: '3px', fontSize: '0.7rem',
  });

  const StudentCard = ({ s }: { s: Student }) => (
    <div className="card" style={{ padding: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{s.name}</h4>
          {s.note && <AlertCircle size={15} color="var(--accent)" />}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--background)', padding: '2px 8px', borderRadius: '12px' }}>{s.id}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.85rem' }}>
        <div style={{ background: 'var(--background)', padding: '6px 8px', borderRadius: '6px' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>호차</span>
          <strong>{s.coach}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({s.bus})</span>
        </div>
        <div style={{ background: 'var(--background)', padding: '6px 8px', borderRadius: '6px' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>1일차 방</span>
          <strong>{s.room1 || '-'}</strong> {s.room1Leader && <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>⭐방장</span>}
        </div>
        <div style={{ background: 'var(--background)', padding: '6px 8px', borderRadius: '6px' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>2일차 방</span>
          <strong>{s.room2 || '-'}</strong> {s.room2Leader && <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>⭐방장</span>}
        </div>
        <div style={{ background: 'var(--background)', padding: '6px 8px', borderRadius: '6px' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>식사팀</span>
          <span style={{ fontSize: '0.78rem' }}>{s.mealTeam ? s.mealTeam.split(/[,，]/).length + '명' : '-'}</span>
        </div>
      </div>
      {s.note && (
        <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(245,158,11,0.1)', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--accent)', display: 'flex', gap: '6px' }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} /> <span>{s.note}</span>
        </div>
      )}
      {(s.studentPhone || s.parentPhone1) && (
        <div style={{ marginTop: '6px', padding: '8px', background: 'var(--background)', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {s.studentPhone && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>학생:</span><a href={`tel:${s.studentPhone}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>📞 {s.studentPhone}</a></div>}
          {s.parentPhone1 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>학부모1:</span><a href={`tel:${s.parentPhone1}`} style={{ color: 'var(--secondary)', textDecoration: 'none' }}>📞 {s.parentPhone1}</a></div>}
          {s.parentPhone2 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>학부모2:</span><a href={`tel:${s.parentPhone2}`} style={{ color: 'var(--secondary)', textDecoration: 'none' }}>📞 {s.parentPhone2}</a></div>}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--primary)', color: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700 }}>선생님 대시보드</h1>
          <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>전체 학생: {students.length}명</p>
        </div>
        <button onClick={() => { localStorage.removeItem('teacherAuth'); router.push('/teacher/login'); }} style={{ color: 'white', opacity: 0.8, padding: '8px' }}><LogOut size={20} /></button>
      </div>

      {/* Tabs - scrollable on mobile */}
      <div style={{ display: 'flex', background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <button onClick={() => setActiveTab('search')} style={tabStyle('search')}><Search size={18} />검색</button>
        <button onClick={() => setActiveTab('bus')} style={tabStyle('bus')}><Bus size={18} />호차</button>
        <button onClick={() => setActiveTab('room')} style={tabStyle('room')}><BedDouble size={18} />방</button>
        <button onClick={() => setActiveTab('external')} style={tabStyle('external')}><AlertCircle size={18} />외부</button>
        <button onClick={() => setActiveTab('safety')} style={tabStyle('safety')}><ShieldCheck size={18} />안전</button>
      </div>

      <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="학생 이름 또는 학번" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-field" style={{ paddingLeft: '44px', height: '48px' }} />
            </div>
            {searchQuery && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>검색 결과 ({searchResults.length}명)</p>
                {searchResults.map(s => <StudentCard key={s.id} s={s} />)}
              </div>
            )}
          </div>
        )}

        {/* Bus/Coach Tab - sorted by student ID */}
        {activeTab === 'bus' && (
          <div>
            <select value={selectedBus} onChange={e => setSelectedBus(e.target.value)} className="input-field" style={{ marginBottom: '16px', height: '48px' }}>
              <option value="">호차를 선택하세요</option>
              {coaches.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {selectedBus && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>탑승 명단 (학번순)</h3>
                  <span style={{ background: 'var(--primary-light)', color: 'white', padding: '3px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>총 {busRoster.length}명</span>
                </div>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {busRoster.map((s, idx) => (
                    <div key={s.id} style={{ display: 'flex', padding: '10px 14px', borderBottom: idx !== busRoster.length - 1 ? '1px solid var(--border-color)' : 'none', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: 'var(--background)', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>{idx + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600 }}>{s.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.id}</span>
                          {s.note && <span style={{ fontSize: '0.7rem', background: 'var(--accent)', color: 'white', padding: '1px 5px', borderRadius: '8px' }}>특이</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Room Tab - Card Grid */}
        {activeTab === 'room' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <button onClick={() => { setSelectedDay(1); setSelectedRoom(''); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 600, background: selectedDay === 1 ? 'var(--primary)' : 'var(--card-bg)', color: selectedDay === 1 ? 'white' : 'var(--text-muted)', border: `1px solid ${selectedDay === 1 ? 'var(--primary)' : 'var(--border-color)'}`, fontSize: '0.9rem' }}>1일차</button>
              <button onClick={() => { setSelectedDay(2); setSelectedRoom(''); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 600, background: selectedDay === 2 ? 'var(--secondary)' : 'var(--card-bg)', color: selectedDay === 2 ? 'white' : 'var(--text-muted)', border: `1px solid ${selectedDay === 2 ? 'var(--secondary)' : 'var(--border-color)'}`, fontSize: '0.9rem' }}>2일차</button>
            </div>

            {/* Selected Room Detail - shown at TOP */}
            {selectedRoom && (
              <div style={{ animation: 'fadeUp 0.2s ease-out forwards', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedRoom}호 명단</h3>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ background: selectedDay === 1 ? 'var(--primary-light)' : 'var(--secondary)', color: 'white', padding: '3px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>{roomStudents.length}명</span>
                    <button onClick={() => setSelectedRoom('')} style={{ background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>✕</button>
                  </div>
                </div>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {roomStudents.map((s, idx) => {
                    const isLeader = selectedDay === 1 ? s.room1Leader : s.room2Leader;
                    return (
                      <div key={s.id} style={{ display: 'flex', padding: '10px 14px', borderBottom: idx !== roomStudents.length - 1 ? '1px solid var(--border-color)' : 'none', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {isLeader && <Crown size={14} color="var(--accent)" />}
                            <span style={{ fontWeight: isLeader ? 700 : 500 }}>{s.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.id}</span>
                            {isLeader && <span style={{ fontSize: '0.65rem', background: 'rgba(245,158,11,0.15)', color: 'var(--accent)', padding: '1px 6px', borderRadius: '8px', fontWeight: 600 }}>방장</span>}
                            {s.note && <span style={{ fontSize: '0.65rem', background: 'var(--accent)', color: 'white', padding: '1px 5px', borderRadius: '8px' }}>특이</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Room Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {currentRooms.map(room => {
                const count = students.filter(s => selectedDay === 1 ? s.room1 === room : s.room2 === room).length;
                const isSelected = selectedRoom === room;
                const hasLeader = students.some(s => selectedDay === 1 ? (s.room1 === room && s.room1Leader) : (s.room2 === room && s.room2Leader));
                const accent = selectedDay === 1 ? 'var(--primary)' : 'var(--secondary)';
                return (
                  <button key={room} onClick={() => setSelectedRoom(isSelected ? '' : room)} style={{
                    padding: '10px 6px', borderRadius: '10px', textAlign: 'center',
                    background: isSelected ? accent : 'var(--card-bg)',
                    color: isSelected ? 'white' : 'var(--foreground)',
                    border: `1px solid ${isSelected ? accent : 'var(--border-color)'}`,
                    transition: 'all 0.2s ease', position: 'relative',
                  }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{room}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '2px' }}>{count}명</div>
                    {hasLeader && <Crown size={10} style={{ position: 'absolute', top: '4px', right: '4px', color: isSelected ? 'white' : 'var(--accent)' }} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* External Tab */}
        {activeTab === 'external' && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>외부 지원 인력</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {externals.length > 0 ? externals.map((ext, idx) => (
                <div key={idx} className="card" style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{ext.name || '(미정)'}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(79,70,229,0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{ext.type}</span>
                  </div>
                  {ext.phone && <a href={`tel:${ext.phone}`} style={{ fontSize: '0.85rem', color: 'var(--foreground)', textDecoration: 'none' }}>📞 {ext.phone}</a>}
                </div>
              )) : <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>등록된 외부요원이 없습니다.</div>}
            </div>
          </div>
        )}

        {/* Safety Education Tab */}
        {activeTab === 'safety' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldCheck size={22} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>안전교육 자료</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {safeCategories.map((cat, cIdx) => {
                const items = safeEduData.filter(s => s.category === cat);
                const isOpen = openSafeCategory === cat;
                const colors = ['#4f46e5', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899', '#84cc16'];
                const color = colors[cIdx % colors.length];
                return (
                  <div key={cat} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
                    <button onClick={() => { setOpenSafeCategory(isOpen ? null : cat); setOpenSafeItem(null); }} style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', background: isOpen ? color : 'var(--card-bg)',
                      color: isOpen ? 'white' : 'var(--foreground)', fontWeight: 700, fontSize: '0.95rem',
                      transition: 'all 0.3s ease',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{cat}</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{items.length}건</span>
                      </div>
                      <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                    </button>
                    {isOpen && (
                      <div style={{ padding: '8px' }}>
                        {items.map((item, iIdx) => {
                          const iKey = `${cIdx}-${iIdx}`;
                          const isItemOpen = openSafeItem === iKey;
                          return (
                            <div key={iKey} style={{ marginBottom: '6px' }}>
                              <button onClick={() => setOpenSafeItem(isItemOpen ? null : iKey)} style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem',
                                color: isItemOpen ? color : 'var(--foreground)',
                                background: isItemOpen ? `${color}10` : 'transparent', textAlign: 'left',
                              }}>
                                <span>{item.subItem}</span>
                                <ChevronDown size={14} style={{ transform: isItemOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', opacity: 0.5, flexShrink: 0 }} />
                              </button>
                              {isItemOpen && (
                                <div style={{
                                  padding: '12px', margin: '4px 8px 8px', background: 'var(--background)',
                                  borderRadius: '8px', borderLeft: `3px solid ${color}`,
                                  fontSize: '0.83rem', lineHeight: 1.7, whiteSpace: 'pre-line',
                                  color: 'var(--foreground)',
                                }}>
                                  {item.content}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .animation-fade { animation: fadeUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
