import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────────────
   WeatherON — 하이브리드 크롬 UI Demo (H1 홈 메인)
   기준: brand/WeatherON_디자인_정체성_가이드.md 3장 + 4-1장(채택 항목)
   Brand-Native 버전(WeatherON_H1_brand_native_DEMO.jsx)을 베이스로,
   "구조적 chrome" 범위에서만 Liquid Glass / Material 메커니즘을 채택.
   항상 Navy/Gold/기능색 토큰으로 리틴트 — 브랜드 모먼트는 그대로 고정.

   채택한 것:
   - 바텀시트 블러(Navy 틴트) + 드래그 핸들 (Liquid Glass + Material)
   - 스프링 오버슈트 트랜지션 (Liquid Glass)
   - 연속 곡률(squircle 근사) 코너 (Liquid Glass)
   - 상태 레이어 프레스 틴트 = 리플 대체 (Material)
   - Navy 톤 스텝 엘리베이션 (Material 체계만, 컬러는 자체 토큰)

   채택하지 않은 것:
   - Material You 다이내믹 컬러, 시스템 기본 백색/그레이 틴트,
     FAB 원형 실루엣, 리플의 원형 확산 애니메이션, 일반화된 스페큘러 하이라이트.
   ───────────────────────────────────────────────────────────────────── */

/* ── Brand / Functional Color Tokens ── */
const NAVY      = '#1D5A86';
const NAVY_DARK = '#276A96';
const PANEL     = '#2B719D'; // L0 — 기본 카드 패널
const PANEL_L1  = '#3D87B5'; // L1 — 바텀시트 표면 (한 단계 위 톤)
const PANEL_L2  = '#55A0CA'; // L2 — 시트 내부 중첩 요소 (가장 위 톤)
const GOLD      = '#F0A020';
const SKY       = '#4A8FD4';
const CLEAR     = '#3ABFA0';
const MIST      = '#E4F2FF';

