import math
from PIL import Image, ImageDraw, ImageFont

FONT_DIR = "/sessions/elegant-fervent-mendel/mnt/.claude/skills/canvas-design/canvas-fonts/"
REG = FONT_DIR + "Outfit-Regular.ttf"
BOLD = FONT_DIR + "Outfit-Bold.ttf"
MONO = FONT_DIR + "DMMono-Regular.ttf"
KR_DIR = "/usr/share/fonts/opentype/noto/"
KR_REG = KR_DIR + "NotoSansCJK-Regular.ttc"
KR_BOLD = KR_DIR + "NotoSansCJK-Bold.ttc"
KR_INDEX = 1

NAVY = (12, 31, 63)
GOLD = (240, 160, 32)
PAPER = (244, 247, 252)
MIST = (107, 128, 160)
CLOUD = (232, 237, 246)
SKY = (74, 143, 212)
PHOTO_GRAY = (168, 176, 190)

SS = 3


def blend(c1, c2, t):
    return tuple(int(c1[i] * t + c2[i] * (1 - t)) for i in range(3))


# ---------------------------------------------------------------
# ICON DRAW FUNCTIONS — "Horizon ON-Switch" 디벨롭 3종
# (1순위 후보 C. Horizon ON-Switch 기반 확장)
# ---------------------------------------------------------------

