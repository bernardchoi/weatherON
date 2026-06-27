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
# ICON DRAW FUNCTIONS — 완전히 새로운 3종
# ---------------------------------------------------------------

def draw_sun_check(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """Sun Check — 오늘의 결정(코디·우산·신발 ON)이 완료되었음을 체크마크로,
    그 끝에서 해가 떠오르는 형태로 표현."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    neutral = mono if mono else fg_neutral

    stroke = max(2, int(s * 0.095))
    A = (cx - s * 0.255, cy - s * 0.02)
    V = (cx - s * 0.045, cy + s * 0.175)
    B = (cx + s * 0.275, cy - s * 0.225)

    draw.line([A, V], fill=neutral, width=stroke, joint="curve")
    draw.line([V, B], fill=neutral, width=stroke, joint="curve")
    r = stroke / 2
    for pt in (A, V):
        draw.ellipse([pt[0] - r, pt[1] - r, pt[0] + r, pt[1] + r], fill=neutral)

    # 체크의 끝에서 떠오르는 해
    sun_r = s * 0.125
    draw.ellipse([B[0] - sun_r, B[1] - sun_r, B[0] + sun_r, B[1] + sun_r], fill=gold)


def draw_horizon_gate(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """Horizon Gate — 문(Go, 출발)을 나서는 지평선 위로 해가 떠오르는 형태.
    출발시간 역산·목적지 이동(Go) 기능을 '문턱'으로 표현."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    neutral = mono if mono else fg_neutral

    w = s * 0.56
    y_top = cy - s * 0.32
    y_bottom = cy + s * 0.30
    arch_stroke = max(2, int(s * 0.075))
    arch_box = [cx - w / 2, y_top, cx + w / 2, y_bottom]
    draw.rounded_rectangle(arch_box, radius=w / 2 - 1, outline=neutral, width=arch_stroke,
                            corners=(True, True, False, False))

    # 지평선
    y_horizon = cy + s * 0.06
    h_stroke = max(2, int(s * 0.045))
    draw.line([(cx - s * 0.345, y_horizon), (cx + s * 0.345, y_horizon)], fill=neutral, width=h_stroke)

    # 문턱 위로 떠오르는 해
    sun_r = s * 0.145
    draw.ellipse([cx - sun_r, y_horizon - sun_r, cx + sun_r, y_horizon + sun_r], fill=gold)


def draw_orbit_sun(draw, box, bg, fg_gold, fg_neutral, radius_ratio=0.18, mono=None):
    """Orbit Sun — 중심의 해(날씨)를 따라 코디·우산·신발·목적지 추천이
    하나의 궤도 위 마커로 따라붙는 형태."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold = mono if mono else fg_gold
    neutral = mono if mono else fg_neutral

    # 중심의 해
    sun_r = s * 0.165
    draw.ellipse([cx - sun_r, cy - sun_r, cx + sun_r, cy + sun_r], fill=gold)

    # 궤도 링 (270도, 우측 상단에 갭)
    r1 = s * 0.355
    ring_stroke = max(2, int(s * 0.06))
    bbox = [cx - r1, cy - r1, cx + r1, cy + r1]
    draw.arc(bbox, start=25, end=295, fill=neutral, width=ring_stroke)

    # 갭 위치의 마커 (현재 추천/목적지)
    ang = math.radians(25)
    mx, my = cx + r1 * math.cos(ang), cy + r1 * math.sin(ang)
    marker_r = s * 0.072
    draw.ellipse([mx - marker_r, my - marker_r, mx + marker_r, my + marker_r], fill=neutral)


CANDIDATES = [
    ("01", "Sun Check (해 체크)", "체크마크 끝에서 떠오르는 해 — 코디·우산·신발 추천이 모두 'ON'된 오늘의 완료 상태를 표현", draw_sun_check),
    ("02", "Horizon Gate (지평선 게이트)", "문턱 위로 떠오르는 해 — 출발시간 역산·목적지 이동(Go) 기능을 떠나는 순간으로 표현", draw_horizon_gate),
    ("03", "Orbit Sun (궤도 선)", "해를 중심으로 도는 궤도와 마커 — 날씨를 축으로 코디·우산·신발·목적지 추천이 따라붙는 구조를 표현", draw_orbit_sun),
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

draw.text((MARGIN * SS, 36 * SS), "WeatherON — 아이콘 재개발 3종 비교", font=f_title, fill=NAVY)
draw.text((MARGIN * SS, 84 * SS),
          "기존 후보(Quiet Horizon / Sunburst / Cloud Duality / ON 스위치 / Go 핀 / 코디 레이어)와는",
          font=f_sub, fill=MIST)
draw.text((MARGIN * SS, 84 * SS + 24 * SS),
          "전혀 다른 시각적 메타포로 처음부터 다시 디벨롭한 3개 방향입니다. 모두 '해(날씨)'를 중심축으로 둡니다.",
          font=f_sub, fill=MIST)
draw.line([MARGIN * SS, 144 * SS, (W - MARGIN) * SS, 144 * SS], fill=CLOUD, width=2 * SS)

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
          "WEATHERON / ICON REDEVELOPMENT — SUN CHECK / HORIZON GATE / ORBIT SUN",
          font=f_tag, fill=MIST)

img = img.resize((W, H), Image.LANCZOS)
img.save("/sessions/elegant-fervent-mendel/mnt/outputs/WeatherON_로고아이콘_재개발_3종.png")
print("done", img.size)
