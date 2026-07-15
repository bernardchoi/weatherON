import { useState, useEffect } from "react";

/* ════════════════════════════════════════════════════════════════════
   PLATFORM-ADAPTIVE 예시 (H1 홈 기반)
   ────────────────────────────────────────────────────────────────────
   원칙: "비주얼 시스템"은 양 플랫폼 동일 유지, "인터랙션/컴포넌트 셰이프
   레이어"만 플랫폼 컨벤션에 맞게 분기.

   동일하게 유지되는 것 (WeatherON 브랜드 = 글래스):
     - 배경 그라디언트, 블러 카드(GlassCard), ambient blob, 타이포그래피
     - 탭바 컨테이너 자체(블러 유리 캡슐, 위치, 높이)

   플랫폼별로 분기되는 것 (인터랙션 레이어):
     - 탭 active 상태 표현: iOS = 반투명 글래스 캡슐 / Android = M3
       Expressive 톤 필 컬러 캡슐(채도 있는 강조색 + 진한 텍스트)
     - CTA 버튼 셰이프: iOS = 보더+specular 라인 / Android = 풀필렛(28px)
       + elevation 그림자(Material은 보더 대신 그림자로 깊이 표현)
   ════════════════════════════════════════════════════════════════════ */

/* ── SVG Icon Helpers ───────────────────────────────────────────────── */
function SunSVG() {
  const rays = [
    [34,4,34,12],[34,56,34,64],[4,34,12,34],[56,34,64,34],
    [16.1,16.1,21.9,21.9],[46.1,46.1,51.9,51.9],
    [51.9,16.1,46.1,21.9],[21.9,46.1,16.1,51.9],
  ];
  return (
    <svg width={68} height={68} viewBox="0 0 68 68" fill="none">
      <circle cx={34} cy={34} r={16} stroke="#F4C842" strokeWidth={3}/>
      {rays.map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#F4C842" strokeWidth={3} strokeLinecap="round"/>
      ))}
    </svg>
  );
}

function BellSVG() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke="rgba(255,255,255,0.80)" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}

/* ── Tab Icons ──────────────────────────────────────────────────────── */
const tabDefs = [
  { id:'홈', icon:(
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { id:'코디', icon:(
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
    </svg>
  )},
  { id:'출발', icon:(
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
    </svg>
  )},
  { id:'MY', icon:(
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )},
  { id:'소셜', icon:(
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  )},
];

/* ── Reusable Glass Card (플랫폼 무관 — 공통 비주얼) ─────────────────── */
function GlassCard({ alpha=0.10, blur=20, children, style={} }) {
  return (
    <div style={{
      background: `rgba(255,255,255,${alpha})`,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      border: '1px solid rgba(255,255,255,0.16)',
      borderRadius: 18,
      padding: '14px 16px',
      position: 'relative',
      overflow: 'hidden', flexShrink: 0,
      ...style,
    }}>
      <div style={{
        position:'absolute', top:0, left:'12%', right:'12%', height:1,
        background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.40),transparent)',
        pointerEvents:'none',
      }}/>
      {children}
    </div>
  );
}

/* ── Status Bar Icons ───────────────────────────────────────────────── */
function StatusIcons() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
      <svg width="18" height="13" viewBox="0 0 18 13" fill="rgba(255,255,255,0.88)">
        <rect x="0" y="8" width="3" height="5" rx="1"/>
        <rect x="5" y="5.5" width="3" height="7.5" rx="1"/>
        <rect x="10" y="3" width="3" height="10" rx="1"/>
        <rect x="15" y="0" width="3" height="13" rx="1"/>
      </svg>
      <svg width="16" height="12" viewBox="0 0 24 18" fill="none"
        stroke="rgba(255,255,255,0.88)" strokeWidth="2.5" strokeLinecap="round">
        <path d="M2 6C6.5 1.5 17.5 1.5 22 6"/>
        <path d="M5 10C8 7 16 7 19 10"/>
        <path d="M8.5 14C10 12.5 14 12.5 15.5 14"/>
        <circle cx="12" cy="17" r="1.5" fill="rgba(255,255,255,0.88)" stroke="none"/>
      </svg>
      <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
        <rect x="0.5" y="0.5" width="21" height="12" rx="2.5"
          stroke="rgba(255,255,255,0.60)" strokeWidth="1"/>
        <rect x="2" y="2" width="15" height="9" rx="1.5" fill="rgba(255,255,255,0.88)"/>
        <path d="M23 4v5a2.5 2.5 0 000-5z" fill="rgba(255,255,255,0.45)"/>
      </svg>
    </div>
  );
}

