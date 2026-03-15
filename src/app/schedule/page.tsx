"use client";

import { useEffect, useState } from 'react';
import KakaoNoticeButton from '@/components/KakaoNoticeButton';
import { Clock, MapPin, Map, TriangleAlert, ChevronDown } from 'lucide-react';
import { getSchedules } from '@/lib/google-sheets';
import type { Schedule } from '@/lib/google-sheets';

const DAY_LABELS: Record<string, { label: string; date: string; color: string }> = {
  '1': { label: '1일차', date: '5월 13일 (수)', color: '#4f46e5' },
  '2': { label: '2일차', date: '5월 14일 (목)', color: '#ec4899' },
  '3': { label: '3일차', date: '5월 15일 (금)', color: '#f59e0b' },
};

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDays, setOpenDays] = useState<Set<string>>(new Set(['1']));
  const [studentTeam, setStudentTeam] = useState<string | null>(null);
  const [kstNow, setKstNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setKstNow(new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' })));
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSchedulesData = async () => {
      try {
        const data = await getSchedules();
        if (data && data.length > 0) {
          setSchedules(data);
          
          // Auto-open today's day
          const kst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
          const currentYMD = `${kst.getFullYear()}-${String(kst.getMonth() + 1).padStart(2, '0')}-${String(kst.getDate()).padStart(2, '0')}`;
          
          if (currentYMD === '2026-05-13') setOpenDays(new Set(['1']));
          else if (currentYMD === '2026-05-14') setOpenDays(new Set(['2']));
          else if (currentYMD === '2026-05-15') setOpenDays(new Set(['3']));
          else setOpenDays(new Set(['1']));
        }
      } catch (err) {
        console.error('Failed to fetch schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedulesData();
    setStudentTeam(localStorage.getItem('studentTeam'));
  }, []);

  const days = Array.from(new Set(schedules.map(s => s.day))).filter(Boolean).sort();

  const toggleDay = (day: string) => {
    setOpenDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>일정표를 불러오는 중...</div>;
  }

  const isCurrentSchedule = (day: string, timeStr: string) => {
    if (!kstNow) return false;
    
    let targetDate = '';
    if (day === '1') targetDate = '2026-05-13';
    else if (day === '2') targetDate = '2026-05-14';
    else if (day === '3') targetDate = '2026-05-15';
    
    const currentYMD = `${kstNow.getFullYear()}-${String(kstNow.getMonth() + 1).padStart(2, '0')}-${String(kstNow.getDate()).padStart(2, '0')}`;
    if (currentYMD !== targetDate) return false;

    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*~\s*(\d{1,2}):(\d{2})/);
    if (!timeMatch) return false;

    const currentMins = kstNow.getHours() * 60 + kstNow.getMinutes();
    const startMins = parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10);
    const endMins = parseInt(timeMatch[3], 10) * 60 + parseInt(timeMatch[4], 10);

    return currentMins >= startMins && currentMins <= endMins;
  };

  return (
    <div className="screen-container">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '16px' }}>일정표</h2>
      <KakaoNoticeButton />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
        {days.map(day => {
          const info = DAY_LABELS[day] || { label: `${day}일차`, date: '', color: '#4f46e5' };
          const isOpen = openDays.has(day);
          const daySchedules = schedules.filter(s => s.day === day);
          const hasActiveCurrent = daySchedules.some(s => isCurrentSchedule(day, s.time));

          return (
            <div key={day} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
              {/* Day Header - Clickable */}
              <button
                onClick={() => toggleDay(day)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: isOpen ? info.color : 'var(--card-bg)',
                  color: isOpen ? 'white' : 'var(--foreground)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  transition: 'all 0.3s ease',
                  borderBottom: isOpen ? `1px solid ${info.color}` : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{info.label}</span>
                  {info.date && <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.8 }}>{info.date}</span>}
                  {hasActiveCurrent && !isOpen && (
                    <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>진행 중</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{daySchedules.length}개 일정</span>
                  <ChevronDown
                    size={20}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </div>
              </button>

              {/* Day Content - Timeline */}
              {isOpen && (
                <div style={{ padding: '20px 16px 20px 40px', position: 'relative' }}>
                  {/* Vertical line */}
                  <div style={{
                    position: 'absolute',
                    left: '27px',
                    top: '32px',
                    bottom: '32px',
                    width: '2px',
                    background: 'var(--border-color)',
                    zIndex: 0
                  }} />

                  {daySchedules.map((item, idx) => {
                    const isActive = isCurrentSchedule(day, item.time);

                    return (
                      <div key={idx} style={{ position: 'relative', marginBottom: idx !== daySchedules.length - 1 ? '24px' : '0', zIndex: 1 }}>
                        {/* Timeline Dot */}
                        <div style={{
                          position: 'absolute',
                          left: '-24px',
                          top: '4px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: isActive ? info.color : 'white',
                          border: `3px solid ${isActive ? info.color : 'var(--border-color)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isActive ? `0 0 0 3px ${info.color}33` : '0 0 0 3px var(--background)',
                          transition: 'all 0.3s ease'
                        }}>
                          {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                        </div>

                        <div style={{ 
                          borderRadius: 'var(--radius-md)',
                          border: isActive ? `2px solid ${info.color}` : '1px solid var(--border-color)',
                          background: 'var(--card-bg)',
                          overflow: 'hidden',
                          transform: isActive ? 'scale(1.01)' : 'scale(1)',
                          transition: 'all 0.3s ease',
                          boxShadow: isActive ? `0 6px 12px ${info.color}22` : 'var(--shadow-sm)',
                          position: 'relative'
                        }}>
                          {isActive && (
                            <div style={{ position: 'absolute', top: item.image ? '8px' : '-10px', right: '12px', background: info.color, color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, zIndex: 2 }}>
                              진행 중
                            </div>
                          )}

                          {/* Image */}
                          {item.image && (
                            <div style={{ width: '100%', height: '140px', overflow: 'hidden', position: 'relative' }}>
                              <img 
                                src={item.image.startsWith('/') ? `/mathtrip${item.image}` : item.image} 
                                alt={item.place} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(transparent, rgba(0,0,0,0.3))' }} />
                            </div>
                          )}

                          {/* Content */}
                          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)' }}>{item.place}</h3>
                                {item.team && item.team !== '전체' && (
                                  <span style={{ 
                                    background: item.team.includes('A') ? 'rgba(236,72,153,0.1)' : 'rgba(79,70,229,0.1)', 
                                    color: item.team.includes('A') ? 'var(--secondary)' : 'var(--primary)',
                                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 
                                  }}>
                                    {item.team}팀
                                  </span>
                                )}
                                {studentTeam && item.team && item.team !== '전체' && item.team.toUpperCase().includes(studentTeam.toUpperCase()) && (
                                  <span style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 700 }}>⭐ 내 일정</span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: info.color, background: `${info.color}15`, padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
                                <Clock size={12} />
                                <span>{item.time}</span>
                              </div>
                            </div>

                            {item.meeting && (
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--secondary)' }} />
                                <span style={{ lineHeight: 1.4 }}>{item.meeting}</span>
                              </div>
                            )}

                            {item.content && (
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.85rem', background: 'var(--background)', padding: '8px 10px', borderRadius: '8px', color: 'var(--foreground)' }}>
                                <TriangleAlert size={14} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--accent)' }} />
                                <span style={{ lineHeight: 1.5, whiteSpace: 'pre-line' }}>{item.content}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {days.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <Map size={48} opacity={0.2} style={{ margin: '0 auto 12px' }} />
          <p>등록된 일정이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
