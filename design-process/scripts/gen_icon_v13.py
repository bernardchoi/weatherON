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

# 골드-크림 대비 3단계
ACCENT_HI = (253, 246, 235)   # 밝게 → 골드 대비 ↑
ACCENT_MD = (250, 236, 214)   # 기존 E-2c와 유사 (기준)
ACCENT_LO = (247, 222, 184)   # 더 따뜻하게 → 골드와 동화, 대비 ↓


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


def draw_e2c_on_indicator(draw, box, bg, gold, neutral, accent, radius_ratio=0.18):
    """E-2c 디벨롭. Track Accent + OFF 포지션 표시.
    트랙 좌측 끝에 얇은 링(빈 원, OFF 슬롯)을 두어 '지금은 우측 태양=ON'을
    토글의 두 상태로 형상화. 골드는 여전히 태양에만 집중, 링은 배경색(navy)
    외곽선이라 시각적으로 가장 약한 요소."""
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

    # OFF 슬롯: 트랙 좌측 끝, 배경색 얇은 링
    off_r = track_h / 2 * 0.46
    off_cx = track_x0 + track_h / 2
    off_cy = (track_y0 + track_y1) / 2
    ring_w = max(1, int(s * 0.014))
    draw.ellipse([off_cx - off_r, off_cy - off_r, off_cx + off_r, off_cy + off_r], outline=bg, width=ring_w)

    # 태양 = ON 노브
    knob_r = track_h / 2 * 0.94
    knob_cx = track_x1 - track_h / 2
    knob_cy = (track_y0 + track_y1) / 2
    draw.ellipse([knob_cx - knob_r, knob_cy - knob_r, knob_cx + knob_r, knob_cy + knob_r], fill=gold)

    draw_rays(draw, knob_cx, knob_cy, knob_r + s * 0.035, s * 0.095, max(2, int(s * 0.024)), (-35, 0, 35), gold)

    cloud_w = s * 0.34
    draw_cloud(draw, x0 + s * 0.275, track_y0 - s * 0.155, cloud_w, neutral)


CASES = [
    ("F-1", "고대비", "크림 밝게 · 골드 대비 ↑",
     lambda d, b: draw_e2c_on_indicator(d, b, NAVY, GOLD, PAPER, ACCENT_HI)),
    ("F-2", "중간 (기준)", "OFF 슬롯 추가 · 톤 유지",
     lambda d, b: draw_e2c_on_indicator(d, b, NAVY, GOLD, PAPER, ACCENT_MD)),
    ("F-3", "저대비·웜톤", "크림 진하게 · 골드와 동화",
     lambda d, b: draw_e2c_on_indicator(d, b, NAVY, GOLD, PAPER, ACCENT_LO)),
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
img.save("/sessions/elegant-fervent-mendel/mnt/outputs/WeatherON_v13_test.png")
print("done", img.size)
