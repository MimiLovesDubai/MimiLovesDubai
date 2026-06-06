# Merkbeelden plaatsen

De site verwacht onderstaande bestanden in deze map. Tot ze er zijn, toont de
site elegante gouden fallbacks, dus hij blijft er goed uitzien. Sla elk beeld op
met de **exacte bestandsnaam** en commit + push.

| Bestandsnaam | Formaat | Waar gebruikt | Welk gegenereerd beeld |
|--------------|---------|---------------|------------------------|
| `hero.png` | liggend 16:11 / 16:9 | Groot hero-kader op de homepage | De gouden AI-figuur in de lounge |
| `og.png` | 16:9 | Social preview (LinkedIn/X/WhatsApp) + `og:image` | De banner mét "MyAIAgent.tech"-tekst |
| `brand-square.png` | 1:1 | Favicon + app-icoon | Het vierkante close-up portret |
| `story.png` | 9:16 | (niet op de site) Instagram/TikTok-story | Het verticale poster-beeld |

## Hoe plaatsen

1. Open het gewenste beeld (de links staan in de chat).
2. Sla op onder de juiste naam hierboven, in `assets/img/`.
3. Commit & push. De site gebruikt ze automatisch.

> Tip: optimaliseer grote PNG's (bijv. via squoosh.app) naar < 400 KB voor snelle
> laadtijd — belangrijk voor een site die viraal moet gaan. WebP mag ook; pas dan
> de bestandsnaam-extensie aan in `build_site.py` en draai `python3 build_site.py`.

Liever je eigen beelden? Gebruik dezelfde bestandsnamen en formaten.
