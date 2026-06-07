#!/usr/bin/env python3
"""Generate a luxe Gumroad cover (1280x720) and thumbnail (1280x1280)."""
import os, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "gumroad"); os.makedirs(OUT, exist_ok=True)
LOGO = os.path.join(HERE, "assets/media/logo.png")
FONTS = "/usr/share/fonts/truetype/liberation/"
def font(name, size): return ImageFont.truetype(FONTS + name, size)
BOLD = "LiberationSans-Bold.ttf"; REG = "LiberationSans-Regular.ttf"
GOLD = (236, 200, 120); GOLD_BR = (249, 231, 173); WHITE = (245, 244, 250); DIM = (170, 174, 190)

def bg(w, h):
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    top = np.array([16, 15, 24]); bot = np.array([5, 5, 10])
    g = top[None, None] * (1 - yy[..., None] / h) + bot[None, None] * (yy[..., None] / h)
    cx, cy = w * 0.5, h * 0.34
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (max(w, h) * 0.55)
    glow = np.clip(1 - d, 0, 1) ** 2
    g += glow[..., None] * np.array([60, 44, 14])
    # subtle starfield
    rng = np.random.default_rng(7)
    for _ in range(int(w * h / 5200)):
        x, y = rng.integers(0, w), rng.integers(0, h); b = rng.uniform(20, 90)
        g[y, x] += b
    return Image.fromarray(np.clip(g, 0, 255).astype("uint8"), "RGB").convert("RGBA")

def paste_logo(canvas, size, cx, cy):
    lg = Image.open(LOGO).convert("RGB").resize((size, size), Image.LANCZOS)
    gray = lg.convert("L")
    mask = gray.point(lambda p: 0 if p < 38 else min(255, int((p - 38) * 1.7)))
    # gold glow halo behind
    halo = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(halo)
    hd.ellipse([cx - size * 0.62, cy - size * 0.62, cx + size * 0.62, cy + size * 0.62], fill=(236, 200, 120, 70))
    canvas.alpha_composite(halo.filter(ImageFilter.GaussianBlur(size * 0.12)))
    canvas.paste(lg, (int(cx - size / 2), int(cy - size / 2)), mask)

def text(canvas, cx, y, s, fnt, fill, center=True, glow=False, spacing=0, anchor_left=None):
    d = ImageDraw.Draw(canvas)
    if spacing: s = (" " * 0).join(s); s = (chr(0x2009)).join(list(s)) if spacing else s
    bb = d.textbbox((0, 0), s, font=fnt); tw = bb[2] - bb[0]
    x = (cx - tw / 2 - bb[0]) if center else (anchor_left if anchor_left is not None else cx)
    if glow:
        gl = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        ImageDraw.Draw(gl).text((x, y), s, font=fnt, fill=(236, 200, 120, 230))
        canvas.alpha_composite(gl.filter(ImageFilter.GaussianBlur(10)))
    d.text((x + 2, y + 2), s, font=fnt, fill=(0, 0, 0, 120))  # shadow
    d.text((x, y), s, font=fnt, fill=fill)
    return bb[3] - bb[1]

def border(canvas, pad, ln=42):
    d = ImageDraw.Draw(canvas); w, h = canvas.size; c = (236, 200, 120, 180)
    for (x, y, dx, dy) in [(pad, pad, 1, 0), (pad, pad, 0, 1), (w - pad, pad, -1, 0), (w - pad, pad, 0, 1),
                            (pad, h - pad, 1, 0), (pad, h - pad, 0, -1), (w - pad, h - pad, -1, 0), (w - pad, h - pad, 0, -1)]:
        d.line([(x, y), (x + dx * ln, y + dy * ln)], fill=c, width=3)

def price_badge(canvas, cx, y):
    d = ImageDraw.Draw(canvas)
    f_old = font(REG, 30); f_new = font(BOLD, 46); f_sub = font(REG, 24)
    old = "€299"; new = "€149"; sub = "Levenslange toegang"
    wo = d.textlength(old, font=f_old); wn = d.textlength(new, font=f_new)
    gap = 18; total = wo + gap + wn
    x = cx - total / 2
    d.text((x, y + 12), old, font=f_old, fill=DIM)
    d.line([(x, y + 12 + 17), (x + wo, y + 12 + 17)], fill=DIM, width=3)  # strikethrough
    d.text((x + wo + gap, y), new, font=f_new, fill=GOLD_BR)
    text(canvas, cx, y + 60, sub, f_sub, GOLD, center=True)

def make_cover():
    W, H = 1280, 720; c = bg(W, H)
    border(c, 28)
    paste_logo(c, 220, W * 0.5, 150)
    text(c, W / 2, 268, "M Y A I A G E N T . T E C H", font(BOLD, 24), GOLD, spacing=0)
    text(c, W / 2, 312, "Bouw een AI-agent", font(BOLD, 66), WHITE, glow=True)
    text(c, W / 2, 386, "die zélf een bedrijf runt", font(BOLD, 66), GOLD_BR, glow=True)
    text(c, W / 2, 478, "De complete, futuristische cursus — van idee tot een 24/7 verdienende AI", font(REG, 25), DIM)
    price_badge(c, W / 2, 540)
    c.convert("RGB").save(os.path.join(OUT, "gumroad-cover.png"))
    print("cover ->", os.path.join(OUT, "gumroad-cover.png"))

def make_thumb():
    W = H = 1280; c = bg(W, H)
    border(c, 40, 60)
    paste_logo(c, 440, W * 0.5, 360)
    text(c, W / 2, 600, "M Y A I A G E N T . T E C H", font(BOLD, 34), GOLD)
    text(c, W / 2, 660, "AI-AGENT", font(BOLD, 150), WHITE, glow=True)
    text(c, W / 2, 815, "CURSUS", font(BOLD, 150), GOLD_BR, glow=True)
    text(c, W / 2, 1010, "Bouw een bedrijf dat AI voor je runt", font(REG, 38), DIM)
    price_badge(c, W / 2, 1090)
    c.convert("RGB").save(os.path.join(OUT, "gumroad-thumbnail.png"))
    print("thumb ->", os.path.join(OUT, "gumroad-thumbnail.png"))

if __name__ == "__main__":
    make_cover(); make_thumb(); print("Done.")
