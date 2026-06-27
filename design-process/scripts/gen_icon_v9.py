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
# 공통 헬퍼 — 미니멀 구름 실루엣
# ---------------------------------------------------------------

def draw_cloud(draw, cx, cy, w, color):
    """w를 기준으로 (cx, cy)를 중심으로 한 플랫 미니멀 구름.
    base pill + 2개의 비대칭 bump로 구성."""
    h = w * 0.52
    base_h = h * 0.60
    draw.rounded_rectangle(
        [cx - w / 2, cy - base_h / 2, cx + w / 2, cy + base_h / 2],
        radius=base_h / 2, fill=color)
    r1 = h * 0.46
    bx1 = cx - w * 0.20
    draw.ellipse([bx1 - r1, cy - base_h / 2 - r1 * 0.95, bx1 + r1, cy - base_h / 2 + r1 * 1.05], fill=color)
    r2 = h * 0.58
    bx2 = cx + w * 0.12
    draw.ellipse([bx2 - r2, cy - base_h / 2 - r2 * 1.1, bx2 + r2, cy - base_h / 2 + r2 * 0.9], fill=color)


# ---------------------------------------------------------------
# ICON DRAW FUNCTIONS — "날씨 모티프" 디벨롭 3종
# (피드백: 아크 구조가 '눈'처럼 보임 → 해소 / 날씨 요소 명시적 추가)
# ---------------------------------------------------------------

