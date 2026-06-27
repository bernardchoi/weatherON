// WeatherON 사내 제안 PPT - 공통 테마 & 헬퍼
// 브랜드 컬러: Horizon Navy / Dawn Gold / Sky Blue / Clear Teal
// 주의(PptxGenJS pitfalls): hex 색상에 '#' 금지, 8자리 hex(투명도 포함) 금지(opacity 속성 사용),
// bullet:true 사용(유니코드 불릿 금지), rich text 줄바꿈은 breakLine:true,
// bullet 사용시 lineSpacing 대신 paraSpaceAfter, shadow 등 옵션객체는 매번 새로 생성,
// 사각 바는 RECTANGLE(코너 잘림 방지)

const COLORS = {
  navy: '0C1F3F',      // Horizon Navy - primary dark
  navy2: '152C52',     // 살짝 밝은 네이비 (카드/구분)
  gold: 'F0A020',      // Dawn Gold - 강조/CTA
  sky: '4A8FD4',       // Sky Blue - 보조 강조
  teal: '3ABFA0',      // Clear Teal - 긍정/수익
  white: 'FFFFFF',
  cream: 'FBF6EC',     // 아이콘 배경 등에 쓰인 따뜻한 화이트
  bgLight: 'F4F7FB',   // 라이트 슬라이드 배경
  bgPanel: 'FFFFFF',   // 패널/카드 배경
  textDark: '0C1F3F',
  textSub: '5A6E8A',
  border: 'D9E2EF',
  red: 'E85A5A',
};

const FONT_HEAD = 'Noto Sans KR';   // 제목/본문 (Plus Jakarta Sans 대체)
const FONT_BODY = 'Noto Sans KR';
const FONT_MONO = 'DM Mono';        // 알고리즘/코드 표기
const FONT_WORD = 'Manrope';        // 워드마크 전용

const SLIDE_W = 10;
const SLIDE_H = 5.625;

// ---- 공통 옵션 팩토리 (PptxGenJS는 옵션 객체를 mutate 하므로 매번 새로 생성) ----
function shadowOpt() {
  return { type: 'outer', color: '0C1F3F', opacity: 0.18, blur: 6, offset: 2, angle: 90 };
}

function softShadow() {
  return { type: 'outer', color: '0C1F3F', opacity: 0.10, blur: 4, offset: 1, angle: 90 };
}

// ---- 슬라이드 베이스 ----
function addBgSlide(pptx, color) {
  const slide = pptx.addSlide();
  slide.background = { color };
  return slide;
}

// 페이지 번호 + 워터마크형 브랜드 표기 (라이트 배경용)
function addFooter(slide, pageNum, opts = {}) {
  const dark = !!opts.dark;
  const lineColor = dark ? '2A4068' : COLORS.border;
  const textColor = dark ? '9FB3D1' : COLORS.textSub;
  slide.addShape('line', {
    x: 0.5, y: SLIDE_H - 0.42, w: SLIDE_W - 1.0, h: 0,
    line: { color: lineColor, width: 0.75 },
  });
  slide.addText('WeatherON · App Product Plan v4.0 · 사내 제안', {
    x: 0.5, y: SLIDE_H - 0.38, w: 6.5, h: 0.3,
    fontFace: FONT_BODY, fontSize: 8, color: textColor, align: 'left',
  });
  slide.addText(String(pageNum).padStart(2, '0'), {
    x: SLIDE_W - 1.0, y: SLIDE_H - 0.38, w: 0.5, h: 0.3,
    fontFace: FONT_MONO, fontSize: 9, color: textColor, align: 'right',
  });
}

// 슬라이드 상단 공통 헤더 (라이트 배경): 섹션 라벨 + 타이틀
function addHeader(slide, kicker, title, opts = {}) {
  const accent = opts.accent || COLORS.gold;
  // 좌측 액센트 바 (RECTANGLE - 코너 잘림 없음)
  slide.addShape('rect', {
    x: 0.5, y: 0.42, w: 0.09, h: 0.78,
    fill: { color: accent },
    line: { type: 'none' },
  });
  slide.addText(kicker, {
    x: 0.72, y: 0.40, w: 8.8, h: 0.32,
    fontFace: FONT_MONO, fontSize: 12, color: COLORS.textSub,
    charSpacing: 1, align: 'left',
  });
  slide.addText(title, {
    x: 0.68, y: 0.68, w: 8.8, h: 0.56,
    fontFace: FONT_HEAD, fontSize: 26, bold: true, color: COLORS.textDark,
    align: 'left',
  });
}

