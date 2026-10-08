from pathlib import Path
import math,json,subprocess,hashlib,xml.etree.ElementTree as ET
R=Path(__file__).resolve().parent.parent
# Newly authored vector geometry, visually reconstructed from selected B.
cloud='M 237 428 C 265 356 333 285 422 281 C 534 270 615 344 651 426 C 665 460 684 459 728 450 C 811 433 882 489 908 568 C 930 642 877 733 791 785 C 716 831 616 823 537 780 C 473 745 442 735 397 743 C 310 764 220 742 175 709 C 89 659 65 579 100 515 C 126 464 176 435 221 431 C 229 430 234 431 237 428 Z'
fold='M 175 719 C 209 670 258 649 315 655 C 397 662 448 698 529 690 C 629 681 701 621 790 574 C 842 546 892 544 909 578 C 911 657 864 737 788 782 C 701 831 619 819 536 775 C 460 735 416 701 366 690 C 299 675 261 766 175 719 Z'
under='M 175 719 C 211 671 260 649 315 655 C 338 658 352 670 366 690 C 311 726 247 777 175 719 Z'
mono_cloud='M 237 428 C 265 356 333 285 422 281 C 534 270 615 344 651 426 C 665 460 684 459 728 450 C 811 433 882 489 908 568 C 876 532 840 546 790 574 C 701 621 629 681 529 690 C 448 698 397 662 315 655 C 258 649 209 670 175 709 C 89 659 65 579 100 515 C 126 464 176 435 221 431 C 229 430 234 431 237 428 Z'
def pt(rad,ang):
 a=math.radians(ang);return (697+rad*math.cos(a),354+rad*math.sin(a))
