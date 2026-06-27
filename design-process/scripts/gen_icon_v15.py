import math
from PIL import Image, ImageDraw, ImageFont

FONT_DIR = "/sessions/elegant-fervent-mendel/mnt/.claude/skills/canvas-design/canvas-fonts/"
MONO = FONT_DIR + "DMMono-Regular.ttf"
KR_DIR = "/usr/share/fonts/opentype/noto/"
KR_REG = KR_DIR + "NotoSansCJK-Regular.ttc"
KR_INDEX = 1

NAVY = (12, 31, 63)
GOLD = (240, 160, 32)
PAPER = (244, 247, 252)
MIST = (107, 128, 160)
SS = 3

ACCENT_HI = (253, 246, 235)   # G-1 기준
RAIN = (74, 99, 145)          # MIST보다 약간 더 짙은 톤 — 빗물 작대기


def draw_cloud(draw, cx, cy, w, color):
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
    return cx, cy, w, base_h


def draw_rays(draw, cx, cy, r0, ray_len, ray_w, angles, gold):
    for ang_deg in angles:
        ang = math.radians(ang_deg - 90)
        xs, ys = cx + math.cos(ang) * r0, cy + math.sin(ang) * r0
        xe, ye = cx + math.cos(ang) * (r0 + ray_len), cy + math.sin(ang) * (r0 + ray_len)
        draw.line([xs, ys, xe, ye], fill=gold, width=ray_w)


def draw_rain(draw, cloud_cx, cloud_cy, cloud_w, cloud_base_h, color, s, count=3, max_y=None):
    """구름 아래 사선 빗물 작대기 N개. 사선 각도 = 70deg(수직에서 20deg 기울임)."""
    base_y = cloud_cy + cloud_base_h / 2 + s * 0.025
    line_len = s * 0.075
    line_w = max(1, int(s * 0.022))
    ang = math.radians(20)  # 수직에서 기울어진 각도
    dx = math.sin(ang) * line_len
    dy = math.cos(ang) * line_len
    spacing = cloud_w * 0.30
    start_x = cloud_cx - spacing
    for i in range(count):
        x0 = start_x + i * spacing
        y0 = base_y
        x1 = x0 + dx
        y1 = y0 + dy
        if max_y is not None and y1 > max_y:
            continue
        draw.line([x0, y0, x1, y1], fill=color, width=line_w)


def draw_e2c_on_mark(draw, box, bg, gold, neutral, accent, radius_ratio=0.18, rain=False):
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)

    track_h = s * 0.32
    track_y0 = cy - track_h / 2 + s * 0.04
    track_y1 = track_y0 + track_h
    track_x0 = x0 + s * 0.10
    track_x1 = x1 - s * 0.10
    draw.rounded_rectangle([track_x0, track_y0, track_x1, track_y1], radius=track_h / 2, fill=accent)

    bar_w = s * 0.022
    bar_h = track_h * 0.42
    bar_cx = track_x0 + track_h / 2
    bar_cy = (track_y0 + track_y1) / 2
    draw.rounded_rectangle(
        [bar_cx - bar_w / 2, bar_cy - bar_h / 2, bar_cx + bar_w / 2, bar_cy + bar_h / 2],
        radius=bar_w / 2, fill=bg)

    knob_r = track_h / 2 * 0.94
    knob_cx = track_x1 - track_h / 2
    knob_cy = (track_y0 + track_y1) / 2
    draw.ellipse([knob_cx - knob_r, knob_cy - knob_r, knob_cx + knob_r, knob_cy + knob_r], fill=gold)

    draw_rays(draw, knob_cx, knob_cy, knob_r + s * 0.035, s * 0.095, max(2, int(s * 0.024)), (-35, 0, 35), gold)

    cloud_w = s * 0.34
    cloud_cx = x0 + s * 0.275
    cloud_cy = track_y0 - s * 0.155
    draw_cloud(draw, cloud_cx, cloud_cy, cloud_w, neutral)

    if rain:
        cloud_h = cloud_w * 0.52
        cloud_base_h = cloud_h * 0.60
        draw_rain(draw, cloud_cx, cloud_cy, cloud_w, cloud_base_h, RAIN, s, count=3, max_y=track_y0 - s * 0.01)


CASES = [
    ("G-1", "기준 (비 없음)", "v13b 기존안",
     lambda d, b: draw_e2c_on_mark(d, b, NAVY, GOLD, PAPER, ACCENT_HI, rain=False)),
    ("I-1", "구름 + 빗물 작대기 3개", "구름 아래 사선 빗방울 추가",
     lambda d, b: draw_e2c_on_mark(d, b, NAVY, GOLD, PAPER, ACCENT_HI, rain=True)),
]

SZ = 220
PAD = 50
LABEL_H = 80
W = PAD * 2 + len(CASES) * SZ + (len(CASES) - 1) * PAD
H = PAD + SZ + LABEL_H

img = Image.new("RGB", (W * SS, H * SS), PAPER)
draw = ImageDraw.Draw(img)
f_num = ImageFont.truetype(MONO, 14 * SS)
f_label = ImageFont.truetype(KR_REG, 14 * SS, index=KR_INDEX)
f_sub = ImageFont.truetype(KR_REG, 12 * SS, index=KR_INDEX)

for i, (num, label, sub, fn) in enumerate(CASES):
    x = PAD + i * (SZ + PAD)
    box = [x * SS, PAD * SS, (x + SZ) * SS, (PAD + SZ) * SS]
    fn(draw, box)
    draw.text((x * SS, (PAD + SZ + 12) * SS), num, font=f_num, fill=GOLD)
    draw.text((x * SS, (PAD + SZ + 36) * SS), label, font=f_label, fill=NAVY)
    draw.text((x * SS, (PAD + SZ + 58) * SS), sub, font=f_sub, fill=MIST)

img = img.resize((W, H), Image.LANCZOS)
img.save("/sessions/elegant-fervent-mendel/mnt/outputs/WeatherON_v15_test.png")
print("done", img.size)


# 56px 파비콘 가독성 테스트
FAV = 56
FPAD = 30
FH = 36
FW = FPAD + len(CASES) * (FAV + FPAD)
FHt = FPAD + FAV + FH

img2 = Image.new("RGB", (FW * SS, FHt * SS), PAPER)
draw2 = ImageDraw.Draw(img2)
f_flabel = ImageFont.truetype(KR_REG, 13 * SS, index=KR_INDEX)
for i, (num, label, sub, fn) in enumerate(CASES):
    x = FPAD + i * (FAV + FPAD)
    box = [x * SS, FPAD * SS, (x + FAV) * SS, (FPAD + FAV) * SS]
    fn(draw2, box)
    draw2.text((x * SS, (FPAD + FAV + 6) * SS), f"{num} @ 56px", font=f_flabel, fill=NAVY)

img2 = img2.resize((FW, FHt), Image.LANCZOS)
img2.save("/sessions/elegant-fervent-mendel/mnt/outputs/WeatherON_v15_favicon_test.png")
print("done2", img2.size)
