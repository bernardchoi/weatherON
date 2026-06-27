import math
import numpy as np
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
GLOW = (34, 52, 92)           # J-1: 새벽빛 그라디언트
CLOUD_BACK = (58, 78, 120)    # 보조 구름(뒤쪽, 더 짙은 톤) — NAVY와 MIST 사이
SNOW = (215, 224, 240)        # 눈 입자 — PAPER보다 살짝 톤다운(배경과 과한 대비 방지)


def make_gradient_bg(s, radius_ratio, center_ratio, c_near, c_far, max_ratio=1.0):
    yy, xx = np.mgrid[0:s, 0:s].astype(np.float64)
    cx, cy = center_ratio[0] * s, center_ratio[1] * s
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    max_dist = max_ratio * s
    t = np.clip(dist / max_dist, 0, 1) ** 1.2
    arr = np.zeros((s, s, 3), dtype=np.uint8)
    for c in range(3):
        arr[..., c] = (c_near[c] * (1 - t) + c_far[c] * t).astype(np.uint8)
    grad = Image.fromarray(arr, "RGB")

    mask = Image.new("L", (s, s), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle([0, 0, s, s], radius=s * radius_ratio, fill=255)

    out = Image.new("RGB", (s, s), PAPER)
    out.paste(grad, (0, 0), mask)
    return out


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
    return base_h


def draw_rays(draw, cx, cy, r0, ray_len, ray_w, angles, gold):
    for ang_deg in angles:
        ang = math.radians(ang_deg - 90)
        xs, ys = cx + math.cos(ang) * r0, cy + math.sin(ang) * r0
        xe, ye = cx + math.cos(ang) * (r0 + ray_len), cy + math.sin(ang) * (r0 + ray_len)
        draw.line([xs, ys, xe, ye], fill=gold, width=ray_w)


def draw_snow(draw, cx, cy, s, color):
    """구름 아래 작은 원형 눈 입자 3개 — 얇은 선 대신 '면'으로 표현해 축소 시에도 살아남도록."""
    r = s * 0.018
    positions = [(cx - s * 0.085, cy + s * 0.085),
                 (cx + s * 0.01, cy + s * 0.13),
                 (cx + s * 0.09, cy + s * 0.07)]
    for (x, y) in positions:
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color)


def render_icon(s, glow=True, extra_cloud=False, snow=False, radius_ratio=0.18):
    if glow:
        img = make_gradient_bg(s, radius_ratio, center_ratio=(0.74, 0.54), c_near=GLOW, c_far=NAVY)
    else:
        img = Image.new("RGB", (s, s), PAPER)
        d0 = ImageDraw.Draw(img)
        d0.rounded_rectangle([0, 0, s, s], radius=s * radius_ratio, fill=NAVY)

    draw = ImageDraw.Draw(img)

    track_h = s * 0.32
    track_y0 = s / 2 - track_h / 2 + s * 0.04
    track_y1 = track_y0 + track_h
    track_x0 = s * 0.10
    track_x1 = s - s * 0.10
    draw.rounded_rectangle([track_x0, track_y0, track_x1, track_y1], radius=track_h / 2, fill=ACCENT_HI)

    bar_w = s * 0.022
    bar_h = track_h * 0.42
    bar_cx = track_x0 + track_h / 2
    bar_cy = (track_y0 + track_y1) / 2
    draw.rounded_rectangle(
        [bar_cx - bar_w / 2, bar_cy - bar_h / 2, bar_cx + bar_w / 2, bar_cy + bar_h / 2],
        radius=bar_w / 2, fill=NAVY)

    knob_r = track_h / 2 * 0.94
    knob_cx = track_x1 - track_h / 2
    knob_cy = (track_y0 + track_y1) / 2
    draw.ellipse([knob_cx - knob_r, knob_cy - knob_r, knob_cx + knob_r, knob_cy + knob_r], fill=GOLD)

    draw_rays(draw, knob_cx, knob_cy, knob_r + s * 0.035, s * 0.095, max(2, int(s * 0.024)), (-35, 0, 35), GOLD)

    cloud_w = s * 0.34
    cloud_cx = s * 0.275
    cloud_cy = track_y0 - s * 0.155

    # K-1: 메인 구름 뒤에 더 작은 보조 구름을 살짝 겹쳐, '여러 구름(흐림)' 레이어 표현
    if extra_cloud:
        back_w = cloud_w * 0.62
        back_cx = cloud_cx + cloud_w * 0.46
        back_cy = cloud_cy + cloud_w * 0.10
        draw_cloud(draw, back_cx, back_cy, back_w, CLOUD_BACK)

    draw_cloud(draw, cloud_cx, cloud_cy, cloud_w, PAPER)

    # K-2: 구름 아래 작은 눈 입자 3개
    if snow:
        draw_snow(draw, cloud_cx, cloud_cy, s, SNOW)

    return img


CASES = [
    ("J-1", "현재 채택안", "구름 + Dawn Glow",
     lambda s: render_icon(s, glow=True, extra_cloud=False, snow=False)),
    ("K-1", "보조 구름 추가", "흐림 표현 — 구름 2겹 레이어",
     lambda s: render_icon(s, glow=True, extra_cloud=True, snow=False)),
    ("K-2", "눈 입자 추가", "구름 아래 작은 원형 눈 3개",
     lambda s: render_icon(s, glow=True, extra_cloud=False, snow=True)),
    ("K-3", "보조 구름 + 눈", "두 요소 동시 적용",
     lambda s: render_icon(s, glow=True, extra_cloud=True, snow=True)),
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
    icon = fn(SZ * SS)
    img.paste(icon, (x * SS, PAD * SS))
    draw.text((x * SS, (PAD + SZ + 12) * SS), num, font=f_num, fill=GOLD)
    draw.text((x * SS, (PAD + SZ + 36) * SS), label, font=f_label, fill=NAVY)
    draw.text((x * SS, (PAD + SZ + 58) * SS), sub, font=f_sub, fill=MIST)

img = img.resize((W, H), Image.LANCZOS)
img.save("/sessions/elegant-fervent-mendel/mnt/outputs/WeatherON_v17_test.png")
print("done", img.size)


# 56px 파비콘 가독성 테스트
FAV = 56
FPAD = 28
FH = 36
FW = FPAD + len(CASES) * (FAV + FPAD)
FHt = FPAD + FAV + FH

img2 = Image.new("RGB", (FW * SS, FHt * SS), PAPER)
draw2 = ImageDraw.Draw(img2)
f_flabel = ImageFont.truetype(KR_REG, 12 * SS, index=KR_INDEX)
for i, (num, label, sub, fn) in enumerate(CASES):
    x = FPAD + i * (FAV + FPAD)
    icon = fn(FAV * SS)
    img2.paste(icon, (x * SS, FPAD * SS))
    draw2.text((x * SS, (FPAD + FAV + 6) * SS), f"{num} @56px", font=f_flabel, fill=NAVY)

img2 = img2.resize((FW, FHt), Image.LANCZOS)
img2.save("/sessions/elegant-fervent-mendel/mnt/outputs/WeatherON_v17_favicon_test.png")
print("done2", img2.size)
