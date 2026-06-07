"""
viral_content_agent.py — Een "content studio" van agents voor virale short-form video.

Geef een niche op en de agents leveren een batch kant-en-klare video-concepten:
  • IDEEËN-AGENT     — bedenkt video-ideeën met een virale hoek
  • SCRIPT-AGENT     — schrijft per idee: hook, script, tekst-in-beeld, caption, hashtags

Perfect voor faceless TikTok/Reels/Shorts-kanalen, meme-pagina's of een AI-persona.
Je hoeft alleen nog te filmen/monteren en te posten (of koppel een beeld-/videogenerator).

Draai:
    python code/viral_content_agent.py "weird history facts" 5

Hoort bij de cursus "De Autonome Onderneming / MyAIAgent".
"""

import json
import os
import sys
from datetime import datetime

from dotenv import load_dotenv
from pydantic import BaseModel

HIER = os.path.dirname(__file__)
load_dotenv(os.path.join(HIER, ".env"))

try:
    import anthropic
except ImportError:
    sys.exit("❌ Draai eerst: pip install -r code/requirements.txt")

MODEL = "claude-opus-4-8"
MAX_KOSTEN_USD = float(os.environ.get("MAX_DAGELIJKSE_KOSTEN_USD", "5.00"))
PRIJS_IN, PRIJS_UIT = 5.00, 25.00
OUTPUT_MAP = os.path.join(HIER, "outputs")

client = anthropic.Anthropic()


class Kosten:
    def __init__(self, limiet): self.limiet, self.totaal = limiet, 0.0
    def tel(self, u): self.totaal += u.input_tokens / 1e6 * PRIJS_IN + u.output_tokens / 1e6 * PRIJS_UIT
    def over(self): return self.totaal >= self.limiet


# ── Schemas ──────────────────────────────────────────────────────────────────
class VideoIdee(BaseModel):
    titel: str
    hoek: str            # de virale invalshoek
    waarom_viraal: str   # waarom dit zou kunnen aanslaan


class IdeeLijst(BaseModel):
    ideeen: list[VideoIdee]


class ShortPakket(BaseModel):
    hook: str                  # de eerste 1-2 seconden (cruciaal!)
    script: str                # gesproken/tekst-script van ~20-40 sec
    tekst_in_beeld: list[str]  # korte on-screen captions per shot
    caption: str               # post-caption
    hashtags: list[str]


# ── De agents ────────────────────────────────────────────────────────────────
IDEEEN_PROMPT = """\
Je bent een virale short-form content-strateeg (TikTok, Reels, YouTube Shorts) met gevoel voor
wat Gen Z deelt. Je bedenkt originele, scrollstop-waardige video-ideeën met een sterke hoek.

Regels:
- Houd het eerlijk en feitelijk juist — geen misleiding of nepclaims.
- Geen clickbait die niet wordt waargemaakt; de hoek moet écht interessant zijn.
- Respecteer platformregels (geen haat, geen gevaarlijke challenges, geen nepengagement).
- Mik op nieuwsgierigheid, herkenbaarheid, verrassing of esthetiek."""

SCRIPT_PROMPT = """\
Je bent een short-form scriptschrijver. Maak van een idee een compleet, productieklaar pakket:
- hook: de eerste 1-2 seconden, een zin die mensen laat stoppen met scrollen.
- script: ~20-40 seconden gesproken of voice-over tekst, vlot en ritmisch.
- tekst_in_beeld: korte on-screen captions per shot (max ~6).
- caption: een korte post-caption met een vraag of haakje voor reacties.
- hashtags: 5-8 relevante hashtags (mix van groot en niche).
Toon: energiek, Gen Z, niet cringe. Eerlijk en feitelijk juist."""


def bedenk_ideeen(niche: str, n: int, meter: Kosten) -> IdeeLijst:
    r = client.messages.parse(
        model=MODEL, max_tokens=2000, thinking={"type": "adaptive"},
        output_config={"effort": "high"}, system=IDEEEN_PROMPT,
        messages=[{"role": "user", "content": f"Bedenk {n} virale short-form video-ideeën voor de niche: '{niche}'."}],
        output_format=IdeeLijst,
    )
    meter.tel(r.usage)
    return r.parsed_output


def maak_short(niche: str, idee: VideoIdee, meter: Kosten) -> ShortPakket:
    r = client.messages.parse(
        model=MODEL, max_tokens=1500, output_config={"effort": "medium"}, system=SCRIPT_PROMPT,
        messages=[{"role": "user", "content":
                   f"Niche: {niche}\nIdee: {idee.titel}\nHoek: {idee.hoek}\n"
                   "Maak het complete short-pakket."}],
        output_format=ShortPakket,
    )
    meter.tel(r.usage)
    return r.parsed_output


def main() -> None:
    niche = sys.argv[1] if len(sys.argv) > 1 else "weird history facts"
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    os.makedirs(OUTPUT_MAP, exist_ok=True)
    meter = Kosten(MAX_KOSTEN_USD)

    print(f"🎬 Content studio gestart voor niche: '{niche}' — {n} concepten\n")
    ideeen = bedenk_ideeen(niche, n, meter).ideeen

    resultaten = []
    for i, idee in enumerate(ideeen, 1):
        if meter.over():
            print(f"🛑 Budgetlimiet bereikt (${meter.totaal:.4f}). Stop.")
            break
        print(f"▶️  Concept {i}/{len(ideeen)}: {idee.titel}")
        pakket = maak_short(niche, idee, meter)
        resultaten.append({"idee": idee.model_dump(), "pakket": pakket.model_dump()})

        print(f"   🪝 HOOK: {pakket.hook}")
        print(f"   📝 {pakket.script}")
        print(f"   🏷️  {' '.join(pakket.hashtags)}")
        print(f"   💬 {pakket.caption}\n")

    # Bewaar de hele batch
    stempel = datetime.now().strftime("%Y%m%d_%H%M")
    pad = os.path.join(OUTPUT_MAP, f"content_{stempel}.json")
    with open(pad, "w", encoding="utf-8") as f:
        json.dump({"niche": niche, "concepten": resultaten}, f, ensure_ascii=False, indent=2)

    print("=" * 56)
    print(f"📦 {len(resultaten)} kant-en-klare concepten opgeslagen in {pad}")
    print(f"💸 API-kosten: ${meter.totaal:.4f}")
    print("🎥 Volgende stap: film/monteer ze (of koppel een beeld-/videogenerator) en post dagelijks.")
    print("=" * 56)


if __name__ == "__main__":
    main()
