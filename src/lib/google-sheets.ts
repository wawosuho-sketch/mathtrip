import Papa from 'papaparse';

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID;

export interface Student {
  id: string;      // 학번
  name: string;    // 이름
  team: string;    // 팀 (A/B)
  room1: string;   // 1일차 방
  room2: string;   // 2일차 방
  bus: string;     // 버스 번호
  car: string;     // 호차
  note: string;    // 비고 (알레르기, 요양호 등)
  studentPhone?: string; // 학생연락처
  parentPhone?: string; // 학부모 연락처
}

export interface Schedule {
  day: string;     // 일차 (1, 2, 3)
  time: string;    // 시간
  place: string;   // 장소
  meeting: string; // 화장실/집결지
  content: string; // 상세내용
  team: string;    // 팀 구분 (A/B/전체 - optional)
  image: string;   // 이미지 URL
}

export interface Contact {
  type: string;    // 구분 (선생님/기관)
  name: string;    // 이름
  phone: string;   // 연락처
}

export interface External {
  type: string;    // 구분 (운전자/안전요원/여행사 등)
  name: string;    // 이름/회사명
  phone: string;   // 연락처
  role: string;    // 담당업무/차량번호
}

export interface Announcement {
  show: string;    // 노출 (TRUE/FALSE)
  time: string;    // 시간
  message: string; // 내용
}

// Helper to fetch and parse a public Google Sheet as CSV
async function fetchSheet<T>(sheetName: string): Promise<T[]> {
  if (!SPREADSHEET_ID) {
    console.warn('Missing NEXT_PUBLIC_SPREADSHEET_ID');
    return [];
  }
  
  // Using Google Visualization API endpoint for CSV export
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 10 } }); // Cache for 10 seconds
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

export async function getStudents(): Promise<Student[]> {
  const raw = await fetchSheet<any>('students');
  return raw.map(row => ({
    id: row['학번'] || row['id'] || '',
    name: row['이름'] || row['name'] || '',
    team: row['팀'] || row['팀(A/B)'] || row['team'] || '',
    room1: row['1일차'] || row['room1'] || '',
    room2: row['2일차'] || row['room2'] || '',
    bus: row['버스 차번호'] || row['버스번호'] || row['bus'] || '',
    car: row['호차'] || row['car'] || '',
    note: row['비고(요양호, 특수)'] || row['비고'] || row['note'] || '',
    studentPhone: row['학생연락처'] || row['학생 연락처'] || '',
    parentPhone: row['학부모 연락처'] || row['학부모연락처'] || ''
  }));
}

export async function getSchedules(): Promise<Schedule[]> {
  const raw = await fetchSheet<any>('schedule');
  return raw.map(row => {
    // Combine multiple user columns into content
    const extras = [];
    if (row['체험안내']) extras.push(`체험안내: ${row['체험안내']}`);
    if (row['주의사항']) extras.push(`주의사항: ${row['주의사항']}`);
    
    // Combine meeting and toilet
    const meetingPlaces = [];
    if (row['모이는곳']) meetingPlaces.push(`집결: ${row['모이는곳']}`);
    if (row['화장실']) meetingPlaces.push(`화장실: ${row['화장실']}`);

    // Find image URL - may be in named column or unnamed column
    let imageUrl = row['이미지URL'] || row['이미지'] || row['image'] || '';
    if (!imageUrl) {
      // Scan all values for image paths (unnamed columns from CSV import)
      const vals = Object.values(row) as string[];
      const found = vals.find(v => typeof v === 'string' && v.startsWith('/schedule/'));
      if (found) imageUrl = found;
    }

    return {
      day: row['일자'] || row['일차'] || row['day'] || '',
      time: row['시간'] || row['time'] || '',
      place: row['장소'] || row['place'] || '',
      meeting: meetingPlaces.join(', ') || row['모이는곳'] || row['meeting'] || '',
      content: extras.join(' / ') || row['내용'] || row['content'] || '',
      team: row['팀'] || row['team'] || '',
      image: imageUrl
    };
  });
}

export async function getContacts(): Promise<Contact[]> {
  const raw = await fetchSheet<any>('contacts');
  return raw.map(row => ({
    type: row['구분'] || row['type'] || '',
    name: row['이름'] || row['name'] || '',
    phone: row['연락처'] || row['phone'] || ''
  }));
}

export async function getExternal(): Promise<External[]> {
  const raw = await fetchSheet<any>('external');
  return raw.map(row => ({
    type: row['구분'] || row['type'] || '',
    name: row['이름'] || row['name'] || '',
    phone: row['연락처'] || row['phone'] || '',
    role: row['담당업무'] || row['role'] || ''
  }));
}

// Announcements no longer used due to KakaoTalk integration, but keeping safe mapping just in case
export async function getAnnouncements(): Promise<Announcement[]> {
  return fetchSheet<Announcement>('announcements');
}

export async function getEmergencyContacts(): Promise<Contact[]> {
  const raw = await fetchSheet<any>('emergency');
  return raw.map(row => ({
    type: row['구분'] || row['기관'] || row['type'] || '',
    name: row['이름'] || row['기관'] || row['name'] || '',
    phone: row['연락처'] || row['phone'] || ''
  }));
}
