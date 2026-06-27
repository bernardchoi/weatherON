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


def draw_rays(draw, cx, cy, r0, ray_len, ray_w, angles, gold):
    for ang_deg in angles:
        ang = math.radians(ang_deg - 90)
        xs, ys = cx + math.cos(ang) * r0, cy + math.sin(ang) * r0
        xe, ye = cx + math.cos(ang) * (r0 + ray_len), cy + math.sin(ang) * (r0 + ray_len)
        draw.line([xs, ys, xe, ye], fill=gold, width=ray_w)


def draw_e1_rays_cloud(draw, box, bg, gold, neutral, radius_ratio=0.18):
    """E-1. Sunrise + Cloud — 중앙 갭에 태양+광선, 좌상단에 구름으로 균형"""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = x1 - x0
    if bg is not None:
        draw.rounded_rectangle(box, radius=s * radius_ratio, fill=bg)

    hz_y = cy + s * 0.18
    hz_thick = max(2, s * 0.05)
    gap_half = s * 0.15

    draw.rounded_rectangle([x0 + s * 0.10, hz_y - hz_thick / 2, cx - gap_half, hz_y + hz_thick / 2],
                            radius=hz_thick / 2, fill=neutral)
    draw.rounded_rectangle([cx + gap_half, hz_y - hz_thick / 2, x1 - s * 0.10, hz_y + hz_thick / 2],
                            radius=hz_thick / 2, fill=neutral)

    sun_r = gap_half * 1.0
    draw.ellipse([cx - sun_r, hz_y - sun_r, cx + sun_r, hz_y + sun_r], fill=gold)
    draw_rays(draw, cx, hz_y, sun_r + s * 0.038, s * 0.105, max(2, int(s * 0.026)), (-55, 0, 55), gold)

    cloud_w = s * 0.27
    draw_cloud(draw, x0 + s * 0.225, y0 + s * 0.205, cloud_w, neutral)


def draw_toggle_sun(draw, box, bg, gold, neutral, with_highlight=False, radius_ratio=0.18):
    """E-2 / E-3. Toggle-ON Sun — 가로 트랙(토글) 우측 끝에 태양=노브를 배치해
    '해 = ON 버튼' 형상을 직접적으로 표현. 광선+구름 동반.
    with_highlight=True면 노브 좌상단에 작은 하이라이트 호(반사광) 1개 추가."""
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
    draw.rounded_rectangle([track_x0, track_y0, track_x1, track_y1], radius=track_h / 2, fill=neutral)

    knob_r = track_h / 2 * 0.94
    knob_cx = track_x1 - track_h / 2
    knob_cy = (track_y0 + track_y1) / 2
    draw.ellipse([knob_cx - knob_r, knob_cy - knob_r, knob_cx + knob_r, knob_cy + knob_r], fill=gold)

    draw_rays(draw, knob_cx, knob_cy, knob_r + s * 0.035, s * 0.095, max(2, int(s * 0.024)), (-35, 0, 35), gold)

    if with_highlight:
        hl_w = max(2, int(s * 0.018))
        hl_r = knob_r * 0.58
        hl_box = [knob_cx - hl_r, knob_cy - hl_r, knob_cx + hl_r, knob_cy + hl_r]
        draw.arc(hl_box, 205, 285, fill=bg, width=hl_w)

    cloud_w = s * 0.34
    draw_cloud(draw, x0 + s * 0.275, track_y0 - s * 0.155, cloud_w, neutral)


CASES = [
    ("E-1", "Sunrise + Cloud", "광선·구름 동시 배치", lambda d, b: draw_e1_rays_cloud(d, b, NAVY, GOLD, PAPER)),
    ("E-2", "Toggle-ON Sun", "해 = 토글 노브(ON 위치)", lambda d, b: draw_toggle_sun(d, b, NAVY, GOLD, PAPER, with_highlight=False)),
    ("E-3", "Toggle-ON Sun + Shine", "노브에 하이라이트 호 1개", lambda d, b: draw_toggle_sun(d, b, NAVY, GOLD, PAPER, with_highlight=True)),
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
img.save("/sessions/elegant-fervent-mendel/mnt/outputs/WeatherON_v11_test.png")
print("done", img.size)
