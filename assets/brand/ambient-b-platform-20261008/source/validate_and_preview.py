from pathlib import Path
from PIL import Image
import math,json,subprocess,re,struct,xml.etree.ElementTree as ET
r=Path(__file__).resolve().parent.parent
checks=[]
for f in ['Android-foreground-safezone.png','Android-monochrome-safezone.png']:
 im=Image.open(r/'previews'/f);a=im.getchannel('A'); pts=[(x,y) for y in range(im.height) for x in range(im.width) if a.getpixel((x,y))>0];rad=max(math.hypot(x+.5-540,y+.5-540) for x,y in pts)/10;b=a.getbbox()
 checks.append({'file':f,'max_radius_dp':round(rad,3),'limit_radius_dp':33,'pass':rad<=33,'bounds_px':b,'width_dp':(b[2]-b[0])/10,'height_dp':(b[3]-b[1])/10})
 assert rad<=33
for f in [r/'android/store/WeatherON-Ambient-B-Play-512.png',*r.glob('ios/composites/*1024.png')]:
 im=Image.open(f);checks.append({'file':str(f.relative_to(r)),'size':im.size,'mode':im.mode,'bytes':f.stat().st_size,'alpha_extrema':im.getchannel('A').getextrema() if im.mode=='RGBA' else None})
for f in [*r.rglob('*.svg'),*r.rglob('*.xml')]:ET.parse(f)
checks.append({'xml_parse':'passed','note':'XML parse is not Android resource compilation.'})
for name in ['10-sun','20-cloud','30-fold-under','40-fold']:
 ls=ET.parse(r/f'ios/layers/light/{name}.svg');ds=ET.parse(r/f'ios/layers/dark/{name}.svg');ns={'s':'http://www.w3.org/2000/svg'}
 assert [e.attrib['d'] for e in ls.findall('.//s:path',ns)]==[e.attrib['d'] for e in ds.findall('.//s:path',ns)]
checks.append({'ios_light_dark_path_equality':'passed','original_raster_pixel_equality':'not claimed; newly authored vectors'})
(r/'docs/validation.json').write_text(json.dumps(checks,indent=2))
def inner(p):return re.sub(r'^<svg[^>]*>|</svg>$','',p.read_text())
light=inner(r/'ios/composites/WeatherON-Ambient-B-iOS-light-1024.svg')
dark=inner(r/'ios/composites/WeatherON-Ambient-B-iOS-dark-1024.svg').replace('id="','id="dark-').replace('url(#','url(#dark-')
android=inner(r/'previews/Android-round.svg');mono=inner(r/'previews/Android-monochrome.svg')
parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="760" viewBox="0 0 1600 760"><rect width="1600" height="760" fill="#F5F7F7"/><defs><clipPath id="iosMask"><rect width="1000" height="1000" rx="222"/></clipPath></defs><style>text{font-family:sans-serif;fill:#243E49}</style><text x="64" y="67" font-size="32" font-weight="600">WeatherON / Ambient B</text><text x="64" y="101" font-size="18">Platform asset study · shared vector geometry · not device screenshots</text>']
for i,(name,sub,code,scale) in enumerate([('iOS · Light','Layered material reference',light,.33),('iOS · Dark','Same paths, different appearance',dark,.33),('Android · Adaptive','Tonal surface / mask preview',android,4.58),('Android · Themed','Monochrome silhouette',mono,4.58)]):
 x=64+i*380;parts.append(f'<text x="{x}" y="162" font-size="23" font-weight="600">{name}</text><text x="{x}" y="194" font-size="14">{sub}</text>')
 if i<2:parts.append(f'<g transform="translate({x} 240) scale({scale})"><g clip-path="url(#iosMask)">{code}</g></g>')
 else:parts.append(f'<g transform="translate({x-83} 157) scale({scale})">{code}</g>')
parts.append('<text x="64" y="668" font-size="19">Cloud · flowing fabric · open sun halo</text><text x="64" y="702" font-size="16">Independent assets. Existing application resources remain unchanged.</text></svg>')
p=r/'previews/WeatherON-Ambient-B-Platform-Overview.svg';p.write_text(''.join(parts))
subprocess.run(['inkscape',str(p),'--export-filename='+str(p.with_suffix('.png')),'--export-width=1600'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
print(json.dumps(checks,indent=2))
