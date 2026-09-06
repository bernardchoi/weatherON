"""Check native C1 card breathing room from an adb UI dump (C1 must be open)."""
import os
from pathlib import Path
import shutil
import re
import subprocess
import xml.etree.ElementTree as ET

ADB = os.environ.get('ADB') or shutil.which('adb') or str(Path.home() / 'Library/Android/sdk/platform-tools/adb')
xml = subprocess.check_output([ADB, 'exec-out', 'uiautomator', 'dump', '/dev/tty'], text=True)
root = ET.fromstring(xml[xml.index('<?xml'):xml.index('</hierarchy>') + 12])
density = subprocess.check_output([ADB, 'shell', 'wm', 'density'], text=True)
scale = int(re.findall(r'density: (\d+)', density)[-1]) / 160
wardrobe = next(n.get('content-desc') for n in root.iter('node') if re.fullmatch(r'내 옷장 \d+개 보기', n.get('content-desc', '')))
for label in (wardrobe, '코디 스타일 기준 수정'):
    card = next(n for n in root.iter('node') if n.get('content-desc') == label)
    bounds = lambda n: list(map(int, re.findall(r'\d+', n.get('bounds'))))
    texts = [bounds(n) for n in card.iter('node') if n.get('text')]
    box = bounds(card)
    top = (min(t[1] for t in texts) - box[1]) / scale
    bottom = (box[3] - max(t[3] for t in texts)) / scale
    print(f'{label}: top={top:.1f}dp bottom={bottom:.1f}dp (required >=8dp)', flush=True)
    assert min(top, bottom) >= 7.5, 'Card text is crowded against its edges'
print('PASS: both outfit shortcut cards retain vertical padding')
