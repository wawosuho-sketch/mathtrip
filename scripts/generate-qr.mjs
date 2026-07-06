// ─────────────────────────────────────────────────────────────
//  QR 코드 생성 스크립트
//
//  사용법:
//    1) 아래 URL 3개를 채우거나, 환경변수로 넘깁니다.
//    2) 터미널에서:  npm run qr
//    3) qr/ 폴더에 PNG 이미지가 생성됩니다.
//
//  환경변수로 넘기는 예시 (PowerShell):
//    $env:SAMPLE_APP_URL="https://xxx.vercel.app"; $env:SAMPLE_SHEET_URL="https://docs.google.com/..."; npm run qr
// ─────────────────────────────────────────────────────────────

import QRCode from 'qrcode';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'qr');

// ── 여기에 주소를 채우세요 (환경변수가 우선 적용됩니다) ──
const targets = [
  {
    name: 'repo-code',
    label: '실제 코드 복사용 (GitHub 저장소)',
    url: process.env.REPO_URL || 'https://github.com/wawosuho-sketch/mathtrip',
  },
  {
    name: 'sample-app',
    label: '샘플 앱 (Vercel 배포 주소)',
    url: process.env.SAMPLE_APP_URL || 'https://sample-sigma-seven-39.vercel.app/login',
  },
  {
    name: 'sample-sheet',
    label: '샘플 구글시트',
    url: process.env.SAMPLE_SHEET_URL || 'https://docs.google.com/spreadsheets/d/1Lk-l6nwVU0DhnU-iuoQrBbCOHah5260BT88h-MS12Ek/edit?usp=sharing',
  },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let made = 0;
  for (const t of targets) {
    if (!t.url) {
      console.log(`  ⏭  건너뜀: ${t.label}  (URL 미입력)`);
      continue;
    }
    const file = path.join(OUT_DIR, `${t.name}.png`);
    await QRCode.toFile(file, t.url, {
      width: 800,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#FFFFFF' },
    });
    console.log(`  ✅ 생성: qr/${t.name}.png  →  ${t.url}`);
    made++;
  }

  console.log(`\n완료: ${made}개 생성. 인쇄 전 반드시 스마트폰으로 스캔 테스트하세요.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
