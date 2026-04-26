"use client";

import { useEffect, useState } from 'react';
import KakaoNoticeButton from '@/components/KakaoNoticeButton';
import { Clock, MapPin, TriangleAlert, ChevronDown, ChevronRight, Bus, Image as ImageIcon } from 'lucide-react';
import { getScheduleEntries, getCourseInfo } from '@/lib/google-sheets';
import type { ScheduleEntry, CourseInfo } from '@/lib/google-sheets';

const DAY_LABELS: Record<string, { label: string; date: string; color: string }> = {
  '1': { label: '1일차', date: '5월 13일 (수)', color: '#4f46e5' },
  '2': { label: '2일차', date: '5월 14일 (목)', color: '#ec4899' },
  '3': { label: '3일차', date: '5월 15일 (금)', color: '#f59e0b' },
};

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDays, setOpenDays] = useState<Set<string>>(new Set(['1']));
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [studentCoach, setStudentCoach] = useState<string>('');
  const [kstNow, setKstNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setKstNow(new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' })));
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleData, courseData] = await Promise.all([
          getScheduleEntries(),
          getCourseInfo(),
        ]);
        if (scheduleData.length > 0) setSchedules(scheduleData);
        if (courseData.length > 0) setCourses(courseData);

        // Auto-open today's day
        const kst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
        const ymd = `${kst.getFullYear()}-${String(kst.getMonth() + 1).padStart(2, '0')}-${String(kst.getDate()).padStart(2, '0')}`;
        if (ymd === '2026-05-13') setOpenDays(new Set(['1']));
        else if (ymd === '2026-05-14') setOpenDays(new Set(['2']));
        else if (ymd === '2026-05-15') setOpenDays(new Set(['3']));
        else setOpenDays(new Set(['1']));
      } catch (err) {
        console.error('Failed to fetch schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setStudentCoach(localStorage.getItem('studentCoach') || '');
  }, []);

  // Build course lookup map
  const courseMap: Record<string, CourseInfo> = {};
  courses.forEach(c => {
    courseMap[c.name] = c;
  });

  const days = Array.from(new Set(schedules.map(s => s.day))).filter(Boolean).sort();

  const toggleDay = (day: string) => {
    setOpenDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const toggleExpand = (key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>일정표를 불러오는 중...</div>;
  }

  return (
    <div className="screen-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)' }}>일정표</h2>
        {studentCoach && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'linear-gradient(135deg, var(--primary-light), var(--primary-dark))',
            color: 'white', padding: '6px 14px', borderRadius: '20px',
            fontSize: '0.8rem', fontWeight: 700,
          }}>
            <Bus size={14} />
            {studentCoach}
          </div>
        )}
      </div>
      <KakaoNoticeButton coach={studentCoach} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
        {days.map(day => {
          const info = DAY_LABELS[day] || { label: `${day}일차`, date: '', color: '#4f46e5' };
          const isOpen = openDays.has(day);
          const daySchedules = schedules.filter(s => s.day === day);
          const hasActiveCurrent = daySchedules.some(s => isCurrentSchedule(day, s.time));

          return (
            <div key={day} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
              {/* Day Header */}
              <button
                onClick={() => toggleDay(day)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: isOpen ? info.color : 'var(--card-bg)',
                  color: isOpen ? 'white' : 'var(--foreground)',
                  fontWeight: 700, fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  borderBottom: isOpen ? `1px solid ${info.color}` : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span>{info.label}</span>
                  {info.date && <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.8 }}>{info.date}</span>}
                  {hasActiveCurrent && !isOpen && (
                    <span style={{ fontSize: '0.65rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>진행 중</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{daySchedules.length}개</span>
                  <ChevronDown
                    size={18}
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                  />
                </div>
              </button>

              {/* Timeline */}
              {isOpen && (
                <div style={{ padding: '16px 12px 16px 36px', position: 'relative' }}>
                  {/* Vertical line */}
                  <div style={{
                    position: 'absolute', left: '23px', top: '28px', bottom: '28px',
                    width: '2px', background: 'var(--border-color)', zIndex: 0
                  }} />

                  {daySchedules.map((item, idx) => {
                    const isActive = isCurrentSchedule(day, item.time);
                    const courseName = studentCoach ? (item.coaches[studentCoach] || '') : '';
                    const course = courseName ? courseMap[courseName] : null;
                    const itemKey = `${day}-${idx}`;
                    const isExpanded = expandedItems.has(itemKey);
                    const firstImage = course?.images?.[0];

                    return (
                      <div key={idx} style={{ position: 'relative', marginBottom: idx !== daySchedules.length - 1 ? '20px' : '0', zIndex: 1 }}>
                        {/* Timeline Dot */}
                        <div style={{
                          position: 'absolute', left: '-22px', top: '4px',
                          width: '18px', height: '18px', borderRadius: '50%',
                          background: isActive ? info.color : 'white',
                          border: `3px solid ${isActive ? info.color : 'var(--border-color)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: isActive ? `0 0 0 3px ${info.color}33` : '0 0 0 3px var(--background)',
                          transition: 'all 0.3s ease'
                        }}>
                          {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                        </div>

                        <div
                          style={{
                            borderRadius: 'var(--radius-md)',
                            border: isActive ? `2px solid ${info.color}` : '1px solid var(--border-color)',
                            background: 'var(--card-bg)',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            boxShadow: isActive ? `0 4px 12px ${info.color}22` : 'var(--shadow-sm)',
                            position: 'relative',
                            cursor: course ? 'pointer' : 'default',
                          }}
                          onClick={() => course && toggleExpand(itemKey)}
                        >
                          {isActive && (
                            <div style={{
                              position: 'absolute', top: '8px', right: '8px',
                              background: info.color, color: 'white',
                              padding: '2px 8px', borderRadius: '10px',
                              fontSize: '0.65rem', fontWeight: 700, zIndex: 2
                            }}>
                              진행 중
                            </div>
                          )}

                          {/* Compact Header */}
                          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--foreground)' }}>
                                  {courseName || '(미정)'}
                                </h3>
                                {course && (
                                  <ChevronRight
                                    size={16}
                                    style={{
                                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                      transition: 'transform 0.2s ease',
                                      color: 'var(--text-muted)', flexShrink: 0
                                    }}
                                  />
                                )}
                              </div>
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: '3px',
                                color: info.color, background: `${info.color}12`,
                                padding: '2px 8px', borderRadius: '10px',
                                fontSize: '0.7rem', fontWeight: 600, flexShrink: 0
                              }}>
                                <Clock size={11} />
                                <span>{item.time}</span>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Detail */}
                          {isExpanded && course && (
                            <div style={{
                              borderTop: '1px solid var(--border-color)',
                              padding: '12px 14px',
                              display: 'flex', flexDirection: 'column', gap: '10px',
                              animation: 'fadeUp 0.2s ease-out forwards',
                            }}>
                              {/* Images */}
                              {course.images.length > 0 && (
                                <div style={{
                                  display: 'flex', gap: '8px', overflowX: 'auto',
                                  paddingBottom: '4px', WebkitOverflowScrolling: 'touch',
                                }}>
                                  {course.images.map((img, imgIdx) => (
                                    <div key={imgIdx} style={{
                                      width: course.images.length === 1 ? '100%' : '200px',
                                      height: '130px', borderRadius: '10px', overflow: 'hidden',
                                      flexShrink: 0, position: 'relative', background: 'var(--background)',
                                    }}>
                                      <img
                                        src={img.startsWith('/') ? `/mathtrip${img}` : img}
                                        alt={`${course.name} ${imgIdx + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Activity */}
                              {course.activity && (
                                <div style={{
                                  display: 'flex', alignItems: 'flex-start', gap: '6px',
                                  fontSize: '0.82rem', color: 'var(--foreground)',
                                  background: 'var(--background)', padding: '10px 12px',
                                  borderRadius: '8px', lineHeight: 1.6,
                                }}>
                                  <MapPin size={14} style={{ marginTop: '3px', flexShrink: 0, color: 'var(--primary)' }} />
                                  <span style={{ whiteSpace: 'pre-line' }}>{course.activity}</span>
                                </div>
                              )}

                              {/* Caution */}
                              {course.caution && (
                                <div style={{
                                  display: 'flex', alignItems: 'flex-start', gap: '6px',
                                  fontSize: '0.82rem', color: 'var(--accent)',
                                  background: 'rgba(245, 158, 11, 0.06)', padding: '10px 12px',
                                  borderRadius: '8px', lineHeight: 1.6,
                                  border: '1px solid rgba(245, 158, 11, 0.15)',
                                }}>
                                  <TriangleAlert size={14} style={{ marginTop: '3px', flexShrink: 0 }} />
                                  <span style={{ whiteSpace: 'pre-line' }}>{course.caution}</span>
                                </div>
                              )}
                            </div>
                          )}
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
          <p>등록된 일정이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
