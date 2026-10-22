import numpy as np, soundfile as sf, os
SR=16000
# Segment video durations, measured when the clips were recorded. The total
# (73.90s) matches the concatenated video's 73.87s to within rounding, and
# ffmpeg's scene detection found the intro->mark cut at 16.57s against a
# computed 16.58s, which confirms the offsets.
DUR=[("00-title",4.50),("01-intro",12.08),("02-mark",8.08),("03-add",14.92),
     ("04-return",7.36),("05-keyboard",7.40),("06-mobile",6.88),("07-over",5.68),
     ("99-end",7.00)]
starts={}; t=0.0
for n,d in DUR:
    starts[n]=t; t+=d
total=t
print("total timeline", round(total,2),"s")
track=np.zeros(int(total*SR)+SR, dtype=np.float32)
for n,_ in DUR:
    w,sr=sf.read(f"out/{n}.wav")
    assert sr==SR
    i=int(starts[n]*SR)
    end=i+len(w)
    if end>len(track): track=np.pad(track,(0,end-len(track)))
    track[i:end]+=w
    print(f"  {n:<12} placed at {starts[n]:6.2f}s  len {len(w)/SR:5.2f}s  ends {end/SR:6.2f}s")
peak=float(np.abs(track).max())
if peak>1.0: track=track/peak
sf.write("./narration.wav", track, SR)
print("wrote narration.wav", round(len(track)/SR,2),"s peak",round(float(np.abs(track).max()),3))
