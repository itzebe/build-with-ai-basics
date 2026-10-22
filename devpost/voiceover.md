# Voiceover

The narration in `finite-demo.mp4`, one block per shot. Each block is timed to fit inside
its shot, and the audio is placed at the shot's start.

| Shot | Fits in | Spoken |
|---|---|---|
| Title card | 4.50s | Some moments run out. |
| First load | 12.08s | This counts the ones still to come. One square for every time it will happen. The pale ones have already passed. The green ones are still ahead. |
| Marking | 8.08s | Tap a square you were there for. Tap it again to take it back. |
| Adding | 14.92s | Add your own. How often it happens, how long it runs, and when it started. It begins partly in the past, because it started years ago. |
| Coming back | 7.36s | Come back a month later, and it tells you what passed while you were away. Once. |
| Keyboard | 7.40s | One tab stop, not one per square. The arrow keys move. Enter records. |
| Phone | 6.88s | The same app on a phone. |
| Finished phase | 5.68s | When a phase is over, it says so, and still lets you record it. |
| End card | 7.00s | One square for every moment. The squares pass on their own. |

Total spoken 55.2s across 73.9s of video, so each block starts on its shot and finishes
before the next one.

## Notes on the voice

The voice is synthetic Nigerian-accented English: SpeechT5 fine-tuned on Nigerian-accented
recordings (`Ngadou/nigerian_accent_tts_en`). `voiceover.py` regenerates it.

The product name is never spoken. The model cannot say "Finite". Across 240 combinations of
spelling ("Finite", "Fynite", "Fy nite", "Fine ite", "Fighnite"), speaker embedding and
random seed, it produced "Five Nights", "Phoenix", "Fire Nate", "find eights", "fine aids"
and "finance", and never once the intended word. The title card carries the name visually
instead, and the narration describes the idea.

Two other things had to be worked around, and both were measured:

- The fine-tune ships no speaker embedding, and SpeechT5 takes its accent mostly from the
  embedding. Embeddings are extracted with a SpeechBrain x-vector encoder from the same
  Nigerian training audio, then L2-normalized to the scale the model expects.
- Generation is stochastic even with the model in `eval()`, so every call is seeded.
  Without a seed the same sentence gives different audio on each run.

Every line was checked by transcribing the rendered audio and comparing it to the intended
text. Word counts match exactly and 97% of words align. The remaining differences are the
speech recogniser mishearing the accent, not the narration being wrong: it writes "At your
own" for "Add your own", "up" for "app", and "face" for "phase".

If you would rather use your own voice, read the table above in order. You can say the
product name.
