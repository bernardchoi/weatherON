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


def draw_horizon_rays(draw, box, bg, fg_gold, fg_neutral, with_arc=False, radius_ratio=0.18):
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold, neutral = fg_gold, fg_neutral

    hz_y = cy + s * 0.18
    hz_thick = max(2, s * 0.05)
    gap_half = s * 0.15

    draw.rounded_rectangle([x0 + s * 0.10, hz_y - hz_thick / 2, cx - gap_half, hz_y + hz_thick / 2],
                            radius=hz_thick / 2, fill=neutral)
    draw.rounded_rectangle([cx + gap_half, hz_y - hz_thick / 2, x1 - s * 0.10, hz_y + hz_thick / 2],
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

    if with_arc:
        # Halo arc — 광선보다 큰 반경, 태양과 거리를 두어 '눈썹'이 아닌 '헤일로/궤도'로 보이게
        arc_r = s * 0.345
        arc_w = max(2, int(s * 0.022))
        arc_box = [cx - arc_r, hz_y - arc_r, cx + arc_r, hz_y + arc_r]
        draw.arc(arc_box, 200, 340, fill=gold, width=arc_w)


def draw_horizon_cloud_rising(draw, box, bg, fg_gold, fg_neutral, with_arc=0, radius_ratio=0.18):
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)
    gold, neutral = fg_gold, fg_neutral

    hz_y = cy + s * 0.18
    hz_thick = max(2, s * 0.05)
    gap_cx = cx + s * 0.10
    gap_half = s * 0.15

    draw.rounded_rectangle([x0 + s * 0.09, hz_y - hz_thick / 2, gap_cx - gap_half, hz_y + hz_thick / 2],
                            radius=hz_thick / 2, fill=neutral)
    draw.rounded_rectangle([gap_cx + gap_half, hz_y - hz_thick / 2, x1 - s * 0.09, hz_y + hz_thick / 2],
                            radius=hz_thick / 2, fill=neutral)

    sun_r = gap_half * 1.0
    draw.ellipse([gap_cx - sun_r, hz_y - sun_r, gap_cx + sun_r, hz_y + sun_r], fill=gold)

    cloud_w = s * 0.34
    cloud_cx = cx - s * 0.20
    cloud_cy = hz_y - s * 0.21
    draw_cloud(draw, cloud_cx, cloud_cy, cloud_w, neutral)

    if with_arc:
        # Motion arcs — 태양 좌측(구름 쪽)으로 짧은 궤적 호. 동심원이 아닌 '이동선'으로 보이도록 배치
        arc_w = max(2, int(s * 0.020))
        radii = [sun_r * 1.9, sun_r * 2.6] if with_arc >= 2 else [sun_r * 1.9]
        for r in radii:
            arc_box = [gap_cx - r, hz_y - r, gap_cx + r, hz_y + r]
            draw.arc(arc_box, 140, 220, fill=gold, width=arc_w)


CASES = [
    ("D-2", "Sunrise Rays (원본)", lambda d, b: draw_horizon_rays(d, b, NAVY, GOLD, PAPER, with_arc=False)),
    ("D-2b", "Rays + Halo Arc 1줄", lambda d, b: draw_horizon_rays(d, b, NAVY, GOLD, PAPER, with_arc=True)),
    ("D-3", "Cloud Drift·Rising (원본)", lambda d, b: draw_horizon_cloud_rising(d, b, NAVY, GOLD, PAPER, with_arc=0)),
    ("D-3b", "Cloud Drift + Motion Arc 1줄", lambda d, b: draw_horizon_cloud_rising(d, b, NAVY, GOLD, PAPER, with_arc=1)),
    ("D-3c", "Cloud Drift + Motion Arc 2줄", lambda d, b: draw_horizon_cloud_rising(d, b, NAVY, GOLD, PAPER, with_arc=2)),
]

SZ = 200
PAD = 40
LABEL_H = 70
W = PAD * 2 + len(CASES) * SZ + (len(CASES) - 1) * PAD
H = PAD + SZ + LABEL_H

img = Image.new("RGB", (W * SS, H * SS), PAPER)
draw = ImageDraw.Draw(img)
f_num = ImageFont.truetype(MONO, 13 * SS)
f_label = ImageFont.truetype(KR_REG, 13 * SS, index=KR_INDEX)

for i, (num, label, fn) in enumerate(CASES):
    x = PAD + i * (SZ + PAD)
    box = [x * SS, PAD * SS, (x + SZ) * SS, (PAD + SZ) * SS]
    fn(draw, box)
    draw.text((x * SS, (PAD + SZ + 10) * SS), num, font=f_num, fill=GOLD)
    draw.text((x * SS, (PAD + SZ + 32) * SS), label, font=f_label, fill=MIST)

img = img.resize((W, H), Image.LANCZOS)
img.save("/sessions/elegant-fervent-mendel/mnt/outputs/WeatherON_arc_test.png")
print("done", img.size)
