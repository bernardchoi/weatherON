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
SS = 4

ACCENT_HI = (253, 246, 235)
ACCENT_MD = (250, 236, 214)


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


def draw_rays(draw, cx, cy, r0, ray_len, ray_w, angles, gold):
    for ang_deg in angles:
        ang = math.radians(ang_deg - 90)
        xs, ys = cx + math.cos(ang) * r0, cy + math.sin(ang) * r0
        xe, ye = cx + math.cos(ang) * (r0 + ray_len), cy + math.sin(ang) * (r0 + ray_len)
        draw.line([xs, ys, xe, ye], fill=gold, width=ray_w)


def draw_e2c_on_mark(draw, box, bg, gold, neutral, accent, radius_ratio=0.18):
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
    draw_cloud(draw, x0 + s * 0.275, track_y0 - s * 0.155, cloud_w, neutral)


# 파비콘 가독성 테스트: 각 케이스를 56px과 220px로 렌더링
SIZES = [56, 220]
CASES = [
    ("G-1", ACCENT_HI),
    ("G-2", ACCENT_MD),
]

PAD = 30
LABEL_H = 36
COL_W = max(SIZES) + PAD
ROW_H = max(SIZES) + LABEL_H + PAD
W = PAD + len(SIZES) * COL_W
H = PAD + len(CASES) * ROW_H

img = Image.new("RGB", (W * SS, H * SS), PAPER)
draw = ImageDraw.Draw(img)
f_label = ImageFont.truetype(KR_REG, 13 * SS, index=KR_INDEX)

for r, (name, accent) in enumerate(CASES):
    for c, sz in enumerate(SIZES):
        x = PAD + c * COL_W
        y = PAD + r * ROW_H
        box = [x * SS, y * SS, (x + sz) * SS, (y + sz) * SS]
        draw_e2c_on_mark(draw, box, NAVY, GOLD, PAPER, accent)
        draw.text((x * SS, (y + sz + 6) * SS), f"{name} @ {sz}px", font=f_label, fill=NAVY)

img = img.resize((W, H), Image.LANCZOS)
img.save("/sessions/elegant-fervent-mendel/mnt/outputs/WeatherON_v13b_favicon_test.png")
print("done", img.size)
