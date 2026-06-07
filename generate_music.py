#!/usr/bin/env python3
"""Generate cinematic, Tulum-style build-up preview tracks (original, royalty-free).
Each builds from atmosphere -> groove -> tension -> a big reveal/drop. Renders MP3s."""
import os, subprocess, numpy as np
from scipy.signal import butter, lfilter, fftconvolve
import imageio_ffmpeg

SR = 44100
FF = imageio_ffmpeg.get_ffmpeg_exe()
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "previews")
os.makedirs(OUT, exist_ok=True)

def midi(n): return 440.0 * 2 ** ((n - 69) / 12.0)
def butter_f(x, cut, kind="low", order=2):
    cut = np.clip(cut / (SR / 2), 1e-4, 0.999); b, a = butter(order, cut, btype=kind); return lfilter(b, a, x)
def lp(x, c, o=2): return butter_f(x, c, "low", o)
def hp(x, c, o=2): return butter_f(x, c, "high", o)
def perc_env(n, atk, dec):
    t = np.arange(n) / SR
    return np.where(t < atk, t / max(atk, 1e-5), np.exp(-(t - atk) / dec))
def sus_env(n, atk, rel):
    e = np.ones(n); a = int(atk * SR); r = int(rel * SR)
    if a > 0: e[:a] = np.linspace(0, 1, a)
    if r > 0: e[-r:] = np.linspace(1, 0, r)
    return e
def saw(freq, n):
    t = np.arange(n) / SR; return 2 * (t * freq - np.floor(0.5 + t * freq))
def dsaw(freq, n, voices=3, det=0.012):
    out = np.zeros(n)
    for i in range(voices):
        f = freq * (1 + det * (i - (voices - 1) / 2))
        out += saw(f, n)
    return out / voices
def sine(freq, n, ph=0.0):
    t = np.arange(n) / SR; return np.sin(2 * np.pi * freq * t + ph)
def noise(n): return np.random.uniform(-1, 1, n)

