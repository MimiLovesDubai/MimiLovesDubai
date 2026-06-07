#!/usr/bin/env python3
"""Build the Gumroad cover (from the golden AI figure) and thumbnail (from the
logo), with a luxe gold text + price overlay."""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "gumroad"); os.makedirs(OUT, exist_ok=True)
UP = "/root/.claude/uploads/726c3654-cf9b-53d6-914f-4afd64c89c36/"
FIGURE = UP + "0c0fdae0-mimi20228075__de2a41f026ab4e928aae17021a642fe7.png"
LOGO = UP + "ad91d89d-My_AI_Agent_Dubai.png"
FONTS = "/usr/share/fonts/truetype/liberation/"
def font(n, s): return ImageFont.truetype(FONTS + n, s)
BOLD, REG = "LiberationSans-Bold.ttf", "LiberationSans-Regular.ttf"
GOLD, GOLD_BR, WHITE, DIM = (236, 200, 120), (249, 231, 173), (245, 244, 250), (188, 192, 206)

def cover_crop(im, w, h):
    iw, ih = im.size; s = max(w / iw, h / ih)
    im = im.resize((int(iw * s + 1), int(ih * s + 1)), Image.LANCZOS)
    iw, ih = im.size
    return im.crop(((iw - w) // 2, (ih - h) // 2, (iw - w) // 2 + w, (ih - h) // 2 + h))

def vgrad(w, h, top_a, bot_a, start=0.0):
    """Vertical black gradient alpha (transparent top -> dark bottom)."""
    g = Image.new("L", (1, h), 0); px = g.load()
    for y in range(h):
        f = max(0.0, (y / h - start) / (1 - start)) if start < 1 else 0
        px[0, y] = int((top_a + (bot_a - top_a) * f))
    g = g.resize((w, h))
    blk = Image.new("RGBA", (w, h), (4, 4, 9, 255)); blk.putalpha(g); return blk

def text(c, cx, y, s, fnt, fill, center=True, glow=False, left=None):
    d = ImageDraw.Draw(c); bb = d.textbbox((0, 0), s, font=fnt); tw = bb[2] - bb[0]
    x = (cx - tw / 2 - bb[0]) if center else left
    if glow:
        gl = Image.new("RGBA", c.size, (0, 0, 0, 0))
        ImageDraw.Draw(gl).text((x, y), s, font=fnt, fill=(236, 200, 120, 235))
        c.alpha_composite(gl.filter(ImageFilter.GaussianBlur(12)))
    d.text((x + 2, y + 3), s, font=fnt, fill=(0, 0, 0, 150))
    d.text((x, y), s, font=fnt, fill=fill)
    return tw

def corners(c, pad, ln=44):
    d = ImageDraw.Draw(c); w, h = c.size; col = (236, 200, 120, 200)
    for x, y, dx, dy in [(pad, pad, 1, 0), (pad, pad, 0, 1), (w - pad, pad, -1, 0), (w - pad, pad, 0, 1),
                          (pad, h - pad, 1, 0), (pad, h - pad, 0, -1), (w - pad, h - pad, -1, 0), (w - pad, h - pad, 0, -1)]:
        d.line([(x, y), (x + dx * ln, y + dy * ln)], fill=col, width=3)

def logo_mask(size):
    lg = Image.open(LOGO).convert("RGB").resize((size, size), Image.LANCZOS)
    m = lg.convert("L").point(lambda p: 0 if p < 38 else min(255, int((p - 38) * 1.7)))
    return lg, m

def price(c, cx, y, big=46):
    d = ImageDraw.Draw(c); fo, fn, fs = font(REG, int(big * .62)), font(BOLD, big), font(REG, int(big * .5))
    old, new = "€299", "€149"
    wo, wn = d.textlength(old, font=fo), d.textlength(new, font=fn); gap = 16; x = cx - (wo + gap + wn) / 2
    d.text((x, y + (big - int(big * .62)) // 1), old, font=fo, fill=DIM)
    d.line([(x, y + int(big * .42)), (x + wo, y + int(big * .42))], fill=DIM, width=3)
    d.text((x + wo + gap, y), new, font=fn, fill=GOLD_BR)
    text(c, cx, y + big + 8, "Levenslange toegang", fs, GOLD)

def make_cover():
    W, H = 1280, 720
    c = cover_crop(Image.open(FIGURE).convert("RGB"), W, H).convert("RGBA")
    c.alpha_composite(vgrad(W, H, 30, 250, start=0.30))                       # bottom scrim
    side = Image.new("RGBA", (W, H), (0, 0, 0, 0))                            # slight left scrim
    sg = Image.new("L", (W, 1), 0)
    for x in range(W): sg.load()[x, 0] = int(150 * max(0, 1 - x / (W * 0.55)))
    side.putalpha(sg.resize((W, H))); c.alpha_composite(side)
    corners(c, 26)
    lg, m = logo_mask(70); c.paste(lg, (44, 40), m)
    text(c, 0, 52, "MYAIAGENT.TECH", font(BOLD, 26), GOLD_BR, center=False, left=128)
    text(c, W / 2, 452, "Bouw een AI-agent", font(BOLD, 62), WHITE, glow=True)
    text(c, W / 2, 522, "die zélf een bedrijf runt", font(BOLD, 62), GOLD_BR, glow=True)
    price(c, W / 2, 612, 44)
    c.convert("RGB").save(os.path.join(OUT, "gumroad-cover.png")); print("cover done")

def make_thumb():
    W = 1280
    c = Image.open(LOGO).convert("RGB").resize((W, W), Image.LANCZOS).convert("RGBA")
    c.alpha_composite(vgrad(W, W, 0, 252, start=0.46))
    corners(c, 40, 64)
    text(c, W / 2, 858, "MYAIAGENT.TECH", font(BOLD, 32), GOLD_BR)
    text(c, W / 2, 905, "AI-AGENT CURSUS", font(BOLD, 104), WHITE, glow=True)
    price(c, W / 2, 1055, 56)
    c.convert("RGB").save(os.path.join(OUT, "gumroad-thumbnail.png")); print("thumb done")

if __name__ == "__main__":
    make_cover(); make_thumb(); print("Done.")
