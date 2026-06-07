#!/usr/bin/env python3
"""Cinematic string/violin previews (original, royalty-free).
A bowed-string ensemble + expressive solo violin (vibrato, portamento, bow
attack, body resonance) over an emotional build to a soaring climax. Renders MP3."""
import os, subprocess, numpy as np
from scipy.signal import butter, lfilter, fftconvolve
import imageio_ffmpeg, wave

SR = 44100
FF = imageio_ffmpeg.get_ffmpeg_exe()
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "previews")
os.makedirs(OUT, exist_ok=True)

def midi(n): return 440.0 * 2 ** ((n - 69) / 12.0)
def bf(x, cut, kind="low", order=2):
    cut = np.clip(cut / (SR / 2), 1e-4, 0.999); b, a = butter(order, cut, btype=kind); return lfilter(b, a, x)
def lp(x, c, o=2): return bf(x, c, "low", o)
def hp(x, c, o=2): return bf(x, c, "high", o)
def bp(x, c, q=1.5):
    w = c / (SR / 2); bw = w / q
    lo = np.clip(w - bw / 2, 1e-4, 0.999); hi = np.clip(w + bw / 2, lo + 1e-4, 0.999)
    b, a = butter(2, [lo, hi], btype="band"); return lfilter(b, a, x)
def noise(n): return np.random.uniform(-1, 1, n)
def sus_env(n, atk, rel, swell=0.18):
    e = np.ones(n); a = int(atk * SR); r = int(min(rel, 0.45) * SR)
    if a > 0: e[:a] = np.linspace(0, 1, a) ** 1.5
    if r > 0: e[-r:] *= np.linspace(1, 0, r)
    # gentle crescendo across the note (bow swell)
    e *= (1 - swell) + swell * np.linspace(0, 1, n)
    return e

def bowed(freq, dur, from_freq=None, vib_rate=5.9, vib_depth=0.006, vib_delay=0.18,
          atk=0.09, rel=0.3, bright=1.0, nharm=14):
    """One bowed string voice: additive harmonics + vibrato + portamento + body + bow noise."""
    total = dur + rel; n = int(total * SR); t = np.arange(n) / SR
    base = np.full(n, float(freq))
    if from_freq:
        g = int(0.07 * SR); g = min(g, n); base[:g] = np.linspace(from_freq, freq, g)
    vd = vib_depth * np.clip((t - vib_delay) / 0.4, 0, 1)
    inst = base * (1 + vd * np.sin(2 * np.pi * vib_rate * t))
    ph = 2 * np.pi * np.cumsum(inst) / SR
    s = np.zeros(n)
    for k in range(1, nharm + 1):
        if k * freq > 11000: break
        s += (1.0 / k ** 1.15) * np.sin(k * ph)
    # violin body resonance (air + main wood + bridge hill)
    body = 0.6 * s + 0.25 * bp(s, 550, 1.2) + 0.3 * bp(s, 2600 * bright, 1.4)
    body = lp(body, 8500 * bright)
    e = sus_env(n, atk, rel)
    bow = hp(noise(n), 2500) * np.exp(-t / 0.04) * 0.05
    return (body * e + bow * (e ** 2)) * 0.5

def ens(freq, dur, voices=7, cents=9.0, spread_ms=20.0, **kw):
    """A string section: detuned, time-spread unison voices."""
    rel = kw.get("rel", 0.3); maxoff = int((spread_ms / 1000) * SR)
    n = int((dur + rel) * SR) + maxoff + 8
    buf = np.zeros(n)
    for _ in range(voices):
        c = np.random.uniform(-cents, cents); f = freq * 2 ** (c / 1200)
        v = bowed(f, dur, vib_rate=np.random.uniform(5.3, 6.4),
                  vib_depth=np.random.uniform(0.004, 0.007), **kw)
        off = int(np.random.uniform(0, maxoff))
        buf[off:off + len(v)] += v
    return buf / np.sqrt(voices)

def timp(freq=70, dur=0.7):
    n = int(dur * SR); t = np.arange(n) / SR
    f = freq * (1 + 0.4 * np.exp(-t / 0.04))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.28)
    s += lp(noise(n), 400) * np.exp(-t / 0.18) * 0.4
    return np.tanh(s * 1.2) * 0.8

class Mix:
    def __init__(self, length): self.n = int(length * SR); self.dry = np.zeros((self.n, 2)); self.wet = np.zeros((self.n, 2))
    def add(self, sig, t, gain=1.0, pan=0.0, wet=0.4):
        i = int(t * SR); j = i + len(sig)
        if i >= self.n: return
        if j > self.n: sig = sig[:self.n - i]; j = self.n
        l = gain * (1 - max(pan, 0)); r = gain * (1 + min(pan, 0))
        self.dry[i:j, 0] += sig * l * (1 - wet); self.dry[i:j, 1] += sig * r * (1 - wet)
        self.wet[i:j, 0] += sig * l * wet; self.wet[i:j, 1] += sig * r * wet
    def render(self):
        L = int(2.8 * SR); t = np.arange(L) / SR
        impL = lp(noise(L), 7000) * np.exp(-t / 0.8); impR = lp(noise(L), 7000) * np.exp(-t / 0.8)
        wL = fftconvolve(self.wet[:, 0], impL)[:self.n]; wR = fftconvolve(self.wet[:, 1], impR)[:self.n]
        out = self.dry.copy(); out[:, 0] += wL * 0.02; out[:, 1] += wR * 0.02
        out = np.tanh(out * 1.05); out /= max(np.abs(out).max(), 1e-6); out *= 0.95
        fi = int(0.4 * SR); fo = int(2.0 * SR)
        out[:fi] *= np.linspace(0, 1, fi)[:, None]; out[-fo:] *= np.linspace(1, 0, fo)[:, None]
        return out

