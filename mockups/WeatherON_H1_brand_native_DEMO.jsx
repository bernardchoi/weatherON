import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────────────
   WeatherON — Brand-Native UI Demo (H1 홈 메인)
   기준: brand/WeatherON_디자인_정체성_가이드.md
   원칙: Liquid Glass(블러/반투명/스페큘러), Material(엘리베이션/리플/FAB) 등
   특정 OS 트렌드를 전혀 사용하지 않고, WeatherON 고유 토큰(Navy+Gold 브랜드
   페어링, 기능색, 공유 글리프, 타이포 시스템)만으로 구성한 화면.
   ───────────────────────────────────────────────────────────────────── */

/* ── Brand / Functional Color Tokens (brand/weatheron_ci_bi.html 기준) ── */
const NAVY      = '#1D5A86'; // horizon — 브랜드 모먼트 전용
const NAVY_DARK = '#276A96'; // 가장 어두운 패널(탭바 등)
const PANEL     = '#2B719D'; // 카드 패널 — 불투명 솔리드, 블러 없음
const GOLD      = '#F0A020'; // dawn — 브랜드 모먼트 전용 (CTA, 공유 글리프)
const SKY       = '#4A8FD4'; // 기능색 — 날씨/카테고리 표시용
const CLEAR     = '#3ABFA0'; // 기능색 — 맑음/코디 카테고리
const MIST      = '#E4F2FF'; // 기능색 — 보조 정보
const CLOUD     = '#E8EDF6';

/* ── SVG Icon Helpers ───────────────────────────────────────────────── */
function SunSVG() {
  // 공유 글리프: 아이콘/워드마크와 동일한 골드 원+광선 모티프
  const rays = [
    [34,4,34,12],[34,56,34,64],[4,34,12,34],[56,34,64,34],
    [16.1,16.1,21.9,21.9],[46.1,46.1,51.9,51.9],
    [51.9,16.1,46.1,21.9],[21.9,46.1,16.1,51.9],
  ];
  return (
    <svg width={68} height={68} viewBox="0 0 68 68" fill="none">
      <circle cx={34} cy={34} r={16} fill={GOLD}/>
      {rays.map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={GOLD} strokeWidth={3} strokeLinecap="round"/>
      ))}
    </svg>
  );
}

function BellSVG() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none"
      stroke="rgba(232,237,246,0.82)" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}

/* ── Tab Icons ──────────────────────────────────────────────────────── */
const tabDefs = [
  { id:'홈', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { id:'코디', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
    </svg>
  )},
  { id:'출발', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
    </svg>
  )},
  { id:'MY', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )},
  { id:'소셜', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  )},
];

/* ── Brand Card: 불투명 솔리드 패널, 블러/스페큘러 없음, 단일 소프트 섀도우 ── */
function BrandCard({ accent, children, style={} }) {
  return (
    <div style={{
      background: PANEL,
      borderRadius: 16,
      padding: '14px 16px',
      position: 'relative',
      overflow: 'hidden', flexShrink: 0,
      boxShadow: '0 6px 16px rgba(0,0,0,0.30)',
      ...style,
    }}>
      {/* 카테고리 표시용 좌측 액센트 바 — 기능색만 사용, 브랜드색(Navy/Gold)은 쓰지 않음 */}
      {accent && (
        <div style={{
          position:'absolute', top:0, left:0, bottom:0, width:3,
          background:accent,
        }}/>
      )}
      {children}
    </div>
  );
}

/* ── Status Bar Icons ───────────────────────────────────────────────── */
function StatusIcons() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
      <svg width="18" height="13" viewBox="0 0 18 13" fill="rgba(232,237,246,0.88)">
        <rect x="0" y="8" width="3" height="5" rx="1"/>
        <rect x="5" y="5.5" width="3" height="7.5" rx="1"/>
        <rect x="10" y="3" width="3" height="10" rx="1"/>
        <rect x="15" y="0" width="3" height="13" rx="1"/>
      </svg>
      <svg width="16" height="12" viewBox="0 0 24 18" fill="none"
        stroke="rgba(232,237,246,0.88)" strokeWidth="2.5" strokeLinecap="round">
        <path d="M2 6C6.5 1.5 17.5 1.5 22 6"/>
        <path d="M5 10C8 7 16 7 19 10"/>
        <path d="M8.5 14C10 12.5 14 12.5 15.5 14"/>
        <circle cx="12" cy="17" r="1.5" fill="rgba(232,237,246,0.88)" stroke="none"/>
      </svg>
      <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
        <rect x="0.5" y="0.5" width="21" height="12" rx="2.5"
          stroke="rgba(232,237,246,0.55)" strokeWidth="1"/>
        <rect x="2" y="2" width="15" height="9" rx="1.5" fill="rgba(232,237,246,0.88)"/>
        <path d="M23 4v5a2.5 2.5 0 000-5z" fill="rgba(232,237,246,0.42)"/>
      </svg>
    </div>
  );
}

