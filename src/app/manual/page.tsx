"use client";

import { useState } from 'react';
import { ChevronDown, Bus, Flame, Ambulance, MapPinOff, ShieldAlert, Play } from 'lucide-react';

interface ManualItem {
  subtitle: string;
  content: string;
  videoUrl?: string; // YouTube Shorts URL
}

interface ManualSection {
  icon: React.ReactNode;
  title: string;
  color: string;
  items: ManualItem[];
}

// Helper to convert Shorts URL to Embed URL
const getEmbedUrl = (url: string) => {
  if (!url) return "";
  const match = url.match(/(?:shorts\/|v=|\/)([\w-]{11})/);
  if (!match) return "";
  
  // Use official embed endpoint and add rel=0 to prevent recommended videos at the end
  return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;
};

const sections: ManualSection[] = [
  {
    icon: <Bus size={22} />,
    title: '🚍 교통 및 이동 중 사고',
    color: '#3b82f6',
    items: [
      {
        subtitle: '안전수칙 및 안전벨트 착용',
        content: '버스 탑승 시 전 좌석 안전벨트 착용은 의무입니다. 갑작스러운 제동이나 충돌 시 몸을 보호하는 유일한 수단임을 명심하세요.',
        videoUrl: 'https://www.youtube.com/shorts/_A8O3vVn7yw' // Busan Office of Education
      },
      {
        subtitle: '버스 비상 탈출',
        content: '비상망치를 이용하여 창문의 모서리를 수직으로 강하게 타격합니다. 망치가 없다면 소화기나 단단한 물체를 사용하여 유리창을 깨고 탈출합니다.',
        videoUrl: 'https://www.youtube.com/shorts/ht4Wa6pIrrQ' // Incheon Fire Agency
      }
    ]
  },
  {
    icon: <Flame size={22} />,
    title: '🚨 재난 및 숙소 사고',
    color: '#ef4444',
    items: [
      {
        subtitle: '완강기 사용법',
        content: '지지대를 창밖으로 밀어내고 줄(릴)을 던진 뒤, 가슴 높이로 벨트를 단단히 조이고 두 손으로 건물 외벽을 짚으며 천천히 하강해야 합니다.',
        videoUrl: 'https://www.youtube.com/shorts/abYdmF0AdLU' // user-confirmed link
      },
      {
        subtitle: '소화기 사용법',
        content: '안전핀을 뽑고, 노즐을 불쪽으로 향한 뒤 손잡이를 세게 움켜쥡니다. 바람을 등지고 비로 쓸 듯이 뿌립니다.',
        videoUrl: 'https://www.youtube.com/shorts/xDVDr68wABY' // NFA
      },
      {
        subtitle: '화재 시 대피 요령',
        content: '"불이야!" 소리치며 대피합니다. 유독가스를 마시지 않도록 낮은 자세로 젖은 수건을 코와 입에 대고 이동합니다.',
        videoUrl: 'https://www.youtube.com/shorts/a16Ij9aTNpo' // NFA
      },
      {
        subtitle: '지진 발생 시',
        content: '탁자 밑으로 들어가 머리를 보호하고, 흔들림이 멈추면 넓은 공터로 대피합니다. 엘리베이터 대신 계단을 이용하세요.',
        videoUrl: 'https://www.youtube.com/shorts/DlXxCD1XEk8' // MoIS
      }
    ]
  },
  {
    icon: <Ambulance size={22} />,
    title: '🚑 질병 및 응급 상황',
    color: '#22c55e',
    items: [
      {
        subtitle: '심폐소생술 (CPR)',
        content: '의식 확인 후 119 신고 요청. 가슴 중앙을 분당 100~120회 속도로 깊고 강하게 압박합니다.',
        videoUrl: 'https://www.youtube.com/shorts/7OgU4xXDFmU' // NFA
      },
      {
        subtitle: '기도 폐쇄 (하임리히 법)',
        content: '환자 뒤에서 주먹 쥔 손을 명치 끝에 대고 위로 강하게 밀쳐 올립니다. 의식이 없다면 즉시 CPR을 실시합니다.',
        videoUrl: 'https://www.youtube.com/shorts/ZrsFhtACPl4' // Pusan Nat'l Univ Hospital
      },
      {
        subtitle: '아나필락시스 및 알레르기',
        content: '호흡 곤란 시 즉시 119 신고. 에피네프린 자가주사기가 있다면 허벅지 바깥쪽에 수직으로 주사하고 10초간 유지합니다.',
        videoUrl: 'https://www.youtube.com/shorts/CuLFy85dx98' // Samsung Seoul Hospital
      }
    ]
  },
  {
    icon: <MapPinOff size={22} />,
    title: '🙋 야외 활동 및 미아',
    color: '#a855f7',
    items: [
      {
        subtitle: '길을 잃었을 때 (멈추기)',
        content: '길을 잃으면 그 자리에 멈춰 서서 선생님이나 부모님께 연락합니다. 주변 경찰관이나 공영 시설에 도움을 요청하세요.',
        // videoUrl removed as per request
      }
    ]
  }
];

