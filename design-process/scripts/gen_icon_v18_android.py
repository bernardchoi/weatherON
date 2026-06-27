"""
WeatherON — Android 전용 아이콘 에셋 생성
- Adaptive Icon: foreground(투명배경 풀컬러 그래픽) + background(NAVY 단색, full bleed)
- Notification small icon: 흰색 단색 실루엣 + 투명배경 (Android 시스템 규격)

기준 형태(G-1)는 design-process/scripts/gen_icon_v16.py의 render_icon() 지오메트리를 그대로 재사용.
"""
import math
from PIL import Image, ImageDraw

NAVY = (12, 31, 63, 255)
GOLD = (240, 160, 32, 255)
PAPER = (244, 247, 252, 255)
ACCENT_HI = (253, 246, 235, 255)  # G-1 크림 트랙
WHITE = (255, 255, 255, 255)
TRANSPARENT = (255, 255, 255, 0)

OUT_DIR = "/sessions/ecstatic-beautiful-allen/mnt/스마트 날씨 앱/assets/icon/android"
PREVIEW_DIR = "/sessions/ecstatic-beautiful-allen/mnt/outputs"


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


def draw_rays(draw, cx, cy, r0, ray_len, ray_w, angles, color):
    for ang_deg in angles:
        ang = math.radians(ang_deg - 90)
        xs, ys = cx + math.cos(ang) * r0, cy + math.sin(ang) * r0
        xe, ye = cx + math.cos(ang) * (r0 + ray_len), cy + math.sin(ang) * (r0 + ray_len)
        draw.line([xs, ys, xe, ye], fill=color, width=ray_w)


def draw_content(draw, s, track_color, bar_color, knob_color, ray_color, cloud_color):
    """G-1 지오메트리(gen_icon_v16.render_icon) 그대로, 배경 없이 콘텐츠만."""
    track_h = s * 0.32
    track_y0 = s / 2 - track_h / 2 + s * 0.04
    track_y1 = track_y0 + track_h
    track_x0 = s * 0.10
    track_x1 = s - s * 0.10
    draw.rounded_rectangle([track_x0, track_y0, track_x1, track_y1], radius=track_h / 2, fill=track_color)

    bar_w = s * 0.022
    bar_h = track_h * 0.42
    bar_cx = track_x0 + track_h / 2
    bar_cy = (track_y0 + track_y1) / 2
    draw.rounded_rectangle(
        [bar_cx - bar_w / 2, bar_cy - bar_h / 2, bar_cx + bar_w / 2, bar_cy + bar_h / 2],
        radius=bar_w / 2, fill=bar_color)

    knob_r = track_h / 2 * 0.94
    knob_cx = track_x1 - track_h / 2
    knob_cy = (track_y0 + track_y1) / 2
    draw.ellipse([knob_cx - knob_r, knob_cy - knob_r, knob_cx + knob_r, knob_cy + knob_r], fill=knob_color)

    draw_rays(draw, knob_cx, knob_cy, knob_r + s * 0.035, s * 0.095, max(2, int(s * 0.024)), (-35, 0, 35), ray_color)

    cloud_w = s * 0.34
    cloud_cx = s * 0.275
    cloud_cy = track_y0 - s * 0.155
    draw_cloud(draw, cloud_cx, cloud_cy, cloud_w, cloud_color)


def render_content_rgba(s, track_color, bar_color, knob_color, ray_color, cloud_color):
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_content(draw, s, track_color, bar_color, knob_color, ray_color, cloud_color)
    return img


def fit_into_canvas(content_img, canvas_size, safe_ratio):
    """content_img(투명배경, 콘텐츠만)를 autocrop 후 canvas_size 정사각형 중앙에,
    콘텐츠의 긴 변이 canvas_size*safe_ratio가 되도록 스케일."""
    bbox = content_img.getbbox()
    cropped = content_img.crop(bbox)
    cw, ch = cropped.size
    target_max = canvas_size * safe_ratio
    scale = target_max / max(cw, ch)
    new_w, new_h = round(cw * scale), round(ch * scale)
    resized = cropped.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    px = (canvas_size - new_w) // 2
    py = (canvas_size - new_h) // 2
    canvas.alpha_composite(resized, (px, py))
    return canvas


