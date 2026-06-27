from PIL import Image, ImageDraw, ImageFont
import math

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
# ICON DRAW FUNCTIONS — 핵심 기능 통합 3종
# ---------------------------------------------------------------

def draw_on_switch(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """ON 스위치 (Power Sun) — 전원 다이얼 + 빈틈에서 떠오르는 해.
    'Weather ON / Outfit ON / Go ON' 워드플레이를 직접 시각화."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    neutral = mono if mono else fg_neutral

    ring_r = s * 0.305
    ring_stroke = max(2, int(s * 0.088))
    bbox = [cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r]
    # 상단 270도(=12시) 부근에 40도 갭을 남기고 다이얼 링을 그림
    draw.arc(bbox, start=295, end=605, fill=neutral, width=ring_stroke)

    # 갭 위치에 해가 떠오름 — 전원이 켜진 상태
    sun_cx, sun_cy = cx, cy - ring_r
    sun_r = s * 0.115
    draw.ellipse([sun_cx - sun_r, sun_cy - sun_r, sun_cx + sun_r, sun_cy + sun_r], fill=gold)

    # 위쪽으로 뻗는 3개의 짧은 광선
    ray_w = max(2, int(s * 0.04))
    r1 = sun_r + s * 0.035
    r2 = sun_r + s * 0.105
    for dx, dy in [(0.0, -1.0), (0.78, -0.63), (-0.78, -0.63)]:
        lx1, ly1 = sun_cx + dx * r1, sun_cy + dy * r1
        lx2, ly2 = sun_cx + dx * r2, sun_cy + dy * r2
        draw.line([lx1, ly1, lx2, ly2], fill=gold, width=ray_w)


def draw_go_pin(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """Go 핀 (Destination Pin) — 목적지 핀 안에 담긴 해.
    목적지 날씨 비교 + 출발시간 역산(Go) 기능을 표현."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    neutral = mono if mono else fg_neutral

    r = s * 0.255
    hcy = cy - s * 0.075

    # 핀 꼭지(테일)
    apex = (cx, cy + s * 0.365)
    left = (cx - r * 0.92, hcy + r * 0.52)
    right = (cx + r * 0.92, hcy + r * 0.52)
    draw.polygon([left, right, apex], fill=neutral)

    # 핀 머리(원)
    draw.ellipse([cx - r, hcy - r, cx + r, hcy + r], fill=neutral)

    # 핀 내부의 해
    sun_r = s * 0.115
    draw.ellipse([cx - sun_r, hcy - sun_r, cx + sun_r, hcy + sun_r], fill=gold)


def draw_layered_stack(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """코디 레이어 (Layered Stack) — 해 아래 쌓인 옷차림 레이어.
    날씨 기반 코디·신발 추천 기능을 표현."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    neutral = mono if mono else fg_neutral
    blend_bg = bg if bg is not None else PAPER
    n_top = mono if mono else neutral
    n_mid = mono if mono else blend(fg_neutral, blend_bg, 0.78)
    n_bot = mono if mono else blend(fg_neutral, blend_bg, 0.62)

    # 해 — 코디를 결정하는 기준
    sun_r = s * 0.118
    sun_cx, sun_cy = cx, cy - s * 0.305
    draw.ellipse([sun_cx - sun_r, sun_cy - sun_r, sun_cx + sun_r, sun_cy + sun_r], fill=gold)

    # 레이어 3단 (위에서부터: 좁음 → 넓음)
    band_h = s * 0.135
    bands = [
        (s * 0.34, cy - s * 0.075, n_top),
        (s * 0.50, cy + s * 0.115, n_mid),
        (s * 0.66, cy + s * 0.315, n_bot),
    ]
    for w, ycenter, col in bands:
        bb = [cx - w / 2, ycenter - band_h / 2, cx + w / 2, ycenter + band_h / 2]
        draw.rounded_rectangle(bb, radius=band_h / 2, fill=col)


CANDIDATES = [
    ("01", "ON 스위치 (Power Sun)", "다이얼 링의 빈틈에서 떠오르는 해 — 'Weather ON · Outfit ON · Go ON' 워드플레이를 직접 시각화", draw_on_switch),
    ("02", "Go 핀 (Destination Pin)", "목적지 핀 안의 해 — 목적지 날씨 비교 · 출발시간 역산 · 신발 알림 기능을 표현", draw_go_pin),
    ("03", "코디 레이어 (Layered Stack)", "해 아래 쌓인 코디 레이어 — 날씨 기반 코디 · 신발 추천 기능을 표현", draw_layered_stack),
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

HEADER_H = 195
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

draw.text((MARGIN * SS, 36 * SS), "WeatherON — 핵심 기능 통합 아이콘 3종 비교", font=f_title, fill=NAVY)
draw.text((MARGIN * SS, 84 * SS),
          "단순히 날씨 수치를 보여주는 앱이 아닌, 'Weather ON · Outfit ON · Go ON' —",
          font=f_sub, fill=MIST)
draw.text((MARGIN * SS, 84 * SS + 24 * SS),
          "코디·우산·신발 추천, 목적지 날씨 비교, 출발시간 역산까지 결정해주는 앱의 핵심 기능을 날씨 요소와 결합한 3개 방향입니다.",
          font=f_sub, fill=MIST)
draw.line([MARGIN * SS, 144 * SS, (W - MARGIN) * SS, 144 * SS], fill=CLOUD, width=2 * SS)

# Column headers
colhead_y = HEADER_H
for i, (num, name, desc, _) in enumerate(CANDIDATES):
    cx0 = MARGIN + i * (COL_W + GAP_COL)
    draw.text((cx0 * SS, (colhead_y + 4) * SS), num, font=f_label, fill=GOLD)
    draw.text(((cx0 + 34) * SS, colhead_y * SS), name, font=f_colname, fill=NAVY)
    # 줄바꿈 처리 (긴 설명 2줄)
    desc_words = desc
    max_chars = 27
    if len(desc_words) > max_chars:
        # 적당한 위치에서 줄바꿈
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
          "WEATHERON / FEATURE-INTEGRATED ICON DIRECTION — ON SWITCH / GO PIN / LAYERED STACK",
          font=f_tag, fill=MIST)

img = img.resize((W, H), Image.LANCZOS)
img.save("/sessions/elegant-fervent-mendel/mnt/outputs/WeatherON_로고아이콘_기능통합_3종.png")
print("done", img.size)
