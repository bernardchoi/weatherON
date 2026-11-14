# Clarify definite assignment for Clang without changing libwebp's control flow.
# Build 66, libwebp 1.6.0. arm64 iOS -O2 assembly is identical before/after.
def patch_weatheron_libwebp(pods_root)
  patches = {
    'libwebp/src/dsp/dec_neon.c' => [
      ['  uint16x8_t sum_top;', '  uint16x8_t sum_top = vdupq_n_u16(0);', 2],
      ['  uint16x8_t sum_left;', '  uint16x8_t sum_left = vdupq_n_u16(0);', 2]
    ],
    'libwebp/src/enc/backward_references_enc.c' => [
      ['    int best_offset;', '    int best_offset = 0;', 1]
    ]
  }
  patches.each do |relative, replacements|
    path = File.join(pods_root, relative)
    next unless File.exist?(path)
    original = File.read(path)
    patched = original.dup
    replacements.each do |before, after, expected|
      next if patched.scan(after).length == expected && !patched.include?(before)
      unless patched.scan(before).length == expected
        raise "libwebp source changed: inspect #{relative} before updating the warning patch"
      end
      patched = patched.gsub(before, after)
    end
    if patched != original
      mode = File.stat(path).mode
      begin
        File.chmod(mode | 0200, path)
        File.write(path, patched)
      ensure
        File.chmod(mode, path)
      end
    end
  end
end

patch_weatheron_libwebp(ARGV.fetch(0)) if $PROGRAM_NAME == __FILE__