/* ── Main Mockup ────────────────────────────────────────────────────── */
export default function WeatherONHomePlatformAdaptive() {
  const [activeTab, setActiveTab] = useState('홈');
  const [platform, setPlatform] = useState('ios'); // 'ios' | 'android'
  const isIOS = platform === 'ios';

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@800&family=Noto+Sans+KR:wght@400;500;700&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch(_){} };
  }, []);

  const pills = [
    { icon:'💧', label:'습도 65%' },
    { icon:'🌬️', label:'2.3m/s' },
    { icon:'☀️', label:'UV 3' },
    { icon:'☔', label:'0mm' },
  ];

  const cardTag  = { fontSize:10.5, fontWeight:500, color:'#A8C4E0', letterSpacing:'0.3px', marginBottom:5 };
  const cardMain = { fontSize:15, fontWeight:700, color:'#fff', lineHeight:1.35, marginBottom:4 };
  const cardSub  = { fontSize:11.5, color:'rgba(228,242,255,0.72)' };

  return (
    <div style={{
      minHeight:'100vh',
      background:'#030810',
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      justifyContent:'center',
      gap:18,
      padding:'32px 20px',
    }}>
      {/* ── Page label ── */}
      <p style={{
        fontSize:11, fontWeight:500,
        color:'rgba(228,242,255,0.38)',
        letterSpacing:'1.8px',
        textTransform:'uppercase',
        fontFamily:'system-ui',
      }}>
        WeatherON · H1 홈 · Platform-Adaptive Demo
      </p>

      {/* ── Platform Toggle (데모 컨트롤 — 실제 앱 UI 아님) ── */}
      <div style={{
        display:'flex', gap:4,
        background:'rgba(255,255,255,0.06)',
        border:'1px solid rgba(255,255,255,0.12)',
        borderRadius:14, padding:4,
      }}>
        {['ios','android'].map(p => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            style={{
              padding:'7px 18px',
              borderRadius:10,
              border:'none',
              cursor:'pointer',
              fontSize:12.5, fontWeight:700,
              fontFamily:'system-ui',
              background: platform===p ? '#4ECBA3' : 'transparent',
              color: platform===p ? '#0B1E3D' : 'rgba(255,255,255,0.55)',
              transition:'all 0.18s',
            }}
          >
            {p === 'ios' ? '🍎 iOS · Liquid Glass' : '🤖 Android · M3 Expressive'}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          PHONE FRAME
      ════════════════════════════════════════════ */}
      <div style={{
        width:393, height:852,
        borderRadius:44,
        overflow:'hidden',
        position:'relative', flexShrink: 0,
        background:'linear-gradient(175deg,#0B1E3D 0%,#1A3A6B 44%,#2D5FA6 100%)',
        boxShadow:[
          '0 0 0 1.5px rgba(255,255,255,0.10)',
          '0 40px 80px rgba(0,0,0,0.75)',
          '0 8px 24px rgba(0,0,0,0.50)',
        ].join(','),
        fontFamily:"'Noto Sans KR',-apple-system,sans-serif",
        flexShrink:0,
      }}>

        {/* ── Ambient blobs (공통 비주얼) ── */}
        <div style={{ position:'absolute', top:50,  right:-40, width:220, height:220, borderRadius:'50%', background:'#1A3A6B', filter:'blur(56px)', opacity:0.60, pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:280, left:-30,  width:180, height:180, borderRadius:'50%', background:'#2D5FA6', filter:'blur(48px)', opacity:0.38, pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:100, right:-20, width:200, height:200, borderRadius:'50%', background:'#0A1E44', filter:'blur(48px)', opacity:0.55, pointerEvents:'none' }}/>

        <div style={{
          position:'absolute', top:80, left:'50%', transform:'translateX(-50%)',
          width:230, height:230,
          background:'radial-gradient(ellipse,rgba(244,200,66,0.18) 0%,transparent 70%)',
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
          <span style={{ fontSize:15, fontWeight:700, color:'#fff', letterSpacing:'0.2px' }}>9:41</span>
          <StatusIcons/>
        </div>

        {/* ════════════════
            위치 HEADER
        ════════════════ */}
        <div style={{
          position:'absolute', top:54, left:0, right:0, height:50,
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:10,
        }}>
          <div style={{
            display:'flex', alignItems:'center', gap:4,
            background:'rgba(255,255,255,0.09)',
            backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
            border:'1px solid rgba(255,255,255,0.12)',
            borderRadius:20, padding:'6px 14px',
          }}>
            <span style={{ fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.92)' }}>
              서울 마포구 합정동
            </span>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.50)', marginLeft:2 }}>▾</span>
          </div>
          <div style={{
            position:'absolute', right:20,
            width:36, height:36,
            background:'rgba(255,255,255,0.09)',
            border:'1px solid rgba(255,255,255,0.10)',
            borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <BellSVG/>
          </div>
        </div>

        {/* ═══════════════
            WEATHER HERO
        ═══════════════ */}
        <div style={{
          position:'absolute', top:108, left:0, right:0, height:230,
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
        }}>
          <div style={{ marginBottom:10 }}><SunSVG/></div>
          <div style={{
            fontFamily:"'Manrope',sans-serif",
            fontWeight:800, fontSize:84,
            color:'#fff', lineHeight:0.92,
            letterSpacing:'-4px',
          }}>
            22°
          </div>
          <div style={{ fontSize:17, fontWeight:400, color:'#A8C4E0', marginTop:10 }}>맑음</div>
          <div style={{ fontSize:12, color:'rgba(228,242,255,0.58)', marginTop:5 }}>
            체감 21° · 최고 26° · 최저 15°
          </div>
        </div>

        {/* ═════════════
            상세 PILLS
        ═════════════ */}
        <div style={{
          position:'absolute', top:344, left:0, right:0,
          display:'flex', justifyContent:'center', gap:7, padding:'0 16px',
        }}>
          {pills.map(p => (
            <div key={p.label} style={{
              display:'flex', alignItems:'center', gap:4,
              padding:'7px 11px',
              background:'rgba(255,255,255,0.13)',
              backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
              border:'1px solid rgba(255,255,255,0.18)',
              borderRadius:20,
            }}>
              <span style={{ fontSize:13 }}>{p.icon}</span>
              <span style={{ fontSize:11.5, fontWeight:500, color:'rgba(255,255,255,0.88)', whiteSpace:'nowrap' }}>
                {p.label}
              </span>
            </div>
          ))}
        </div>

        {/* ══════════════════════════
            CARDS AREA (공통 비주얼)
        ══════════════════════════ */}
        <div style={{
          position:'absolute', top:403, left:20, right:20,
          display:'flex', flexDirection:'column', gap:11,
        }}>

          <GlassCard alpha={0.09} blur={20}>
            <div style={cardTag}>✦ AI 장소 추천</div>
            <div style={cardMain}>오늘 이 날씨엔 합정동 카페 어때요?</div>
            <div style={cardSub}>☀ 맑음 · 기온 22°C · Gemini AI 추천</div>
          </GlassCard>

          <GlassCard alpha={0.11} blur={16}>
            <div style={cardTag}>👗 코디 추천</div>
            <div style={cardMain}>오늘은 얇은 가디건 추천해요 🧥</div>
            <div style={cardSub}>일교차 8°C · 코디 탭에서 자세히 보기 →</div>
          </GlassCard>

          {/* ── CTA 버튼: 플랫폼별 셰이프/깊이 표현 분기 ──
              iOS  : 보더 라인 + specular 하이라이트 (Liquid Glass 관습)
              Android : 풀필렛 28px + elevation 그림자 (Material은 보더 대신
                        그림자로 깊이를 표현, 더 표현적인 라운드 셰이프) */}
          <div style={{
            height:52,
            borderRadius: isIOS ? 14 : 28,
            background:'rgba(232,133,74,0.88)',
            backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
            border: isIOS ? '1px solid rgba(255,200,140,0.28)' : 'none',
            boxShadow: isIOS ? 'none' : '0 8px 18px rgba(232,133,74,0.42), 0 2px 4px rgba(232,133,74,0.30)',
            display:'flex', alignItems:'center', justifyContent:'center',
            position:'relative', overflow:'hidden', flexShrink: 0, cursor:'pointer',
            userSelect:'none',
            transition:'border-radius 0.2s, box-shadow 0.2s',
          }}>
            {isIOS && (
              <div style={{
                position:'absolute', top:0, left:'15%', right:'15%', height:1,
                background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.52),transparent)',
              }}/>
            )}
            <span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>
              ⚡&nbsp;&nbsp;지금 날씨 제보하기
            </span>
          </div>
        </div>

        {/* ═════════════════════════════════
            TAB BAR — 컨테이너(유리 캡슐)는 공통,
            active 표현만 플랫폼별 분기
        ═════════════════════════════════ */}
        <div style={{
          position:'absolute', bottom:18, left:16, right:16, height:68,
          background:'rgba(8,22,52,0.62)',
          backdropFilter:'blur(32px) saturate(180%)',
          WebkitBackdropFilter:'blur(32px) saturate(180%)',
          borderRadius:34,
          border:'1px solid rgba(255,255,255,0.13)',
          display:'flex', alignItems:'center', justifyContent:'space-around',
          padding:'0 4px',
          overflow:'hidden',
          zIndex:20,
        }}>
          <div style={{
            position:'absolute', top:0, left:'8%', right:'8%', height:1,
            background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)',
            pointerEvents:'none',
          }}/>

          {tabDefs.map(tab => {
            const active = activeTab === tab.id;

            /* ── iOS: 반투명 글래스 캡슐 (Liquid Glass) ── */
            const iosActiveBg = 'rgba(255,255,255,0.16)';
            const iosActiveBorder = '1px solid rgba(255,255,255,0.13)';
            const iosIconColor = active ? '#fff' : 'rgba(228,242,255,0.55)';

            /* ── Android: M3 Expressive 톤 필 캡슐 (채도 있는 강조색 채움) ── */
            const androidActiveBg = 'rgba(78,203,163,0.92)'; // fresh 토큰, 풀 채움
            const androidIconColor = active ? '#0B1E3D' : 'rgba(228,242,255,0.55)';

            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex:1,
                  display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', gap:3,
                  height:56,
                  borderRadius: isIOS ? 28 : (active ? 22 : 28),
                  cursor:'pointer',
                  position:'relative', zIndex:2,
                  background: active ? (isIOS ? iosActiveBg : androidActiveBg) : 'transparent',
                  border: active ? (isIOS ? iosActiveBorder : 'none') : '1px solid transparent',
                  boxShadow: (!isIOS && active) ? '0 4px 10px rgba(78,203,163,0.35)' : 'none',
                  transition:'all 0.22s ease',
                  userSelect:'none',
                }}
              >
                {/* iOS active capsule specular — Android는 보더/하이라이트 대신 그림자로 깊이 표현하므로 생략 */}
                {isIOS && active && (
                  <div style={{
                    position:'absolute', top:0, left:'18%', right:'18%', height:1,
                    background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.46),transparent)',
                  }}/>
                )}

                <div style={{ color: isIOS ? iosIconColor : androidIconColor, display:'flex', transition:'color 0.22s' }}>
                  {tab.icon}
                </div>

                <span style={{
                  fontSize:10, fontWeight: active ? 700 : 500,
                  color: isIOS ? iosIconColor : androidIconColor,
                  letterSpacing:'0.2px',
                  transition:'all 0.22s',
                }}>
                  {tab.id}
                </span>

                {/* iOS만 dot indicator 사용 — Android는 필 자체가 강조색이라 dot 불필요 */}
                {isIOS && active && (
                  <div style={{
                    position:'absolute', bottom:4,
                    width:3, height:3, borderRadius:'50%',
                    background:'rgba(255,255,255,0.72)',
                  }}/>
                )}
              </div>
            );
          })}
        </div>

      </div>{/* /phone */}

      <p style={{ fontSize:11, color:'rgba(228,242,255,0.30)', fontFamily:'system-ui', letterSpacing:'0.5px', maxWidth:340, textAlign:'center', lineHeight:1.6 }}>
        배경 · 카드 · 블러 · 타이포는 두 플랫폼 동일 — 탭 active 표현과 CTA 버튼 셰이프/깊이만 플랫폼 컨벤션에 맞춰 분기
      </p>
    </div>
  );
}