# ── 1) Adaptive Icon — Foreground (풀컬러, 투명배경, 108dp 캔버스의 66dp 세이프존) ──
MASTER = 1024  # 108dp 캔버스를 표현하는 마스터 해상도
SAFE_RATIO = 66 / 108  # Android 세이프존(중앙 66dp 원) 비율

fg_content = render_content_rgba(
    2048,  # 고해상도로 그려서 디테일 보존 후 축소
    track_color=ACCENT_HI, bar_color=NAVY, knob_color=GOLD, ray_color=GOLD, cloud_color=PAPER,
)
fg_canvas = fit_into_canvas(fg_content, MASTER, SAFE_RATIO)
fg_path = f"{OUT_DIR}/icon-adaptive-foreground-1024.png"
fg_canvas.save(fg_path)

# ── 2) Adaptive Icon — Background (NAVY 단색, full bleed, 투명도 없음) ──
bg_canvas = Image.new("RGBA", (MASTER, MASTER), NAVY)
bg_path = f"{OUT_DIR}/icon-adaptive-background-1024.png"
bg_canvas.save(bg_path)

# ── 3) QA 프리뷰 — fg+bg를 원형/둥근정사각 마스크로 합성해 실제 런처 노출 시뮬레이션 ──
def composite_preview(mask_shape):
    base = bg_canvas.convert("RGBA").copy()
    base.alpha_composite(fg_canvas)
    mask = Image.new("L", (MASTER, MASTER), 0)
    mdraw = ImageDraw.Draw(mask)
    if mask_shape == "circle":
        mdraw.ellipse([0, 0, MASTER, MASTER], fill=255)
    else:  # squircle 근사
        mdraw.rounded_rectangle([0, 0, MASTER, MASTER], radius=MASTER * 0.22, fill=255)
    out = Image.new("RGBA", (MASTER, MASTER), (0, 0, 0, 0))
    out.paste(base, (0, 0), mask)
    return out

preview_circle = composite_preview("circle")
preview_square = composite_preview("square")

preview_w = MASTER * 2 + 80
preview = Image.new("RGB", (preview_w, MASTER + 40), (244, 247, 252))
preview.paste(Image.new("RGB", (MASTER, MASTER), (255, 255, 255)).convert("RGBA"), (0, 0))
preview.paste(preview_circle, (0, 0), preview_circle)
preview.paste(preview_square, (MASTER + 80, 0), preview_square)
preview_small = preview.resize((preview_w // 4, (MASTER + 40) // 4), Image.LANCZOS)
preview_small.save(f"{PREVIEW_DIR}/WeatherON_adaptive_icon_preview.png")

# ── 4) Notification small icon — 흰색 단색 실루엣 + 투명배경 (bar는 진짜 투명 펀치) ──
NOTIF_SAFE_RATIO = 0.88  # 노티피케이션 아이콘은 OS 마스킹이 없어 패딩을 적게 둠

notif_content = render_content_rgba(
    2048,
    track_color=WHITE, bar_color=TRANSPARENT, knob_color=WHITE, ray_color=WHITE, cloud_color=WHITE,
)

DENSITIES = {"mdpi": 24, "hdpi": 36, "xhdpi": 48, "xxhdpi": 72, "xxxhdpi": 96}
notif_paths = []
for density, px in DENSITIES.items():
    canvas = fit_into_canvas(notif_content, px, NOTIF_SAFE_RATIO)
    path = f"{OUT_DIR}/icon-notification-{density}-{px}.png"
    canvas.save(path)
    notif_paths.append(path)

# 마스터(고해상도) 버전도 별도 보관 — 향후 다른 밀도 필요 시 재추출 기준
notif_master = fit_into_canvas(notif_content, 432, NOTIF_SAFE_RATIO)
notif_master_path = f"{OUT_DIR}/icon-notification-master-432.png"
notif_master.save(notif_master_path)

print("Adaptive foreground:", fg_path, fg_canvas.size)
print("Adaptive background:", bg_path, bg_canvas.size)
print("Preview:", f"{PREVIEW_DIR}/WeatherON_adaptive_icon_preview.png")
print("Notification icons:", notif_paths)
print("Notification master:", notif_master_path)
