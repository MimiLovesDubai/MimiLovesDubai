#!/usr/bin/env python3
"""Gumroad cover + thumbnail, NL and EN. Hi-res, sharp, chic slanted serif,
emotional viral copy, and a prominent BESTSELLER bar at the bottom (under all text)."""
import os, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "gumroad"); os.makedirs(OUT, exist_ok=True)
UP = "/root/.claude/uploads/726c3654-cf9b-53d6-914f-4afd64c89c36/"
FIGURE = UP + "0c0fdae0-mimi20228075__de2a41f026ab4e928aae17021a642fe7.png"
LOGO = UP + "ad91d89d-My_AI_Agent_Dubai.png"
FONTS = "/usr/share/fonts/truetype/liberation/"
def font(n, s): return ImageFont.truetype(FONTS + n, s)
BOLD, REG = "LiberationSerif-BoldItalic.ttf", "LiberationSerif-Italic.ttf"
SANS_BI = "LiberationSans-BoldItalic.ttf"
GOLD, GOLD_BR, WHITE, DIM, INK = (236, 200, 120), (252, 235, 180), (248, 247, 252), (200, 204, 216), (26, 19, 5)

TXT = {
    "nl": {"eyebrow": "VERDIEN TERWIJL JE SLAAPT", "t1": "Bouw een AI-agent", "t2": "die zélf een bedrijf runt",
           "sub": "Zonder code in 30 dagen, 24/7 voor je aan het werk", "psub": "Levenslange toegang · direct downloaden",
           "thumb": "AI-AGENT CURSUS", "thumb_sub": "Verdien terwijl je slaapt, zonder code",
           "cover": "gumroad-cover.png", "tb": "gumroad-thumbnail.png"},
    "en": {"eyebrow": "EARN WHILE YOU SLEEP", "t1": "Build an AI agent", "t2": "that runs a business itself",
           "sub": "No code, in 30 days, working for you 24/7", "psub": "Lifetime access · instant download",
           "thumb": "AI-AGENT COURSE", "thumb_sub": "Earn while you sleep, no code",
           "cover": "gumroad-cover-en.png", "tb": "gumroad-thumbnail-en.png"},
}

