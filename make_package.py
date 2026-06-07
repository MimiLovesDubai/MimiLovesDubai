#!/usr/bin/env python3
"""
make_package.py — Bouwt het downloadbare cursuspakket (ZIP) dat kopers ontvangen.

Het pakket bevat de volledige cursus: de leesbare website (offline), de
werkende codevoorbeelden, de sjablonen en de bronteksten.

Draai:
    python3 make_package.py

Upload de gemaakte downloads/myaiagent-cursus.zip naar Gumroad als productbestand.
"""

import os
import zipfile

HIER = os.path.dirname(os.path.abspath(__file__))
UIT = os.path.join(HIER, "downloads")
os.makedirs(UIT, exist_ok=True)
ZIP_PAD = os.path.join(UIT, "myaiagent-cursus.zip")

# Wat er in het pakket komt (volledige cursus, offline bruikbaar).
LOSSE_BESTANDEN = ["README.md", "index.html", "challenge.html"]
MAPPEN = ["modules", "code", "templates", "assets", "en", "challenge"]
# Ook de gerenderde modulepagina's meenemen voor offline lezen.
EXTRA_GLOB_PREFIX = "module-"


def voeg_bestand_toe(zf: zipfile.ZipFile, pad: str, arcprefix: str = "myaiagent-cursus") -> None:
    arcname = os.path.join(arcprefix, os.path.relpath(pad, HIER))
    zf.write(pad, arcname)


def main() -> None:
    bestanden = 0
    with zipfile.ZipFile(ZIP_PAD, "w", zipfile.ZIP_DEFLATED) as zf:
        for naam in LOSSE_BESTANDEN:
            p = os.path.join(HIER, naam)
            if os.path.exists(p):
                voeg_bestand_toe(zf, p)
                bestanden += 1

        # Gerenderde pagina's in de root (module-*.html, level-*.html)
        for naam in sorted(os.listdir(HIER)):
            if naam.endswith(".html") and (naam.startswith(EXTRA_GLOB_PREFIX) or naam.startswith("level-")):
                voeg_bestand_toe(zf, os.path.join(HIER, naam))
                bestanden += 1

        for mapnaam in MAPPEN:
            mappad = os.path.join(HIER, mapnaam)
            if not os.path.isdir(mappad):
                continue
            for root, _dirs, files in os.walk(mappad):
                rp = root.replace("\\", "/")
                # afbeeldingen/zware media worden los/online geladen — buiten het pakket houden
                if "__pycache__" in rp or "/img" in rp or "/media" in rp:
                    continue
                for f in files:
                    if f.endswith(".pyc"):
                        continue
                    voeg_bestand_toe(zf, os.path.join(root, f))
                    bestanden += 1

    grootte = os.path.getsize(ZIP_PAD) / 1024
    print(f"✅ Pakket gemaakt: {ZIP_PAD}")
    print(f"   {bestanden} bestanden, {grootte:.0f} KB")
    print("   Upload dit bestand naar Gumroad als productbestand.")


if __name__ == "__main__":
    main()
