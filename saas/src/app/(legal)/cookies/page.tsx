export const metadata = { title: "Cookiebeleid" };

export default function CookiesPage() {
  return (
    <>
      <h1>Cookiebeleid</h1>
      <p>Laatst bijgewerkt: juli 2026 · Van toepassing op MyAIAgent OS (myaiagent.tech).</p>

      <h2>1. Welke cookies we gebruiken</h2>
      <p>
        MyAIAgent OS gebruikt uitsluitend <strong>functionele cookies</strong> die noodzakelijk
        zijn om de dienst te laten werken:
      </p>
      <ul>
        <li>
          <strong>Sessiecookies van Supabase Auth</strong> (namen beginnen met <code>sb-</code>):
          houden je ingelogd en beveiligen je sessie.
        </li>
        <li>
          <strong>Stripe-cookies tijdens het afrekenen:</strong> worden door Stripe geplaatst op de
          betaalpagina voor fraudepreventie en het afronden van je betaling.
        </li>
      </ul>

      <h2>2. Geen tracking</h2>
      <p>
        We plaatsen geen advertentie- of trackingcookies en gebruiken geen social-media-pixels.
        Omdat we alleen noodzakelijke cookies gebruiken, is een cookiebanner niet vereist.
      </p>

      <h2>3. Cookies beheren</h2>
      <p>
        Je kunt cookies wissen of blokkeren via je browserinstellingen. Zonder de functionele
        cookies kun je niet ingelogd blijven en werkt de dienst niet goed.
      </p>

      <h2>4. Wijzigingen</h2>
      <p>
        Als we in de toekomst analytics toevoegen, werken we dit beleid bij en vragen we — waar
        wettelijk vereist — eerst je toestemming.
      </p>
    </>
  );
}
