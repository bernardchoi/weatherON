// WeatherON 사내 제안 PPT - 슬라이드 1~10
// 표지, 목차, 핵심컨셉, 핵심기능요약, 목적지날씨, 출발시간역산, 신발추천, 우산추천, 코디엔진, 알림체계

const {
  COLORS, FONT_HEAD, FONT_BODY, FONT_MONO, SLIDE_W, SLIDE_H,
  softShadow, addBgSlide, addFooter, addHeader, addCoverSlide,
  addBullets, addFeatureCard, addStat,
} = require('./theme');

function buildSlides01_10(pptx) {
  // ───────────────────────────────────────────────
  // Slide 1 · Cover
  // ───────────────────────────────────────────────
  addCoverSlide(pptx, {
    eyebrow: 'INTERNAL PRODUCT PROPOSAL · 2026.06',
    title: '날씨를 보여주는 앱이 아니라, 오늘을 대신 결정해주는 앱',
    sub: '목적지 날씨 비교, 출발시간 역산, 신발·우산·코디 추천, AI 장소 추천까지 — 열면 5초 안에 오늘 준비가 끝나는 라이프스타일 날씨 앱 제안',
    tags: ['목적지 날씨', '출발시간 역산', '신발 추천', 'AI 코디 엔진', '여행 플래너', '수익화 로드맵'],
    meta: 'WeatherON App Product Plan v4.0 · Prepared by Daehyeon Choi · 2026.06.15',
  });

  // ───────────────────────────────────────────────
  // Slide 2 · 목차
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, 'CONTENTS', '목차');

    const parts = [
      {
        no: 'PART 1',
        title: '서비스 핵심 가치',
        range: 'P.03 – 10',
        items: ['핵심 컨셉 — "오늘 준비를 빠르게"', '핵심 기능 한눈에 보기', '목적지 날씨 비교', '출발시간 역산 알림', '신발 추천 매트릭스', '우산 추천 알고리즘', '스타일 · 코디 엔진', '알림 체계'],
        color: COLORS.gold,
      },
      {
        no: 'PART 2',
        title: 'UX 고도화 & 신규 기능',
        range: 'P.11 – 20',
        items: ['UX 흐름 5단계', 'v3 변경사항 (전략 재검토)', '장소 카테고리 확장', 'UX 방향 & 탭 구조 · 여행 플래너', 'AI 위치 추천 카드'],
        color: COLORS.sky,
      },
      {
        no: 'PART 3',
        title: '사업화 전략 & 수익 모델',
        range: 'P.16 – 20',
        items: ['수익 모델 5-Phase 로드맵', '브랜드 파트너십 우선순위', 'AdMob 광고 수익화 준비', '광고 배치 정책 & 도입 일정'],
        color: COLORS.teal,
      },
      {
        no: 'PART 4',
        title: '기술 · 보안 · 종합 제안',
        range: 'P.21 – 29',
        items: ['기술 스택 & API 아키텍처', 'API 비용 시뮬레이션', '인증 & 보안 시스템', '회원가입 · 로그인 플로우', '개발 로드맵 5-Phase', '기존 날씨 앱과의 차별점', '종합 요약 · Next Steps · 클로징'],
        color: COLORS.red,
      },
    ];

    const colW = 4.35, gapX = 0.2, colH = 1.78, gapY = 0.18;
    const startX = 0.5, startY = 1.5;
    parts.forEach((p, idx) => {
      const col = idx % 2, row = Math.floor(idx / 2);
      const x = startX + col * (colW + gapX);
      const y = startY + row * (colH + gapY);
      s.addShape('roundRect', {
        x, y, w: colW, h: colH, rectRadius: 0.07,
        fill: { color: COLORS.bgPanel },
        line: { color: COLORS.border, width: 1 },
        shadow: softShadow(),
      });
      s.addShape('rect', { x, y, w: 0.06, h: colH, fill: { color: p.color }, line: { type: 'none' } });
      s.addText(p.no, {
        x: x + 0.2, y: y + 0.13, w: 1.5, h: 0.26,
        fontFace: FONT_MONO, fontSize: 10, color: p.color, charSpacing: 2, bold: true,
      });
      s.addText(p.range, {
        x: x + colW - 1.5, y: y + 0.13, w: 1.3, h: 0.26,
        fontFace: FONT_MONO, fontSize: 10, color: COLORS.textSub, align: 'right',
      });
      s.addText(p.title, {
        x: x + 0.2, y: y + 0.38, w: colW - 0.4, h: 0.34,
        fontFace: FONT_HEAD, fontSize: 15, bold: true, color: COLORS.textDark,
      });
      s.addText(p.items.join('   ·   '), {
        x: x + 0.2, y: y + 0.74, w: colW - 0.4, h: colH - 0.84,
        fontFace: FONT_BODY, fontSize: 9.5, color: COLORS.textSub, lineSpacingMultiple: 1.35,
        valign: 'top',
      });
    });

    addFooter(s, 2);
  }

  // ───────────────────────────────────────────────
  // Slide 3 · 핵심 컨셉 (Overview)
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.navy);
    s.addShape('rect', { x: 0, y: 0, w: SLIDE_W, h: 0.08, fill: { color: COLORS.gold }, line: { type: 'none' } });

    s.addText('CORE CONCEPT', {
      x: 0.7, y: 0.55, w: 8.6, h: 0.35,
      fontFace: FONT_MONO, fontSize: 12, color: COLORS.sky, charSpacing: 2,
    });
    s.addText('날씨 정보를 "제공"하지 않습니다.\n오늘의 행동을 "결정"해 줍니다.', {
      x: 0.7, y: 0.95, w: 8.6, h: 1.5,
      fontFace: FONT_HEAD, fontSize: 30, bold: true, color: COLORS.white, lineSpacingMultiple: 1.2,
    });
    s.addText('기존 날씨 앱은 온도·강수확률 같은 "숫자"를 보여줍니다. WeatherON은 그 숫자를 사용자의 하루 — 무엇을 입고, 언제 나가고, 어떤 신발을 신고, 우산이 필요한지 — 에 대한 구체적인 답으로 변환해 제시합니다.', {
      x: 0.7, y: 2.55, w: 8.6, h: 0.8,
      fontFace: FONT_BODY, fontSize: 13, color: '9FB3D1', lineSpacingMultiple: 1.35,
    });

    // Stat row
    const stats = [
      { value: '5초', label: '홈 화면에서\n오늘 준비 완료' },
      { value: '5가지', label: '코디·우산·신발·\n출발시간·AI추천' },
      { value: '1탭', label: '목적지 등록만으로\n전체 자동화' },
      { value: '0원', label: '핵심 기능은\n비회원도 무료' },
    ];
    const sw = 1.95, sh = 1.1, sgap = 0.18;
    stats.forEach((st, i) => {
      addStat(s, { x: 0.7 + i * (sw + sgap), y: 3.6, w: sw, h: sh, value: st.value, label: st.label, color: COLORS.gold });
    });

    addFooter(s, 3, { dark: true });
  }

  // ───────────────────────────────────────────────
  // Slide 4 · 핵심 기능 한눈에 보기
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '01 · OVERVIEW', '핵심 기능 한눈에 보기');

    const features = [
      { icon: '🌍', iconBg: COLORS.sky, title: '목적지 날씨 비교', body: '출발지 ↔ 목적지 날씨를 한 화면에서 비교. 자주 가는 곳은 저장해 즉시 확인.' },
      { icon: '⏰', iconBg: COLORS.gold, title: '출발시간 역산 알림', body: '도착 목표 시간 + 이동 소요시간을 계산해 "몇 시에 나가야 하는지" 역산 알림.' },
      { icon: '👟', iconBg: COLORS.teal, title: '신발 추천', body: '목적지 날씨 × 코디 × 스타일을 종합해 신발을 특정, 출발 10분 전 알림.' },
      { icon: '☂️', iconBg: COLORS.sky, title: '우산 추천 알고리즘', body: '강수확률 숫자가 아닌 "우산 종류·크기 + 이유"를 목적지 기준으로 제안.' },
      { icon: '👗', iconBg: COLORS.gold, title: '스타일 · 코디 엔진', body: '스타일 태그 기반 룰 + AI 모델로 날씨에 맞는 코디를 추천.' },
      { icon: '🔔', iconBg: COLORS.teal, title: '알림 체계', body: '날씨·코디·신발 알림(목적지 불필요) + 출발시각·긴급 변화 알림(목적지 등록 시).' },
    ];

    const cw = 2.95, ch = 1.7, gx = 0.18, gy = 0.18;
    features.forEach((f, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      addFeatureCard(s, {
        x: 0.5 + col * (cw + gx), y: 1.55 + row * (ch + gy), w: cw, h: ch,
        icon: f.icon, iconBg: f.iconBg, title: f.title, body: f.body,
      });
    });

    addFooter(s, 4);
  }

  // ───────────────────────────────────────────────
  // Slide 5 · 목적지 날씨 비교
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '03 · DESTINATION WEATHER', '목적지 날씨 비교');

    addBullets(s, [
      { text: '출발지(현재 위치)와 목적지의 날씨를 하나의 비교 카드로 동시에 표시', bold: true },
      { text: '온도차·강수 여부·체감 변화를 즉시 인지 → 옷차림·우산 판단의 기준점 제공' },
      { text: '자주 가는 장소(회사, 학교, 자주 만나는 약속 장소 등)는 즐겨찾기로 저장해 홈에서 바로 확인' },
      { text: '국내/해외 자동 판별 — 카카오 Local API(국내) ↔ Google Maps Geocoding(해외)로 API 자동 전환', color: COLORS.textSub, fontSize: 12 },
      { text: '이후 등장하는 출발시간 역산·신발 추천·짐 체크리스트(해외)는 모두 이 목적지 정보를 기반으로 동작', bold: true, color: COLORS.sky },
    ], { x: 0.7, y: 1.55, w: 5.5, h: 3.5, fontSize: 13.5, paraSpaceAfter: 11 });

    // Right side: visual comparison card mock
    const cx = 6.5, cy = 1.6, cw = 3.0;
    s.addShape('roundRect', { x: cx, y: cy, w: cw, h: 3.45, rectRadius: 0.08, fill: { color: COLORS.navy }, line: { type: 'none' }, shadow: softShadow() });
    s.addText('오늘의 날씨 비교', { x: cx + 0.2, y: cy + 0.18, w: cw - 0.4, h: 0.3, fontFace: FONT_BODY, fontSize: 11, color: '9FB3D1' });

    const rows = [
      { label: '📍 현재 위치 · 삼성동', temp: '23°', desc: '맑음 · 강수 0%' },
      { label: '🏢 목적지 · 강남역', temp: '21°', desc: '구름 조금 · 강수 20%' },
    ];
    rows.forEach((r, i) => {
      const ry = cy + 0.65 + i * 1.2;
      s.addShape('roundRect', { x: cx + 0.18, y: ry, w: cw - 0.36, h: 1.0, rectRadius: 0.06, fill: { color: COLORS.navy2 }, line: { type: 'none' } });
      s.addText(r.label, { x: cx + 0.35, y: ry + 0.12, w: cw - 0.7, h: 0.28, fontFace: FONT_BODY, fontSize: 11.5, color: COLORS.white, bold: true });
      s.addText(r.temp, { x: cx + 0.35, y: ry + 0.4, w: 1.2, h: 0.5, fontFace: FONT_MONO, fontSize: 26, bold: true, color: COLORS.gold });
      s.addText(r.desc, { x: cx + 0.35, y: ry + 0.78, w: cw - 0.7, h: 0.22, fontFace: FONT_BODY, fontSize: 10, color: '9FB3D1' });
    });
    s.addText('→ 2°C 차이 · 비 가능성 있음 → 우산·신발 추천에 반영', {
      x: cx + 0.18, y: cy + 3.05, w: cw - 0.36, h: 0.35,
      fontFace: FONT_BODY, fontSize: 10, color: COLORS.gold, italic: true,
    });

    addFooter(s, 5);
  }

  // ───────────────────────────────────────────────
  // Slide 6 · 출발시간 역산
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '04 · DEPARTURE CALCULATION', '출발시간 역산 알림');

    s.addText('"몇 시에 나가야 하지?" — 매일 반복되는 고민을 자동 계산', {
      x: 0.7, y: 1.5, w: 8.6, h: 0.4,
      fontFace: FONT_HEAD, fontSize: 15, bold: true, color: COLORS.textDark,
    });

    // Flow steps
    const steps = [
      { t: '도착 목표 시간 입력', d: '"10시까지 강남역 도착"' },
      { t: '목적지 소요시간 계산', d: '카카오 Directions API(국내)\n· 고정값(해외)' },
      { t: '출발 시각 역산', d: '소요시간 + 여유시간\n→ 출발 시각 자동 계산' },
      { t: '역산 알림 발송', d: '출발 시각에 맞춰\nFCM/APNs 푸시 알림' },
    ];
    const stepW = 2.05, stepH = 1.7, gap = 0.18;
    steps.forEach((st, i) => {
      const x = 0.7 + i * (stepW + gap);
      s.addShape('roundRect', { x, y: 2.1, w: stepW, h: stepH, rectRadius: 0.07, fill: { color: COLORS.bgPanel }, line: { color: COLORS.border, width: 1 }, shadow: softShadow() });
      s.addShape('ellipse', { x: x + 0.15, y: 2.25, w: 0.4, h: 0.4, fill: { color: COLORS.gold }, line: { type: 'none' } });
      s.addText(String(i + 1), { x: x + 0.15, y: 2.25, w: 0.4, h: 0.4, fontFace: FONT_MONO, fontSize: 14, bold: true, color: COLORS.white, align: 'center', valign: 'middle' });
      s.addText(st.t, { x: x + 0.15, y: 2.75, w: stepW - 0.3, h: 0.45, fontFace: FONT_HEAD, fontSize: 11.5, bold: true, color: COLORS.textDark });
      s.addText(st.d, { x: x + 0.15, y: 3.2, w: stepW - 0.3, h: stepH - 1.3, fontFace: FONT_BODY, fontSize: 9.5, color: COLORS.textSub, lineSpacingMultiple: 1.2 });
      if (i < steps.length - 1) {
        s.addText('→', { x: x + stepW - 0.05, y: 2.7, w: 0.3, h: 0.4, fontFace: FONT_BODY, fontSize: 16, color: COLORS.border, align: 'center' });
      }
    });

    addBullets(s, [
      { text: '신발 추천·짐 체크리스트(여행)와 동일한 역산 로직을 공유 — 출발 10분 전 알림에 신발 정보 결합', },
      { text: '국내는 카카오 Directions API(일 1만건 무료), 해외는 고정값 → Phase 4부터 T-map 정밀 역산으로 고도화', color: COLORS.textSub, fontSize: 12 },
    ], { x: 0.7, y: 4.05, w: 8.6, h: 1.2, fontSize: 13 });

    addFooter(s, 6);
  }

  // ───────────────────────────────────────────────
  // Slide 7 · 신발 추천 매트릭스
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '05 · SHOE RECOMMENDATION', '신발 추천 매트릭스');

    addBullets(s, [
      { text: '국내외 날씨 앱 최초로 "신발"까지 추천하는 기능', bold: true, color: COLORS.gold },
      { text: '입력값 3가지를 종합 — ① 목적지 날씨(강수·노면 상태) ② 오늘의 코디(스타일 태그) ③ 사용자 스타일 선호' },
      { text: '결과는 JSON 매트릭스 기반 룰 엔진으로 신발 종류를 특정 (예: 레인부츠 / 워커 / 로우컷 스니커즈 등)' },
      { text: '출발 10분 전, 코디·우산 알림과 함께 신발 알림 발송 → 현관에서 다시 고민하지 않도록' },
    ], { x: 0.7, y: 1.55, w: 5.4, h: 3.4, fontSize: 13.5, paraSpaceAfter: 11 });

    // Matrix mock table
    const tx = 6.35, ty = 1.6, tw = 3.15;
    s.addShape('roundRect', { x: tx, y: ty, w: tw, h: 3.45, rectRadius: 0.08, fill: { color: COLORS.bgPanel }, line: { color: COLORS.border, width: 1 }, shadow: softShadow() });
    s.addText('신발 추천 매트릭스 (예시)', { x: tx + 0.18, y: ty + 0.15, w: tw - 0.36, h: 0.3, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: COLORS.textDark });

    const matrix = [
      { cond: '강수 70%↑ · 노면 젖음', shoe: '레인부츠 / 방수워커', color: COLORS.sky },
      { cond: '강수 30~70% · 흐림', shoe: '워커 / 방수 스니커즈', color: COLORS.teal },
      { cond: '강수 0~30% · 맑음', shoe: '로우컷 스니커즈', color: COLORS.gold },
      { cond: '한파 · 적설', shoe: '방한부츠 + 논슬립', color: COLORS.red },
    ];
    matrix.forEach((m, i) => {
      const ry = ty + 0.6 + i * 0.7;
      s.addShape('rect', { x: tx + 0.18, y: ry, w: 0.06, h: 0.55, fill: { color: m.color }, line: { type: 'none' } });
      s.addText(m.cond, { x: tx + 0.35, y: ry, w: tw - 0.55, h: 0.28, fontFace: FONT_BODY, fontSize: 10.5, color: COLORS.textSub });
      s.addText(m.shoe, { x: tx + 0.35, y: ry + 0.26, w: tw - 0.55, h: 0.28, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: COLORS.textDark });
    });

    addFooter(s, 7);
  }

  // ───────────────────────────────────────────────
  // Slide 8 · 우산 추천 알고리즘
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '06 · UMBRELLA ALGORITHM', '우산 추천 알고리즘');

    addBullets(s, [
      { text: '기존 앱: "강수확률 60%" 라는 숫자만 제시 → 사용자가 직접 판단', color: COLORS.textSub },
      { text: 'WeatherON: 우산의 종류·크기 + 그 이유를 제시', bold: true, color: COLORS.gold },
    ], { x: 0.7, y: 1.5, w: 8.6, h: 0.9, fontSize: 13.5, paraSpaceAfter: 8 });

    // Comparison cards
    const cards = [
      { title: '😶 기존 날씨 앱', sub: '강수확률 60%', desc: '판단은 사용자 몫. 우산을 챙길지, 어떤 우산을 챙길지 알 수 없음.', color: COLORS.border, dark: false },
      { title: '☂️ WeatherON', sub: '장우산 추천', desc: '오후 3시부터 강한 비(시간당 10mm↑) 예상 · 목적지(강남역)는 강수 지속 → 장우산 권장. 외출 1~3시간 전 사전 알림.', color: COLORS.gold, dark: true },
    ];
    cards.forEach((c, i) => {
      const x = 0.7 + i * 4.5;
      s.addShape('roundRect', { x, y: 2.55, w: 4.3, h: 2.4, rectRadius: 0.08, fill: { color: c.dark ? COLORS.navy : COLORS.bgPanel }, line: { color: c.dark ? COLORS.gold : COLORS.border, width: c.dark ? 1.5 : 1 }, shadow: softShadow() });
      s.addText(c.title, { x: x + 0.25, y: 2.78, w: 3.8, h: 0.35, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: c.dark ? COLORS.white : COLORS.textDark });
      s.addText(c.sub, { x: x + 0.25, y: 3.15, w: 3.8, h: 0.5, fontFace: FONT_MONO, fontSize: 22, bold: true, color: c.dark ? COLORS.gold : COLORS.textSub });
      s.addText(c.desc, { x: x + 0.25, y: 3.7, w: 3.8, h: 1.1, fontFace: FONT_BODY, fontSize: 11, color: c.dark ? '9FB3D1' : COLORS.textSub, lineSpacingMultiple: 1.3 });
    });

    addFooter(s, 8);
  }

  // ───────────────────────────────────────────────
  // Slide 9 · 스타일 · 코디 엔진
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '07 · STYLE ENGINE', '스타일 · 코디 엔진');

    addBullets(s, [
      { text: '온보딩에서 선택한 스타일 태그(예: 캐주얼, 미니멀, 스트릿 등) 기반 1차 룰 엔진으로 기본 코디 제시', bold: true },
      { text: '날씨 구간(5단계 온도·강수 구간)별로 사전 정의된 코디 룰을 1차 매칭' },
      { text: 'AI 모델이 날씨·시간·사용자 취향을 종합해 "오늘 이 날씨엔" 코디 한 줄 설명을 생성 — 단순 추천이 아닌 이유가 있는 제안' },
      { text: '신발 추천(05) · 우산 추천(06) 결과와 결합되어 홈 화면 하나의 카드로 완결' },
      { text: 'Phase 3부터 코디 히스토리 기반 개인화 고도화 — 사용자가 실제 선택한 코디를 학습', color: COLORS.textSub, fontSize: 12 },
    ], { x: 0.7, y: 1.55, w: 5.5, h: 3.5, fontSize: 13.5, paraSpaceAfter: 10 });

    // Right: rule -> AI flow
    const rx = 6.4, ry = 1.6, rw = 3.1;
    s.addShape('roundRect', { x: rx, y: ry, w: rw, h: 1.55, rectRadius: 0.08, fill: { color: COLORS.bgPanel }, line: { color: COLORS.border, width: 1 }, shadow: softShadow() });
    s.addText('1차 · 룰 엔진', { x: rx + 0.2, y: ry + 0.15, w: rw - 0.4, h: 0.3, fontFace: FONT_MONO, fontSize: 10, color: COLORS.sky, charSpacing: 1 });
    s.addText('날씨 구간 × 스타일 태그\n→ 기본 코디 매칭', { x: rx + 0.2, y: ry + 0.45, w: rw - 0.4, h: 1.0, fontFace: FONT_HEAD, fontSize: 13, bold: true, color: COLORS.textDark, lineSpacingMultiple: 1.3 });

    s.addText('↓', { x: rx + rw / 2 - 0.15, y: ry + 1.6, w: 0.3, h: 0.35, fontFace: FONT_BODY, fontSize: 18, color: COLORS.border, align: 'center' });

    s.addShape('roundRect', { x: rx, y: ry + 2.0, w: rw, h: 1.45, rectRadius: 0.08, fill: { color: COLORS.navy }, line: { type: 'none' }, shadow: softShadow() });
    s.addText('2차 · AI 모델', { x: rx + 0.2, y: ry + 2.15, w: rw - 0.4, h: 0.3, fontFace: FONT_MONO, fontSize: 10, color: COLORS.gold, charSpacing: 1 });
    s.addText('"오늘 이 날씨엔 트렌치코트 +\n슬랙스 어떠세요?" — 이유 포함\n한 줄 추천 생성', { x: rx + 0.2, y: ry + 2.45, w: rw - 0.4, h: 0.95, fontFace: FONT_BODY, fontSize: 11, color: '9FB3D1', lineSpacingMultiple: 1.3 });

    addFooter(s, 9);
  }

  // ───────────────────────────────────────────────
  // Slide 10 · 알림 체계
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '08 · NOTIFICATION SYSTEM', '알림 체계');

    s.addText('기상 특보뿐 아니라, "오늘 무엇을 해야 하는지"까지 알려주는 알림', {
      x: 0.7, y: 1.5, w: 8.6, h: 0.4,
      fontFace: FONT_HEAD, fontSize: 15, bold: true, color: COLORS.textDark,
    });

    const cards = [
      { title: '🌤️ 기본 알림 (목적지 불필요)', items: ['설정한 외출 시간 기준 날씨·코디·신발 알림', '비 시작 1~3시간 전 사전 알림', '탭 시 강수 타임라인 페이지(그칠 시각·강도·행동 가이드)'], color: COLORS.sky },
      { title: '🎯 목적지 등록 시 추가', items: ['출발 시각 역산 알림 (04 연동)', '이동 중 긴급 날씨 변화 알림', '신발 알림(05)이 출발 10분 전 자동 결합'], color: COLORS.gold },
      { title: '⭐ 프리미엄 — 알림 고도화 (킬러 기능)', items: ['알림 시간·조건 고급 커스터마이징', '급변 상황 재알림', '구글 캘린더 연동 코디 캘린더', '7일 코디 플래닝'], color: COLORS.teal },
    ];
    cards.forEach((c, i) => {
      const x = 0.5 + i * 3.1;
      s.addShape('roundRect', { x, y: 2.05, w: 2.95, h: 3.05, rectRadius: 0.08, fill: { color: COLORS.bgPanel }, line: { color: COLORS.border, width: 1 }, shadow: softShadow() });
      s.addShape('rect', { x, y: 2.05, w: 2.95, h: 0.07, fill: { color: c.color }, line: { type: 'none' } });
      s.addText(c.title, { x: x + 0.18, y: 2.22, w: 2.6, h: 0.55, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: COLORS.textDark, lineSpacingMultiple: 1.15 });
      addBullets(s, c.items.map(t => ({ text: t, fontSize: 10.5 })), { x: x + 0.18, y: 2.85, w: 2.6, h: 2.1, fontSize: 10.5, paraSpaceAfter: 6, bulletColor: c.color });
    });

    addFooter(s, 10);
  }
}

module.exports = buildSlides01_10;