a,b=-61,291
p,q=pt(177,a),pt(177,b);u,v=pt(113,b),pt(113,a)
sun=f'M {p[0]:.3f} {p[1]:.3f} A 177 177 0 1 1 {q[0]:.3f} {q[1]:.3f} L {u[0]:.3f} {u[1]:.3f} A 113 113 0 1 0 {v[0]:.3f} {v[1]:.3f} Z'
# Gap is between -69deg and -61deg, retaining the approved upper-right opening.
cloud=mono_cloud
G={'sun':sun,'cloud':cloud,'fold':fold,'fold-under':under,'monochrome-cloud':mono_cloud}
(R/'source/geometry.json').write_text(json.dumps(G,indent=2))
pal={'light':{'bg':'#E9F6F8','cloud1':'#547F94','cloud2':'#112E3E','fold1':'#B7EDF1','fold2':'#4B9EAD','under':'#245A6A','sun1':'#FFC650','sun2':'#F39A11'},'dark':{'bg':'#102B38','cloud1':'#F4F8F8','cloud2':'#B6D0DA','fold1':'#B2E6EC','fold2':'#4097AA','under':'#1A5062','sun1':'#FFCC59','sun2':'#F5A11B'}}
def svg(content,defs='',box='0 0 1000 1000',size=1024):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="{box}"><defs>{defs}</defs>{content}</svg>'
def defs(c):return ''.join(f'<linearGradient id="{n}" x1="0" y1="0" x2="0.55" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="{c[n+"1"]}"/><stop offset="1" stop-color="{c[n+"2"]}"/></linearGradient>' for n in ['cloud','fold','sun'])
def path(d,fill):return f'<path d="{d}" fill="{fill}"/>'
def render(p,out=None,size=1024):
 out=out or p.with_suffix('.png');subprocess.run(['inkscape',str(p),'--export-type=png','--export-filename='+str(out),'--export-width='+str(size),'--export-height='+str(size),'--export-png-color-mode='+('RGB_8' if '-1024.svg' in str(p) else 'RGBA_8')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
for mode,c in pal.items():
 # Import sources use flat colors, no baked reflections or shadows. Composer supplies material.
 layerparts={'00-background':f'<rect width="1000" height="1000" fill="{c["bg"]}"/>','10-sun':path(sun,c['sun1']),'20-cloud':path(cloud,c['cloud1']),'30-fold-under':path(under,c['under']),'40-fold':path(fold,c['fold2'])}
 for name,part in layerparts.items():
  p=R/f'ios/layers/{mode}/{name}.svg';p.write_text(svg(part));render(p)
 preview=f'<rect width="1000" height="1000" fill="{c["bg"]}"/>'+path(sun,'url(#sun)')+path(cloud,'url(#cloud)')+path(under,c['under'])+path(fold,'url(#fold)')
 p=R/f'ios/composites/WeatherON-Ambient-B-iOS-{mode}-1024.svg';p.write_text(svg(preview,defs(c)));render(p)
 # transparent layered composite reference; not an automatically validated Xcode dark-slot file
 fg=path(sun,'url(#sun)')+path(cloud,'url(#cloud)')+path(under,c['under'])+path(fold,'url(#fold)')
 p=R/f'ios/composites/WeatherON-Ambient-B-iOS-{mode}-foreground.svg';p.write_text(svg(fg,defs(c)));render(p)
# Android: same geometry, tonal fills. Conservative 62.8x48.6dp logo fits circle radius33.
transform='translate(16 16) scale(0.076)'
c=pal['light'];androidcolors={'sun':'#F5AE2B','cloud':'#285467','fold-under':'#235B6B','fold':'#80CBD5'}
fg=''.join(path(G[n],androidcolors[n]) for n in ['sun','cloud','fold-under','fold'])
androidsvg=svg(f'<rect width="1000" height="1000" fill="#E7F2F4"/>{fg}')
p=R/'android/store/WeatherON-Ambient-B-Play-512.svg';p.write_text(androidsvg);render(p,size=512)
# Resource vectors deliberately use only broadly supported solid paths.
head='<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">'
def xmlpath(d,color):return f'<path android:fillColor="{color}" android:pathData="{d}"/>'
group='<group android:translateX="16" android:translateY="16" android:scaleX="0.076" android:scaleY="0.076">'
(R/'android/res/drawable/weatheron_ambient_b_foreground.xml').write_text(head+group+''.join(xmlpath(G[n],androidcolors[n]) for n in ['sun','cloud','fold-under','fold'])+'</group></vector>')
(R/'android/res/drawable/weatheron_ambient_b_background.xml').write_text(head+xmlpath('M0,0 H108 V108 H0 Z','#E7F2F4')+'</vector>')
mono=path(sun,'#FFFFFF')+path(mono_cloud,'#FFFFFF')+f'<g transform="translate(0 12)">{path(fold,"#FFFFFF")}</g>'
(R/'android/res/drawable/weatheron_ambient_b_monochrome.xml').write_text(head+group+xmlpath(sun,'#FFFFFFFF')+xmlpath(mono_cloud,'#FFFFFFFF')+'<group android:translateY="12">'+xmlpath(fold,'#FFFFFFFF')+'</group></group></vector>')
for ver in [26,33]:
 extra='<monochrome android:drawable="@drawable/weatheron_ambient_b_monochrome"/>' if ver==33 else ''
 (R/f'android/res/mipmap-anydpi-v{ver}/weatheron_ambient_b.xml').write_text('<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@drawable/weatheron_ambient_b_background"/><foreground android:drawable="@drawable/weatheron_ambient_b_foreground"/>'+extra+'</adaptive-icon>')
# Plain SVG previews are newly authored layouts; source images are never edited.
previewdefs='<clipPath id="circle"><circle cx="54" cy="54" r="36"/></clipPath><clipPath id="round"><rect x="18" y="18" width="72" height="72" rx="18"/></clipPath>'
for name,clip in [('circle','circle'),('round','round')]:
 content=f'<g clip-path="url(#{clip})"><rect width="108" height="108" fill="#E7F2F4"/><g transform="{transform}">{fg}</g></g>'
 p=R/f'previews/Android-{name}.svg';p.write_text(svg(content,previewdefs,box='0 0 108 108',size=512));render(p,size=512)
p=R/'previews/Android-monochrome.svg';p.write_text(svg(f'<circle cx="54" cy="54" r="36" fill="#445D67"/><g transform="{transform}">{mono}</g>',box='0 0 108 108',size=512));render(p,size=512)
for p in R.rglob('*.xml'):ET.parse(p)
print('Created sources/layers/composites/Android vectors and previews.')

# Transparent foreground for numerical safe-zone validation.
p=R/'previews/Android-foreground-safezone.svg';p.write_text(svg(f'<g transform="{transform}">{fg}</g>',box='0 0 108 108',size=1080));render(p,size=1080)
p=R/'previews/Android-monochrome-safezone.svg';p.write_text(svg(f'<g transform="{transform}">{mono}</g>',box='0 0 108 108',size=1080));render(p,size=1080)
