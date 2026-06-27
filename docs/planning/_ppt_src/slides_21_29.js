// WeatherON 사내 제안 PPT - 슬라이드 21~29
// 기술스택&API, API비용, 인증&보안, 가입/로그인 와이어프레임, 로드맵, 차별화비교,
// 종합요약, Next Steps, 클로징

const {
  COLORS, FONT_HEAD, FONT_BODY, FONT_MONO, FONT_WORD, SLIDE_W, SLIDE_H,
  softShadow, addBgSlide, addFooter, addHeader, addCoverSlide,
  addBullets, addFeatureCard, addStat,
} = require('./theme');

function buildSlides21_29(pptx) {
  // ───────────────────────────────────────────────
  // Slide 21 · 기술 스택 & API 아키텍처
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '15 · TECH STACK', '기술 스택 & API 아키텍처');

    // chip rows
    s.addText('FRONTEND · APP', { x: 0.7, y: 1.5, w: 4.3, h: 0.25, fontFace: FONT_MONO, fontSize: 10, color: COLORS.sky, charSpacing: 1 });
    const fe = ['React Native (채택)', 'Expo Dev Client / EAS', 'TypeScript', 'FCM / APNs (Push)'];
    fe.forEach((c, i) => {
      const x = 0.7 + (i % 2) * 2.25;
      const y = 1.78 + Math.floor(i / 2) * 0.42;
      s.addShape('roundRect', { x, y, w: 2.1, h: 0.34, rectRadius: 0.17, fill: { color: COLORS.bgPanel }, line: { color: COLORS.border, width: 1 } });
      s.addText(c, { x, y, w: 2.1, h: 0.34, fontFace: FONT_BODY, fontSize: 9.5, color: COLORS.textDark, align: 'center', valign: 'middle' });
    });

    s.addText('BACKEND · AI', { x: 5.2, y: 1.5, w: 4.3, h: 0.25, fontFace: FONT_MONO, fontSize: 10, color: COLORS.sky, charSpacing: 1 });
    const be = ['Cloud Functions (Node.js)', 'Firebase Auth', 'Firestore', 'Secret Manager', 'TypeScript 룰엔진(shared)'];
    be.forEach((c, i) => {
      const x = 5.2 + (i % 2) * 2.25;
      const y = 1.78 + Math.floor(i / 2) * 0.42;
      s.addShape('roundRect', { x, y, w: 2.1, h: 0.34, rectRadius: 0.17, fill: { color: COLORS.navy }, line: { type: 'none' } });
      s.addText(c, { x, y, w: 2.1, h: 0.34, fontFace: FONT_BODY, fontSize: 9, color: COLORS.white, align: 'center', valign: 'middle' });
    });

    // API auto-detect flow
    s.addText('📍 목적지 유형 자동 감지 — API 분기 아키텍처', { x: 0.7, y: 3.05, w: 8.6, h: 0.3, fontFace: FONT_MONO, fontSize: 11, color: COLORS.sky, charSpacing: 1 });

    const flow = [
      { t: '사용자 입력', d: '"강남역"\n"오사카 난바"', color: COLORS.bgPanel, tc: COLORS.textDark },
      { t: '국내/해외 판별', d: '카카오 API 1차검색\n→ 없으면 해외', color: 'FFF6E8', tc: COLORS.navy },
    ];
    let fx = 0.5;
    flow.forEach((f, i) => {
      const w = 1.55;
      s.addShape('roundRect', { x: fx, y: 3.5, w, h: 1.55, rectRadius: 0.06, fill: { color: f.color }, line: { color: COLORS.border, width: 1 } });
      s.addText(f.t, { x: fx + 0.08, y: 3.6, w: w - 0.16, h: 0.3, fontFace: FONT_HEAD, fontSize: 10.5, bold: true, color: f.tc });
      s.addText(f.d, { x: fx + 0.08, y: 3.95, w: w - 0.16, h: 1.0, fontFace: FONT_BODY, fontSize: 8.5, color: COLORS.textSub, lineSpacingMultiple: 1.3 });
      s.addText('→', { x: fx + w, y: 4.1, w: 0.25, h: 0.4, fontFace: FONT_BODY, fontSize: 14, color: COLORS.border, align: 'center' });
      fx += w + 0.25;
    });

    // 국내/해외 split
    const splitX = fx;
    s.addShape('roundRect', { x: splitX, y: 3.5, w: 3.0, h: 0.73, rectRadius: 0.06, fill: { color: 'E8F5EC' }, line: { color: COLORS.teal, width: 1 } });
    s.addText('🇰🇷 국내', { x: splitX + 0.1, y: 3.55, w: 1.0, h: 0.25, fontFace: FONT_HEAD, fontSize: 10, bold: true, color: '1A7050' });
    s.addText('카카오 Local/Directions · T-map(P4~) · Open-Meteo+KMA', { x: splitX + 0.1, y: 3.8, w: 2.85, h: 0.4, fontFace: FONT_BODY, fontSize: 8, color: '1A7050', lineSpacingMultiple: 1.2 });

    s.addShape('roundRect', { x: splitX, y: 4.32, w: 3.0, h: 0.73, rectRadius: 0.06, fill: { color: 'E8EEFF' }, line: { color: COLORS.sky, width: 1 } });
    s.addText('🌍 해외', { x: splitX + 0.1, y: 4.37, w: 1.0, h: 0.25, fontFace: FONT_HEAD, fontSize: 10, bold: true, color: '1A4090' });
    s.addText('Google Maps Geocoding · Open-Meteo 글로벌', { x: splitX + 0.1, y: 4.62, w: 2.85, h: 0.4, fontFace: FONT_BODY, fontSize: 8, color: '1A4090', lineSpacingMultiple: 1.2 });

    s.addText('→', { x: splitX + 3.05, y: 4.1, w: 0.25, h: 0.4, fontFace: FONT_BODY, fontSize: 14, color: COLORS.border, align: 'center' });

    s.addShape('roundRect', { x: splitX + 3.35, y: 3.5, w: 1.55, h: 1.55, rectRadius: 0.06, fill: { color: COLORS.navy }, line: { type: 'none' } });
    s.addText('결과 출력', { x: splitX + 3.43, y: 3.6, w: 1.4, h: 0.3, fontFace: FONT_HEAD, fontSize: 10.5, bold: true, color: COLORS.gold });
    s.addText('날씨비교\n코디·신발추천\n출발시간역산\n짐체크리스트', { x: splitX + 3.43, y: 3.95, w: 1.4, h: 1.0, fontFace: FONT_BODY, fontSize: 8.5, color: '9FB3D1', lineSpacingMultiple: 1.3 });

    addFooter(s, 21);
  }

  // ───────────────────────────────────────────────
  // Slide 22 · API 비용 요약 & Phase별 비용
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '15 · API COST', 'API 비용 요약 — "API 비용 ₩0"으로 시작');

    const headOpt = { fill: { color: COLORS.navy }, color: COLORS.white, fontFace: FONT_MONO, fontSize: 9.5, bold: false, align: 'left', valign: 'middle', margin: [1, 4, 1, 4] };
    const cellOpt = { fontFace: FONT_BODY, fontSize: 9.5, color: COLORS.textDark, valign: 'middle', margin: [1, 4, 1, 4] };
    const rows = [
      [
        { text: 'API', options: headOpt },
        { text: '용도', options: headOpt },
        { text: '무료 한도', options: { ...headOpt, align: 'center' } },
        { text: '초과 요금', options: { ...headOpt, align: 'center' } },
        { text: 'Phase', options: { ...headOpt, align: 'center' } },
      ],
      [
        { text: '카카오 Local API', options: { ...cellOpt, bold: true } },
        { text: '국내 장소 검색', options: { ...cellOpt, color: COLORS.textSub } },
        { text: '일 1만건', options: { ...cellOpt, align: 'center', color: COLORS.teal, bold: true } },
        { text: '건당 소액', options: { ...cellOpt, align: 'center', color: COLORS.textSub } },
        { text: 'P1~', options: { ...cellOpt, align: 'center' } },
      ],
      [
        { text: '카카오 Directions API', options: { ...cellOpt, bold: true } },
        { text: '국내 소요시간', options: { ...cellOpt, color: COLORS.textSub } },
        { text: '일 1만건', options: { ...cellOpt, align: 'center', color: COLORS.teal, bold: true } },
        { text: '건당 ₩8', options: { ...cellOpt, align: 'center', color: COLORS.textSub } },
        { text: 'P2~', options: { ...cellOpt, align: 'center' } },
      ],
      [
        { text: 'T-map API', options: { ...cellOpt, bold: true, color: COLORS.gold } },
        { text: '국내 정밀 소요시간', options: { ...cellOpt, color: COLORS.textSub } },
        { text: '일 1,000건', options: { ...cellOpt, align: 'center', color: COLORS.gold, bold: true } },
        { text: '건당 ₩10', options: { ...cellOpt, align: 'center', color: COLORS.textSub } },
        { text: 'P4~', options: { ...cellOpt, align: 'center' } },
      ],
      [
        { text: 'Google Maps Geocoding', options: { ...cellOpt, bold: true, color: COLORS.sky } },
        { text: '해외 장소 검색', options: { ...cellOpt, color: COLORS.textSub } },
        { text: '재산정 필요', options: { ...cellOpt, align: 'center', color: COLORS.sky, bold: true } },
        { text: '요금 확인', options: { ...cellOpt, align: 'center', color: COLORS.textSub } },
        { text: 'P3~', options: { ...cellOpt, align: 'center' } },
      ],
      [
        { text: 'Google Places API(선택)', options: { ...cellOpt, bold: true } },
        { text: '해외 POI 선택 확장', options: { ...cellOpt, color: COLORS.textSub } },
        { text: '사용량 기준', options: { ...cellOpt, align: 'center', color: COLORS.teal, bold: true } },
        { text: '요금 확인', options: { ...cellOpt, align: 'center', color: COLORS.textSub } },
        { text: 'P3~', options: { ...cellOpt, align: 'center' } },
      ],
      [
        { text: 'Open-Meteo', options: { ...cellOpt, bold: true, color: COLORS.teal } },
        { text: '국내+해외 날씨 전체', options: { ...cellOpt, color: COLORS.textSub } },
        { text: '무료 한도 기준', options: { ...cellOpt, align: 'center', color: COLORS.teal, bold: true } },
        { text: '—', options: { ...cellOpt, align: 'center', color: COLORS.textSub } },
        { text: 'P1~', options: { ...cellOpt, align: 'center' } },
      ],
    ];
    s.addTable(rows, {
      x: 0.5, y: 1.35, w: 9.0, h: 2.2,
      colW: [2.0, 2.5, 1.6, 1.6, 1.3],
      border: { type: 'solid', color: COLORS.border, pt: 0.5 },
      autoPage: false,
    });

    s.addText('💡 Phase별 예상 API 비용 (MAU 기준)', { x: 0.7, y: 3.78, w: 8.6, h: 0.28, fontFace: FONT_MONO, fontSize: 11, color: COLORS.sky, charSpacing: 1 });
    s.addShape('roundRect', { x: 0.5, y: 4.08, w: 9.0, h: 1.0, rectRadius: 0.06, fill: { color: COLORS.navy }, line: { type: 'none' } });
    const sims = [
      { t: 'Phase 1~2 (MAU ~5천)', d: '카카오 무료 범위 내 · Open-Meteo 무료', v: 'API 비용 ₩0', c: COLORS.teal },
      { t: 'Phase 3 (MAU ~1만)', d: 'Google Maps 사용량 기준 재산정', v: '재확인', c: COLORS.gold },
      { t: 'Phase 4~ (MAU 3만↑)', d: 'T-map 초과분 + Google Maps 사용량 증가', v: '재검토', c: COLORS.sky },
    ];
    sims.forEach((sm, i) => {
      const x = 0.7 + i * 3.0;
      s.addText(sm.t, { x, y: 4.17, w: 2.8, h: 0.25, fontFace: FONT_HEAD, fontSize: 10, bold: true, color: COLORS.white });
      s.addText(sm.d, { x, y: 4.42, w: 2.8, h: 0.3, fontFace: FONT_BODY, fontSize: 8.5, color: '9FB3D1', lineSpacingMultiple: 1.2 });
      s.addText(sm.v, { x, y: 4.72, w: 2.8, h: 0.25, fontFace: FONT_MONO, fontSize: 11, bold: true, color: sm.c });
    });

    addFooter(s, 22);
  }

  // ───────────────────────────────────────────────
  // Slide 23 · 인증 & 보안 시스템
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '16 · AUTH & SECURITY', '회원가입 & 인증 시스템');

    s.addText('기기 언어 자동 적용 후 계정 없이도 핵심 기능 사용 가능. 회원가입은 다기기 동기화·히스토리·여행플래너·구독을 위한 선택. 모든 인증은 OAuth 2.0 + PKCE, 토큰은 Keychain/Keystore에만 저장.', {
      x: 0.7, y: 1.3, w: 8.6, h: 0.4,
      fontFace: FONT_BODY, fontSize: 10.5, color: COLORS.textSub, lineSpacingMultiple: 1.25,
    });

    // Guest vs Member
    s.addShape('roundRect', { x: 0.5, y: 1.78, w: 4.4, h: 1.55, rectRadius: 0.07, fill: { color: COLORS.bgPanel }, line: { color: COLORS.border, width: 1 } });
    s.addText('👤 비회원 (Guest Mode)', { x: 0.65, y: 1.88, w: 4.1, h: 0.28, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: COLORS.textDark });
    addBullets(s, [
      { text: '현재 위치 날씨 + 코디 + 우산 추천', fontSize: 9.5 },
      { text: '외출 알림 기본 1개 · 비예보 사전 알림', fontSize: 9.5 },
      { text: 'AI 위치 추천(1~2곳)', fontSize: 9.5 },
      { text: '다기기 동기화·여행플래너·구독 불가', fontSize: 9.5, color: COLORS.textSub },
    ], { x: 0.65, y: 2.18, w: 4.1, h: 1.1, fontSize: 9.5, paraSpaceAfter: 3 });

    s.addShape('roundRect', { x: 5.1, y: 1.78, w: 4.4, h: 1.55, rectRadius: 0.07, fill: { color: COLORS.bgPanel }, line: { color: COLORS.gold, width: 1.5 } });
    s.addText('⭐ 회원 (Signed In)', { x: 5.25, y: 1.88, w: 4.1, h: 0.28, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: COLORS.gold });
    addBullets(s, [
      { text: 'Guest 기능 전체 포함 + 다기기 동기화', fontSize: 9.5 },
      { text: '코디 히스토리·여행플래너 저장', fontSize: 9.5 },
      { text: '날씨 인사이트 리포트 누적 · 프리미엄 구독', fontSize: 9.5 },
      { text: 'AI 추천 개인화(히스토리 기반) · 계정 즉시 삭제 지원', fontSize: 9.5 },
    ], { x: 5.25, y: 2.18, w: 4.1, h: 1.1, fontSize: 9.5, paraSpaceAfter: 3, bulletColor: COLORS.gold });

    // Region-adaptive auth
    s.addText('자동 추천 로그인 (언어는 기기 설정 유지 · OAuth 2.0 + PKCE)', { x: 0.7, y: 3.48, w: 8.6, h: 0.25, fontFace: FONT_MONO, fontSize: 10.5, color: COLORS.sky, charSpacing: 1 });
    const oauth = [
      { bg: 'FEE500', tc: '3C1E1E', t: '한국', d: '카카오 · 네이버 우선' },
      { bg: '06C755', tc: 'FFFFFF', t: '일본', d: 'LINE 우선 · Apple/Google 보조' },
      { bg: '4285F4', tc: 'FFFFFF', t: '일반 해외', d: 'Google · Apple · 이메일 코드' },
      { bg: '102140', tc: 'FFFFFF', t: '제외 범위', d: '중국권 등 특수 환경 별도' },
    ];
    oauth.forEach((o, i) => {
      const x = 0.5 + i * 2.27;
      s.addShape('roundRect', { x, y: 3.78, w: 2.12, h: 0.75, rectRadius: 0.06, fill: { color: o.bg }, line: { type: 'none' } });
      s.addText(o.t, { x, y: 3.85, w: 2.12, h: 0.3, fontFace: FONT_HEAD, fontSize: 11.5, bold: true, color: o.tc, align: 'center' });
      s.addText(o.d, { x, y: 4.13, w: 2.12, h: 0.35, fontFace: FONT_BODY, fontSize: 8.5, color: o.tc, align: 'center', lineSpacingMultiple: 1.2 });
    });

    // Security summary
    s.addShape('roundRect', { x: 0.5, y: 4.65, w: 9.0, h: 0.4, rectRadius: 0.05, fill: { color: COLORS.navy }, line: { type: 'none' } });
    s.addText('🔐 OAuth2.0+PKCE · Keychain/Keystore 전용 · Cert Pinning · 생체인증 · Rate Limiting(5회 실패시 30분 잠금) · 위치는 반경처리 후 전송 · 계정 즉시 삭제(GDPR/개인정보보호법)', {
      x: 0.65, y: 4.65, w: 8.7, h: 0.4, fontFace: FONT_BODY, fontSize: 8.5, color: '9FB3D1', valign: 'middle',
    });

    addFooter(s, 23);
  }

  // ───────────────────────────────────────────────
  // Slide 24 · 스플래시 & 계정 연결 와이어프레임
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '16-1 · WIREFRAME', '스플래시 & 계정 연결 화면 와이어프레임');

    const cards = [
      { no: '①', title: '언어 적용 & 스플래시', body: '기기 언어를 자동 적용한 뒤 브랜드 로고/워드마크를 노출하고 H1 홈(Guest)으로 바로 진입. 언어 선택을 가입 관문으로 만들지 않는다.' },
      { no: '②', title: 'Guest 홈', body: '현재위치 날씨·코디·우산·신발추천, 알림1개, AI 추천 1~2곳은 비회원도 즉시 이용. 코디/옷장/장소 저장·알림 추가·여행 저장은 잠금 표시.' },
      { no: '③', title: '계정 연결', body: '코디 저장, 옷장 저장, 장소 저장, 알림 추가, 여행 저장, 프리미엄 진입 시 호출. UI 언어는 유지하고 로그인 수단만 자동 추천+변경 제공.' },
      { no: '④', title: '약관·계정 관리', body: '최초 계정 연결 시 A3 약관 동의 후 원래 기능으로 복귀. A4/MY에서 연결계정·데이터내보내기·로그아웃·회원탈퇴 관리.' },
    ];
    cards.forEach((c, i) => {
      const x = 0.5 + i * 2.27;
      s.addShape('roundRect', { x, y: 1.5, w: 2.12, h: 2.55, rectRadius: 0.07, fill: { color: COLORS.bgPanel }, line: { color: COLORS.border, width: 1 }, shadow: softShadow() });
      s.addShape('ellipse', { x: x + 0.12, y: 1.62, w: 0.4, h: 0.4, fill: { color: COLORS.navy }, line: { type: 'none' } });
      s.addText(c.no, { x: x + 0.12, y: 1.62, w: 0.4, h: 0.4, fontFace: FONT_HEAD, fontSize: 13, bold: true, color: COLORS.gold, align: 'center', valign: 'middle' });
      s.addText(c.title, { x: x + 0.12, y: 2.08, w: 1.9, h: 0.3, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: COLORS.textDark });
      s.addText(c.body, { x: x + 0.12, y: 2.4, w: 1.9, h: 1.6, fontFace: FONT_BODY, fontSize: 8.5, color: COLORS.textSub, lineSpacingMultiple: 1.3 });
    });

    // flow
    s.addShape('roundRect', { x: 0.5, y: 4.05, w: 9.0, h: 0.95, rectRadius: 0.07, fill: { color: COLORS.navy }, line: { type: 'none' } });
    s.addText('화면 흐름 · 신규 사용자', { x: 0.7, y: 4.12, w: 8.6, h: 0.22, fontFace: FONT_MONO, fontSize: 9.5, color: '9FB3D1', charSpacing: 1 });
    const flow = ['① 언어적용\n기기 설정', '② 스플래시\n브랜드 노출', '③ 홈진입\nGuest 모드', '④ 계정필요\n저장·알림·여행', '⑤ 계정연결\n약관 후 복귀'];
    flow.forEach((f, i) => {
      const x = 0.7 + i * 1.78;
      const parts = f.split('\n');
      s.addText(parts[0], { x, y: 4.38, w: 1.7, h: 0.22, fontFace: FONT_HEAD, fontSize: 10.5, bold: true, color: COLORS.white, align: 'center' });
      s.addText(parts[1], { x, y: 4.62, w: 1.7, h: 0.35, fontFace: FONT_BODY, fontSize: 8, color: '9FB3D1', align: 'center', lineSpacingMultiple: 1.15 });
      if (i < flow.length - 1) {
        s.addText('→', { x: x + 1.7, y: 4.38, w: 0.18, h: 0.4, fontFace: FONT_BODY, fontSize: 12, color: COLORS.gold, align: 'center' });
      }
    });

    addFooter(s, 24);
  }

  // ───────────────────────────────────────────────
  // Slide 25 · 개발 로드맵 5-Phase
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.navy);
    s.addShape('rect', { x: 0, y: 0, w: SLIDE_W, h: 0.08, fill: { color: COLORS.gold }, line: { type: 'none' } });
    s.addText('17 · ROADMAP', { x: 0.7, y: 0.5, w: 8.6, h: 0.32, fontFace: FONT_MONO, fontSize: 12, color: COLORS.sky, charSpacing: 2 });
    s.addText('개발 로드맵 — v5 (ON Square Lite 동시 출시)', { x: 0.7, y: 0.82, w: 8.6, h: 0.5, fontFace: FONT_HEAD, fontSize: 24, bold: true, color: COLORS.white });

    const phases = [
      { ph: 'Phase 1', m: 'M1~3', t: 'MVP — 핵심 날씨 + ON Square Lite', tasks: '날씨·우산·코디·알림, 인증·정책, 어필리에이트, ON Square Lite(2D Living Mascot Rive·6컴패니언·체크인·Note·리액션), 신고·차단·스팸 제한' },
      { ph: 'Phase 2', m: 'M4~6', t: '목적지 날씨 + 출발시간역산 + 신발알림', tasks: 'Directions/Local, AI 위치추천, 신발알림, 정식출시+ON Square Lite 동시공개+AdMob, 출시 후 Weather Mail·CP샵 순차 개발, MAU 5천' },
      { ph: 'Phase 3', m: 'M7~9', t: '스타일 개인화 + 프리미엄 구독(전환율 2~4%)', tasks: '스타일태그 온보딩, 맞춤코디 엔진, 구독(₩2,900/월), 알림고도화, 캘린더연동, 인사이트리포트, 해외여행플래너+Google Maps, 위젯커스터마이징, MAU 1만' },
      { ph: 'Phase 4', m: 'M10~12', t: '중소브랜드 제휴 + T-map 검토 + 장소카테고리 1단계', tasks: '레인부츠·방수화 협찬(락피쉬·HUNTER등), 타겟광고슬롯, 쇼핑탭 베타, T-map 전환검토, KBO야구장 카테고리(취소확률·자외선·유니폼코디)' },
      { ph: 'Phase 5', m: 'M13~', t: '대형 플랫폼 제휴 + 커머스 본격화', tasks: '무신사·지그재그 파트너십, 쇼핑탭 정식오픈(GMV수수료), 로컬브랜드 커머스, AI코디 고도화, T-map 프리미엄 연동(구독전용), MAU 3만 이상' },
    ];
    phases.forEach((p, i) => {
      const y = 1.5 + i * 0.74;
      s.addShape('roundRect', { x: 0.5, y, w: 9.0, h: 0.62, rectRadius: 0.05, fill: { color: COLORS.navy2 }, line: { type: 'none' } });
      s.addShape('rect', { x: 0.5, y, w: 0.06, h: 0.62, fill: { color: COLORS.gold }, line: { type: 'none' } });
      s.addText(`${p.ph}\n${p.m}`, { x: 0.65, y: y + 0.06, w: 1.1, h: 0.5, fontFace: FONT_MONO, fontSize: 10, bold: true, color: COLORS.gold, lineSpacingMultiple: 1.1, valign: 'middle' });
      s.addText(p.t, { x: 1.85, y: y + 0.06, w: 2.55, h: 0.5, fontFace: FONT_HEAD, fontSize: 10, bold: true, color: COLORS.white, valign: 'middle', lineSpacingMultiple: 1.05 });
      s.addText(p.tasks, { x: 4.5, y: y + 0.06, w: 4.85, h: 0.5, fontFace: FONT_BODY, fontSize: 8, color: '9FB3D1', valign: 'middle', lineSpacingMultiple: 1.15 });
    });

    addFooter(s, 25, { dark: true });
  }

  // ───────────────────────────────────────────────
  // Slide 26 · 차별화 비교표
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '18 · DIFFERENTIATION', '기존 날씨 앱과의 차별점');

    const headOpt = { fill: { color: COLORS.navy }, color: COLORS.white, fontFace: FONT_HEAD, fontSize: 8.5, bold: true, align: 'left', valign: 'middle', margin: [1, 3, 1, 3] };
    const labelOpt = { fontFace: FONT_HEAD, fontSize: 8, bold: true, color: COLORS.textDark, valign: 'middle', fill: { color: 'F4F7FB' }, margin: [1, 3, 1, 3] };
    const oldOpt = { fontFace: FONT_BODY, fontSize: 7.5, color: COLORS.textSub, valign: 'middle', margin: [1, 3, 1, 3] };
    const newOpt = { fontFace: FONT_BODY, fontSize: 7.5, color: COLORS.textDark, valign: 'middle', margin: [1, 3, 1, 3] };

    const data = [
      ['핵심 역할', '날씨 수치 제공', '결정 제안 — 뭘 입고, 언제 나가고, 무슨 신발 신을지'],
      ['목적지 날씨', '없음(수동검색)', '출발지↔목적지 비교 카드, 저장 기능'],
      ['출발 시간', '없음', '도착목표시간+소요시간 → 출발시각 역산 알림'],
      ['신발 추천', '없음', '목적지날씨×코디×스타일 종합 → 신발 특정, 출발10분전 알림'],
      ['우산 추천', '강수확률 %만', '종류·크기+이유+목적지 기준 연동'],
      ['알림', '기상특보만', '날씨·코디·신발 알림 + 목적지등록시 출발시각·긴급변화 알림'],
      ['수익 모델', '단순광고/유료앱', '어필리에이트→구독→중소브랜드→대형콜라보 단계적 확장'],
      ['프리미엄 차별화', '광고 제거 정도', '알림고도화(킬러)·스타일개인화·인사이트리포트·해외여행플래너'],
      ['비예보 사전알림', '없음(특보만)', '비 시작 1~3시간전 사전알림 + 강수타임라인'],
      ['해외여행 준비', '없음', '다도시 일정→날짜별 날씨+코디+짐체크리스트 자동생성'],
      ['홈 화면 UX', '날씨 수치 나열', '"열면 5초안에 오늘 준비 끝" — 한 화면에서 완결'],
      ['AI 위치추천 카드', '없음', '"오늘 이 날씨에 딱 맞는 주변 장소" 이유포함 추천 (전무)'],
      ['인증/보안', '앱별 편차 큼', '지역맞춤 OAuth+Guest Mode·PKCE·Keychain·생체인증·Cert Pinning'],
    ];

    const rows = [
      [
        { text: '항목', options: headOpt },
        { text: '기존 날씨 앱', options: headOpt },
        { text: 'WeatherON', options: { ...headOpt, color: COLORS.gold } },
      ],
      ...data.map(([k, o, n]) => [
        { text: k, options: labelOpt },
        { text: o, options: oldOpt },
        { text: n, options: newOpt },
      ]),
    ];

    s.addTable(rows, {
      x: 0.4, y: 1.3, w: 9.2, h: 3.75,
      colW: [1.5, 2.3, 5.4],
      border: { type: 'solid', color: COLORS.border, pt: 0.5 },
      autoPage: false,
      valign: 'middle',
    });

    addFooter(s, 26);
  }

  // ───────────────────────────────────────────────
  // Slide 27 · 종합 요약
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.navy);
    s.addShape('rect', { x: 0, y: 0, w: SLIDE_W, h: 0.08, fill: { color: COLORS.teal }, line: { type: 'none' } });
    s.addText('SUMMARY', { x: 0.7, y: 0.5, w: 8.6, h: 0.32, fontFace: FONT_MONO, fontSize: 12, color: COLORS.sky, charSpacing: 2 });
    s.addText('종합 요약 — WeatherON이 제안하는 가치', { x: 0.7, y: 0.82, w: 8.6, h: 0.5, fontFace: FONT_HEAD, fontSize: 24, bold: true, color: COLORS.white });

    const cols = [
      {
        title: '🎯 제품 가치', color: COLORS.gold,
        items: ['날씨 "정보 제공"이 아닌 "오늘의 행동 결정"', '목적지 날씨·출발시간 역산·신발·우산·코디까지 5초 안에 완결', 'AI 위치추천·해외여행플래너 — 국내외 시장 전무한 기능'],
      },
      {
        title: '💰 수익 전략', color: COLORS.teal,
        items: ['Phase1 어필리에이트로 즉시 현금흐름 확보', 'Phase2~3 광고(AdMob)+구독(₩2,900/월)으로 확장', 'MAU 3만 이상 시 대형 플랫폼 제휴 협상력 확보'],
      },
      {
        title: '🔐 안정성', color: COLORS.sky,
        items: ['OAuth2.0+PKCE, Guest Mode로 진입장벽 최소화', 'AdMob 4대 필수 심사 항목 선제 대응', '기존 Node.js/Render 인프라 재사용 — 추가 비용 최소'],
      },
    ];
    cols.forEach((c, i) => {
      const x = 0.5 + i * 3.05;
      s.addShape('roundRect', { x, y: 1.55, w: 2.9, h: 3.6, rectRadius: 0.08, fill: { color: COLORS.navy2 }, line: { type: 'none' } });
      s.addShape('rect', { x, y: 1.55, w: 2.9, h: 0.06, fill: { color: c.color }, line: { type: 'none' } });
      s.addText(c.title, { x: x + 0.18, y: 1.75, w: 2.55, h: 0.4, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: COLORS.white });
      addBullets(s, c.items.map(t => ({ text: t, color: '9FB3D1', fontSize: 10.5 })), { x: x + 0.18, y: 2.25, w: 2.55, h: 2.8, fontSize: 10.5, paraSpaceAfter: 10, bulletColor: c.color });
    });

    addFooter(s, 27, { dark: true });
  }

  // ───────────────────────────────────────────────
  // Slide 28 · Next Steps / 제안
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, 'NEXT STEPS', '다음 단계 제안');

    s.addText('본 제안의 승인을 전제로, 아래 순서로 Phase 1(M1~M3) 착수를 제안합니다.', {
      x: 0.7, y: 1.5, w: 8.6, h: 0.35,
      fontFace: FONT_BODY, fontSize: 12.5, color: COLORS.textSub,
    });

    const steps = [
      { no: '01', t: '개발 리소스 배정', d: 'React Native + Expo 앱 1~2명, Firebase/Cloud Functions 백엔드 협업 인력 확정' },
      { no: '02', t: '법무·정책 문서 준비', d: '개인정보처리방침·이용약관·위치기반서비스 이용약관 — AdMob 심사 선제 대응' },
      { no: '03', t: 'API 키 및 도메인 확보', d: '카카오·Google Maps·Firebase·AdMob 계정 개설, weatheron.kr 도메인 등록' },
      { no: '04', t: 'Phase 1 MVP 개발 착수', d: '핵심 날씨 + ON Square Lite + 인증/정책 + 신고·차단·스팸 제한 (M1~M3)' },
      { no: '05', t: '베타 테스트 & 정식 출시 준비', d: '핵심 날씨·ON Square Lite 통합 베타 → 동시 출시, Mail·CP샵은 출시 후 순차 개발' },
    ];
    steps.forEach((st, i) => {
      const y = 2.0 + i * 0.66;
      s.addShape('roundRect', { x: 0.5, y, w: 9.0, h: 0.56, rectRadius: 0.06, fill: { color: COLORS.bgPanel }, line: { color: COLORS.border, width: 1 }, shadow: softShadow() });
      s.addShape('ellipse', { x: 0.62, y: y + 0.08, w: 0.4, h: 0.4, fill: { color: COLORS.gold }, line: { type: 'none' } });
      s.addText(st.no, { x: 0.62, y: y + 0.08, w: 0.4, h: 0.4, fontFace: FONT_MONO, fontSize: 10, bold: true, color: COLORS.white, align: 'center', valign: 'middle', margin: 0 });
      s.addText(st.t, { x: 1.2, y: y + 0.06, w: 2.5, h: 0.44, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: COLORS.textDark, valign: 'middle' });
      s.addText(st.d, { x: 3.8, y: y + 0.06, w: 5.55, h: 0.44, fontFace: FONT_BODY, fontSize: 10, color: COLORS.textSub, valign: 'middle', lineSpacingMultiple: 1.2 });
    });

    addFooter(s, 28);
  }

  // ───────────────────────────────────────────────
  // Slide 29 · 클로징
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.navy);

    s.addShape('ellipse', { x: 7.7, y: 0.55, w: 1.7, h: 1.7, fill: { color: COLORS.gold }, line: { type: 'none' } });
    s.addShape('ellipse', { x: 8.35, y: 1.2, w: 0.5, h: 0.5, fill: { color: COLORS.navy }, line: { type: 'none' } });
    s.addShape('ellipse', { x: 0.55, y: 0.65, w: 1.0, h: 0.6, fill: { color: COLORS.white }, line: { type: 'none' } });
    s.addShape('ellipse', { x: 1.15, y: 0.5, w: 0.75, h: 0.75, fill: { color: COLORS.white }, line: { type: 'none' } });
    s.addShape('ellipse', { x: 1.55, y: 0.7, w: 0.6, h: 0.5, fill: { color: COLORS.white }, line: { type: 'none' } });

    s.addShape('rect', { x: 0, y: 3.55, w: SLIDE_W, h: 0.02, fill: { color: COLORS.sky }, line: { type: 'none' } });

    s.addText(
      [
        { text: 'weather', options: { fontFace: FONT_WORD, fontSize: 60, color: COLORS.white, bold: false } },
        { text: 'ON', options: { fontFace: FONT_WORD, fontSize: 60, color: COLORS.gold, bold: true } },
      ],
      { x: 0.68, y: 2.0, w: 8.6, h: 1.1, align: 'left', fontFace: FONT_WORD }
    );

    s.addText('날씨를 보여주는 앱이 아니라, 오늘을 대신 결정해주는 앱', {
      x: 0.7, y: 3.15, w: 8.6, h: 0.4, fontFace: FONT_HEAD, fontSize: 16, bold: true, color: COLORS.white,
    });
    s.addText('검토해 주셔서 감사합니다. 제안에 대한 의견과 피드백을 기다립니다.', {
      x: 0.7, y: 3.62, w: 8.6, h: 0.35, fontFace: FONT_BODY, fontSize: 12.5, color: '9FB3D1',
    });

    s.addShape('roundRect', { x: 0.7, y: 4.4, w: 8.6, h: 0.65, rectRadius: 0.06, fill: { color: COLORS.navy2 }, line: { type: 'none' } });
    s.addText('Contact', { x: 0.9, y: 4.5, w: 1.5, h: 0.25, fontFace: FONT_MONO, fontSize: 9, color: COLORS.gold, charSpacing: 1 });
    s.addText('최대현 · daehyeon.choii@gmail.com · WeatherON App Product Plan v4.0', {
      x: 0.9, y: 4.75, w: 8.2, h: 0.25, fontFace: FONT_BODY, fontSize: 10.5, color: COLORS.white,
    });

    addFooter(s, 29, { dark: true });
  }
}

module.exports = buildSlides21_29;