def write_mp3(stereo, name):
    raw = (np.clip(stereo, -1, 1) * 32767).astype("<i2").tobytes()
    wavp = os.path.join(OUT, name + ".wav"); mp3 = os.path.join(OUT, name + ".mp3")
    with wave.open(wavp, "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(raw)
    subprocess.run([FF, "-y", "-hide_banner", "-loglevel", "error", "-i", wavp, "-c:a", "libmp3lame", "-b:a", "192k", mp3], check=True)
    os.remove(wavp); print("  ->", os.path.basename(mp3), f"{os.path.getsize(mp3)//1024} KB")

def build(cfg):
    bpm = cfg["bpm"]; beat = 60.0 / bpm; bar = 4 * beat
    nbars = 9; length = nbars * bar + 3.0; m = Mix(length)
    chords = {k: [midi(x) for x in v] for k, v in cfg["chords"].items()}
    roots = cfg["roots"]; seq = cfg["seq"]  # per-bar chord key

    # ----- pads / cello (per bar) -----
    for b in range(nbars):
        t0 = b * bar; key = seq[b]; ch = chords[key]; rt = midi(roots[key] - 12)
        sect = 0.18 if b < 2 else (0.34 if b < 4 else (0.5 if b < 8 else 0.62))
        # low strings (cello/bass) — sustained
        m.add(ens(rt, bar * 1.04, voices=4, cents=7, atk=0.18, rel=0.5, bright=0.7), t0, gain=sect * 0.9, wet=0.45)
        # string ensemble chord (mid)
        if b >= 1:
            for f in ch:
                m.add(ens(f, bar * 1.04, voices=7, cents=10, atk=0.5 if b < 4 else 0.25, rel=0.5,
                          bright=0.9 if b < 8 else 1.15), t0, gain=sect * 0.7 / len(ch),
                      pan=np.random.uniform(-0.25, 0.25), wet=0.55)
        # timpani build + climax
        if b in (6, 7):
            for k in range(4): m.add(timp(70, 0.6), t0 + k * beat, gain=0.22 + 0.05 * k, wet=0.3)
        if b == 8:
            m.add(timp(70, 1.2), t0, gain=0.9, wet=0.3); m.add(timp(105, 1.0), t0, gain=0.5, wet=0.3)

    # reverse-swell into the climax
    sw_n = int(1.6 * SR); tsw = np.arange(sw_n) / SR
    swell = hp(noise(sw_n), 3000) * (tsw / tsw[-1]) ** 2 * 0.5
    m.add(swell, 7 * bar, gain=0.5, wet=0.6)

    # ----- solo violin melody (legato, portamento) from bar 5 (index 4) -----
    t = 4 * bar; prev = None
    for (mn, bts) in cfg["mel"]:
        dur = bts * beat
        v = bowed(midi(mn), dur, from_freq=(midi(prev) if prev else None),
                  vib_rate=6.1, vib_depth=0.008, atk=0.11, rel=0.35, bright=1.2)
        # double an octave-soft for body
        v2 = bowed(midi(mn), dur, vib_rate=5.6, vib_depth=0.006, atk=0.13, rel=0.35, bright=0.8) * 0.4
        ln = max(len(v), len(v2)); buf = np.zeros(ln); buf[:len(v)] += v; buf[:len(v2)] += v2
        m.add(buf, t, gain=0.95, pan=-0.05, wet=0.5)
        t += dur; prev = mn
    return m.render()

CONFIGS = {
    "4_violin_emotional": {
        "bpm": 72,
        "chords": {"Am": [57, 60, 64], "F": [53, 57, 60], "C": [60, 64, 67], "G": [55, 59, 62]},
        "roots": {"Am": 57, "F": 53, "C": 60, "G": 55},
        "seq": ["Am", "Am", "F", "C", "Am", "F", "C", "G", "C"],
        "mel": [(69, 1), (71, 1), (72, 2), (72, 2), (77, 2), (76, 2), (79, 2), (74, 2), (71, 2), (84, 4)],
    },
    "5_violin_epic": {
        "bpm": 76,
        "chords": {"Dm": [50, 53, 57], "Bb": [46, 50, 53], "F": [53, 57, 60], "C": [48, 52, 55]},
        "roots": {"Dm": 50, "Bb": 46, "F": 53, "C": 48},
        "seq": ["Dm", "Dm", "Bb", "F", "Dm", "Bb", "F", "C", "Dm"],
        "mel": [(69, 1), (74, 1), (77, 2), (77, 2), (74, 2), (81, 2), (77, 2), (79, 2), (76, 2), (86, 4)],
    },
}

if __name__ == "__main__":
    for name, cfg in CONFIGS.items():
        print("Rendering", name, "...")
        write_mp3(build(cfg), name)
    print("Done.")
