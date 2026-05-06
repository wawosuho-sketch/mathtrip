import Papa from 'papaparse';

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID;

// ── Student ──
export interface Student {
  id: string;           // 학번
  name: string;         // 이름
  studentPhone: string; // 학생 연락처
  parentPhone1: string; // 학부모 긴급 연락처 1
  parentPhone2: string; // 학부모 긴급 연락처 2
  note: string;         // 학생 특이사항
  mealTeam: string;     // 식사팀 (멤버 이름 나열)
  room1: string;        // 1일차 방번호
  room1Leader: boolean; // 1일차 방장여부
  room2: string;        // 2일차 방번호
  room2Leader: boolean; // 2일차 방장 여부
  coach: string;        // 호차 (1호차, 2호차...)
  bus: string;          // 버스 차번호
}

// ── Schedule (호차별 일정표) ──
export interface ScheduleEntry {
  day: string;
  time: string;
  coaches: Record<string, string>; // { "1호차": "런닝맨체험관+다이나믹메이즈", "2호차": "..." }
}

// ── Course (코스 상세정보) ──
export interface CourseInfo {
  name: string;
  activity: string;
  caution: string;
  images: string[];
}

// ── Contact (선생님 연락처) ──
export interface Contact {
  type: string;    // 구분
  name: string;    // 이름
  phone: string;   // 연락처
  coach: string;   // 탑승 호차
}

// ── External ──
export interface External {
  type: string;
  name: string;
  phone: string;
}

// ── SafeEdu (안전교육) ──
export interface SafeEdu {
  category: string;  // 분야
  subItem: string;   // 세부항목
  content: string;   // 내용
}

// ── Announcement (legacy, kept for safety) ──
export interface Announcement {
  show: string;
  time: string;
  message: string;
}

// ── Helper: fetch and parse a public Google Sheet as CSV ──
async function fetchSheet<T>(sheetName: string): Promise<T[]> {
  if (!SPREADSHEET_ID) {
    console.warn('Missing NEXT_PUBLIC_SPREADSHEET_ID');
    return [];
  }

  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&headers=1`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet ${sheetName}`);
    }
    const csv = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as T[]);
        },
        error: (error: Error) => {
          console.error(`Parse Error in sheet ${sheetName}:`, error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error(`Error fetching sheet ${sheetName}:`, error);
    return [];
  }
}

// ── getStudents ──
export async function getStudents(): Promise<Student[]> {
  const raw = await fetchSheet<any>('students');
  return raw.map(row => ({
    id: (row['학번'] || '').toString().trim(),
    name: (row['이름'] || '').trim(),
    studentPhone: (row['학생 연락처'] || '').trim(),
    parentPhone1: (row['학부모 긴급 연락처 1'] || '').trim(),
    parentPhone2: (row['학부모 긴급 연락처 2'] || '').trim(),
    note: (row['학생 특이사항'] || '').trim(),
    mealTeam: (row['식사팀'] || '').trim(),
    room1: (row['1일차 방번호'] || '').trim(),
    room1Leader: (row['1일차 방장여부'] || '').trim() === '방장',
    room2: (row['2일차 방번호'] || row['2일차 방번호 '] || '').trim(),
    room2Leader: (row['2일차 방장 여부'] || row['2일차 방장여부'] || '').trim() === '방장',
    coach: (row['호차'] || '').trim(),
    bus: (row['버스 차번호'] || '').trim(),
  })).filter(s => s.id && s.name);
}

// ── getScheduleEntries (호차별 일정) ──
export async function getScheduleEntries(): Promise<ScheduleEntry[]> {
  const raw = await fetchSheet<any>('schedule');
  return raw.map(row => {
    const coaches: Record<string, string> = {};
    // Map each 호차 column
    for (let i = 1; i <= 6; i++) {
      const key = `${i}호차`;
      if (row[key]) {
        coaches[key] = (row[key] as string).trim();
      }
    }
    return {
      day: (row['일자'] || '').toString().trim(),
      time: (row['시간'] || '').trim(),
      coaches,
    };
  }).filter(e => e.day && e.time);
}

