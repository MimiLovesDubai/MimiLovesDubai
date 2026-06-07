#!/usr/bin/env python3
"""Combined cinematic preview: an emotional violin build + reveal, then the
Tetris theme (Korobeiniki, public domain) erupting on full string orchestra."""
import numpy as np
from generate_violin import SR, midi, hp, noise, bowed, ens, timp, Mix, write_mp3

def build_combo():
    m = Mix(31.0)

    # ---------------- PART A: cinematic violin build (E minor) ----------------
    bpmA = 74; beatA = 60 / bpmA; barA = 4 * beatA
    chA = {"Em": [52, 55, 59], "C": [48, 52, 55], "Am": [57, 60, 64], "B": [59, 63, 66]}
    rtA = {"Em": 40, "C": 36, "Am": 45, "B": 35}
    seqA = ["Em", "C", "Am", "B"]
    for b in range(4):
        t0 = b * barA; key = seqA[b]; ch = chA[key]
        sect = [0.2, 0.32, 0.44, 0.54][b]
        m.add(ens(midi(rtA[key]), barA * 1.05, voices=4, cents=7, atk=0.2, rel=0.5, bright=0.7), t0, gain=sect * 0.9, wet=0.45)
        for f in ch:
            m.add(ens(midi(f), barA * 1.05, voices=6, cents=10, atk=0.45 if b < 2 else 0.25, rel=0.5, bright=1.0) / len(ch),
                  t0, gain=sect * 0.7, pan=np.random.uniform(-0.2, 0.2), wet=0.55)
        if b == 3:
            for k in range(4): m.add(timp(70, 0.6), t0 + k * beatA, gain=0.2 + 0.06 * k, wet=0.3)
    # rising solo violin over bars 2-3
    tA = 2 * barA; prev = None
    for (mn, bts) in [(76, 2), (79, 2), (81, 2), (83, 2)]:
        d = bts * beatA
        m.add(bowed(midi(mn), d, from_freq=(midi(prev) if prev else None), vib_rate=6.1, vib_depth=0.008, atk=0.1, rel=0.3, bright=1.2),
              tA, gain=0.9, pan=-0.05, wet=0.5)
        tA += d; prev = mn
    # reverse swell into the drop
    sn = int(1.5 * SR); ts = np.arange(sn) / SR
    m.add(hp(noise(sn), 3000) * (ts / ts[-1]) ** 2 * 0.5, 4 * barA - 1.5, gain=0.5, wet=0.6)

    t_drop = 4 * barA
    m.add(timp(70, 1.3), t_drop, gain=0.95, wet=0.3)
    m.add(timp(105, 1.0), t_drop, gain=0.5, wet=0.3)

    # ---------------- PART B: Tetris theme on string orchestra (E minor) -------
    bpmB = 132; beatB = 60 / bpmB; barB = 4 * beatB
    chB = {"Em": [52, 55, 59], "Am": [57, 60, 64], "Dm": [50, 53, 57], "C": [48, 52, 55]}
    rtB = {"Em": 40, "Am": 45, "Dm": 38, "C": 36}
    seqB = ["Em", "Am", "Em", "Am", "Dm", "C", "Em", "Am"]
    for b in range(8):
        t0 = t_drop + b * barB; key = seqB[b]; ch = chB[key]; rt = rtB[key]
        # sustained ensemble chord
        for f in ch:
            m.add(ens(midi(f), barB * 1.02, voices=6, cents=9, atk=0.05, rel=0.18, bright=1.15) / len(ch),
                  t0, gain=0.46, pan=np.random.uniform(-0.2, 0.2), wet=0.5)
        # driving cello bass on every beat
        for k in range(4):
            m.add(bowed(midi(rt), beatB * 0.92, atk=0.02, rel=0.08, bright=0.7), t0 + k * beatB, gain=0.6, wet=0.2)
        # timpani pulse on 1 and 3
        m.add(timp(70, 0.5), t0, gain=0.5, wet=0.25); m.add(timp(70, 0.4), t0 + 2 * beatB, gain=0.4, wet=0.25)

    # Korobeiniki melody (A-section) on solo violin + soft octave sparkle
    MEL = [(76, 1), (71, .5), (72, .5), (74, 1), (72, .5), (71, .5),
           (69, 1), (69, .5), (72, .5), (76, 1), (74, .5), (72, .5),
           (71, 1.5), (72, .5), (74, 1), (76, 1),
           (72, 1), (69, 1), (69, 1), (None, 1),
           (None, .5), (74, 1), (77, .5), (81, 1), (79, .5), (77, .5),
           (76, 1.5), (72, .5), (76, 1), (74, .5), (72, .5),
           (71, 1), (71, .5), (72, .5), (74, 1), (76, 1),
           (72, 1), (69, 1), (69, 1), (None, 1)]
    t = t_drop; prev = None
    for (mn, bts) in MEL:
        d = bts * beatB
        if mn:
            m.add(bowed(midi(mn), d, from_freq=(midi(prev) if prev else None), vib_rate=6.2, vib_depth=0.007,
                        atk=0.03, rel=0.12, bright=1.35), t, gain=0.95, pan=-0.04, wet=0.45)
            prev = mn
        t += d
    return m.render()

if __name__ == "__main__":
    print("Rendering 6_violin_then_tetris ...")
    write_mp3(build_combo(), "6_violin_then_tetris")
    print("Done.")
