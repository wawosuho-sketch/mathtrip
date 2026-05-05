"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bus, BedDouble, LogOut, ShieldCheck, AlertCircle, ChevronDown, X, ClipboardCheck, Users, CarFront, Home } from 'lucide-react';
import { getStudents, getExternal, getExternal2, getSafeEdu, getTeacherChecks, getTeacherRooms } from '@/lib/google-sheets';
import type { Student, External, SafeEdu, TeacherCheck, TeacherRoom } from '@/lib/google-sheets';

export default function TeacherDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [externals, setExternals] = useState<External[]>([]);
  const [externals2, setExternals2] = useState<External[]>([]);
  const [safeEduData, setSafeEduData] = useState<SafeEdu[]>([]);
  const [teacherChecks, setTeacherChecks] = useState<TeacherCheck[]>([]);
  const [teacherRooms, setTeacherRooms] = useState<TeacherRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'search' | 'bus' | 'room' | 'teacherRoom' | 'external' | 'external2' | 'check' | 'safety'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [openSafeCategory, setOpenSafeCategory] = useState<string | null>(null);
  const [openSafeItem, setOpenSafeItem] = useState<string | null>(null);
  const [openCourseIdx, setOpenCourseIdx] = useState<number | null>(null);
  const [teacherRoomDay, setTeacherRoomDay] = useState(1);

  useEffect(() => {
    if (localStorage.getItem('teacherAuth') !== 'true') { router.push('/teacher/login'); return; }
    const fetchData = async () => {
      try {
        const [s, e, e2, se, tc, tr] = await Promise.all([getStudents(), getExternal(), getExternal2(), getSafeEdu(), getTeacherChecks(), getTeacherRooms()]);
        if (s.length > 0) setStudents(s);
        if (e.length > 0) setExternals(e);
        if (e2.length > 0) setExternals2(e2);
        if (se.length > 0) setSafeEduData(se);
        if (tc.length > 0) setTeacherChecks(tc);
        if (tr.length > 0) setTeacherRooms(tr);
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
        <div style={{ background: 'var(--background)', padding: '6px 8px', borderRadius: '6px', gridColumn: '1 / -1' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', marginBottom: '2px' }}>식사팀</span>
          {s.mealTeam ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {s.mealTeam.split(/[,，]/).map((name, i) => (
                <span key={i} style={{
                  fontSize: '0.78rem', fontWeight: name.trim() === s.name ? 700 : 500,
                  background: name.trim() === s.name ? 'var(--primary)' : 'rgba(79,70,229,0.08)',
                  color: name.trim() === s.name ? 'white' : 'var(--foreground)',
                  padding: '1px 7px', borderRadius: '10px',
                }}>{name.trim()}</span>
              ))}
            </div>
          ) : <span style={{ fontSize: '0.78rem' }}>-</span>}
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

      {/* Tabs - 2 rows */}
      <div style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex' }}>
          <button onClick={() => setActiveTab('search')} style={tabStyle('search')}><Search size={16} />검색</button>
          <button onClick={() => setActiveTab('bus')} style={tabStyle('bus')}><Bus size={16} />호차</button>
          <button onClick={() => { setActiveTab('room'); setSelectedRoom(''); }} style={tabStyle('room')}><BedDouble size={16} />학생방</button>
          <button onClick={() => setActiveTab('teacherRoom')} style={tabStyle('teacherRoom')}><Home size={16} />교사방</button>
        </div>
        <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={() => setActiveTab('external')} style={tabStyle('external')}><Users size={16} />요원</button>
          <button onClick={() => setActiveTab('external2')} style={tabStyle('external2')}><CarFront size={16} />운전기사</button>
          <button onClick={() => setActiveTab('check')} style={tabStyle('check')}><ClipboardCheck size={16} />확인사항</button>
          <button onClick={() => setActiveTab('safety')} style={tabStyle('safety')}><ShieldCheck size={16} />안전교육</button>
        </div>
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
            {selectedBus && (() => {
              const busNum = selectedBus.replace(/[^0-9]/g, '').padStart(2, '0');
              const basePath = '/mathtrip';
              return (
                <div>
                  {/* Seating Chart */}
                  <div className="card" style={{ padding: '10px', marginBottom: '14px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: 'var(--primary)' }}>좌석배치도</h3>
                    <img
                      src={`${basePath}/bus/${busNum}.jpg`}
                      alt={`${selectedBus} 좌석배치도`}
                      style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    />
                  </div>

                  {/* Roster */}
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
                            {s.note && <span style={{ fontSize: '0.65rem', background: 'rgba(245,158,11,0.1)', color: 'var(--accent)', padding: '1px 6px', borderRadius: '8px' }}>{s.note}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Room Tab - Floor Grouped */}
        {activeTab === 'room' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <button onClick={() => { setSelectedDay(1); setSelectedRoom(''); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 600, background: selectedDay === 1 ? 'var(--primary)' : 'var(--card-bg)', color: selectedDay === 1 ? 'white' : 'var(--text-muted)', border: `1px solid ${selectedDay === 1 ? 'var(--primary)' : 'var(--border-color)'}`, fontSize: '0.9rem' }}>1일차 (소노문)</button>
              <button onClick={() => { setSelectedDay(2); setSelectedRoom(''); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 600, background: selectedDay === 2 ? 'var(--secondary)' : 'var(--card-bg)', color: selectedDay === 2 ? 'white' : 'var(--text-muted)', border: `1px solid ${selectedDay === 2 ? 'var(--secondary)' : 'var(--border-color)'}`, fontSize: '0.9rem' }}>2일차 (강동)</button>
            </div>

            {(() => {
              const accent = selectedDay === 1 ? 'var(--primary)' : 'var(--secondary)';
              // Group rooms by floor
              const floorMap: Record<string, string[]> = {};
              currentRooms.forEach(room => {
                const match = room.match(/^(\d+)층/);
                const floor = match ? match[1] : '?';
                if (!floorMap[floor]) floorMap[floor] = [];
                floorMap[floor].push(room);
              });
              // Sort floors
              const sortedFloors = Object.keys(floorMap).sort((a, b) => parseInt(a) - parseInt(b));
              // Sort rooms within each floor by room number
              sortedFloors.forEach(f => {
                floorMap[f].sort((a, b) => {
                  const na = parseInt(a.match(/(\d+)호/)?.[1] || '0');
                  const nb = parseInt(b.match(/(\d+)호/)?.[1] || '0');
                  return na - nb;
                });
              });

              return sortedFloors.map(floor => {
                const floorRooms = floorMap[floor];
                const COLS = 3;
                const rows: string[][] = [];
                for (let i = 0; i < floorRooms.length; i += COLS) {
                  rows.push(floorRooms.slice(i, i + COLS));
                }
                const selectedRowIdx = selectedRoom ? rows.findIndex(row => row.includes(selectedRoom)) : -1;

                return (
                  <div key={floor} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ height: '1px', flex: 1, background: 'var(--border-color)' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: accent, background: 'var(--card-bg)', padding: '2px 10px', borderRadius: '12px', border: `1px solid var(--border-color)` }}>{floor}층</span>
                      <div style={{ height: '1px', flex: 1, background: 'var(--border-color)' }} />
                    </div>
                    {rows.map((row, rowIdx) => (
                      <div key={rowIdx}>
                        {selectedRoom && rowIdx === selectedRowIdx && (
                          <div style={{ animation: 'fadeUp 0.15s ease-out forwards', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedRoom} 명단</h3>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span style={{ background: accent, color: 'white', padding: '3px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>{roomStudents.length}명</span>
                                <button onClick={() => setSelectedRoom('')} style={{ background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>✕</button>
                              </div>
                            </div>
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                              {roomStudents.map((s, idx) => {
                                const isLeader = selectedDay === 1 ? s.room1Leader : s.room2Leader;
                                return (
                                  <div key={s.id} style={{ padding: '10px 14px', borderBottom: idx !== roomStudents.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                      <span style={{ fontWeight: isLeader ? 700 : 500 }}>{s.name}</span>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.id}</span>
                                      {isLeader && <span style={{ fontSize: '0.65rem', background: 'rgba(245,158,11,0.15)', color: 'var(--accent)', padding: '1px 6px', borderRadius: '8px', fontWeight: 600 }}>방장</span>}
                                    </div>
                                    {s.note && <div style={{ fontSize: '0.72rem', color: 'var(--accent)', marginTop: '3px', paddingLeft: '2px' }}>⚠ {s.note}</div>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                          {row.map(room => {
                            const count = students.filter(s => selectedDay === 1 ? s.room1 === room : s.room2 === room).length;
                            const isSelected = selectedRoom === room;
                            const hasLeader = students.some(s => selectedDay === 1 ? (s.room1 === room && s.room1Leader) : (s.room2 === room && s.room2Leader));
                            return (
                              <button key={room} onClick={() => setSelectedRoom(isSelected ? '' : room)} style={{
                                padding: '10px 6px', borderRadius: '10px', textAlign: 'center',
                                background: isSelected ? accent : 'var(--card-bg)',
                                color: isSelected ? 'white' : 'var(--foreground)',
                                border: `1px solid ${isSelected ? accent : 'var(--border-color)'}`,
                                transition: 'all 0.2s ease', position: 'relative',
                              }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{room.replace(/^\d+층\s*/, '')}</div>
                                <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '2px' }}>{count}명</div>
                                {hasLeader && <span style={{ position: 'absolute', top: '3px', right: '5px', fontSize: '0.6rem', color: isSelected ? 'white' : 'var(--accent)' }}>★</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* External Tab */}
        {activeTab === 'external' && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>안전요원 · 여행사</h3>
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

        {/* External2 - Driver Tab */}
        {activeTab === 'external2' && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>운전기사 연락처</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {externals2.length > 0 ? externals2.map((ext, idx) => (
                <div key={idx} className="card" style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{ext.name || '(미정)'}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{ext.type}</span>
                  </div>
                  {ext.phone && <a href={`tel:${ext.phone}`} style={{ fontSize: '0.85rem', color: 'var(--foreground)', textDecoration: 'none' }}>📞 {ext.phone}</a>}
                </div>
              )) : <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>등록된 운전기사가 없습니다.</div>}
            </div>
          </div>
        )}

        {/* Teacher Room Tab */}
        {activeTab === 'teacherRoom' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <button onClick={() => setTeacherRoomDay(1)} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 600, background: teacherRoomDay === 1 ? 'var(--primary)' : 'var(--card-bg)', color: teacherRoomDay === 1 ? 'white' : 'var(--text-muted)', border: `1px solid ${teacherRoomDay === 1 ? 'var(--primary)' : 'var(--border-color)'}`, fontSize: '0.9rem' }}>소노문 (1일차)</button>
              <button onClick={() => setTeacherRoomDay(2)} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 600, background: teacherRoomDay === 2 ? 'var(--secondary)' : 'var(--card-bg)', color: teacherRoomDay === 2 ? 'white' : 'var(--text-muted)', border: `1px solid ${teacherRoomDay === 2 ? 'var(--secondary)' : 'var(--border-color)'}`, fontSize: '0.9rem' }}>강동리조트 (2일차)</button>
            </div>
            {(() => {
              const accent = teacherRoomDay === 1 ? 'var(--primary)' : 'var(--secondary)';
              const sorted = [...teacherRooms].sort((a, b) => {
                const ra = teacherRoomDay === 1 ? a.room1 : a.room2;
                const rb = teacherRoomDay === 1 ? b.room1 : b.room2;
                return ra.localeCompare(rb);
              });
              // Group by floor
              const floorMap: Record<string, typeof sorted> = {};
              sorted.forEach(tr => {
                const room = teacherRoomDay === 1 ? tr.room1 : tr.room2;
                const match = room.match(/^(\d+)층/);
                const floor = match ? match[1] : '?';
                if (!floorMap[floor]) floorMap[floor] = [];
                floorMap[floor].push(tr);
              });
              const sortedFloors = Object.keys(floorMap).sort((a, b) => parseInt(a) - parseInt(b));
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sortedFloors.map(floor => (
                    <div key={floor}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ height: '1px', flex: 1, background: 'var(--border-color)' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: accent, padding: '2px 10px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>{floor}층</span>
                        <div style={{ height: '1px', flex: 1, background: 'var(--border-color)' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                        {floorMap[floor].map((tr, idx) => {
                          const room = teacherRoomDay === 1 ? tr.room1 : tr.room2;
                          return (
                            <div key={idx} className="card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tr.name}</span>
                              <span style={{ fontSize: '0.8rem', color: accent, fontWeight: 600, background: `${accent}15`, padding: '2px 8px', borderRadius: '8px' }}>{room.replace(/^\d+층\s*/, '')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Course Check Tab - detail panel above grid like room tab */}
        {activeTab === 'check' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ClipboardCheck size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>코스별 확인사항</h3>
            </div>
            {(() => {
              const COLS = 3;
              const colors = ['#4f46e5','#ef4444','#22c55e','#f59e0b','#a855f7','#06b6d4','#ec4899','#84cc16','#f97316','#6366f1','#14b8a6','#e11d48','#8b5cf6','#0ea5e9','#d946ef','#eab308'];
              const rows: number[][] = [];
              for (let i = 0; i < teacherChecks.length; i += COLS) {
                const row: number[] = [];
                for (let j = i; j < Math.min(i + COLS, teacherChecks.length); j++) row.push(j);
                rows.push(row);
              }
              const selectedRowIdx = openCourseIdx !== null ? rows.findIndex(row => row.includes(openCourseIdx)) : -1;

              return rows.map((row, rowIdx) => (
                <div key={rowIdx}>
                  {/* Detail panel above the row containing the selected course */}
                  {openCourseIdx !== null && rowIdx === selectedRowIdx && teacherChecks[openCourseIdx] && (
                    <div style={{ animation: 'fadeUp 0.15s ease-out forwards', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{teacherChecks[openCourseIdx].course}</h4>
                        <button onClick={() => setOpenCourseIdx(null)} style={{ background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>✕</button>
                      </div>
                      <div className="card" style={{ padding: '14px' }}>
                        {teacherChecks[openCourseIdx].checks.split('\n').filter(Boolean).map((line, li) => (
                          <div key={li} style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: li < teacherChecks[openCourseIdx].checks.split('\n').filter(Boolean).length - 1 ? '1px solid var(--border-color)' : 'none', fontSize: '0.83rem', lineHeight: 1.5 }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                            <span>{line.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Row of course cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '6px' }}>
                    {row.map(idx => {
                      const tc = teacherChecks[idx];
                      const color = colors[idx % colors.length];
                      const isOpen = openCourseIdx === idx;
                      return (
                        <button key={idx} onClick={() => setOpenCourseIdx(isOpen ? null : idx)} style={{
                          padding: '8px 4px', borderRadius: '8px', textAlign: 'center',
                          background: isOpen ? color : 'var(--card-bg)',
                          color: isOpen ? 'white' : 'var(--foreground)',
                          border: `1.5px solid ${isOpen ? color : 'var(--border-color)'}`,
                          fontSize: '0.68rem', fontWeight: 600, lineHeight: 1.3,
                          transition: 'all 0.2s ease', minHeight: '42px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {tc.course.length > 8 ? tc.course.slice(0, 8) + '…' : tc.course}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
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