def draw_horizon_cloud(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """D-1. Horizon Cloud-ON — 구름으로 '날씨'를 직관적으로
    이중 아크(눈썹+눈동자로 읽히던 구조)를 제거하고, 비대칭으로 배치한
    미니멀 구름 실루엣을 더했다. 수평선의 끊김 + 태양 = ON 구조는 유지."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    neutral = mono if mono else fg_neutral

    hz_y = cy + s * 0.18
    hz_thick = max(2, s * 0.052)
    gap_half = s * 0.15

    draw.rounded_rectangle(
        [x0 + s * 0.10, hz_y - hz_thick / 2, cx - gap_half, hz_y + hz_thick / 2],
        radius=hz_thick / 2, fill=neutral)
    draw.rounded_rectangle(
        [cx + gap_half, hz_y - hz_thick / 2, x1 - s * 0.10, hz_y + hz_thick / 2],
        radius=hz_thick / 2, fill=neutral)

    sun_r = gap_half * 1.05
    draw.ellipse([cx - sun_r, hz_y - sun_r, cx + sun_r, hz_y + sun_r], fill=gold)

    cloud_w = s * 0.40
    cloud_cx = cx - s * 0.10
    cloud_cy = hz_y - s * 0.225
    draw_cloud(draw, cloud_cx, cloud_cy, cloud_w, neutral)


def draw_horizon_rays(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """D-2. Horizon Sunrise Rays — 아크를 광선으로 대체
    '눈' 형상을 만들던 동심 아크를 짧은 광선 3개로 바꿔, 떠오르는 해를
    직접적으로 표현한다. 수평선의 끊김 + 태양 = ON 구조는 유지."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    neutral = mono if mono else fg_neutral

    hz_y = cy + s * 0.18
    hz_thick = max(2, s * 0.05)
    gap_half = s * 0.15

    draw.rounded_rectangle(
        [x0 + s * 0.10, hz_y - hz_thick / 2, cx - gap_half, hz_y + hz_thick / 2],
        radius=hz_thick / 2, fill=neutral)
    draw.rounded_rectangle(
        [cx + gap_half, hz_y - hz_thick / 2, x1 - s * 0.10, hz_y + hz_thick / 2],
        radius=hz_thick / 2, fill=neutral)

    sun_r = gap_half * 1.05
    draw.ellipse([cx - sun_r, hz_y - sun_r, cx + sun_r, hz_y + sun_r], fill=gold)

    ray_len = s * 0.13
    ray_w = max(2, int(s * 0.030))
    ray_gap = sun_r + s * 0.045
    for ang_deg in (-55, 0, 55):
        ang = math.radians(ang_deg - 90)
        x_start = cx + math.cos(ang) * ray_gap
        y_start = hz_y + math.sin(ang) * ray_gap
        x_end = cx + math.cos(ang) * (ray_gap + ray_len)
        y_end = hz_y + math.sin(ang) * (ray_gap + ray_len)
        draw.line([x_start, y_start, x_end, y_end], fill=gold, width=ray_w)


def draw_horizon_cloud_rising(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """D-3. Horizon Cloud Drift · Rising — 구름 + 비대칭 떠오름
    태양 위치를 우측으로 이동시켜 '떠오름' 동세를 표현하고, 반대편(좌측)
    상단에 구름을 배치해 균형과 날씨 모티프를 함께 더했다."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    neutral = mono if mono else fg_neutral

    hz_y = cy + s * 0.18
    hz_thick = max(2, s * 0.05)
    gap_cx = cx + s * 0.10
    gap_half = s * 0.15

    draw.rounded_rectangle(
        [x0 + s * 0.09, hz_y - hz_thick / 2, gap_cx - gap_half, hz_y + hz_thick / 2],
        radius=hz_thick / 2, fill=neutral)
    draw.rounded_rectangle(
        [gap_cx + gap_half, hz_y - hz_thick / 2, x1 - s * 0.09, hz_y + hz_thick / 2],
        radius=hz_thick / 2, fill=neutral)

    sun_r = gap_half * 1.0
    draw.ellipse([gap_cx - sun_r, hz_y - sun_r, gap_cx + sun_r, hz_y + sun_r], fill=gold)

    cloud_w = s * 0.34
    cloud_cx = cx - s * 0.20
    cloud_cy = hz_y - s * 0.21
    draw_cloud(draw, cloud_cx, cloud_cy, cloud_w, neutral)


CANDIDATES = [
    ("D-1", "Cloud-ON", "이중 아크를 제거, 비대칭 구름 실루엣으로 '눈' 형상을 해소하고 날씨 모티프를 더함", draw_horizon_cloud),
    ("D-2", "Sunrise Rays", "동심 아크를 광선 3개로 대체, 떠오르는 해를 직접 표현해 '눈' 형상을 해소", draw_horizon_rays),
    ("D-3", "Cloud Drift · Rising", "태양을 우측으로 이동(떠오름)하고 반대편에 구름을 배치해 균형과 날씨 모티프를 함께 표현", draw_horizon_cloud_rising),
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

HEADER_H = 270
COLHEAD_H = 110

ROWS = [
    ("앱 아이콘 (App Icon, 200px)", 40, 270),
    ("파비콘 가독성 테스트 (56px 실제 크기 vs 220px 참고)", 40, 300),
    ("가로형 조합 (Horizontal Lockup) — 액센트 라인 제거", 40, 170),
    ("세로형 조합 (Stacked Lockup) — 액센트 라인 제거", 40, 300),
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

draw.text((MARGIN * SS, 36 * SS), "WeatherON — 날씨 모티프 디벨롭 3종 (D-1 / D-2 / D-3)", font=f_title, fill=NAVY)
draw.text((MARGIN * SS, 84 * SS),
          "기존 디벨롭(C-1~3)의 동심 아크 구조가 '눈'처럼 보인다는 피드백을 반영해 아크를 제거하고,",
          font=f_sub, fill=MIST)
draw.text((MARGIN * SS, 84 * SS + 24 * SS),
          "구름·광선 등 날씨 모티프를 새로 탐색했습니다. 수평선의 끊김 + 태양 = ON 스위치 구조는 그대로 유지합니다.",
          font=f_sub, fill=MIST)
draw.text((MARGIN * SS, 84 * SS + 48 * SS),
          "D-1 Cloud-ON(구름) / D-2 Sunrise Rays(광선) / D-3 Cloud Drift·Rising(구름+비대칭 떠오름)",
          font=f_sub, fill=MIST)
draw.text((MARGIN * SS, 84 * SS + 72 * SS),
          "또한, 의미가 불명확하다는 피드백에 따라 가로형/세로형 조합의 골드 액센트 라인을 제거했습니다.",
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
            wm_y = content_y + panel_h / 2
            draw_wordmark(draw, text_x, wm_y * SS, 40 * SS, PAPER, GOLD, min_size=18 * SS)

        elif row_label.startswith("세로형"):
            panel_size = content_h - 50
            cx_panel = cx0 + (COL_W - panel_size) / 2
            box = [cx_panel * SS, content_y * SS, (cx_panel + panel_size) * SS, (content_y + panel_size) * SS]
            draw.rounded_rectangle(box, radius=20 * SS, outline=(220, 226, 238), width=2 * SS)
            icon_size = panel_size * 0.32
            icon_x = cx_panel + (panel_size - icon_size) / 2
            icon_y = content_y + panel_size * 0.16
            icon_box = [icon_x * SS, icon_y * SS, (icon_x + icon_size) * SS, (icon_y + icon_size) * SS]
            drawfn(draw, icon_box, bg=CLOUD, fg_gold=GOLD, fg_neutral=NAVY)

            wm_y = icon_y + icon_size + panel_size * 0.19
            f_reg, f_bold, w_bbox, on_bbox = wordmark_fonts(draw, 32 * SS, min_size=14 * SS)
            total_w = (w_bbox[2] - w_bbox[0]) + (on_bbox[2] - on_bbox[0])
            wm_x = cx_panel * SS + (panel_size * SS - total_w) / 2
            draw_wordmark(draw, wm_x, (wm_y + (w_bbox[3] - w_bbox[1]) / 2) * SS, 32 * SS, NAVY, GOLD, min_size=14 * SS)
            lbl = "Light Wordmark"
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
          "WEATHERON / QUIET HORIZON — WEATHER MOTIF DEVELOPMENT: CLOUD-ON / SUNRISE RAYS / CLOUD DRIFT",
          font=f_tag, fill=MIST)

img = img.resize((W, H), Image.LANCZOS)
img.save("/sessions/elegant-fervent-mendel/mnt/outputs/WeatherON_날씨모티프_3종.png")
print("done", img.size)