# ---- instruments (return mono float arrays) ----
def kick(dur=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 120 * np.exp(-t / 0.06) + 45
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * perc_env(n, 0.001, 0.11)
    click = hp(noise(n), 2000) * perc_env(n, 0.0005, 0.01) * 0.5
    return np.tanh((body + click) * 1.4) * 0.9
def sub(freq, dur):
    n = int(dur * SR); s = (sine(freq, n) * 0.9 + sine(freq * 2, n) * 0.1)
    return lp(s, 200) * sus_env(n, 0.02, 0.08) * 0.9
def bassp(freq, dur):
    n = int(dur * SR); s = dsaw(freq, n, 2, 0.006)
    s = lp(s, 480)
    return s * perc_env(n, 0.003, dur * 0.5) * 0.8
def conga(freq, dur=0.2):
    n = int(dur * SR); body = sine(freq, n) * perc_env(n, 0.001, 0.06)
    sk = butter_f(noise(n), freq, "low", 2) * perc_env(n, 0.001, 0.04) * 0.4
    return (body + sk) * 0.8
def shaker(dur=0.07):
    n = int(dur * SR); return hp(noise(n), 7000) * perc_env(n, 0.002, 0.03) * 0.6
def pluck(freq, dur=0.32):
    n = int(dur * SR); s = (saw(freq, n) * 0.6 + sine(freq * 2, n) * 0.4)
    s = lp(s, 1700) * perc_env(n, 0.002, dur * 0.45)
    return s * 0.7
def flute(freq, dur, vib=5.0):
    n = int(dur * SR); t = np.arange(n) / SR
    vibr = 1 + 0.006 * np.sin(2 * np.pi * vib * t)
    ph = 2 * np.pi * np.cumsum(freq * vibr) / SR
    s = np.sin(ph) * 0.7 + np.sin(2 * ph) * 0.18
    breath = hp(noise(n), 4000) * 0.06
    return (s + breath) * sus_env(n, 0.06, min(0.25, dur * 0.4)) * 0.6
def pad(freqs, dur, cut=1300):
    n = int(dur * SR); s = np.zeros(n)
    for f in freqs: s += dsaw(f, n, 3, 0.014)
    s = lp(s, cut) / max(len(freqs), 1)
    return s * sus_env(n, 0.6, 0.6) * 0.5
def riser(dur=2.0):
    n = int(dur * SR); t = np.arange(n) / SR
    sweep = 200 * (2 ** (4 * t / dur))
    ph = 2 * np.pi * np.cumsum(sweep) / SR
    tone = np.sin(ph) * 0.3
    nz = hp(noise(n), 2500) * 0.5
    amp = (t / dur) ** 1.6
    return (tone + nz) * amp * 0.7
def impact(dur=2.2):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 80 * np.exp(-t / 0.25) + 35
    ph = 2 * np.pi * np.cumsum(f) / SR
    boom = np.sin(ph) * np.exp(-t / 0.7)
    hit = lp(noise(n), 1500) * np.exp(-t / 0.5) * 0.5
    return np.tanh((boom + hit) * 1.3) * 0.95
def revcym(dur=2.0):
    n = int(dur * SR); s = hp(noise(n), 5000) * (np.arange(n) / n) ** 2
    return s * 0.4

# ---- mixer ----
class Mix:
    def __init__(self, length):
        self.n = int(length * SR)
        self.dry = np.zeros((self.n, 2)); self.wet = np.zeros((self.n, 2))
    def add(self, sig, t, gain=1.0, pan=0.0, wet=0.3):
        i = int(t * SR); j = i + len(sig)
        if i >= self.n: return
        if j > self.n: sig = sig[:self.n - i]; j = self.n
        l = gain * (1 - max(pan, 0)); r = gain * (1 + min(pan, 0))
        self.dry[i:j, 0] += sig * l * (1 - wet); self.dry[i:j, 1] += sig * r * (1 - wet)
        self.wet[i:j, 0] += sig * l * wet; self.wet[i:j, 1] += sig * r * wet
    def render(self):
        imp_n = int(1.8 * SR); t = np.arange(imp_n) / SR
        impL = noise(imp_n) * np.exp(-t / 0.5); impR = noise(imp_n) * np.exp(-t / 0.5)
        wetL = fftconvolve(self.wet[:, 0], impL)[:self.n]
        wetR = fftconvolve(self.wet[:, 1], impR)[:self.n]
        out = self.dry.copy(); out[:, 0] += wetL * 0.012; out[:, 1] += wetR * 0.012
        out = np.tanh(out * 1.1)
        out /= max(np.abs(out).max(), 1e-6); out *= 0.95
        # gentle fade in/out
        fi = int(0.2 * SR); fo = int(1.5 * SR)
        out[:fi] *= np.linspace(0, 1, fi)[:, None]; out[-fo:] *= np.linspace(1, 0, fo)[:, None]
        return out

def write_mp3(stereo, name):
    raw = (np.clip(stereo, -1, 1) * 32767).astype("<i2").tobytes()
    path_wav = os.path.join(OUT, name + ".wav"); path_mp3 = os.path.join(OUT, name + ".mp3")
    import wave
    with wave.open(path_wav, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(raw)
    subprocess.run([FF, "-y", "-hide_banner", "-loglevel", "error", "-i", path_wav,
                    "-c:a", "libmp3lame", "-b:a", "192k", path_mp3], check=True)
    os.remove(path_wav)
    print("  ->", os.path.basename(path_mp3), f"{os.path.getsize(path_mp3)//1024} KB")

# ---- arrangement ----
def build(cfg):
    bpm = cfg["bpm"]; beat = 60.0 / bpm; bar = 4 * beat
    nbars = 14; length = nbars * bar + 2.0
    m = Mix(length)
    chords = cfg["chords"]                 # 4 chords, each a list of midi notes (triad/octaves)
    barchord = [0, 0, 1, 1, 2, 2, 3, 3, 0, 0, 1, 1, 0, 0]  # reveal (bar12) lands on tonic
    def cf(idx): return [midi(x) for x in chords[idx]]
    root = [c[0] for c in chords]

    for b in range(nbars):
        t0 = b * bar; ci = barchord[b]; ch = cf(ci); rt = midi(root[ci] - 12)
        bright = b >= 12
        # pad (every bar, brighter at reveal)
        m.add(pad(ch, bar * 1.02, cut=2200 if bright else 1200), t0, gain=0.5 if bright else 0.34, wet=0.55)
        # sub bass under everything
        m.add(sub(rt, bar * 1.0), t0, gain=0.5 if b >= 4 else 0.3, wet=0.05)
        # shaker groove (offbeats)
        if b >= 1:
            for k in range(8):
                m.add(shaker(), t0 + k * beat / 2, gain=0.25 + 0.05 * (k % 2), pan=0.2 * (-1) ** k, wet=0.4)
        # congas (tribal) from bar 2
        if 2 <= b:
            for k, gv in [(0.5, 0.3), (1.5, 0.25), (2.75, 0.32), (3.5, 0.22)]:
                m.add(conga(midi(root[ci] + cfg["conga"]), 0.2), t0 + k * beat, gain=gv, pan=0.35, wet=0.4)
        # kick 4-on-floor from bar 4
        if b >= 4:
            for k in range(4):
                m.add(kick(), t0 + k * beat, gain=0.95, wet=0.05)
            # bass pluck (root + offbeat fifth)
            m.add(bassp(rt, beat * 0.9), t0 + 0 * beat, gain=0.7, wet=0.05)
            m.add(bassp(midi(root[ci] - 5), beat * 0.6), t0 + 2.5 * beat, gain=0.5, wet=0.05)
        # plucky arpeggio from bar 4
        if b >= 4:
            arp = [ch[i % len(ch)] * (1 if i < len(ch) else 2) for i in range(8)]
            notes = (ch + [ch[0] * 2, ch[1] * 2, ch[2] * 2, ch[0] * 4])
            for k in range(8):
                f = notes[k % len(notes)]
                m.add(pluck(f, 0.3), t0 + k * beat / 2, gain=0.32, pan=-0.25 * (-1) ** k, wet=0.45)
        # lead melody (build bars 8-11 low, reveal bars 12-13 soaring)
        if b >= 8:
            oct_up = 2.0 if b >= 12 else 1.0
            mel = cfg["mel"]
            for (deg, bt, st) in mel:
                f = midi(root[ci] + deg) * oct_up
                m.add(flute(f, bt * beat), t0 + st * beat, gain=0.5 if b >= 12 else 0.34, pan=0.0, wet=0.5)
        # reverse cymbal swell into reveal
        if b == 11:
            m.add(revcym(2.0), t0, gain=0.5, wet=0.5)
            m.add(riser(2.0), t0, gain=0.6, wet=0.3)
        # impact on the reveal downbeat
        if b == 12:
            m.add(impact(2.4), t0, gain=1.0, wet=0.25)
    return m.render()

CONFIGS = {
    "1_tulum_sunrise": {
        "bpm": 120, "conga": 7,
        # A minor -> F -> C -> G  (warm, uplifting Tulum)
        "chords": [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]],
        "mel": [(12, 1, 0), (15, 1, 1), (19, 1, 2), (24, 1, 3)],  # ascending pentatonic-ish reveal
    },
    "2_desert_reveal": {
        "bpm": 118, "conga": 12,
        # D minor -> Bb -> F -> C  (darker, hypnotic, suspense)
        "chords": [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]],
        "mel": [(0, 1.5, 0), (10, 0.5, 1.5), (12, 1, 2), (17, 1, 3)],
    },
    "3_cosmic_rise": {
        "bpm": 122, "conga": 7,
        # E minor -> C -> G -> D  (bright, epic, soaring)
        "chords": [[52, 55, 59], [48, 52, 55], [55, 59, 62], [50, 54, 57]],
        "mel": [(12, 1, 0), (19, 1, 1), (24, 1, 2), (28, 1, 3)],
    },
}

if __name__ == "__main__":
    for name, cfg in CONFIGS.items():
        print("Rendering", name, "...")
        write_mp3(build(cfg), name)
    print("Done.")
