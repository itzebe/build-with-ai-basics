#!/usr/bin/env bash
# Mux the narration onto the recorded video and publish it.
#
# The -movflags +faststart is not optional. Without it ffmpeg writes the moov
# atom after mdat, and a browser has to fetch the whole file before it will
# play. GitHub's inline player refuses such a file, so the video looks broken
# even though it downloads fine.
set -euo pipefail
cd "$(dirname "$0")/.."

FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
SRC=${1:-finite-demo-silent.mp4}

python3 devpost/voiceover.py          # writes out/*.wav
python3 devpost/voiceover-mux.py      # writes narration.wav

# Re-encode rather than copy: GitHub will not preview a file this big inline.
# At -c:v copy the result was 2.68 MB and github.com showed
# "we can't show files that are this big right now" instead of a player.
"$FF" -y -i "$SRC" -i narration.wav \
  -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -preset veryslow -crf 28 -pix_fmt yuv420p \
  -c:a aac -b:a 64k -ac 1 -ar 48000 \
  -movflags +faststart -shortest \
  finite-demo.mp4 -loglevel error

python3 - <<'PY'
import struct
d = open("finite-demo.mp4","rb").read(); i = 0; order = []
while i < len(d) - 8:
    s = struct.unpack(">I", d[i:i+4])[0]; t = d[i+4:i+8].decode("latin1")
    if s == 0: break
    if s == 1: s = struct.unpack(">Q", d[i+8:i+16])[0]
    if not t.isprintable(): break
    order.append(t)
    if t in ("moov","trak","mdia","minf","stbl"): i += 8; continue
    i += s
assert order.index("moov") < order.index("mdat"), "moov after mdat: will not stream"
import os
mb = os.path.getsize("finite-demo.mp4") / 1048576
assert mb < 2.0, f"{mb:.2f} MB is too big for GitHub to preview inline"
print(f"faststart OK: {order[:4]}  size {mb:.2f} MB")
PY
