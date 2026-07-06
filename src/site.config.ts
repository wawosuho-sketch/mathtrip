// ─────────────────────────────────────────────────────────────
//  학교별 설정 파일
//  다른 학교에서 이 앱을 사용할 때는 대부분 이 파일만 수정하면 됩니다.
//  (학생/일정 등 실제 데이터는 코드가 아니라 구글시트에서 관리합니다.)
// ─────────────────────────────────────────────────────────────

export interface TripDay {
  /** 시트 'schedule' 탭의 '일자' 값과 일치해야 합니다 (예: "1", "2", "3") */
  key: string;
  /** 화면에 표시될 라벨 (예: "1일차") */
  label: string;
  /** 화면에 표시될 날짜 (예: "5월 13일 (수)"). 비워두면 표시되지 않습니다. */
  date: string;
  /** 해당 일자의 강조 색상 */
  color: string;
  /** '진행 중' 자동 강조용 실제 날짜 (YYYY-MM-DD). 비워두면 강조 기능만 비활성화됩니다. */
  isoDate: string;
}

export const siteConfig = {
  // ── 학교 / 앱 정보 ──
  schoolName: '○○고등학교',
  appTitle: '수학여행 안내',
  appShortName: '수학여행',
  appDescription: '수학여행 배정 정보 및 안전관리 안내 앱',

  // ── 테마 색상 (앱 상단바 / PWA 색상) ──
  themeColor: '#4f46e5',

  // ── 여행 일자 설정 ──
  // schedule 시트의 '일자' 컬럼 값(key)과 매핑됩니다.
  tripDays: [
    { key: '1', label: '1일차', date: '5월 13일 (수)', color: '#4f46e5', isoDate: '2026-05-13' },
    { key: '2', label: '2일차', date: '5월 14일 (목)', color: '#ec4899', isoDate: '2026-05-14' },
    { key: '3', label: '3일차', date: '5월 15일 (금)', color: '#f59e0b', isoDate: '2026-05-15' },
  ] as TripDay[],

  // ── 호차별 카카오톡 오픈채팅 URL ──
  // 학생이 자기 호차 공지방으로 바로 이동합니다. 없으면 defaultKakaoUrl 사용.
  coachKakaoUrls: {
    // '1호차': 'https://open.kakao.com/o/xxxxxxxx',
    // '2호차': 'https://open.kakao.com/o/xxxxxxxx',
  } as Record<string, string>,

  // ── 공통 긴급 공지 카카오톡 URL (호차 URL이 없을 때 사용) ──
  // 환경변수 NEXT_PUBLIC_KAKAOTALK_URL 로도 설정 가능합니다.
  defaultKakaoUrl: process.env.NEXT_PUBLIC_KAKAOTALK_URL || '',
} as const;

// ── basePath 헬퍼 ──
// Vercel 배포 시에는 비워두면 됩니다(기본값).
// GitHub Pages( https://아이디.github.io/저장소이름 )로 배포할 때만
// 환경변수 NEXT_PUBLIC_BASE_PATH="/저장소이름" 을 설정하세요.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** public 폴더의 정적 파일 경로 앞에 basePath를 붙여줍니다. */
export function withBasePath(path: string): string {
  if (!path) return path;
  if (path.startsWith('/')) return `${BASE_PATH}${path}`;
  return path; // 외부 URL(http...)은 그대로 반환
}

/** 일자 key로 해당 일자 설정을 찾습니다. */
export function getTripDay(key: string): TripDay | undefined {
  return siteConfig.tripDays.find((d) => d.key === key);
}