/* ── SVG Icon Helpers ───────────────────────────────────────────────── */
function SunSVG({ size = 68 }) {
  const rays = [
    [34,4,34,12],[34,56,34,64],[4,34,12,34],[56,34,64,34],
    [16.1,16.1,21.9,21.9],[46.1,46.1,51.9,51.9],
    [51.9,16.1,46.1,21.9],[21.9,46.1,16.1,51.9],
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 68 68" fill="none">
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

function CloseSVG() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="rgba(232,237,246,0.7)" strokeWidth={2.2}
      strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18"/>
      <line x1="18" y1="6" x2="6" y2="18"/>
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

/* ── 상태 레이어(state layer) 프레스 피드백 ──────────────────────────
   Material 리플의 "퍼지는 원" 애니메이션은 배제하고, 톤다운 틴트
   오버레이(opacity 0→0.12)만 채택 — 항상 Gold/기능색 토큰 사용. ── */
function usePressTint() {
  const [pressed, setPressed] = useState(false);
  return {
    pressed,
    handlers: {
      onMouseDown: () => setPressed(true),
      onMouseUp: () => setPressed(false),
      onMouseLeave: () => setPressed(false),
      onTouchStart: () => setPressed(true),
      onTouchEnd: () => setPressed(false),
    },
  };
}

function PressTintOverlay({ pressed, tint }) {
  return (
    <div style={{
      position:'absolute', inset:0,
      background: tint,
      opacity: pressed ? 0.12 : 0,
      transition:'opacity 0.12s ease',
      pointerEvents:'none',
    }}/>
  );
}

/* ── Brand Card — 연속 곡률(squircle 근사) 코너 + 상태 레이어 프레스 ── */
function BrandCard({ accent, children, style={}, onClick }) {
  const { pressed, handlers } = usePressTint();
  return (
    <div
      onClick={onClick}
      {...handlers}
      style={{
        background: PANEL,
        borderRadius: 20, // squircle 근사 — Liquid Glass 연속 곡률 채택
        padding: '14px 16px',
        position: 'relative',
        overflow: 'hidden', flexShrink: 0,
        boxShadow: '0 6px 16px rgba(0,0,0,0.30)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}>
      {accent && (
        <div style={{
          position:'absolute', top:0, left:0, bottom:0, width:3,
          background:accent,
        }}/>
      )}
      <PressTintOverlay pressed={pressed} tint={accent || GOLD}/>
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

/* ── 바텀시트 — Navy 틴트 블러(Liquid Glass) + 드래그 핸들(Material) +
     스프링 오버슈트 트랜지션(Liquid Glass) ── */
function PlaceSheet({ open, onClose }) {
  const cta = usePressTint();
  return (
    <>
      {/* 백드롭 — 시스템 백색이 아닌 Navy 틴트로 블러 */}
      <div onClick={onClose} style={{
        position:'absolute', inset:0,
        background:'rgba(21,41,77,0.55)',
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition:'opacity 0.28s ease',
        zIndex:40,
      }}/>

      {/* 시트 패널 */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0,
        height:392,
        background: `linear-gradient(180deg, ${PANEL_L1} 0%, ${NAVY_DARK} 100%)`,
        borderRadius:'28px 28px 0 0', // squircle 근사
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition:'transform 0.46s cubic-bezier(0.34,1.56,0.64,1)', // 스프링 오버슈트
        boxShadow:'0 -24px 60px rgba(0,0,0,0.55)',
        zIndex:41,
        padding:'14px 20px 28px',
        display:'flex', flexDirection:'column',
      }}>
        {/* 드래그 핸들 — Material 제스처 어포던스, 중립 톤(Mist) */}
        <div style={{
          width:36, height:4, borderRadius:2,
          background:'rgba(232,237,246,0.25)',
          margin:'0 auto 18px',
        }}/>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <span style={{ fontSize:15, fontWeight:700, color:'#fff', fontFamily:"'Noto Sans KR',sans-serif" }}>
            AI 장소 추천
          </span>
          <div onClick={onClose} style={{
            width:28, height:28, borderRadius:'50%',
            background: PANEL_L2,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer',
          }}>
            <CloseSVG/>
          </div>
        </div>

        {/* 시트 내부 중첩 카드 — Navy 톤 스텝(PANEL_L2)으로 한 단계 더 깊은 엘리베이션 표현 */}
        <div style={{
          background: PANEL_L2,
          borderRadius:18,
          padding:'14px 16px',
          marginBottom:10,
        }}>
          <div style={{ fontSize:10.5, fontWeight:600, color:SKY, marginBottom:4, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            ✦ 합정동 · 도보 6분
          </div>
          <div style={{ fontSize:14.5, fontWeight:700, color:'#fff', marginBottom:3, fontFamily:"'Noto Sans KR',sans-serif" }}>
            맑은 날 테라스 카페 BEST
          </div>
          <div style={{ fontSize:11.5, color:'rgba(232,237,246,0.62)', fontFamily:"'Noto Sans KR',sans-serif" }}>
            기온 22°C · 자외선 보통 · 야외석 추천
          </div>
        </div>

        <div style={{
          background: PANEL_L2,
          borderRadius:18,
          padding:'14px 16px',
          marginBottom:18,
        }}>
          <div style={{ fontSize:10.5, fontWeight:600, color:SKY, marginBottom:4, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            ✦ 망원동 · 도보 12분
          </div>
          <div style={{ fontSize:14.5, fontWeight:700, color:'#fff', marginBottom:3, fontFamily:"'Noto Sans KR',sans-serif" }}>
            한강뷰 피크닉 스팟
          </div>
          <div style={{ fontSize:11.5, color:'rgba(232,237,246,0.62)', fontFamily:"'Noto Sans KR',sans-serif" }}>
            기온 22°C · 바람 2.3m/s · 돗자리 챙기세요
          </div>
        </div>

        {/* 시트 내 CTA — 브랜드 모먼트 고정, 상태 레이어 프레스만 적용 */}
        <div
          {...cta.handlers}
          style={{
            height:48, borderRadius:18,
            background: GOLD,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', userSelect:'none',
            position:'relative', overflow:'hidden', flexShrink: 0,
          }}>
          <PressTintOverlay pressed={cta.pressed} tint={NAVY}/>
          <span style={{ fontSize:14, fontWeight:700, color:NAVY, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            장소 더보기
          </span>
        </div>
      </div>
    </>
  );
}

/* ── Main Mockup ────────────────────────────────────────────────────── */
export default function WeatherONHomeHybridChrome() {
  const [activeTab, setActiveTab] = useState('홈');
  const [sheetOpen, setSheetOpen] = useState(false);
  const ctaPress = usePressTint();

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
      <p style={{
        fontSize:11, fontWeight:500,
        color:'rgba(228,242,255,0.38)',
        letterSpacing:'1.6px',
        textTransform:'uppercase',
        fontFamily:'system-ui',
        textAlign:'center',
        maxWidth:393,
      }}>
        WeatherON · H1 홈 메인 · 하이브리드 크롬 (구조적 크롬만 브랜드 토큰으로 사용)
      </p>

      <div style={{
        width:393, height:852,
        borderRadius:40,
        overflow:'hidden',
        position:'relative', flexShrink: 0,
        background:`linear-gradient(175deg, ${NAVY} 0%, #1E3B6E 50%, #2C5491 100%)`,
        boxShadow:[
          '0 0 0 1.5px rgba(255,255,255,0.08)',
          '0 40px 80px rgba(0,0,0,0.70)',
          '0 8px 24px rgba(0,0,0,0.45)',
        ].join(','),
        fontFamily:"'Noto Sans KR',-apple-system,sans-serif",
        flexShrink:0,
      }}>

        <div style={{
          position:'absolute', top:80, left:'50%', transform:'translateX(-50%)',
          width:230, height:230,
          background:'radial-gradient(ellipse, rgba(240,160,32,0.14) 0%, transparent 70%)',
          pointerEvents:'none',
        }}/>

        {/* STATUS BAR */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:54,
          display:'flex', alignItems:'flex-end', justifyContent:'space-between',
          padding:'0 28px 10px',
          zIndex:20,
        }}>
          <span style={{ fontSize:15, fontWeight:700, color:'#fff', letterSpacing:'0.2px', fontFamily:"'DM Mono',monospace" }}>9:41</span>
          <StatusIcons/>
        </div>

        {/* 위치 HEADER */}
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

        {/* WEATHER HERO */}
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

        {/* 상세 PILLS */}
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

        {/* CARDS AREA */}
        <div style={{
          position:'absolute', top:403, left:20, right:20,
          display:'flex', flexDirection:'column', gap:11,
        }}>

          {/* AI 장소 추천 카드 — 탭하면 바텀시트 오픈 (구조적 chrome 데모) */}
          <BrandCard accent={SKY} style={{ paddingLeft:18 }} onClick={() => setSheetOpen(true)}>
            <div style={cardTag}>✦ AI 장소 추천</div>
            <div style={cardMain}>오늘 이 날씨엔 합정동 카페 어때요?</div>
            <div style={cardSub}>맑음 · 기온 22°C · 탭해서 더보기 →</div>
          </BrandCard>

          <BrandCard accent={CLEAR} style={{ paddingLeft:18 }}>
            <div style={cardTag}>👗 코디 추천</div>
            <div style={cardMain}>오늘은 얇은 가디건 추천해요</div>
            <div style={cardSub}>일교차 8°C · 코디 탭에서 자세히 보기 →</div>
          </BrandCard>

          {/* CWR 제보 버튼 — 브랜드 모먼트 고정, 상태 레이어 프레스만 적용 */}
          <div
            {...ctaPress.handlers}
            style={{
              height:52, borderRadius:18, // squircle 근사
              background: GOLD,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 8px 18px rgba(240,160,32,0.32)',
              cursor:'pointer', userSelect:'none',
              position:'relative', overflow:'hidden', flexShrink: 0,
            }}>
            <PressTintOverlay pressed={ctaPress.pressed} tint={NAVY}/>
            <span style={{ fontSize:15, fontWeight:700, color:NAVY, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              지금 날씨 제보하기
            </span>
          </div>
        </div>

        {/* TAB BAR — 탭별 상태 레이어 프레스 적용 */}
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
              <TabItem key={tab.id} tab={tab} active={active} onClick={() => setActiveTab(tab.id)}/>
            );
          })}
        </div>

        {/* 바텀시트 — Liquid Glass(블러+스프링) + Material(드래그 핸들) 구조적 chrome */}
        <PlaceSheet open={sheetOpen} onClose={() => setSheetOpen(false)}/>
      </div>
    </div>
  );
}

function TabItem({ tab, active, onClick }) {
  const { pressed, handlers } = usePressTint();
  return (
    <div
      onClick={onClick}
      {...handlers}
      style={{
        flex:1, height:52, position:'relative', overflow:'hidden', flexShrink: 0,
        borderRadius:14,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:4,
        cursor:'pointer', userSelect:'none',
        color: active ? GOLD : 'rgba(228,242,255,0.55)',
        transition:'color 0.15s ease',
      }}>
      <PressTintOverlay pressed={pressed} tint={GOLD}/>
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
}