export default function ManualPage() {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleSection = (idx: number) => {
    setOpenSection(prev => prev === idx ? null : idx);
    setOpenItem(null);
  };

  const toggleItem = (key: string) => {
    setOpenItem(prev => prev === key ? null : key);
  };

  return (
    <div className="screen-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <ShieldAlert size={28} color="var(--accent)" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)' }}>비상상황 매뉴얼</h2>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px', lineHeight: 1.5 }}>
        글보다 이해하기 쉬운 **영상 매뉴얼**을 확인하세요. 각 항목을 누르면 대처 영상과 설명을 볼 수 있습니다.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sections.map((section, sIdx) => (
          <div key={sIdx} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
            <button
              onClick={() => toggleSection(sIdx)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: openSection === sIdx ? section.color : 'var(--card-bg)',
                color: openSection === sIdx ? 'white' : 'var(--foreground)',
                fontWeight: 700,
                fontSize: '1rem',
                borderBottom: openSection === sIdx ? `1px solid ${section.color}` : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {section.icon}
                <span>{section.title}</span>
              </div>
              <ChevronDown
                size={20}
                style={{
                  transform: openSection === sIdx ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              />
            </button>

            {openSection === sIdx && (
              <div style={{ padding: '8px' }}>
                {section.items.map((item, iIdx) => {
                  const itemKey = `${sIdx}-${iIdx}`;
                  const isOpen = openItem === itemKey;
                  const embedUrl = getEmbedUrl(item.videoUrl || "");

                  return (
                    <div key={itemKey} style={{ marginBottom: '8px' }}>
                      <button
                        onClick={() => toggleItem(itemKey)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          color: isOpen ? section.color : 'var(--foreground)',
                          background: isOpen ? `${section.color}11` : 'transparent',
                          transition: 'all 0.2s ease',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Play size={14} fill={isOpen ? section.color : 'var(--text-muted)'} color={isOpen ? section.color : 'var(--text-muted)'} />
                          <span>{item.subtitle}</span>
                        </div>
                        <ChevronDown
                          size={16}
                          style={{
                            flexShrink: 0,
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            opacity: 0.5
                          }}
                        />
                      </button>
                      
                      {isOpen && (
                        <div style={{
                          padding: '12px',
                          margin: '4px 8px 12px',
                          background: 'var(--background)',
                          borderRadius: '12px',
                          border: `1px solid ${section.color}33`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          {embedUrl && (
                            <div style={{ 
                              position: 'relative', 
                              width: '100%', 
                              aspectRatio: '9/16', 
                              borderRadius: '8px', 
                              overflow: 'hidden',
                              backgroundColor: '#000'
                            }}>
                              <iframe
                                src={embedUrl}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                title={item.subtitle}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              ></iframe>
                            </div>
                          )}
                          <div style={{
                            padding: '10px 14px',
                            fontSize: '0.88rem',
                            lineHeight: 1.6,
                            color: 'var(--foreground)',
                            background: '#fff',
                            borderRadius: '8px',
                            borderLeft: `3px solid ${section.color}`,
                            whiteSpace: 'pre-line'
                          }}>
                            {item.content}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