// ---- 표지(커버) ----
function addCoverSlide(pptx, { eyebrow, title, sub, tags, meta }) {
  const slide = addBgSlide(pptx, COLORS.navy);

  // 배경 장식: 수평선 모티프 (원호 + 태양원 느낌의 단순 도형)
  slide.addShape('rect', {
    x: 0, y: 3.55, w: SLIDE_W, h: 0.02,
    fill: { color: COLORS.sky }, line: { type: 'none' },
  });
  slide.addShape('ellipse', {
    x: 7.7, y: 0.55, w: 1.7, h: 1.7,
    fill: { color: COLORS.gold }, line: { type: 'none' },
  });
  slide.addShape('ellipse', {
    x: 8.35, y: 1.2, w: 0.5, h: 0.5,
    fill: { color: COLORS.navy }, line: { type: 'none' },
  });
  // 구름 모티프
  slide.addShape('ellipse', { x: 0.55, y: 0.65, w: 1.0, h: 0.6, fill: { color: COLORS.white }, line: { type: 'none' } });
  slide.addShape('ellipse', { x: 1.15, y: 0.5, w: 0.75, h: 0.75, fill: { color: COLORS.white }, line: { type: 'none' } });
  slide.addShape('ellipse', { x: 1.55, y: 0.7, w: 0.6, h: 0.5, fill: { color: COLORS.white }, line: { type: 'none' } });

  slide.addText(eyebrow, {
    x: 0.7, y: 2.05, w: 8.6, h: 0.4,
    fontFace: FONT_MONO, fontSize: 13, color: COLORS.sky, charSpacing: 2,
  });

  // WeatherON 워드마크 (Light + ExtraBold Gold)
  slide.addText(
    [
      { text: 'weather', options: { fontFace: FONT_WORD, fontSize: 60, color: COLORS.white, italic: false, bold: false } },
      { text: 'ON', options: { fontFace: FONT_WORD, fontSize: 60, color: COLORS.gold, bold: true } },
    ],
    { x: 0.68, y: 2.35, w: 8.6, h: 1.1, align: 'left', fontFace: FONT_WORD }
  );

  slide.addText(title, {
    x: 0.7, y: 3.45, w: 8.6, h: 0.5,
    fontFace: FONT_HEAD, fontSize: 22, bold: true, color: COLORS.white,
  });
  slide.addText(sub, {
    x: 0.7, y: 3.95, w: 8.6, h: 0.7,
    fontFace: FONT_BODY, fontSize: 13, color: '9FB3D1', lineSpacingMultiple: 1.2,
  });

  // 태그 chips
  if (tags && tags.length) {
    let cx = 0.7;
    const cy = 4.8;
    tags.forEach((t) => {
      const w = 0.16 + t.length * 0.105;
      slide.addShape('roundRect', {
        x: cx, y: cy, w, h: 0.32,
        rectRadius: 0.06,
        fill: { color: COLORS.navy2 },
        line: { color: '2A4068', width: 0.75 },
      });
      slide.addText(t, {
        x: cx, y: cy, w, h: 0.32,
        fontFace: FONT_BODY, fontSize: 9, color: COLORS.white, align: 'center', valign: 'middle',
      });
      cx += w + 0.12;
      if (cx > 9.1) { cx = 0.7; }
    });
  }

  slide.addText(meta, {
    x: 0.7, y: SLIDE_H - 0.5, w: 8.6, h: 0.3,
    fontFace: FONT_MONO, fontSize: 9, color: '6E84AC',
  });

  return slide;
}

// ---- 섹션 디바이더(다크) ----
function addSectionDivider(pptx, { no, title, sub }) {
  const slide = addBgSlide(pptx, COLORS.navy);
  slide.addShape('rect', {
    x: 0, y: 2.55, w: SLIDE_W, h: 0.015,
    fill: { color: COLORS.gold }, line: { type: 'none' },
  });
  slide.addText(no, {
    x: 0.7, y: 1.5, w: 4, h: 1.0,
    fontFace: FONT_MONO, fontSize: 54, color: '2A4068', bold: true,
  });
  slide.addText(title, {
    x: 0.7, y: 2.75, w: 8.6, h: 0.9,
    fontFace: FONT_HEAD, fontSize: 32, bold: true, color: COLORS.white,
  });
  slide.addText(sub, {
    x: 0.7, y: 3.6, w: 8.2, h: 0.9,
    fontFace: FONT_BODY, fontSize: 13, color: '9FB3D1', lineSpacingMultiple: 1.25,
  });
  slide.addShape('ellipse', {
    x: 8.6, y: 0.5, w: 0.9, h: 0.9,
    fill: { color: COLORS.gold }, line: { type: 'none' },
  });
  return slide;
}

