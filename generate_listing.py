#!/usr/bin/env python3
"""Gumroad cover + thumbnail in high resolution: sharp imagery, crisp text,
a BESTSELLER badge and emotional, aspirational copy."""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "gumroad"); os.makedirs(OUT, exist_ok=True)
UP = "/root/.claude/uploads/726c3654-cf9b-53d6-914f-4afd64c89c36/"
FIGURE = UP + "0c0fdae0-mimi20228075__de2a41f026ab4e928aae17021a642fe7.png"
LOGO = UP + "ad91d89d-My_AI_Agent_Dubai.png"
FONTS = "/usr/share/fonts/truetype/liberation/"
def font(n, s): return ImageFont.truetype(FONTS + n, s)
BOLD, REG = "LiberationSerif-BoldItalic.ttf", "LiberationSerif-Italic.ttf"  # chic, slanted, legible
SANS_BI = "LiberationSans-BoldItalic.ttf"
GOLD, GOLD_BR, WHITE, DIM, INK = (236, 200, 120), (252, 235, 180), (248, 247, 252), (200, 204, 216), (26, 19, 5)

def cover_crop(im, w, h, sharpen=120):
    iw, ih = im.size; s = max(w / iw, h / ih)
    im = im.resize((round(iw * s), round(ih * s)), Image.LANCZOS)
    iw, ih = im.size
    im = im.crop(((iw - w) // 2, (ih - h) // 2, (iw - w) // 2 + w, (ih - h) // 2 + h))
    if sharpen: im = im.filter(ImageFilter.UnsharpMask(radius=2.4, percent=sharpen, threshold=2))
    return im

def vgrad(w, h, top_a, bot_a, start=0.0):
    g = Image.new("L", (1, h), 0); px = g.load()
    for y in range(h):
        f = max(0.0, (y / h - start) / (1 - start)) if start < 1 else 0
        px[0, y] = int(top_a + (bot_a - top_a) * f)
    blk = Image.new("RGBA", (w, h), (4, 4, 9, 255)); blk.putalpha(g.resize((w, h))); return blk

def text(c, cx, y, s, fnt, fill, center=True, glow=0, left=None, shadow=3):
    d = ImageDraw.Draw(c); bb = d.textbbox((0, 0), s, font=fnt); tw = bb[2] - bb[0]
    x = (cx - tw / 2 - bb[0]) if center else left
    if glow:
        gl = Image.new("RGBA", c.size, (0, 0, 0, 0))
        ImageDraw.Draw(gl).text((x, y), s, font=fnt, fill=(236, 200, 120, 220))
        c.alpha_composite(gl.filter(ImageFilter.GaussianBlur(glow)))
    if shadow: d.text((x + shadow, y + shadow), s, font=fnt, fill=(0, 0, 0, 170))
    d.text((x, y), s, font=fnt, fill=fill)
    return tw

def corners(c, pad, ln, w=4):
    d = ImageDraw.Draw(c); W, H = c.size; col = (236, 200, 120, 210)
    for x, y, dx, dy in [(pad, pad, 1, 0), (pad, pad, 0, 1), (W - pad, pad, -1, 0), (W - pad, pad, 0, 1),
                          (pad, H - pad, 1, 0), (pad, H - pad, 0, -1), (W - pad, H - pad, -1, 0), (W - pad, H - pad, 0, -1)]:
        d.line([(x, y), (x + dx * ln, y + dy * ln)], fill=col, width=w)

def badge(c, cx, cy, label, fs):
    d = ImageDraw.Draw(c); f = font(SANS_BI, fs)
    tw = d.textlength(label, font=f); padx, pady = int(fs * .9), int(fs * .55)
    w, h = tw + 2 * padx, fs + 2 * pady; x0, y0 = cx - w / 2, cy
    glow = Image.new("RGBA", c.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=h / 2, fill=(236, 200, 120, 150))
    c.alpha_composite(glow.filter(ImageFilter.GaussianBlur(fs * .5)))
    grad = Image.new("L", (1, int(h)), 0)
    for i in range(int(h)): grad.load()[0, i] = int(255 - 70 * (i / h))
    pill = Image.new("RGBA", (int(w), int(h)), (0, 0, 0, 0))
    base = Image.new("RGBA", (int(w), int(h)), GOLD_BR + (255,))
    base.putalpha(grad.resize((int(w), int(h))).point(lambda p: 255))
    tint = Image.new("RGBA", (int(w), int(h)), (0, 0, 0, 0))
    ImageDraw.Draw(tint).rounded_rectangle([0, 0, w - 1, h - 1], radius=h / 2, fill=GOLD_BR + (255,), outline=(150, 110, 40, 255), width=3)
    mask = Image.new("L", (int(w), int(h)), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=h / 2, fill=255)
    c.paste(tint, (int(x0), int(y0)), mask)
    d.text((cx - tw / 2, y0 + pady - 1), label, font=f, fill=INK)

def price(c, cx, y, big):
    d = ImageDraw.Draw(c); fo, fn, fs = font(REG, int(big * .62)), font(BOLD, big), font(REG, int(big * .5))
    old, new = "€299", "€149"
    wo, wn = d.textlength(old, font=fo), d.textlength(new, font=fn); gap = int(big * .4); x = cx - (wo + gap + wn) / 2
    d.text((x, y + int(big * .12)), old, font=fo, fill=DIM)
    d.line([(x, y + int(big * .42)), (x + wo, y + int(big * .42))], fill=DIM, width=4)
    d.text((x + wo + gap + 3, y + 3), new, font=fn, fill=(0, 0, 0, 160))
    d.text((x + wo + gap, y), new, font=fn, fill=GOLD_BR)
    text(c, cx, y + big + 10, "Levenslange toegang · direct downloaden", fs, GOLD, shadow=2)

def make_cover():
    W, H = 1920, 1080
    c = cover_crop(Image.open(FIGURE).convert("RGB"), W, H).convert("RGBA")
    c.alpha_composite(vgrad(W, H, 24, 252, start=0.30))
    side = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sg = Image.new("L", (W, 1), 0)
    for x in range(W): sg.load()[x, 0] = int(160 * max(0, 1 - x / (W * 0.6)))
    side.putalpha(sg.resize((W, H))); c.alpha_composite(side)
    corners(c, 40, 70, 5)
    lg = Image.open(LOGO).convert("RGB").resize((104, 104), Image.LANCZOS)
    m = lg.convert("L").point(lambda p: 0 if p < 38 else min(255, int((p - 38) * 1.7)))
    c.paste(lg, (66, 60), m)
    text(c, 0, 84, "MYAIAGENT.TECH", font(SANS_BI, 38), GOLD_BR, center=False, left=188, shadow=2)
    badge(c, W - 260, 64, "BESTSELLER", 36)
    text(c, W / 2, 612, "Bouw een AI-agent", font(BOLD, 96), WHITE, glow=10)
    text(c, W / 2, 720, "die zélf een bedrijf runt", font(BOLD, 96), GOLD_BR, glow=10)
    text(c, W / 2, 848, "Laat slimme AI het werk doen — en verdien terwijl jij leeft.", font(REG, 40), WHITE, shadow=2)
    price(c, W / 2, 922, 60)
    c.convert("RGB").save(os.path.join(OUT, "gumroad-cover.png")); print("cover", c.size)

def make_thumb():
    W = 1600
    c = Image.open(LOGO).convert("RGB").resize((W, W), Image.LANCZOS)
    c = c.filter(ImageFilter.UnsharpMask(radius=2, percent=90, threshold=2)).convert("RGBA")
    c.alpha_composite(vgrad(W, W, 0, 250, start=0.45))
    corners(c, 54, 88, 6)
    badge(c, W / 2, 70, "BESTSELLER", 44)
    text(c, W / 2, 1040, "MYAIAGENT.TECH", font(SANS_BI, 40), GOLD_BR, shadow=2)
    text(c, W / 2, 1095, "AI-AGENT CURSUS", font(BOLD, 132), WHITE, glow=10)
    text(c, W / 2, 1268, "Jouw bedrijf op de automatische piloot", font(REG, 44), DIM, shadow=2)
    price(c, W / 2, 1360, 64)
    c.convert("RGB").save(os.path.join(OUT, "gumroad-thumbnail.png")); print("thumb", c.size)

if __name__ == "__main__":
    make_cover(); make_thumb(); print("Done.")