// ── getCourseInfo (코스 상세정보) ──
export async function getCourseInfo(): Promise<CourseInfo[]> {
  const raw = await fetchSheet<any>('course');
  return raw.map(row => {
    const rawImages = (row['사진'] || '').trim();
    const images = rawImages
      ? rawImages.split('\n').map((s: string) => s.trim()).filter(Boolean)
      : [];
    return {
      name: (row['코스'] || '').trim(),
      activity: (row['활동내용'] || '').trim(),
      caution: (row['주의사항'] || '').trim(),
      images,
    };
  }).filter(c => c.name);
}

// ── getContacts ──
export async function getContacts(): Promise<Contact[]> {
  const raw = await fetchSheet<any>('contacts');
  return raw.map(row => ({
    type: (row['구분'] || '').trim(),
    name: (row['이름'] || '').trim(),
    phone: (row['연락처'] || '').trim(),
    coach: (row['탑승 호차'] || '').trim(),
  }));
}

// ── getExternal ──
export async function getExternal(): Promise<External[]> {
  const raw = await fetchSheet<any>('external');
  return raw.map(row => ({
    type: (row['구분'] || '').trim(),
    name: (row['이름'] || '').trim(),
    phone: (row['연락처'] || '').trim(),
  }));
}

// ── getEmergencyContacts ──
export async function getEmergencyContacts(): Promise<{ name: string; phone: string }[]> {
  const raw = await fetchSheet<any>('emergency');
  if (!raw || raw.length === 0) return [];

  const keys = Object.keys(raw[0]);
  const contacts: { name: string; phone: string }[] = [];

  // If the header row itself contains actual data (e.g., missing header row)
  let headerName = keys[0] || '';
  let headerPhone = keys[1] || '';
  if (headerName !== '기관' || headerPhone !== '연락처') {
    let n = headerName.replace(/^기관\s*/, '').trim();
    let p = headerPhone.replace(/^연락처\s*/, '').trim();
    if (n || p) contacts.push({ name: n, phone: p });
  }

  for (const row of raw) {
    const n = (row[keys[0]] || '').trim();
    const p = (row[keys[1]] || '').trim();
    if (n || p) {
      contacts.push({ name: n, phone: p });
    }
  }

  return contacts;
}

// ── getSafeEdu ──
export async function getSafeEdu(): Promise<SafeEdu[]> {
  const raw = await fetchSheet<any>('safeedu');
  return raw.map(row => ({
    category: (row['분야'] || '').trim(),
    subItem: (row['세부항목'] || '').trim(),
    content: (row['내용'] || '').trim(),
  })).filter(s => s.category && s.subItem);
}

// ── TeacherCheck (코스별 확인사항) ──
export interface TeacherCheck {
  course: string;
  leadChecks: string;
  supportChecks: string;
}

export async function getTeacherChecks(): Promise<TeacherCheck[]> {
  const raw = await fetchSheet<any>('teachercheck');
  return raw.map(row => {
    let course = '';
    let leadChecks = '';
    let supportChecks = '';
    for (const key of Object.keys(row)) {
      if (key.includes('코스')) course = row[key];
      else if (key.includes('정') && !key.includes('일정')) leadChecks = row[key];
      else if (key.includes('부')) supportChecks = row[key];
    }
    return {
      course: (course || '').trim(),
      leadChecks: (leadChecks || '').trim(),
      supportChecks: (supportChecks || '').trim(),
    };
  }).filter(tc => tc.course);
}

// ── TeacherRoom (교사 방배치) ──
export interface TeacherRoom {
  name: string;
  room1: string; // 소노문
  room2: string; // 강동리조트
}

export async function getTeacherRooms(): Promise<TeacherRoom[]> {
  const raw = await fetchSheet<any>('ch room');
  return raw.map(row => ({
    name: (row['이름'] || '').trim(),
    room1: (row['소노문'] || '').trim(),
    room2: (row['강동리조트'] || '').trim(),
  })).filter(tr => tr.name);
}

// ── getExternal2 (운전기사) ──
export async function getExternal2(): Promise<External[]> {
  const raw = await fetchSheet<any>('external2');
  return raw.map(row => ({
    type: (row['구분'] || '').trim(),
    name: (row['이름'] || '').trim(),
    phone: (row['연락처'] || '').trim(),
  }));
}

// ── Legacy: getSchedules (kept for backward compat but unused) ──
export interface Schedule {
  day: string;
  time: string;
  place: string;
  meeting: string;
  content: string;
  team: string;
  image: string;
}

export async function getSchedules(): Promise<Schedule[]> {
  return [];
}

export async function getAnnouncements(): Promise<Announcement[]> {
  return [];
}