def cover_crop(im, w, h, sharpen=120):
    iw, ih = im.size; s = max(w / iw, h / ih)
    im = im.resize((round(iw * s), round(ih * s)), Image.LANCZOS); iw, ih = im.size
    im = im.crop(((iw - w) // 2, (ih - h) // 2, (iw - w) // 2 + w, (ih - h) // 2 + h))
    return im.filter(ImageFilter.UnsharpMask(radius=2.4, percent=sharpen, threshold=2)) if sharpen else im

def vgrad(w, h, top_a, bot_a, start=0.0):
    g = Image.new("L", (1, h), 0); px = g.load()
    for y in range(h):
        f = max(0.0, (y / h - start) / (1 - start)) if start < 1 else 0
        px[0, y] = int(top_a + (bot_a - top_a) * f)
    blk = Image.new("RGBA", (w, h), (4, 4, 9, 255)); blk.putalpha(g.resize((w, h))); return blk

def base_bg(w, h):
    top, bot = (16, 15, 24), (5, 5, 10); g = Image.new("RGB", (1, h)); px = g.load()
    for y in range(h):
        f = y / h; px[0, y] = tuple(int(top[i] * (1 - f) + bot[i] * f) for i in range(3))
    return g.resize((w, h)).convert("RGBA")

def logo_masked(size):
    lg = Image.open(LOGO).convert("RGB").resize((size, size), Image.LANCZOS)
    lg = lg.filter(ImageFilter.UnsharpMask(radius=2, percent=90, threshold=2))
    m = lg.convert("L").point(lambda p: 0 if p < 36 else min(255, int((p - 36) * 1.7)))
    return lg, m

def text(c, cx, y, s, fnt, fill, center=True, glow=0, left=None, shadow=3):
    d = ImageDraw.Draw(c); bb = d.textbbox((0, 0), s, font=fnt); tw = bb[2] - bb[0]
    x = (cx - tw / 2 - bb[0]) if center else left
    if glow:
        gl = Image.new("RGBA", c.size, (0, 0, 0, 0)); ImageDraw.Draw(gl).text((x, y), s, font=fnt, fill=(236, 200, 120, 220))
        c.alpha_composite(gl.filter(ImageFilter.GaussianBlur(glow)))
    if shadow: d.text((x + shadow, y + shadow), s, font=fnt, fill=(0, 0, 0, 170))
    d.text((x, y), s, font=fnt, fill=fill); return tw

def corners(c, pad, ln, w=4):
    d = ImageDraw.Draw(c); W, H = c.size; col = (236, 200, 120, 210)
    for x, y, dx, dy in [(pad, pad, 1, 0), (pad, pad, 0, 1), (W - pad, pad, -1, 0), (W - pad, pad, 0, 1),
                          (pad, H - pad, 1, 0), (pad, H - pad, 0, -1), (W - pad, H - pad, -1, 0), (W - pad, H - pad, 0, -1)]:
        d.line([(x, y), (x + dx * ln, y + dy * ln)], fill=col, width=w)

def star(d, cx, cy, r, fill):
    pts = []
    for i in range(10):
        rad = r if i % 2 == 0 else r * 0.42; a = -math.pi / 2 + i * math.pi / 5
        pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    d.polygon(pts, fill=fill)

def bestseller(c, cx, top, fs):
    """A prominent gold BESTSELLER bar with flanking stars + glow."""
    d = ImageDraw.Draw(c); f = font(SANS_BI, fs); label = "BESTSELLER"
    tw = d.textlength(label, font=f); sr = fs * 0.6; gap = fs * 0.55; padx = fs * 1.0; pady = fs * 0.5
    inner = sr * 2 + gap + tw + gap + sr * 2; w = inner + 2 * padx; h = fs + 2 * pady; x0 = cx - w / 2; y0 = top
    glow = Image.new("RGBA", c.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=h / 2, fill=(236, 200, 120, 200))
    c.alpha_composite(glow.filter(ImageFilter.GaussianBlur(fs * 0.8)))
    mask = Image.new("L", (int(w), int(h)), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=h / 2, fill=255)
    tint = Image.new("RGBA", (int(w), int(h)), GOLD_BR + (255,))
    ImageDraw.Draw(tint).rounded_rectangle([0, 0, w - 1, h - 1], radius=h / 2, outline=(150, 110, 40, 255), width=5)
    c.paste(tint, (int(x0), int(y0)), mask)
    cy = y0 + h / 2
    d.text((cx - tw / 2, y0 + pady - 1), label, font=f, fill=INK)
    star(d, cx - tw / 2 - gap - sr, cy, sr, INK); star(d, cx + tw / 2 + gap + sr, cy, sr, INK)

def price(c, cx, y, big, psub):
    d = ImageDraw.Draw(c); fo, fn, fs = font(REG, int(big * .62)), font(BOLD, big), font(REG, int(big * .5))
    old, new = "€299", "€149"; wo, wn = d.textlength(old, font=fo), d.textlength(new, font=fn); gap = int(big * .4); x = cx - (wo + gap + wn) / 2
    d.text((x, y + int(big * .12)), old, font=fo, fill=DIM); d.line([(x, y + int(big * .42)), (x + wo, y + int(big * .42))], fill=DIM, width=4)
    d.text((x + wo + gap + 3, y + 3), new, font=fn, fill=(0, 0, 0, 160)); d.text((x + wo + gap, y), new, font=fn, fill=GOLD_BR)
    text(c, cx, y + big + 8, psub, fs, GOLD, shadow=2)

def make_cover(lang):
    T = TXT[lang]; W, H = 1920, 1080
    c = cover_crop(Image.open(FIGURE).convert("RGB"), W, H).convert("RGBA")
    c.alpha_composite(vgrad(W, H, 18, 252, start=0.24))
    side = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sg = Image.new("L", (W, 1), 0)
    for x in range(W): sg.load()[x, 0] = int(160 * max(0, 1 - x / (W * 0.6)))
    side.putalpha(sg.resize((W, H))); c.alpha_composite(side)
    corners(c, 40, 70, 5)
    lg, m = logo_masked(104); c.paste(lg, (66, 58), m)
    text(c, 0, 84, "MYAIAGENT.TECH", font(SANS_BI, 38), GOLD_BR, center=False, left=188, shadow=2)
    text(c, W / 2, 486, T["eyebrow"], font(SANS_BI, 38), GOLD, glow=8)
    text(c, W / 2, 546, T["t1"], font(BOLD, 90), WHITE, glow=10)
    text(c, W / 2, 644, T["t2"], font(BOLD, 90), GOLD_BR, glow=10)
    text(c, W / 2, 764, T["sub"], font(REG, 39), WHITE, shadow=2)
    price(c, W / 2, 828, 50, T["psub"])
    bestseller(c, W / 2, 930, 44)
    c.convert("RGB").save(os.path.join(OUT, T["cover"])); print("cover", lang, c.size)

def make_thumb(lang):
    T = TXT[lang]; W = 1600
    c = base_bg(W, W)
    glow = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([W * .5 - 430, 430 - 430, W * .5 + 430, 430 + 430], fill=(236, 200, 120, 85))
    c.alpha_composite(glow.filter(ImageFilter.GaussianBlur(140)))
    lg, m = logo_masked(840); c.paste(lg, (int(W / 2 - 420), 16), m)
    corners(c, 54, 90, 6)
    text(c, W / 2, 940, T["thumb"], font(BOLD, 124), WHITE, glow=10)
    text(c, W / 2, 1106, T["thumb_sub"], font(REG, 46), GOLD_BR, shadow=2)
    price(c, W / 2, 1210, 60, T["psub"])
    bestseller(c, W / 2, 1338, 50)
    c.convert("RGB").save(os.path.join(OUT, T["tb"])); print("thumb", lang, c.size)

if __name__ == "__main__":
    for lg in ("nl", "en"):
        make_cover(lg); make_thumb(lg)
    print("Done.")