/* ── Main Mockup ────────────────────────────────────────────────────── */
export default function WeatherONHomeBrandNative() {
  const [activeTab, setActiveTab] = useState('홈');

  /* Load Brand Fonts — Manrope는 워드마크 전용이라 본문에는 쓰지 않음 */
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch(_){} };
  }, []);

  const pills = [
    { icon:'💧', label:'65%',   sub:'습도' },
    { icon:'🌬️', label:'2.3m/s', sub:'바람' },
    { icon:'☀️', label:'UV 3',  sub:'자외선' },
    { icon:'☔', label:'0mm',   sub:'강수' },
  ];

  const cardTag  = { fontSize:10.5, fontWeight:600, color:MIST, letterSpacing:'0.3px', marginBottom:6, fontFamily:"'Plus Jakarta Sans',sans-serif" };
  const cardMain = { fontSize:15, fontWeight:700, color:'#fff', lineHeight:1.35, marginBottom:4, fontFamily:"'Noto Sans KR',sans-serif" };
  const cardSub  = { fontSize:11.5, color:'rgba(232,237,246,0.62)', fontFamily:"'Noto Sans KR',sans-serif" };

  return (
    <div style={{
      minHeight:'100vh',
      background:'#030810',
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      justifyContent:'center',
      gap:20,
      padding:'32px 20px',
    }}>
      {/* ── Page label ── */}
      <p style={{
        fontSize:11, fontWeight:500,
        color:'rgba(228,242,255,0.38)',
        letterSpacing:'1.6px',
        textTransform:'uppercase',
        fontFamily:'system-ui',
        textAlign:'center',
      }}>
        WeatherON · H1 홈 메인 · Brand-Native UI (No Liquid Glass / No Material)
      </p>

      {/* ════════════════════════════════════════════
          PHONE FRAME
      ════════════════════════════════════════════ */}
      <div style={{
        width:393, height:852,
        borderRadius:40,
        overflow:'hidden',
        position:'relative', flexShrink: 0,
        background:`linear-gradient(175deg, ${NAVY} 0%, #14294D 50%, #1A3A6B 100%)`,
        boxShadow:[
          '0 0 0 1.5px rgba(255,255,255,0.08)',
          '0 40px 80px rgba(0,0,0,0.70)',
          '0 8px 24px rgba(0,0,0,0.45)',
        ].join(','),
        fontFamily:"'Noto Sans KR',-apple-system,sans-serif",
        flexShrink:0,
      }}>

        {/* ── 태양 모티프 주변 은은한 골드 글로우 (단순 radial-gradient, 블러 필터 아님) ── */}
        <div style={{
          position:'absolute', top:80, left:'50%', transform:'translateX(-50%)',
          width:230, height:230,
          background:'radial-gradient(ellipse, rgba(240,160,32,0.14) 0%, transparent 70%)',
          pointerEvents:'none',
        }}/>

        {/* ════════════
            STATUS BAR
        ════════════ */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:54,
          display:'flex', alignItems:'flex-end', justifyContent:'space-between',
          padding:'0 28px 10px',
          zIndex:20,
        }}>
          <span style={{ fontSize:15, fontWeight:700, color:'#fff', letterSpacing:'0.2px', fontFamily:"'DM Mono',monospace" }}>9:41</span>
          <StatusIcons/>
        </div>

        {/* ════════════════
            위치 HEADER — 불투명 솔리드 핀, 블러 없음
        ════════════════ */}
        <div style={{
          position:'absolute', top:54, left:0, right:0, height:50,
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:10,
        }}>
          <div style={{
            display:'flex', alignItems:'center', gap:4,
            background: NAVY_DARK,
            border:'1px solid rgba(232,237,246,0.10)',
            borderRadius:18, padding:'7px 14px',
          }}>
            <span style={{ fontSize:13.5, fontWeight:500, color:'rgba(232,237,246,0.92)', fontFamily:"'Noto Sans KR',sans-serif" }}>
              서울 마포구 합정동
            </span>
            <span style={{ fontSize:10, color:'rgba(232,237,246,0.45)', marginLeft:2 }}>▾</span>
          </div>
          <div style={{
            position:'absolute', right:20,
            width:36, height:36,
            background: NAVY_DARK,
            border:'1px solid rgba(232,237,246,0.10)',
            borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <BellSVG/>
          </div>
        </div>

        {/* ═══════════════
            WEATHER HERO — 숫자는 DM Mono(타이포 시스템), Manrope는 워드마크 전용이라 미사용
        ═══════════════ */}
        <div style={{
          position:'absolute', top:108, left:0, right:0, height:230,
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
        }}>
          <div style={{ marginBottom:10 }}><SunSVG/></div>
          <div style={{
            fontFamily:"'DM Mono',monospace",
            fontWeight:500, fontSize:80,
            color:'#fff', lineHeight:0.92,
            letterSpacing:'-2px',
          }}>
            22°
          </div>
          <div style={{ fontSize:17, fontWeight:400, color:'#A8C4E0', marginTop:10, fontFamily:"'Noto Sans KR',sans-serif" }}>맑음</div>
          <div style={{ fontSize:12, color:'rgba(228,242,255,0.58)', marginTop:5, fontFamily:"'DM Mono',monospace" }}>
            체감 21° · 최고 26° · 최저 15°
          </div>
        </div>

        {/* ═════════════
            상세 PILLS — 불투명 솔리드, 블러 없음
        ═════════════ */}
        <div style={{
          position:'absolute', top:344, left:0, right:0,
          display:'flex', justifyContent:'center', gap:7, padding:'0 16px',
        }}>
          {pills.map(p => (
            <div key={p.sub} style={{
              display:'flex', alignItems:'center', gap:4,
              padding:'7px 11px',
              background: NAVY_DARK,
              border:'1px solid rgba(232,237,246,0.12)',
              borderRadius:16,
            }}>
              <span style={{ fontSize:13 }}>{p.icon}</span>
              <span style={{ fontSize:11.5, fontWeight:500, color:'rgba(232,237,246,0.90)', whiteSpace:'nowrap', fontFamily:"'DM Mono',monospace" }}>
                {p.label}
              </span>
            </div>
          ))}
        </div>

        {/* ══════════════════════════
            CARDS AREA — 불투명 BrandCard, 기능색은 좌측 액센트 바로만 표시
        ══════════════════════════ */}
        <div style={{
          position:'absolute', top:403, left:20, right:20,
          display:'flex', flexDirection:'column', gap:11,
        }}>

          {/* AI 장소 추천 카드 — 기능색 Sky(날씨 연동 정보) */}
          <BrandCard accent={SKY} style={{ paddingLeft:18 }}>
            <div style={cardTag}>✦ AI 장소 추천</div>
            <div style={cardMain}>오늘 이 날씨엔 합정동 카페 어때요?</div>
            <div style={cardSub}>맑음 · 기온 22°C · Gemini AI 추천</div>
          </BrandCard>

          {/* 코디 추천 카드 — 기능색 Clear(코디 카테고리) */}
          <BrandCard accent={CLEAR} style={{ paddingLeft:18 }}>
            <div style={cardTag}>👗 코디 추천</div>
            <div style={cardMain}>오늘은 얇은 가디건 추천해요</div>
            <div style={cardSub}>일교차 8°C · 코디 탭에서 자세히 보기 →</div>
          </BrandCard>

          {/* CWR 제보 버튼 — 1차 CTA = 브랜드 모먼트, Navy+Gold 페어링 고정 */}
          <div style={{
            height:52, borderRadius:14,
            background: GOLD,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 18px rgba(240,160,32,0.32)',
            cursor:'pointer',
            userSelect:'none',
          }}>
            <span style={{ fontSize:15, fontWeight:700, color:NAVY, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              지금 날씨 제보하기
            </span>
          </div>
        </div>

        {/* ═════════════════════════════════
            TAB BAR — 불투명 솔리드 네이비 바, 액티브 인디케이터는 공유 글리프(골드 노브) 모티프
        ═════════════════════════════════ */}
        <div style={{
          position:'absolute', bottom:18, left:16, right:16, height:64,
          background: NAVY_DARK,
          borderRadius:24,
          border:'1px solid rgba(232,237,246,0.08)',
          display:'flex', alignItems:'center', justifyContent:'space-around',
          padding:'0 4px',
          boxShadow:'0 10px 24px rgba(0,0,0,0.45)',
          zIndex:20,
        }}>
          {tabDefs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex:1,
                  display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', gap:4,
                  height:52,
                  cursor:'pointer',
                  userSelect:'none',
                  color: active ? GOLD : 'rgba(228,242,255,0.55)',
                  transition:'color 0.15s ease',
                }}
              >
                {/* 공유 글리프 모티프(골드 노브)를 액티브 인디케이터로 재사용 */}
                <div style={{
                  width:5, height:5, borderRadius:'50%',
                  background: active ? GOLD : 'transparent',
                  marginBottom:1,
                }}/>
                {tab.icon}
                <span style={{ fontSize:10.5, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  {tab.id}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
