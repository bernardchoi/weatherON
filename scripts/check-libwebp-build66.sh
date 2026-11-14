#!/bin/bash
set -euo pipefail
ROOT=$(mktemp -d "${TMPDIR:-/tmp}/weatheron-webp-check.XXXXXX")
trap 'rm -rf "$ROOT"' EXIT
PODS=${1:-apps/mobile/ios/Pods}
cp -R "$PODS/libwebp" "$ROOT/original"
chmod -R u+w "$ROOT/original"
# Reconstruct the upstream declarations if pod install already applied the patch.
python3 - "$ROOT/original" <<'PY'
import pathlib,sys
root=pathlib.Path(sys.argv[1])
for rel in ['src/dsp/dec_neon.c','src/enc/backward_references_enc.c']:
 p=root/rel;s=p.read_text()
 s=s.replace('uint16x8_t sum_top = vdupq_n_u16(0);','uint16x8_t sum_top;').replace('uint16x8_t sum_left = vdupq_n_u16(0);','uint16x8_t sum_left;').replace('int best_offset = 0;','int best_offset;')
 p.write_text(s)
PY
mkdir "$ROOT/pods"
cp -R "$ROOT/original" "$ROOT/pods/libwebp"
ruby scripts/patch-libwebp-build66.rb "$ROOT/pods"
cp -R "$ROOT/pods/libwebp" "$ROOT/once"
ruby scripts/patch-libwebp-build66.rb "$ROOT/pods"
diff -qr "$ROOT/once" "$ROOT/pods/libwebp"
SDK=$(xcrun --sdk iphoneos --show-sdk-path)
for opt in O2 Os; do
 for name in dec_neon backward_references_enc; do
  if [ "$name" = dec_neon ]; then src=src/dsp/$name.c; else src=src/enc/$name.c; fi
  for variant in original patched; do
   dir="$ROOT/original"; flags=""
   if [ "$variant" = patched ]; then dir="$ROOT/pods/libwebp"; flags="-Werror"; fi
   xcrun clang -target arm64-apple-ios16.4 -isysroot "$SDK" -I"$dir" -$opt -Wuninitialized -Wconditional-uninitialized ${flags} -S "$dir/$src" -o "$ROOT/$variant-$name-$opt.s" 2>"$ROOT/$variant-$name-$opt.log"
   printf '%s %s %s warnings=%s\n' "$variant" "$name" "$opt" "$(grep -c 'warning:' "$ROOT/$variant-$name-$opt.log" || true)"
  done
  cmp "$ROOT/original-$name-$opt.s" "$ROOT/patched-$name-$opt.s"
  echo "$name $opt assembly identical"
 done
done
