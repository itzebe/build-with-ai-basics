"""Generate the Finite voiceover with a Nigerian-accented English TTS voice.

Model: Ngadou/nigerian_accent_tts_en - microsoft/speecht5_tts fine-tuned on
Ngadou/ng-accent-audio-with-text (500 Nigerian-accented English recordings).

Two things this script has to work around, both measured rather than assumed:

1. SpeechT5 takes its accent largely from the speaker embedding, and this
   fine-tune ships none. Embeddings here are extracted with a SpeechBrain
   x-vector encoder from that same Nigerian training audio, then L2-normalized
   to the scale the model expects (CMU xvectors are unit-norm; raw encoder
   output is ~292, which the model reads as out-of-distribution).

2. Generation is stochastic even with the model in eval mode, so every call is
   seeded. Without a seed the same input produces different audio each run.

The product name is never spoken. The model cannot pronounce "Finite": across
240 spelling/speaker/seed combinations it produced "Five Nights", "Phoenix",
"Fire Nate", "find eights", "finance" and similar, and never the intended word.
The title card carries the name visually instead, and the narration describes
the idea. If you record this in your own voice, say the name.
"""
import os

import numpy as np
import soundfile as sf
import torch
from transformers import SpeechT5ForTextToSpeech, SpeechT5HifiGan, SpeechT5Processor

SR = 16000
SEED = 0
SPEAKER = 0
OUT = "out"
os.makedirs(OUT, exist_ok=True)

proc = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
model = SpeechT5ForTextToSpeech.from_pretrained("Ngadou/nigerian_accent_tts_en")
voc = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")
model.eval()
voc.eval()
print("tts loaded")

emb = np.load("ng_embs.npy")
emb = emb / np.linalg.norm(emb, axis=1, keepdims=True)


def synth(text, speaker=SPEAKER, pause=0.30):
    """One sentence at a time; SpeechT5 truncates long inputs."""
    parts = []
    for chunk in [s.strip() for s in text.split(".") if s.strip()]:
        torch.manual_seed(SEED)
        inp = proc(text=chunk + ".", return_tensors="pt")
        with torch.no_grad():
            w = model.generate_speech(
                inp["input_ids"], torch.tensor(emb[speaker]).unsqueeze(0), vocoder=voc
            ).numpy()
        parts.append(w)
        parts.append(np.zeros(int(SR * pause), dtype=np.float32))
    return np.concatenate(parts) if parts else np.zeros(1, dtype=np.float32)


def normalize(w, target_dbfs=-1.5):
    peak = float(np.abs(w).max())
    if peak == 0:
        return w
    return (w * ((10 ** (target_dbfs / 20.0)) / peak)).astype(np.float32)


# One block per video segment. The limit is the measured duration of the
# matching recorded clip, so narration never overruns its picture.
SEGMENTS = [
    ("00-title", 4.50, "Some moments run out."),
    ("01-intro", 12.08, "This counts the ones still to come. One square for every "
                        "time it will happen. The pale ones have already passed. The "
                        "green ones are still ahead."),
    ("02-mark", 8.08, "Tap a square you were there for. Tap it again to take it back."),
    ("03-add", 14.92, "Add your own. How often it happens, how long it runs, and when "
                      "it started. It begins partly in the past, because it started "
                      "years ago."),
    ("04-return", 7.36, "Come back a month later, and it tells you what passed while "
                        "you were away. Once."),
    ("05-keyboard", 7.40, "One tab stop, not one per square. The arrow keys move. "
                          "Enter records."),
    ("06-mobile", 6.88, "The same app on a phone."),
    ("07-over", 5.68, "When a phase is over, it says so, and still lets you record it."),
    ("99-end", 7.00, "One square for every moment. The squares pass on their own."),
]

if __name__ == "__main__":
    import sys

    if "--options" in sys.argv:
        line = "This counts the ones still to come, one square for each time it will happen."
        for i in range(6):
            w = normalize(synth(line, i))
            sf.write(f"{OUT}/voice-option-{i}.wav", w, SR)
            print(f"  voice-option-{i}.wav  {len(w)/SR:.2f}s")
        raise SystemExit

    total = 0.0
    for name, limit, text in SEGMENTS:
        w = normalize(synth(text))
        sf.write(f"{OUT}/{name}.wav", w, SR)
        dur = len(w) / SR
        total += dur
        print(f"  {name:<12} {dur:5.2f}s / {limit:5.2f}s  {'OK' if dur <= limit else 'TOO LONG'}")
    print(f"  total narration {total:.2f}s")