// ---- 불릿 리스트 ----
function addBullets(slide, items, opts = {}) {
  const x = opts.x ?? 0.7, y = opts.y ?? 1.5, w = opts.w ?? 8.6, h = opts.h ?? 3.4;
  const fontSize = opts.fontSize ?? 13;
  const color = opts.color ?? COLORS.textDark;
  const bulletColor = opts.bulletColor ?? COLORS.gold;

  const textRuns = [];
  items.forEach((item, idx) => {
    const isObj = typeof item === 'object';
    const text = isObj ? item.text : item;
    const level = isObj ? (item.level || 0) : 0;
    textRuns.push({
      text,
      options: {
        bullet: { code: '25AA', color: bulletColor, indent: 14 },
        indentLevel: level,
        color: isObj && item.color ? item.color : color,
        bold: isObj ? !!item.bold : false,
        fontSize: isObj && item.fontSize ? item.fontSize : fontSize,
        breakLine: true,
        paraSpaceAfter: opts.paraSpaceAfter ?? 8,
      },
    });
  });

  slide.addText(textRuns, {
    x, y, w, h, fontFace: FONT_BODY, valign: 'top', align: 'left',
  });
}

// ---- 카드(아이콘+텍스트) ----
function addFeatureCard(slide, { x, y, w, h, icon, iconBg, title, body, titleColor, accent }) {
  slide.addShape('roundRect', {
    x, y, w, h, rectRadius: 0.07,
    fill: { color: COLORS.bgPanel },
    line: { color: COLORS.border, width: 1 },
    shadow: softShadow(),
  });
  // 아이콘 원
  slide.addShape('ellipse', {
    x: x + 0.18, y: y + 0.18, w: 0.46, h: 0.46,
    fill: { color: iconBg || COLORS.gold }, line: { type: 'none' },
  });
  slide.addText(icon || '★', {
    x: x + 0.18, y: y + 0.18, w: 0.46, h: 0.46,
    fontFace: FONT_BODY, fontSize: 18, align: 'center', valign: 'middle', color: COLORS.white,
  });
  slide.addText(title, {
    x: x + 0.18, y: y + 0.72, w: w - 0.36, h: 0.34,
    fontFace: FONT_HEAD, fontSize: 13, bold: true, color: titleColor || COLORS.textDark,
  });
  slide.addText(body, {
    x: x + 0.18, y: y + 1.05, w: w - 0.36, h: h - 1.15,
    fontFace: FONT_BODY, fontSize: 9.5, color: COLORS.textSub, lineSpacingMultiple: 1.15,
    valign: 'top',
  });
  if (accent) {
    slide.addShape('rect', {
      x, y, w: 0.06, h, fill: { color: accent }, line: { type: 'none' },
    });
  }
}

// ---- 통계/숫자 콜아웃 ----
function addStat(slide, { x, y, w, h, value, label, color }) {
  slide.addShape('roundRect', {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: COLORS.navy2 }, line: { type: 'none' },
  });
  slide.addText(value, {
    x, y: y + 0.08, w, h: h * 0.6,
    fontFace: FONT_MONO, fontSize: 22, bold: true, color: color || COLORS.gold,
    align: 'center', valign: 'bottom',
  });
  slide.addText(label, {
    x, y: y + h * 0.6, w, h: h * 0.4,
    fontFace: FONT_BODY, fontSize: 9, color: '9FB3D1',
    align: 'center', valign: 'top',
  });
}

module.exports = {
  COLORS, FONT_HEAD, FONT_BODY, FONT_MONO, FONT_WORD, SLIDE_W, SLIDE_H,
  shadowOpt, softShadow,
  addBgSlide, addFooter, addHeader, addCoverSlide, addSectionDivider,
  addBullets, addFeatureCard, addStat,
};