def draw_on_switch_pure(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """C-1. ON-Switch · Pure — 아크 1개로 축소한 극단적 미니멀
    원안의 아크 2개를 1개로 줄여 '더 뺄 것이 없는' 절제를 끝까지
    밀어붙인 버전. 수평선의 끊김(gap)과 그 자리를 메우는 태양 —
    ON 스위치 구조 자체만 남긴다."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    horizon_color = mono if mono else fg_neutral

    hz_y = cy + s * 0.14
    hz_thick = max(2, s * 0.05)
    gap_half = s * 0.155

    draw.rounded_rectangle(
        [x0 + s * 0.09, hz_y - hz_thick / 2, cx - gap_half, hz_y + hz_thick / 2],
        radius=hz_thick / 2, fill=horizon_color)
    draw.rounded_rectangle(
        [cx + gap_half, hz_y - hz_thick / 2, x1 - s * 0.09, hz_y + hz_thick / 2],
        radius=hz_thick / 2, fill=horizon_color)

    arc_stroke = max(2, int(s * 0.058))
    r = s * 0.30
    bbox = [cx - r, hz_y - r, cx + r, hz_y + r]
    draw.arc(bbox, 180, 360, fill=gold, width=arc_stroke)

    sun_r = gap_half * 0.95
    draw.ellipse([cx - sun_r, hz_y - sun_r, cx + sun_r, hz_y + sun_r], fill=gold)


def draw_on_switch_refined(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """C-2. ON-Switch · Refined — 기존 2아크 구조의 비례 보정판
    아크 2개 구조는 유지하되 태양이 갭을 가득 채우도록 비율을 키우고
    수평선 바를 살짝 두껍게 해, 56px에서도 '스위치'로 또렷하게
    읽히는 인식성을 강화했다."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    horizon_color = mono if mono else fg_neutral

    hz_y = cy + s * 0.16
    hz_thick = max(2, s * 0.052)
    gap_half = s * 0.145

    draw.rounded_rectangle(
        [x0 + s * 0.10, hz_y - hz_thick / 2, cx - gap_half, hz_y + hz_thick / 2],
        radius=hz_thick / 2, fill=horizon_color)
    draw.rounded_rectangle(
        [cx + gap_half, hz_y - hz_thick / 2, x1 - s * 0.10, hz_y + hz_thick / 2],
        radius=hz_thick / 2, fill=horizon_color)

    arc_stroke = max(2, int(s * 0.05))
    for r in (s * 0.225, s * 0.335):
        bbox = [cx - r, hz_y - r, cx + r, hz_y + r]
        draw.arc(bbox, 180, 360, fill=gold, width=arc_stroke)

    sun_r = gap_half * 1.05
    draw.ellipse([cx - sun_r, hz_y - sun_r, cx + sun_r, hz_y + sun_r], fill=gold)


def draw_on_switch_rising(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """C-3. ON-Switch · Rising — 비대칭 갭으로 '떠오르는' 동세 추가
    스위치의 갭(태양 위치)을 중심에서 우측으로 이동시켜, ON 의미를
    유지하면서도 '방금 떠오르고 있다'는 비대칭적 동세를 함께
    표현한다."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    horizon_color = mono if mono else fg_neutral

    hz_y = cy + s * 0.16
    hz_thick = max(2, s * 0.05)
    gap_cx = cx + s * 0.09
    gap_half = s * 0.155

    draw.rounded_rectangle(
        [x0 + s * 0.09, hz_y - hz_thick / 2, gap_cx - gap_half, hz_y + hz_thick / 2],
        radius=hz_thick / 2, fill=horizon_color)
    draw.rounded_rectangle(
        [gap_cx + gap_half, hz_y - hz_thick / 2, x1 - s * 0.09, hz_y + hz_thick / 2],
        radius=hz_thick / 2, fill=horizon_color)

    arc_stroke = max(2, int(s * 0.05))
    for r in (s * 0.225, s * 0.335):
        bbox = [gap_cx - r, hz_y - r, gap_cx + r, hz_y + r]
        draw.arc(bbox, 180, 360, fill=gold, width=arc_stroke)

    sun_r = gap_half * 0.95
    draw.ellipse([gap_cx - sun_r, hz_y - sun_r, gap_cx + sun_r, hz_y + sun_r], fill=gold)


CANDIDATES = [
    ("C-1", "ON-Switch · Pure", "아크 2→1개로 축소, 끊긴 수평선과 태양만으로 ON 구조를 표현한 극단적 미니멀", draw_on_switch_pure),
    ("C-2", "ON-Switch · Refined", "2아크 구조 유지, 태양이 갭을 가득 채우도록 비례 보정해 56px 인식성 강화", draw_on_switch_refined),
    ("C-3", "ON-Switch · Rising", "갭(태양 위치)을 우측으로 이동해 ON 의미와 비대칭적 '떠오름' 동세를 함께 표현", draw_on_switch_rising),
]


# ---------------------------------------------------------------
# WORDMARK HELPERS (+ 수평선 모티프 액센트)
# ---------------------------------------------------------------

def wordmark_fonts(draw, max_size, min_size=12):
    size = max_size
    while size > min_size:
        f_reg = ImageFont.truetype(REG, size)
        f_bold = ImageFont.truetype(BOLD, size)
        w_bbox = draw.textbbox((0, 0), "weather", font=f_reg)
        on_bbox = draw.textbbox((0, 0), "ON", font=f_bold)
        return f_reg, f_bold, w_bbox, on_bbox
    return None


def draw_wordmark(draw, x, y_center, max_size, color_weather, color_on=GOLD, min_size=12):
    f_reg, f_bold, w_bbox, on_bbox = wordmark_fonts(draw, max_size, min_size)
    ty = y_center - (w_bbox[3] - w_bbox[1]) / 2 - w_bbox[1]
    draw.text((x, ty), "weather", font=f_reg, fill=color_weather)
    w_w = w_bbox[2] - w_bbox[0]
    ty2 = y_center - (on_bbox[3] - on_bbox[1]) / 2 - on_bbox[1]
    draw.text((x + w_w, ty2), "ON", font=f_bold, fill=color_on)
    total_w = w_w + (on_bbox[2] - on_bbox[0])
    total_h = max(w_bbox[3] - w_bbox[1], on_bbox[3] - on_bbox[1])
    return total_w, total_h


# ---------------------------------------------------------------
# LAYOUT
# ---------------------------------------------------------------
W = 1500
MARGIN = 60
GAP_COL = 40
COL_W = (W - 2 * MARGIN - 2 * GAP_COL) / 3

HEADER_H = 250
COLHEAD_H = 110

ROWS = [
    ("앱 아이콘 (App Icon, 200px — 확대)", 40, 270),
    ("파비콘 가독성 테스트 (56px 실제 크기 vs 220px 참고)", 40, 300),
    ("가로형 조합 — 수평선 모티프를 워드마크에 연장 (Horizontal Lockup)", 40, 170),
    ("세로형 조합 — 수평선 액센트 라인 (Stacked Lockup)", 40, 320),
    ("단색 활용 (Monochrome, 사진/컬러 배경)", 40, 200),
]
ROW_GAP = 30
FOOTER_H = 70

content_total_h = sum(lh + ch for _, lh, ch in ROWS) + ROW_GAP * (len(ROWS) - 1)
H = HEADER_H + COLHEAD_H + content_total_h + FOOTER_H

img = Image.new("RGB", (W * SS, H * SS), PAPER)
draw = ImageDraw.Draw(img)

f_title = ImageFont.truetype(KR_BOLD, 30 * SS, index=KR_INDEX)
f_sub = ImageFont.truetype(KR_REG, 15 * SS, index=KR_INDEX)
f_label = ImageFont.truetype(MONO, 13 * SS)
f_colname = ImageFont.truetype(KR_BOLD, 19 * SS, index=KR_INDEX)
f_coldesc = ImageFont.truetype(KR_REG, 13 * SS, index=KR_INDEX)
f_rowlabel = ImageFont.truetype(KR_BOLD, 15 * SS, index=KR_INDEX)
f_small = ImageFont.truetype(KR_REG, 12 * SS, index=KR_INDEX)
f_tag = ImageFont.truetype(MONO, 12 * SS)

draw.text((MARGIN * SS, 36 * SS), "WeatherON — Horizon ON-Switch 디벨롭 3종 (C-1 / C-2 / C-3)", font=f_title, fill=NAVY)
draw.text((MARGIN * SS, 84 * SS),
          "디자인 크리틱 1순위 후보 'C. Horizon ON-Switch'를 기준으로 세 방향으로 확장 디벨롭했습니다.",
          font=f_sub, fill=MIST)
draw.text((MARGIN * SS, 84 * SS + 24 * SS),
          "C-1 Pure(극단적 미니멀) / C-2 Refined(비례 보정) / C-3 Rising(비대칭 동세 추가) — 아이콘을 200px로 확대해 디테일을 검토합니다.",
          font=f_sub, fill=MIST)
draw.text((MARGIN * SS, 84 * SS + 48 * SS),
          "수평선의 끊김(ON 스위치 구조)을 핵심 모티프로 유지하며, 미니멀리즘·비대칭성·가독성의 균형을 비교합니다.",
          font=f_sub, fill=MIST)
draw.line([MARGIN * SS, (HEADER_H - 22) * SS, (W - MARGIN) * SS, (HEADER_H - 22) * SS], fill=CLOUD, width=2 * SS)

# Column headers
colhead_y = HEADER_H
for i, (num, name, desc, _) in enumerate(CANDIDATES):
    cx0 = MARGIN + i * (COL_W + GAP_COL)
    draw.text((cx0 * SS, (colhead_y + 4) * SS), num, font=f_label, fill=GOLD)
    draw.text(((cx0 + 40) * SS, colhead_y * SS), name, font=f_colname, fill=NAVY)
    desc_words = desc
    max_chars = 27
    if len(desc_words) > max_chars:
        split_idx = desc_words.find(", ")
        if split_idx == -1:
            split_idx = len(desc_words) // 2
        else:
            split_idx += 2
        line1 = desc_words[:split_idx].rstrip()
        line2 = desc_words[split_idx:].lstrip()
        if len(line2) > max_chars + 5:
            split_idx2 = line2.find(", ")
            if split_idx2 == -1:
                split_idx2 = len(line2) // 2
            else:
                split_idx2 += 2
            line2b = line2[split_idx2:].lstrip()
            line2 = line2[:split_idx2].rstrip()
        else:
            line2b = ""
    else:
        line1, line2, line2b = desc_words, "", ""
    draw.text((cx0 * SS, (colhead_y + 36) * SS), line1, font=f_coldesc, fill=MIST)
    if line2:
        draw.text((cx0 * SS, (colhead_y + 58) * SS), line2, font=f_coldesc, fill=MIST)
    if line2b:
        draw.text((cx0 * SS, (colhead_y + 80) * SS), line2b, font=f_coldesc, fill=MIST)

y = HEADER_H + COLHEAD_H

for row_label, label_h, content_h in ROWS:
    draw.text((MARGIN * SS, (y + 8) * SS), row_label, font=f_rowlabel, fill=NAVY)
    content_y = y + label_h

    for i, (num, name, desc, drawfn) in enumerate(CANDIDATES):
        cx0 = MARGIN + i * (COL_W + GAP_COL)

        if row_label.startswith("앱 아이콘"):
            sz = 200
            sx = cx0 + (COL_W - sz) / 2
            sy = content_y
            box = [sx * SS, sy * SS, (sx + sz) * SS, (sy + sz) * SS]
            drawfn(draw, box, bg=NAVY, fg_gold=GOLD, fg_neutral=PAPER)
            lbl = "200px / Navy"
            tb = draw.textbbox((0, 0), lbl, font=f_small)
            tw = tb[2] - tb[0]
            draw.text((cx0 * SS + (COL_W * SS - tw) / 2, (sy + sz + 14) * SS), lbl, font=f_small, fill=MIST)

        elif row_label.startswith("파비콘"):
            ref_sz = 220
            base = ref_sz + 44

            sz1 = 56
            sx1 = cx0 + 20
            sy1 = content_y + (base - sz1)
            box1 = [sx1 * SS, sy1 * SS, (sx1 + sz1) * SS, (sy1 + sz1) * SS]
            drawfn(draw, box1, bg=NAVY, fg_gold=GOLD, fg_neutral=PAPER)
            lbl1 = "56px (실제)"
            tb = draw.textbbox((0, 0), lbl1, font=f_small)
            tw = tb[2] - tb[0]
            draw.text((sx1 * SS + (sz1 * SS - tw) / 2, (sy1 + sz1 + 14) * SS), lbl1, font=f_small, fill=MIST)

            sz2 = ref_sz
            sx2 = sx1 + sz1 + 40
            sy2 = content_y + (base - sz2)
            box2 = [sx2 * SS, sy2 * SS, (sx2 + sz2) * SS, (sy2 + sz2) * SS]
            drawfn(draw, box2, bg=NAVY, fg_gold=GOLD, fg_neutral=PAPER)
            lbl2 = "220px (참고)"
            tb = draw.textbbox((0, 0), lbl2, font=f_small)
            tw = tb[2] - tb[0]
            draw.text((sx2 * SS + (sz2 * SS - tw) / 2, (sy2 + sz2 + 14) * SS), lbl2, font=f_small, fill=MIST)

        elif row_label.startswith("가로형"):
            panel_h = content_h
            box = [cx0 * SS, content_y * SS, (cx0 + COL_W) * SS, (content_y + panel_h) * SS]
            draw.rounded_rectangle(box, radius=16 * SS, fill=NAVY)
            icon_size = panel_h * 0.6
            icon_pad = (panel_h - icon_size) / 2
            icon_box = [(cx0 + icon_pad) * SS, (content_y + icon_pad) * SS,
                        (cx0 + icon_pad + icon_size) * SS, (content_y + icon_pad + icon_size) * SS]
            drawfn(draw, icon_box, bg=NAVY, fg_gold=GOLD, fg_neutral=PAPER)
            text_x = (cx0 + icon_pad + icon_size + panel_h * 0.16) * SS
            wm_y = content_y + panel_h / 2 - panel_h * 0.07
            wm_w, wm_h = draw_wordmark(draw, text_x, wm_y * SS, 40 * SS, PAPER, GOLD, min_size=18 * SS)
            # 수평선 모티프 액센트 — 워드마크 아래로 연장된 골드 라인
            # 패널 우측 경계(아이콘 좌측 패딩과 동일한 여백)를 넘지 않도록 클램프
            line_y = wm_y + wm_h * 0.85
            line_thick = max(1, int(panel_h * 0.025))
            panel_right_edge = (cx0 + COL_W - icon_pad) * SS
            line_x1 = min(text_x + wm_w * SS, panel_right_edge)
            draw.rounded_rectangle(
                [text_x, (line_y) * SS, line_x1, (line_y) * SS + line_thick * SS],
                radius=line_thick * SS / 2, fill=GOLD)

        elif row_label.startswith("세로형"):
            panel_size = content_h - 50
            cx_panel = cx0 + (COL_W - panel_size) / 2
            box = [cx_panel * SS, content_y * SS, (cx_panel + panel_size) * SS, (content_y + panel_size) * SS]
            draw.rounded_rectangle(box, radius=20 * SS, outline=(220, 226, 238), width=2 * SS)
            icon_size = panel_size * 0.32
            icon_x = cx_panel + (panel_size - icon_size) / 2
            icon_y = content_y + panel_size * 0.15
            icon_box = [icon_x * SS, icon_y * SS, (icon_x + icon_size) * SS, (icon_y + icon_size) * SS]
            drawfn(draw, icon_box, bg=CLOUD, fg_gold=GOLD, fg_neutral=NAVY)

            # 수평선 모티프 액센트 라인 (아이콘과 워드마크 사이)
            accent_y = icon_y + icon_size + panel_size * 0.085
            accent_half_w = panel_size * 0.16
            accent_thick = max(1, int(panel_size * 0.014))
            draw.rounded_rectangle(
                [(cx_panel + panel_size / 2 - accent_half_w) * SS, accent_y * SS,
                 (cx_panel + panel_size / 2 + accent_half_w) * SS, accent_y * SS + accent_thick * SS],
                radius=accent_thick * SS / 2, fill=GOLD)

            wm_y = accent_y + panel_size * 0.10
            f_reg, f_bold, w_bbox, on_bbox = wordmark_fonts(draw, 32 * SS, min_size=14 * SS)
            total_w = (w_bbox[2] - w_bbox[0]) + (on_bbox[2] - on_bbox[0])
            wm_x = cx_panel * SS + (panel_size * SS - total_w) / 2
            draw_wordmark(draw, wm_x, (wm_y + (w_bbox[3] - w_bbox[1]) / 2) * SS, 32 * SS, NAVY, GOLD, min_size=14 * SS)
            lbl = "Light + Horizon Accent"
            tb = draw.textbbox((0, 0), lbl, font=f_small)
            tw = tb[2] - tb[0]
            draw.text((cx_panel * SS + (panel_size * SS - tw) / 2, (content_y + panel_size + 16) * SS), lbl, font=f_small, fill=MIST)

        elif row_label.startswith("단색"):
            panel_h = content_h - 36
            box = [cx0 * SS, content_y * SS, (cx0 + COL_W) * SS, (content_y + panel_h) * SS]
            draw.rounded_rectangle(box, radius=14 * SS, fill=PHOTO_GRAY)
            sz = panel_h * 0.62
            sx = cx0 + (COL_W - sz) / 2
            sy = content_y + (panel_h - sz) / 2
            icon_box = [sx * SS, sy * SS, (sx + sz) * SS, (sy + sz) * SS]
            drawfn(draw, icon_box, bg=None, fg_gold=PAPER, fg_neutral=PAPER, mono=PAPER)
            lbl = "사진/이미지 위 (White)"
            tb = draw.textbbox((0, 0), lbl, font=f_small)
            tw = tb[2] - tb[0]
            draw.text((cx0 * SS + (COL_W * SS - tw) / 2, (content_y + panel_h + 12) * SS), lbl, font=f_small, fill=MIST)

    y += label_h + content_h + ROW_GAP

draw.text((MARGIN * SS, (H - FOOTER_H + 14) * SS),
          "WEATHERON / QUIET HORIZON — ON-SWITCH DEVELOPMENT: PURE / REFINED / RISING",
          font=f_tag, fill=MIST)

img = img.resize((W, H), Image.LANCZOS)
img.save("/sessions/elegant-fervent-mendel/mnt/outputs/WeatherON_OnSwitch_디벨롭_3종.png")
print("done", img.size)
