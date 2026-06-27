// WeatherON 사내 제안 PPT - 슬라이드 11~20
// UX흐름, v4 신규 전략요소, 장소카테고리확장, UX방향&여행플래너, AI추천카드,
// 수익모델5Phase, 브랜드파트너십, AdMob체크리스트, 광고정책&일정, AdMob와이어프레임

const {
  COLORS, FONT_HEAD, FONT_BODY, FONT_MONO, SLIDE_W, SLIDE_H,
  softShadow, addBgSlide, addFooter, addHeader,
  addBullets, addFeatureCard, addStat,
} = require('./theme');

function buildSlides11_20(pptx) {
  // ───────────────────────────────────────────────
  // Slide 11 · UX 흐름 5단계
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '09 · UX FLOW', '사용자 여정 — 5단계 UX 흐름');

    s.addText('앱을 열고 닫기까지, 사용자는 "결정"을 위해 단 몇 번의 터치만 거칩니다.', {
      x: 0.7, y: 1.5, w: 8.6, h: 0.4,
      fontFace: FONT_HEAD, fontSize: 14, bold: true, color: COLORS.textDark,
    });

    const steps = [
      { no: '①', t: '앱 실행', d: '비회원(Guest)도 즉시 진입.\n위치 권한 허용 시 현재 위치\n날씨 자동 조회', color: COLORS.sky },
      { no: '②', t: '홈 — 오늘의 결정', d: '날씨 요약 · 코디 · 우산 ·\n신발 · 출발시간이 한 화면에\n완결 (5초 룰)', color: COLORS.gold },
      { no: '③', t: '목적지 등록 (선택)', d: '자주 가는 곳 저장 →\n출발시간 역산 ·\n목적지 날씨 비교 활성화', color: COLORS.teal },
      { no: '④', t: '알림 수신', d: '사전 알림(비 1~3시간 전) ·\n출발시각 알림 · 신발 알림\n(출발 10분 전)', color: COLORS.sky },
      { no: '⑤', t: '탭 이동 · 상세 확인', d: '코디 상세, 여행 플래너,\nAI 추천 장소, 마이페이지로\n자유롭게 이동', color: COLORS.gold },
    ];
    const w = 1.74, h = 2.55, gap = 0.12;
    steps.forEach((st, i) => {
      const x = 0.5 + i * (w + gap);
      s.addShape('roundRect', { x, y: 2.1, w, h, rectRadius: 0.07, fill: { color: COLORS.bgPanel }, line: { color: COLORS.border, width: 1 }, shadow: softShadow() });
      s.addShape('rect', { x, y: 2.1, w, h: 0.06, fill: { color: st.color }, line: { type: 'none' } });
      s.addText(st.no, { x: x + 0.12, y: 2.22, w: w - 0.24, h: 0.4, fontFace: FONT_MONO, fontSize: 20, bold: true, color: st.color });
      s.addText(st.t, { x: x + 0.12, y: 2.62, w: w - 0.24, h: 0.55, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: COLORS.textDark, lineSpacingMultiple: 1.1 });
      s.addText(st.d, { x: x + 0.12, y: 3.2, w: w - 0.24, h: h - 1.2, fontFace: FONT_BODY, fontSize: 9, color: COLORS.textSub, lineSpacingMultiple: 1.3 });
      if (i < steps.length - 1) {
        s.addText('→', { x: x + w - 0.02, y: 3.2, w: 0.28, h: 0.4, fontFace: FONT_BODY, fontSize: 14, color: COLORS.border, align: 'center' });
      }
    });

    addBullets(s, [
      { text: '핵심 원칙: 비회원도 핵심 흐름(②④) 전부 이용 가능 — 회원가입은 다기기 동기화·히스토리·구독을 위한 "선택"', color: COLORS.textSub, fontSize: 11.5 },
    ], { x: 0.7, y: 4.85, w: 8.6, h: 0.5, fontSize: 11.5 });

    addFooter(s, 11);
  }

  // ───────────────────────────────────────────────
  // Slide 12 · v4 핵심 신규 전략 요소
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, 'v3 → v4 · STRATEGY UPDATE', 'v4에서 새로 추가된 핵심 전략 요소');

    s.addText('기존 v3 기획에서 한 단계 더 — "결정 제안"을 넘어 새로운 사용 맥락과 수익 채널까지 확장합니다.', {
      x: 0.7, y: 1.5, w: 8.6, h: 0.4,
      fontFace: FONT_BODY, fontSize: 12.5, color: COLORS.textSub,
    });

    const items = [
      { icon: '⚾', iconBg: COLORS.teal, title: '장소 카테고리 확장', body: 'KBO 야구장 등 특화 장소 카테고리 — 경기 취소 확률, 좌석별 자외선, 유니폼 레이어링 코디 (Phase 4~)' },
      { icon: '🤖', iconBg: COLORS.sky, title: 'AI 위치 추천 카드', body: '현재 날씨·위치·시간·취향 → AI 모델이 "오늘 이 날씨에 어울리는 주변 장소"를 이유와 함께 추천' },
      { icon: '✈️', iconBg: COLORS.gold, title: '해외 여행 플래너', body: '다도시 일정 → 날짜별 날씨+코디+짐 체크리스트 자동 생성. 국내외 시장에 전무한 기능' },
      { icon: '🔐', iconBg: COLORS.navy2, title: '인증 & 보안 체계', body: '국가 선택 없이 자동 추천 로그인: 한국 카카오·네이버 / 일본 LINE / 해외 Google·Apple·이메일 코드 + Guest Mode' },
      { icon: '💰', iconBg: COLORS.red, title: 'AdMob 광고 수익화', body: '필수 심사 체크리스트(개인정보처리방침·app-ads.txt·UMP·스토어등록) 선제 대응으로 광고 수익 안정 확보' },
      { icon: '🛒', iconBg: COLORS.gold, title: '단계별 수익 다각화', body: '어필리에이트(즉시) → 구독(M7~) → 중소브랜드(M10~) → 대형 콜라보(M13~, MAU 3만↑)' },
    ];
    const cw = 2.95, ch = 1.7, gx = 0.18, gy = 0.18;
    items.forEach((f, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      addFeatureCard(s, {
        x: 0.5 + col * (cw + gx), y: 2.05 + row * (ch + gy), w: cw, h: ch,
        icon: f.icon, iconBg: f.iconBg, title: f.title, body: f.body,
      });
    });

    addFooter(s, 12);
  }

  // ───────────────────────────────────────────────
  // Slide 13 · 장소 카테고리 확장
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '10 · PLACE CATEGORY EXPANSION', '장소 카테고리 확장 — 날씨를 넘어 "맥락"으로');

    addBullets(s, [
      { text: '동일한 "날씨 → 결정" 엔진을 특정 장소·활동 맥락에 맞춰 재구성하는 확장 전략', bold: true },
      { text: '1단계 적용 대상: ⚾ KBO 야구장 (Phase 4, M10~M12)' },
      { text: '경기 취소 확률 — 강수량·구장별 우천 취소 기준을 반영한 사전 안내' },
      { text: '좌석별 자외선 정보 — 외야/내야 등 좌석 위치별 노출 시간 고려' },
      { text: '유니폼 레이어링 코디 — 응원 유니폼 위에 날씨에 맞는 레이어링 제안' },
      { text: '향후 확장 가능 카테고리(아이디어): 캠핑·등산·축구장·테마파크 등 — 동일 프레임워크 재사용 가능', color: COLORS.textSub, fontSize: 12 },
    ], { x: 0.7, y: 1.55, w: 5.5, h: 3.5, fontSize: 13, paraSpaceAfter: 9 });

    // Right visual: KBO card mock
    const cx = 6.4, cy = 1.6, cw = 3.1;
    s.addShape('roundRect', { x: cx, y: cy, w: cw, h: 3.45, rectRadius: 0.08, fill: { color: COLORS.navy }, line: { type: 'none' }, shadow: softShadow() });
    s.addText('⚾ 잠실 야구장 · 오늘 18:30', { x: cx + 0.2, y: cy + 0.18, w: cw - 0.4, h: 0.3, fontFace: FONT_HEAD, fontSize: 13, bold: true, color: COLORS.white });
    s.addText('22° · 구름 조금 · 강수 15%', { x: cx + 0.2, y: cy + 0.5, w: cw - 0.4, h: 0.3, fontFace: FONT_BODY, fontSize: 11, color: '9FB3D1' });

    const rows = [
      { label: '경기 취소 확률', val: '낮음 (15%)', color: COLORS.teal },
      { label: '외야석 자외선', val: '보통 — 모자 권장', color: COLORS.gold },
      { label: '유니폼 코디', val: '유니폼 + 바람막이', color: COLORS.sky },
    ];
    rows.forEach((r, i) => {
      const ry = cy + 1.0 + i * 0.75;
      s.addShape('roundRect', { x: cx + 0.18, y: ry, w: cw - 0.36, h: 0.62, rectRadius: 0.05, fill: { color: COLORS.navy2 }, line: { type: 'none' } });
      s.addText(r.label, { x: cx + 0.32, y: ry + 0.08, w: cw - 0.6, h: 0.25, fontFace: FONT_BODY, fontSize: 10, color: '9FB3D1' });
      s.addText(r.val, { x: cx + 0.32, y: ry + 0.3, w: cw - 0.6, h: 0.28, fontFace: FONT_HEAD, fontSize: 12.5, bold: true, color: r.color });
    });

    addFooter(s, 13);
  }

  // ───────────────────────────────────────────────
  // Slide 14 · UX 방향 & 탭 구조 · 해외 여행 플래너
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '11 · UX DIRECTION & TRAVEL PLANNER', 'UX 방향 & 탭 구조 · 해외 여행 플래너');

    // Tab structure
    s.addText('4-탭 구조로 핵심 기능을 정리해 "복잡함"을 줄입니다.', {
      x: 0.7, y: 1.5, w: 8.6, h: 0.35,
      fontFace: FONT_HEAD, fontSize: 13.5, bold: true, color: COLORS.textDark,
    });

    const tabs = [
      { icon: '🏠', name: '홈', desc: '오늘의 날씨·코디·우산·\n신발·출발시간 카드 +\nAI 추천 장소' },
      { icon: '👗', name: '코디 · 날씨', desc: '목적지 날씨 비교,\n강수 타임라인,\n코디 히스토리' },
      { icon: '✈️', name: '여행 플래너', desc: '다도시 일정 등록 →\n날짜별 날씨+코디+\n짐 체크리스트' },
      { icon: '👤', name: '마이페이지', desc: '계정·구독·알림 설정,\n스타일 태그,\n연결 계정 관리' },
    ];
    const tw = 2.15, th = 1.5, tgap = 0.14;
    tabs.forEach((t, i) => {
      const x = 0.5 + i * (tw + tgap);
      s.addShape('roundRect', { x, y: 1.95, w: tw, h: th, rectRadius: 0.07, fill: { color: COLORS.bgPanel }, line: { color: COLORS.border, width: 1 }, shadow: softShadow() });
      s.addText(t.icon, { x: x + 0.12, y: 2.05, w: 0.5, h: 0.4, fontFace: FONT_BODY, fontSize: 18 });
      s.addText(t.name, { x: x + 0.12, y: 2.45, w: tw - 0.24, h: 0.3, fontFace: FONT_HEAD, fontSize: 12.5, bold: true, color: COLORS.textDark });
      s.addText(t.desc, { x: x + 0.12, y: 2.75, w: tw - 0.24, h: th - 0.8, fontFace: FONT_BODY, fontSize: 9, color: COLORS.textSub, lineSpacingMultiple: 1.25 });
    });

    // Travel planner highlight
    s.addShape('roundRect', { x: 0.5, y: 3.65, w: 9.0, h: 1.55, rectRadius: 0.08, fill: { color: COLORS.navy }, line: { type: 'none' }, shadow: softShadow() });
    s.addText('✈️ 해외 여행 플래너 — 국내외 시장 최초', { x: 0.7, y: 3.8, w: 8.6, h: 0.3, fontFace: FONT_HEAD, fontSize: 13, bold: true, color: COLORS.gold });
    addBullets(s, [
      { text: '다도시 여행 일정 등록 → 도시·날짜별 날씨를 미리 비교', color: '9FB3D1', fontSize: 11.5 },
      { text: '날짜별 날씨에 맞춘 코디를 자동 추천 — 짐을 싸기 전에 미리 확인', color: '9FB3D1', fontSize: 11.5 },
      { text: '여행 전체 짐 체크리스트를 날씨 기반으로 자동 생성 (우산, 방수화, 한기 대비 외투 등)', color: '9FB3D1', fontSize: 11.5 },
    ], { x: 0.7, y: 4.1, w: 8.6, h: 1.05, fontSize: 11.5, paraSpaceAfter: 4 });

    addFooter(s, 14);
  }

  // ───────────────────────────────────────────────
  // Slide 15 · 홈 AI 추천 카드
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '12 · HOME AI CARD', '홈 AI 추천 카드 — "오늘 이 날씨엔"');

    addBullets(s, [
      { text: '입력 4종: 현재 날씨 + 위치 + 시간 + 사용자 취향(스타일 태그·히스토리)', bold: true },
      { text: 'AI 모델이 종합해 "오늘 이 날씨에 어울리는 주변 장소"를 이유와 함께 1~2곳 추천' },
      { text: '예: "오늘처럼 맑고 선선한 날엔 — 한강공원 피크닉 어떠세요? 자외선이 약해 야외활동에 좋아요"' },
      { text: '비회원도 이용 가능(1~2곳 추천), 회원은 히스토리 기반으로 추천이 점차 개인화됨' },
      { text: '홈 화면에서 코디·우산·신발·출발시간 카드 바로 아래 배치 → AdMob 네이티브 광고와 동일 영역에 자연스럽게 결합 (14번 참고)', color: COLORS.textSub, fontSize: 12 },
    ], { x: 0.7, y: 1.55, w: 5.5, h: 3.5, fontSize: 13.5, paraSpaceAfter: 10 });

    // Right: card mock
    const cx = 6.4, cy = 1.6, cw = 3.1;
    s.addShape('roundRect', { x: cx, y: cy, w: cw, h: 3.45, rectRadius: 0.08, fill: { color: COLORS.bgPanel }, line: { color: COLORS.border, width: 1 }, shadow: softShadow() });
    s.addText('홈 화면', { x: cx + 0.18, y: cy + 0.12, w: cw - 0.36, h: 0.25, fontFace: FONT_MONO, fontSize: 9, color: COLORS.textSub, charSpacing: 1 });

    s.addShape('roundRect', { x: cx + 0.18, y: cy + 0.42, w: cw - 0.36, h: 0.75, rectRadius: 0.05, fill: { color: COLORS.navy }, line: { type: 'none' } });
    s.addText('오늘 22° · 맑음\n코디 · 우산 · 신발 · 출발시간', { x: cx + 0.32, y: cy + 0.52, w: cw - 0.6, h: 0.6, fontFace: FONT_BODY, fontSize: 9.5, color: '9FB3D1', lineSpacingMultiple: 1.3 });

    s.addShape('roundRect', { x: cx + 0.18, y: cy + 1.28, w: cw - 0.36, h: 1.55, rectRadius: 0.05, fill: { color: 'FFF6E8' }, line: { color: COLORS.gold, width: 1 } });
    s.addText('🤖 오늘 이 날씨엔', { x: cx + 0.32, y: cy + 1.4, w: cw - 0.6, h: 0.28, fontFace: FONT_HEAD, fontSize: 11.5, bold: true, color: COLORS.gold });
    s.addText('"맑고 선선한 날엔 한강공원\n피크닉 어떠세요? 자외선이\n약해 야외활동에 좋아요."', { x: cx + 0.32, y: cy + 1.7, w: cw - 0.6, h: 1.1, fontFace: FONT_BODY, fontSize: 10, color: COLORS.textDark, lineSpacingMultiple: 1.35, italic: true });

    s.addShape('roundRect', { x: cx + 0.18, y: cy + 2.95, w: cw - 0.36, h: 0.4, rectRadius: 0.05, fill: { color: COLORS.bgLight }, line: { color: COLORS.border, width: 1 } });
    s.addText('AD · 네이티브 광고 영역', { x: cx + 0.32, y: cy + 2.95, w: cw - 0.6, h: 0.4, fontFace: FONT_MONO, fontSize: 9, color: COLORS.textSub, valign: 'middle' });

    addFooter(s, 15);
  }

  // ───────────────────────────────────────────────
  // Slide 16 · 수익 모델 5-Phase 로드맵
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.navy);
    s.addShape('rect', { x: 0, y: 0, w: SLIDE_W, h: 0.08, fill: { color: COLORS.teal }, line: { type: 'none' } });
    s.addText('13 · REVENUE MODEL', { x: 0.7, y: 0.5, w: 8.6, h: 0.32, fontFace: FONT_MONO, fontSize: 12, color: COLORS.sky, charSpacing: 2 });
    s.addText('수익 모델 — 5-Phase 단계적 다각화', { x: 0.7, y: 0.82, w: 8.6, h: 0.5, fontFace: FONT_HEAD, fontSize: 24, bold: true, color: COLORS.white });

    const phases = [
      { ph: 'Phase 1', m: 'M1~3', t: '어필리에이트', d: '쿠팡파트너스 즉시 연결\n→ 출시 즉시 수익 발생', color: COLORS.sky },
      { ph: 'Phase 2', m: 'M4~6', t: '광고 (AdMob)', d: '무신사파트너스 추가\nMAU 5,000 목표\n배너·네이티브 광고 시작', color: COLORS.gold },
      { ph: 'Phase 3', m: 'M7~9', t: '프리미엄 구독', d: '₩2,900/월\n전환율 목표 2~4%\nMAU 1만 목표', color: COLORS.teal },
      { ph: 'Phase 4', m: 'M10~12', t: '중소 브랜드 제휴', d: '레인부츠·방수화\n협찬·타겟 광고 슬롯\n쇼핑탭 베타', color: COLORS.sky },
      { ph: 'Phase 5', m: 'M13~', t: '대형 플랫폼 제휴', d: 'MAU 3만 달성 후\n무신사·지그재그\nGMV 수수료', color: COLORS.gold },
    ];
    const pw = 1.74, ph_ = 3.1, pgap = 0.12;
    phases.forEach((p, i) => {
      const x = 0.5 + i * (pw + pgap);
      s.addShape('roundRect', { x, y: 1.55, w: pw, h: ph_, rectRadius: 0.08, fill: { color: COLORS.navy2 }, line: { type: 'none' } });
      s.addShape('rect', { x, y: 1.55, w: pw, h: 0.06, fill: { color: p.color }, line: { type: 'none' } });
      s.addText(p.ph, { x: x + 0.12, y: 1.7, w: pw - 0.24, h: 0.3, fontFace: FONT_MONO, fontSize: 12, bold: true, color: p.color });
      s.addText(p.m, { x: x + 0.12, y: 1.98, w: pw - 0.24, h: 0.25, fontFace: FONT_MONO, fontSize: 9, color: '6E84AC' });
      s.addText(p.t, { x: x + 0.12, y: 2.3, w: pw - 0.24, h: 0.55, fontFace: FONT_HEAD, fontSize: 12.5, bold: true, color: COLORS.white, lineSpacingMultiple: 1.1 });
      s.addText(p.d, { x: x + 0.12, y: 2.95, w: pw - 0.24, h: ph_ - 1.1, fontFace: FONT_BODY, fontSize: 9.5, color: '9FB3D1', lineSpacingMultiple: 1.35 });
    });

    s.addText('핵심 전략: 초기엔 어필리에이트로 즉시 현금흐름 확보 → 트래픽이 쌓이면 광고·구독으로 확장 → MAU 3만 이상에서 대형 플랫폼 협상력 확보', {
      x: 0.7, y: 4.75, w: 8.6, h: 0.4,
      fontFace: FONT_BODY, fontSize: 9, color: COLORS.gold, italic: true,
    });

    addFooter(s, 16, { dark: true });
  }

  // ───────────────────────────────────────────────
  // Slide 17 · 브랜드 파트너십 우선순위
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '13 · BRAND PARTNERSHIP', '브랜드 파트너십 우선순위');

    s.addText('"날씨 기반 행동 추천"이라는 맥락은 신발·의류 브랜드에게 정밀한 타겟 노출 기회를 제공합니다.', {
      x: 0.7, y: 1.5, w: 8.6, h: 0.4,
      fontFace: FONT_BODY, fontSize: 12.5, color: COLORS.textSub,
    });

    const tiers = [
      { rank: '1순위 · 즉시', title: '어필리에이트 제휴', body: '쿠팡파트너스(즉시) + 무신사파트너스(Phase2~) — 별도 영업 없이 즉시 수익화 가능. 신발·우산·우비 추천 결과에 자연스럽게 연결.', color: COLORS.teal },
      { rank: '2순위 · M10~', title: '중소 브랜드 협찬', body: '레인부츠·방수화 전문 브랜드 (예: 락피쉬, HUNTER 등) — 날씨 기반 타겟 광고 슬롯 판매, 시즌 한정 스폰서십 패키지로 우선 제안.', color: COLORS.sky },
      { rank: '3순위 · M13~', title: '대형 패션 플랫폼', body: 'MAU 3만 달성 후 무신사·지그재그와 파트너십 협상 — 실적 데이터(MAU·CTR) 기반 협상력 확보, 앱내 쇼핑탭 정식 오픈 및 GMV 수수료 수익.', color: COLORS.gold },
    ];
    tiers.forEach((t, i) => {
      const y = 2.05 + i * 1.18;
      s.addShape('roundRect', { x: 0.5, y, w: 9.0, h: 1.05, rectRadius: 0.07, fill: { color: COLORS.bgPanel }, line: { color: COLORS.border, width: 1 }, shadow: softShadow() });
      s.addShape('rect', { x: 0.5, y, w: 0.07, h: 1.05, fill: { color: t.color }, line: { type: 'none' } });
      s.addText(t.rank, { x: 0.7, y: y + 0.12, w: 1.6, h: 0.8, fontFace: FONT_MONO, fontSize: 11, bold: true, color: t.color, valign: 'middle' });
      s.addText(t.title, { x: 2.3, y: y + 0.12, w: 2.2, h: 0.8, fontFace: FONT_HEAD, fontSize: 13.5, bold: true, color: COLORS.textDark, valign: 'middle' });
      s.addText(t.body, { x: 4.6, y: y + 0.12, w: 4.7, h: 0.8, fontFace: FONT_BODY, fontSize: 10.5, color: COLORS.textSub, valign: 'middle', lineSpacingMultiple: 1.25 });
    });

    addFooter(s, 17);
  }

  // ───────────────────────────────────────────────
  // Slide 18 · AdMob 필수 체크리스트
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '14 · ADMOB MONETIZATION', 'AdMob 광고 수익화 — 4대 필수 심사 항목', { accent: COLORS.red });

    s.addText('광고 도입 전, 다음 4가지를 먼저 갖추지 않으면 광고 게재 자체가 제한됩니다.', {
      x: 0.7, y: 1.5, w: 8.6, h: 0.35,
      fontFace: FONT_BODY, fontSize: 12.5, color: COLORS.textSub,
    });

    const items = [
      { no: '필수1', title: '개인정보처리방침 페이지', body: '앱 내 + 웹페이지 동시 게재. 광고 SDK 수집 데이터(광고ID/IDFA, 기기정보, IP기반위치, 앱사용데이터) 명시, Google 제3자 제공 고지 + 광고 정책 링크, 보관·파기 정책, 개인정보보호책임자 연락처 포함.' },
      { no: '필수2', title: 'app-ads.txt 인증', body: '개발자 도메인(예: weatheron.kr) 확보 후 루트에 app-ads.txt 게재(IAB Tech Lab 형식, AdMob 퍼블리셔ID 포함). Play/App Store에 도메인 등록. 2025년부터 신규 앱은 사실상 필수 — 미인증 시 광고 제한.' },
      { no: '필수3', title: '동의관리(Google UMP SDK)', body: 'GDPR/미국 주별 개인정보법 동의 메시지 자동 표시 + iOS ATT 권한 요청(Info.plist NSUserTrackingUsageDescription). 동의 거부 시 비맞춤형 광고(NPA) 제공, 국내는 개인정보보호법 기반 광고ID 수집 고지.' },
      { no: '필수4', title: '스토어 등록 & 신고', body: 'Play Console "광고 포함" 선언 + "데이터 보안" 섹션에 광고 SDK 데이터 항목 정확히 기재. App Store "앱 개인정보 보호" 라벨에 광고 데이터/추적 반영. 콘텐츠 등급 설문에 광고 반영. AdMob 결제 프로필 + ID 인증 필요.' },
    ];
    items.forEach((it, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 0.5 + col * 4.6, y = 2.0 + row * 1.6;
      s.addShape('roundRect', { x, y, w: 4.45, h: 1.48, rectRadius: 0.07, fill: { color: COLORS.bgPanel }, line: { color: COLORS.border, width: 1 }, shadow: softShadow() });
      s.addShape('roundRect', { x: x + 0.15, y: y + 0.13, w: 0.65, h: 0.3, rectRadius: 0.04, fill: { color: COLORS.red }, line: { type: 'none' } });
      s.addText(it.no, { x: x + 0.15, y: y + 0.13, w: 0.65, h: 0.3, fontFace: FONT_MONO, fontSize: 10, bold: true, color: COLORS.white, align: 'center', valign: 'middle' });
      s.addText(it.title, { x: x + 0.9, y: y + 0.1, w: 3.4, h: 0.35, fontFace: FONT_HEAD, fontSize: 12.5, bold: true, color: COLORS.textDark });
      s.addText(it.body, { x: x + 0.15, y: y + 0.5, w: 4.15, h: 0.92, fontFace: FONT_BODY, fontSize: 9, color: COLORS.textSub, lineSpacingMultiple: 1.25 });
    });

    addFooter(s, 18);
  }

  // ───────────────────────────────────────────────
  // Slide 19 · AdMob 광고 배치 정책 & 도입 일정
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '14 · AD PLACEMENT & TIMELINE', '광고 배치 정책 & 도입 일정', { accent: COLORS.red });

    // Left: policy do/don't
    s.addText('광고 배치 정책', { x: 0.7, y: 1.5, w: 4.4, h: 0.32, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: COLORS.textDark });

    s.addShape('roundRect', { x: 0.7, y: 1.88, w: 4.4, h: 1.55, rectRadius: 0.06, fill: { color: 'FDEDED' }, line: { color: COLORS.red, width: 1 } });
    s.addText('❌ 금지', { x: 0.85, y: 1.98, w: 4.1, h: 0.28, fontFace: FONT_HEAD, fontSize: 11.5, bold: true, color: COLORS.red });
    addBullets(s, [
      { text: '인터랙티브 요소 근접 배치, 콘텐츠 가림', fontSize: 9.5 },
      { text: '자체 클릭(셀프클릭) → 계정 정지 사유', fontSize: 9.5 },
      { text: '클릭/시청 보상 약속, 푸시 알림 내 광고', fontSize: 9.5 },
      { text: '실행 즉시·화면 전환마다 전면광고 반복', fontSize: 9.5 },
    ], { x: 0.85, y: 2.28, w: 4.1, h: 1.1, fontSize: 9.5, paraSpaceAfter: 3, bulletColor: COLORS.red });

    s.addShape('roundRect', { x: 0.7, y: 3.5, w: 4.4, h: 1.55, rectRadius: 0.06, fill: { color: 'EAFBF5' }, line: { color: COLORS.teal, width: 1 } });
    s.addText('✅ WeatherON 설계', { x: 0.85, y: 3.6, w: 4.1, h: 0.28, fontFace: FONT_HEAD, fontSize: 11.5, bold: true, color: COLORS.teal });
    addBullets(s, [
      { text: '네이티브 광고 1개 — AI추천카드 바로 아래, "AD" 라벨', fontSize: 9.5 },
      { text: '배너 — 날씨/코디 탭 하단, 버튼과 간격 확보', fontSize: 9.5 },
      { text: '전면광고 — 자연스러운 화면 전환 시점, 세션당 1~2회', fontSize: 9.5 },
      { text: '보상형 광고 미사용 · 프리미엄 구독 시 광고 전면 제거', fontSize: 9.5 },
    ], { x: 0.85, y: 3.9, w: 4.1, h: 1.1, fontSize: 9.5, paraSpaceAfter: 3, bulletColor: COLORS.teal });

    // Right: timeline
    s.addText('AdMob 도입 일정', { x: 5.35, y: 1.5, w: 4.15, h: 0.32, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: COLORS.textDark });

    const tl = [
      { ph: 'Phase 1 (M1~3)', d: '개발자 도메인 확보 · 개인정보처리방침/이용약관 작성 · UMP SDK 통합' },
      { ph: 'Phase 2 (M4~6)', d: '정식 스토어 출시 → app-ads.txt 게재 → AdMob 앱 등록 → 준비상태 검토(1~2주)' },
      { ph: 'Phase 2 후반', d: '검토 승인 후 배너·네이티브 광고 게재 시작' },
      { ph: 'Phase 3 (M7~)', d: '프리미엄 구독자 광고 제거 옵션 제공' },
    ];
    tl.forEach((t, i) => {
      const y = 1.9 + i * 0.78;
      s.addShape('ellipse', { x: 5.35, y: y + 0.05, w: 0.16, h: 0.16, fill: { color: COLORS.red }, line: { type: 'none' } });
      if (i < tl.length - 1) {
        s.addShape('line', { x: 5.43, y: y + 0.21, w: 0, h: 0.62, line: { color: COLORS.border, width: 1.5 } });
      }
      s.addText(t.ph, { x: 5.65, y: y - 0.03, w: 3.85, h: 0.26, fontFace: FONT_MONO, fontSize: 10, bold: true, color: COLORS.red });
      s.addText(t.d, { x: 5.65, y: y + 0.21, w: 3.85, h: 0.5, fontFace: FONT_BODY, fontSize: 10, color: COLORS.textSub, lineSpacingMultiple: 1.25 });
    });

    s.addShape('roundRect', { x: 5.35, y: 4.7, w: 4.15, h: 0.45, rectRadius: 0.06, fill: { color: COLORS.navy }, line: { type: 'none' } });
    s.addText('예상 광고 수익 — MAU 1만 기준, 월 ₩30~80만 (eCPM ₩1,500~3,000 가정)', {
      x: 5.5, y: 4.7, w: 3.9, h: 0.45, fontFace: FONT_BODY, fontSize: 9, color: COLORS.gold, valign: 'middle',
    });

    addFooter(s, 19);
  }

  // ───────────────────────────────────────────────
  // Slide 20 · AdMob 심사 대응 와이어프레임 개요
  // ───────────────────────────────────────────────
  {
    const s = addBgSlide(pptx, COLORS.bgLight);
    addHeader(s, '14-1 · WIREFRAME', 'AdMob 심사 대응 — 화면 설계 개요', { accent: COLORS.red });

    const cards = [
      { no: '①', title: '설정 메뉴', body: '알림설정·계정관리·광고 및 맞춤설정 + 개인정보처리방침/이용약관/위치기반서비스이용약관/오픈소스라이선스/문의하기/앱정보 — 모든 AdMob 필수 정책 문서를 설정 탭에서 접근, 동일 문서를 weatheron.kr 웹에도 게시.' },
      { no: '②', title: '개인정보처리방침 페이지', body: '6개 섹션: ①수집 항목(광고ID/기기정보/IP위치/앱사용데이터) ②제3자 제공(Google AdMob) ③광고식별자 안내 ④보관·파기(탈퇴 시 즉시 파기) ⑤이용자 권리 ⑥개인정보보호책임자 연락처.' },
      { no: '③', title: 'UMP 동의 모달', body: '홈 화면(날씨·코디·AI추천 카드) 위에 "광고 개인화 설정" 동의 모달 오버레이. "동의"/"동의하지 않음" + "옵션 더보기". Google UMP SDK로 GDPR/CCPA 대응, iOS는 별도 ATT 팝업 추가 표시.' },
      { no: '④', title: '홈 화면 광고 배치', body: '날씨 카드 → 오늘 코디·우산·신발 카드 → 출발시각 카드 → AI 추천 카드 → "AD" 라벨이 붙은 네이티브 광고 1개. 콘텐츠와 명확히 구분선으로 분리, 인터랙티브 요소와 인접 배치하지 않음.' },
    ];
    cards.forEach((c, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 0.5 + col * 4.6, y = 1.55 + row * 1.85;
      s.addShape('roundRect', { x, y, w: 4.45, h: 1.7, rectRadius: 0.07, fill: { color: COLORS.bgPanel }, line: { color: COLORS.border, width: 1 }, shadow: softShadow() });
      s.addShape('ellipse', { x: x + 0.15, y: y + 0.15, w: 0.4, h: 0.4, fill: { color: COLORS.navy }, line: { type: 'none' } });
      s.addText(c.no, { x: x + 0.15, y: y + 0.15, w: 0.4, h: 0.4, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: COLORS.gold, align: 'center', valign: 'middle' });
      s.addText(c.title, { x: x + 0.65, y: y + 0.13, w: 3.7, h: 0.35, fontFace: FONT_HEAD, fontSize: 12.5, bold: true, color: COLORS.textDark });
      s.addText(c.body, { x: x + 0.15, y: y + 0.55, w: 4.15, h: 1.1, fontFace: FONT_BODY, fontSize: 9, color: COLORS.textSub, lineSpacingMultiple: 1.25 });
    });

    addFooter(s, 20);
  }
}

module.exports = buildSlides11_20;
