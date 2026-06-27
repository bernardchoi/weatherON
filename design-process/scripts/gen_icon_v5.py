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
# ICON DRAW FUNCTIONS — 경쟁사 리뷰 기반 4번째 라운드 (날씨 픽토그램)
# ---------------------------------------------------------------

def draw_sun_cloud(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """Sun & Cloud — 가장 보편적인 '날씨 앱' 픽토그램(해+구름)을
    WeatherON 네이비+골드 톤으로 재해석. 해는 골드, 구름은 뉴트럴."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    neutral = mono if mono else fg_neutral

    # 해 (구름 뒤에서 떠오르는 해 — rays + circle)
    sun_cx, sun_cy = cx + s * 0.06, cy - s * 0.21
    sun_r = s * 0.155
    ray_stroke = max(2, int(s * 0.035))
    for ang_deg in (200, 235, 270, 305, 340):
        ang = math.radians(ang_deg)
        r1, r2 = sun_r + s * 0.05, sun_r + s * 0.135
        x_start = sun_cx + r1 * math.cos(ang)
        y_start = sun_cy + r1 * math.sin(ang)
        x_end = sun_cx + r2 * math.cos(ang)
        y_end = sun_cy + r2 * math.sin(ang)
        draw.line([(x_start, y_start), (x_end, y_end)], fill=gold, width=ray_stroke)
    draw.ellipse([sun_cx - sun_r, sun_cy - sun_r, sun_cx + sun_r, sun_cy + sun_r], fill=gold)

    # 구름 (겹쳐진 원 + 받침 라운드사각형)
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


def draw_sun_umbrella(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """Sun & Umbrella — 해(날씨)와 우산(우산 추천 기능)을 함께 배치해
    '날씨를 보고 무엇을 챙길지 결정해주는' 핵심 가치를 직관적으로 표현."""
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

    # 우산 캐노피 (반원 + 살 분할)
    canopy_r = s * 0.34
    canopy_cy = cy + s * 0.06
    draw.pieslice([cx - canopy_r, canopy_cy - canopy_r, cx + canopy_r, canopy_cy + canopy_r],
                   180, 360, fill=neutral)

    # 손잡이 (기둥 + 훅)
    pole_stroke = max(2, int(s * 0.05))
    draw.line([(cx, canopy_cy), (cx, cy + s * 0.30)], fill=neutral, width=pole_stroke)
    hook_r = s * 0.075
    draw.arc([cx - hook_r * 0.3, cy + s * 0.30 - hook_r * 2, cx + hook_r * 1.7, cy + s * 0.30],
             0, 180, fill=neutral, width=pole_stroke)


def draw_weather_pin(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """Weather Pin — 목적지 날씨 비교 기능을 '위치 핀' 형태로 표현하고,
    핀 위로 해가 떠오르는 형태를 더해 '그 장소의 날씨'를 직관적으로 드러냄."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    neutral = mono if mono else fg_neutral

    # 핀 모양 (원 + 삼각형 끝)
    pin_cy = cy + s * 0.05
    pin_r = s * 0.26
    draw.ellipse([cx - pin_r, pin_cy - pin_r, cx + pin_r, pin_cy + pin_r], fill=neutral)
    tri_half = pin_r * 0.78
    draw.polygon([
        (cx - tri_half, pin_cy + pin_r * 0.62),
        (cx + tri_half, pin_cy + pin_r * 0.62),
        (cx, pin_cy + pin_r * 1.62),
    ], fill=neutral)

    # 핀 위로 떠오르는 해 (rays + circle, 핀 상단 경계를 넘어 돌출)
    sun_cy = pin_cy - pin_r * 0.32
    sun_r = s * 0.135
    ray_stroke = max(2, int(s * 0.03))
    for ang_deg in (200, 235, 270, 305, 340):
        ang = math.radians(ang_deg)
        r1, r2 = sun_r + s * 0.04, sun_r + s * 0.105
        x_start = cx + r1 * math.cos(ang)
        y_start = sun_cy + r1 * math.sin(ang)
        x_end = cx + r2 * math.cos(ang)
        y_end = sun_cy + r2 * math.sin(ang)
        draw.line([(x_start, y_start), (x_end, y_end)], fill=gold, width=ray_stroke)
    draw.ellipse([cx - sun_r, sun_cy - sun_r, cx + sun_r, sun_cy + sun_r], fill=gold)


CANDIDATES = [
    ("01", "Sun & Cloud (해와 구름)", "가장 보편적인 날씨 픽토그램(해+구름)을 네이비+골드로 재해석 — '날씨 앱'임을 한눈에 인지", draw_sun_cloud),
    ("02", "Sun & Umbrella (해와 우산)", "해(날씨)와 우산(우산 추천 기능)을 함께 배치 — 날씨를 보고 무엇을 챙길지 결정해주는 가치를 표현", draw_sun_umbrella),
    ("03", "Weather Pin (날씨 핀)", "위치 핀 위로 해가 떠오르는 형태 — 목적지 날씨 비교 기능을 직관적인 지도 마커로 표현", draw_weather_pin),
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

draw.text((MARGIN * SS, 36 * SS), "WeatherON — 아이콘 4차 재개발 3종 비교 (날씨 픽토그램 기반)", font=f_title, fill=NAVY)
draw.text((MARGIN * SS, 84 * SS),
          "경쟁사 비교 분석 결과, 추상 기하학(수평선+아크+원)은 '날씨 앱' 인지도가 낮다는 점을 반영해",
          font=f_sub, fill=MIST)
draw.text((MARGIN * SS, 84 * SS + 24 * SS),
          "해/구름/우산/핀 등 보편적인 날씨 픽토그램을 네이비+골드 톤으로 재해석한 3개 방향입니다.",
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
    else:
        line1, line2 = desc_words, ""
    draw.text((cx0 * SS, (colhead_y + 36) * SS), line1, font=f_coldesc, fill=MIST)
    if line2:
        draw.text((cx0 * SS, (colhead_y + 58) * SS), line2, font=f_coldesc, fill=MIST)

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
          "WEATHERON / ICON ROUND 4 — SUN & CLOUD / SUN & UMBRELLA / WEATHER PIN (PICTOGRAM-BASED)",
          font=f_tag, fill=MIST)

img = img.resize((W, H), Image.LANCZOS)
img.save("/sessions/elegant-fervent-mendel/mnt/outputs/WeatherON_로고아이콘_4차_3종.png")
print("done", img.size)
