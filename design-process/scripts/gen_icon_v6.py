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
# ICON DRAW FUNCTIONS — Round 5 (4차 리뷰 반영 디벨롭)
# ---------------------------------------------------------------

def draw_sun_cloud(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """Sun & Cloud — 4차와 동일한 컨셉, 파비콘(56px) 가독성을 위해
    레이(rays)를 살짝 더 길고 두껍게 다듬음."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    neutral = mono if mono else fg_neutral

    sun_cx, sun_cy = cx + s * 0.06, cy - s * 0.21
    sun_r = s * 0.155
    ray_stroke = max(2, int(s * 0.04))
    for ang_deg in (200, 235, 270, 305, 340):
        ang = math.radians(ang_deg)
        r1, r2 = sun_r + s * 0.05, sun_r + s * 0.15
        x_start = sun_cx + r1 * math.cos(ang)
        y_start = sun_cy + r1 * math.sin(ang)
        x_end = sun_cx + r2 * math.cos(ang)
        y_end = sun_cy + r2 * math.sin(ang)
        draw.line([(x_start, y_start), (x_end, y_end)], fill=gold, width=ray_stroke)
    draw.ellipse([sun_cx - sun_r, sun_cy - sun_r, sun_cx + sun_r, sun_cy + sun_r], fill=gold)

    r_main = s * 0.24
    draw.ellipse([cx + s * 0.05 - r_main, cy + s * 0.05 - r_main,
                  cx + s * 0.05 + r_main, cy + s * 0.05 + r_main], fill=neutral)
    r_l = s * 0.165
    draw.ellipse([cx - s * 0.16 - r_l, cy + s * 0.10 - r_l,
                  cx - s * 0.16 + r_l, cy + s * 0.10 + r_l], fill=neutral)
    r_r = s * 0.145
    draw.ellipse([cx + s * 0.27 - r_r, cy + s * 0.10 - r_r,
                  cx + s * 0.27 + r_r, cy + s * 0.10 + r_r], fill=neutral)
    draw.rounded_rectangle([cx - s * 0.32, cy + s * 0.02, cx + s * 0.34, cy + s * 0.30],
                            radius=s * 0.14, fill=neutral)


def draw_sun_umbrella_rain(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """Sun & Umbrella + Rain — 4차의 '해+우산'에 우산살(rib)과 빗방울을 더해
    '비 예보 → 우산 추천'이라는 기능 맥락을 더 명확히 표현."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    neutral = mono if mono else fg_neutral

    # 해 (좌상단)
    sun_cx, sun_cy = cx - s * 0.18, cy - s * 0.27
    sun_r = s * 0.135
    ray_stroke = max(2, int(s * 0.032))
    for ang_deg in (165, 200, 235, 270, 305):
        ang = math.radians(ang_deg)
        r1, r2 = sun_r + s * 0.045, sun_r + s * 0.12
        x_start = sun_cx + r1 * math.cos(ang)
        y_start = sun_cy + r1 * math.sin(ang)
        x_end = sun_cx + r2 * math.cos(ang)
        y_end = sun_cy + r2 * math.sin(ang)
        draw.line([(x_start, y_start), (x_end, y_end)], fill=gold, width=ray_stroke)
    draw.ellipse([sun_cx - sun_r, sun_cy - sun_r, sun_cx + sun_r, sun_cy + sun_r], fill=gold)

    # 우산 캐노피
    canopy_r = s * 0.34
    canopy_cy = cy + s * 0.04
    draw.pieslice([cx - canopy_r, canopy_cy - canopy_r, cx + canopy_r, canopy_cy + canopy_r],
                   180, 360, fill=neutral)

    # 우산살 (rib) — 단색(monochrome) 행에서는 생략 (bg가 없으므로)
    if bg is not None:
        rib_stroke = max(1, int(s * 0.012))
        for ang_deg in (198, 234, 270, 306, 342):
            ang = math.radians(ang_deg)
            ex = cx + canopy_r * math.cos(ang)
            ey = canopy_cy + canopy_r * math.sin(ang)
            draw.line([(cx, canopy_cy), (ex, ey)], fill=bg, width=rib_stroke)

    # 손잡이 (기둥 + 훅)
    pole_stroke = max(2, int(s * 0.05))
    draw.line([(cx, canopy_cy), (cx, cy + s * 0.30)], fill=neutral, width=pole_stroke)
    hook_r = s * 0.075
    draw.arc([cx - hook_r * 0.3, cy + s * 0.30 - hook_r * 2, cx + hook_r * 1.7, cy + s * 0.30],
             0, 180, fill=neutral, width=pole_stroke)

    # 빗방울 (우산 아래로 떨어지는 비 — '비 예보' 맥락 강조; 손잡이 훅과 겹치지 않게 배치)
    drop_w, drop_h = s * 0.045, s * 0.09
    for dx in (-s * 0.30, -s * 0.155, s * 0.245):
        dy = canopy_cy + canopy_r * 0.62
        draw.ellipse([cx + dx - drop_w / 2, dy - drop_h / 2, cx + dx + drop_w / 2, dy + drop_h / 2], fill=gold)


def draw_sun_pin_badge(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """Sun + Pin Badge — 4차의 'Weather Pin'을 디벨롭. 핀이 주(主) 형태가 되면
    '지도/위치' 앱으로 오인될 수 있다는 문제를 해결하기 위해, 해를 중심 주
    모티프로 두고 위치 핀은 우하단의 작은 배지(badge)로 축소 배치 —
    '이 장소의 날씨'를 보조적으로 암시. 단색 행에서도 두 형태가 서로
    떨어져 있어 모두 또렷하게 보임."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    neutral = mono if mono else fg_neutral

    # 해 (중앙, 주 모티프)
    sun_cx, sun_cy = cx - s * 0.04, cy - s * 0.06
    sun_r = s * 0.20
    ray_stroke = max(2, int(s * 0.036))
    for ang_deg in (0, 45, 90, 135, 180, 225, 270, 315):
        ang = math.radians(ang_deg)
        r1, r2 = sun_r + s * 0.045, sun_r + s * 0.115
        x_start = sun_cx + r1 * math.cos(ang)
        y_start = sun_cy + r1 * math.sin(ang)
        x_end = sun_cx + r2 * math.cos(ang)
        y_end = sun_cy + r2 * math.sin(ang)
        draw.line([(x_start, y_start), (x_end, y_end)], fill=gold, width=ray_stroke)
    draw.ellipse([sun_cx - sun_r, sun_cy - sun_r, sun_cx + sun_r, sun_cy + sun_r], fill=gold)

    # 위치 핀 배지 (우하단, 보조 모티프 — 해와 겹치지 않게 분리 배치)
    pin_cx, pin_cy = cx + s * 0.27, cy + s * 0.275
    pin_r = s * 0.095
    draw.ellipse([pin_cx - pin_r, pin_cy - pin_r, pin_cx + pin_r, pin_cy + pin_r], fill=neutral)
    tri_half = pin_r * 0.78
    draw.polygon([
        (pin_cx - tri_half, pin_cy + pin_r * 0.6),
        (pin_cx + tri_half, pin_cy + pin_r * 0.6),
        (pin_cx, pin_cy + pin_r * 1.6),
    ], fill=neutral)


CANDIDATES = [
    ("01", "Sun & Cloud (해와 구름)", "4차안 유지 — 가장 보편적인 날씨 픽토그램, 56px 파비콘 가독성을 위해 레이 두께·길이 보강", draw_sun_cloud),
    ("02", "Sun & Umbrella & Rain (해·우산·비)", "우산살(rib)과 빗방울을 추가해 '비 예보 → 우산 추천' 기능 맥락을 강화", draw_sun_umbrella_rain),
    ("03", "Sun + Pin Badge (해 + 위치 배지)", "해를 주 모티프로, 위치 핀은 우하단 작은 배지로 — 지도 앱으로 오인되는 문제 해결, 목적지 날씨 비교 기능을 보조 표현", draw_sun_pin_badge),
]


# ---------------------------------------------------------------
# WORDMARK HELPERS
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

HEADER_H = 220
COLHEAD_H = 110

ROWS = [
    ("앱 아이콘 (App Icon, 160px)", 40, 230),
    ("파비콘 가독성 테스트 (56px 실제 크기 vs 224px 참고)", 40, 250),
    ("가로형 조합 (Horizontal Lockup)", 40, 150),
    ("세로형 조합 (Stacked Lockup)", 40, 280),
    ("단색 활용 (Monochrome, 사진/컬러 배경)", 40, 170),
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

draw.text((MARGIN * SS, 36 * SS), "WeatherON — 아이콘 5차 디벨롭 3종 비교 (4차 리뷰 반영)", font=f_title, fill=NAVY)
draw.text((MARGIN * SS, 84 * SS),
          "4차안 검토 결과, 해+구름은 유지하고 우산에는 빗방울/우산살을 더해 기능 맥락을 강화했습니다.",
          font=f_sub, fill=MIST)
draw.text((MARGIN * SS, 84 * SS + 24 * SS),
          "'날씨 핀'은 지도 앱처럼 보이는 문제를 해소하기 위해 해를 주 모티프로, 핀은 작은 배지로 재배치했습니다.",
          font=f_sub, fill=MIST)
draw.line([MARGIN * SS, 168 * SS, (W - MARGIN) * SS, 168 * SS], fill=CLOUD, width=2 * SS)

# Column headers
colhead_y = HEADER_H
for i, (num, name, desc, _) in enumerate(CANDIDATES):
    cx0 = MARGIN + i * (COL_W + GAP_COL)
    draw.text((cx0 * SS, (colhead_y + 4) * SS), num, font=f_label, fill=GOLD)
    draw.text(((cx0 + 34) * SS, colhead_y * SS), name, font=f_colname, fill=NAVY)
    desc_words = desc
    max_chars = 27
    if len(desc_words) > max_chars:
        split_idx = desc_words.find(" — ")
        if split_idx == -1:
            split_idx = len(desc_words) // 2
        else:
            split_idx += 3
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
            sz = 160
            sx = cx0 + (COL_W - sz) / 2
            sy = content_y
            box = [sx * SS, sy * SS, (sx + sz) * SS, (sy + sz) * SS]
            drawfn(draw, box, bg=NAVY, fg_gold=GOLD, fg_neutral=PAPER)
            lbl = "160px / Navy"
            tb = draw.textbbox((0, 0), lbl, font=f_small)
            tw = tb[2] - tb[0]
            draw.text((cx0 * SS + (COL_W * SS - tw) / 2, (sy + sz + 14) * SS), lbl, font=f_small, fill=MIST)

        elif row_label.startswith("파비콘"):
            sz1 = 56
            sx1 = cx0 + 20
            sy1 = content_y + (224 - sz1)
            box1 = [sx1 * SS, sy1 * SS, (sx1 + sz1) * SS, (sy1 + sz1) * SS]
            drawfn(draw, box1, bg=NAVY, fg_gold=GOLD, fg_neutral=PAPER)
            lbl1 = "56px (실제)"
            tb = draw.textbbox((0, 0), lbl1, font=f_small)
            tw = tb[2] - tb[0]
            draw.text((sx1 * SS + (sz1 * SS - tw) / 2, (sy1 + sz1 + 14) * SS), lbl1, font=f_small, fill=MIST)

            sz2 = 180
            sx2 = sx1 + sz1 + 40
            sy2 = content_y + (224 - sz2)
            box2 = [sx2 * SS, sy2 * SS, (sx2 + sz2) * SS, (sy2 + sz2) * SS]
            drawfn(draw, box2, bg=NAVY, fg_gold=GOLD, fg_neutral=PAPER)
            lbl2 = "180px (참고)"
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
            draw_wordmark(draw, text_x, (content_y + panel_h / 2) * SS, 40 * SS, PAPER, GOLD, min_size=18 * SS)

        elif row_label.startswith("세로형"):
            panel_size = content_h - 40
            cx_panel = cx0 + (COL_W - panel_size) / 2
            box = [cx_panel * SS, content_y * SS, (cx_panel + panel_size) * SS, (content_y + panel_size) * SS]
            draw.rounded_rectangle(box, radius=20 * SS, outline=(220, 226, 238), width=2 * SS)
            icon_size = panel_size * 0.34
            icon_x = cx_panel + (panel_size - icon_size) / 2
            icon_y = content_y + panel_size * 0.18
            icon_box = [icon_x * SS, icon_y * SS, (icon_x + icon_size) * SS, (icon_y + icon_size) * SS]
            drawfn(draw, icon_box, bg=CLOUD, fg_gold=GOLD, fg_neutral=NAVY)
            wm_y = icon_y + icon_size + panel_size * 0.16
            f_reg, f_bold, w_bbox, on_bbox = wordmark_fonts(draw, 30 * SS, min_size=14 * SS)
            total_w = (w_bbox[2] - w_bbox[0]) + (on_bbox[2] - on_bbox[0])
            wm_x = cx_panel * SS + (panel_size * SS - total_w) / 2
            draw_wordmark(draw, wm_x, (wm_y + (w_bbox[3] - w_bbox[1]) / 2) * SS, 30 * SS, NAVY, GOLD, min_size=14 * SS)
            lbl = "Light"
            tb = draw.textbbox((0, 0), lbl, font=f_small)
            tw = tb[2] - tb[0]
            draw.text((cx_panel * SS + (panel_size * SS - tw) / 2, (content_y + panel_size + 14) * SS), lbl, font=f_small, fill=MIST)

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
          "WEATHERON / ICON ROUND 5 — SUN & CLOUD / SUN & UMBRELLA & RAIN / SUN + PIN BADGE",
          font=f_tag, fill=MIST)

img = img.resize((W, H), Image.LANCZOS)
img.save("/sessions/elegant-fervent-mendel/mnt/outputs/WeatherON_로고아이콘_5차_3종.png")
print("done", img.size)
