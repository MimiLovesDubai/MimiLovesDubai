export const metadata = { title: "Privacybeleid" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacybeleid</h1>
      <p>Laatst bijgewerkt: juli 2026 · Van toepassing op MyAIAgent OS (myaiagent.tech).</p>

      <h2>1. Wie zijn wij</h2>
      <p>
        MyAIAgent OS is een dienst van MyAIAgent.tech. Vragen over dit beleid kun je stellen via
        het e-mailadres dat op de website staat vermeld.
      </p>

      <h2>2. Welke gegevens we verwerken</h2>
      <ul>
        <li><strong>Accountgegevens:</strong> naam, e-mailadres en versleuteld wachtwoord (via Supabase Auth).</li>
        <li><strong>Inhoud die je zelf toevoegt:</strong> projecten, documenten, gesprekken met AI-agents, taken en prompts.</li>
        <li><strong>Gebruiksgegevens:</strong> aantallen AI-berichten en tokengebruik, om je maandlimiet toe te passen.</li>
        <li><strong>Betaalgegevens:</strong> afgehandeld door Stripe; wij slaan geen kaartnummers op, alleen abonnementstatus en factuurreferenties.</li>
      </ul>

      <h2>3. Waarvoor we gegevens gebruiken</h2>
      <ul>
        <li>Het leveren van de dienst (inloggen, projecten, AI-antwoorden genereren).</li>
        <li>Facturatie en abonnementsbeheer.</li>
        <li>Beveiliging, misbruikpreventie en het handhaven van gebruikslimieten.</li>
      </ul>

      <h2>4. AI-verwerking</h2>
      <p>
        Om antwoorden te genereren sturen we jouw berichten, relevante projectcontext en documenten
        naar Anthropic (Claude API) als verwerker. We sturen niet meer context mee dan nodig is
        voor je vraag. Gebruik de dienst niet voor bijzondere persoonsgegevens (zoals medische of
        strafrechtelijke gegevens) van jezelf of anderen.
      </p>

      <h2>5. Bewaartermijnen</h2>
      <p>
        Je gegevens blijven bewaard zolang je account bestaat. Verwijder je je account, dan worden
        je projecten, gesprekken, documenten en taken verwijderd. Factuurgegevens bewaren we zolang
        de wet dat vereist.
      </p>

      <h2>6. Delen met derden</h2>
      <p>
        We delen gegevens alleen met verwerkers die nodig zijn om de dienst te leveren: Supabase
        (database en authenticatie), Anthropic (AI-antwoorden), Stripe (betalingen) en onze
        hostingpartij (Vercel). We verkopen nooit gegevens.
      </p>

      <h2>7. Jouw rechten (AVG)</h2>
      <p>
        Je hebt recht op inzage, correctie, verwijdering, beperking en overdraagbaarheid van je
        gegevens, en het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens.
        Mail ons om een verzoek in te dienen.
      </p>

      <h2>8. Beveiliging</h2>
      <p>
        Toegang tot data is per gebruiker afgeschermd met row-level security. Verbindingen lopen
        via HTTPS. Sleutels en geheimen staan buiten de code in beveiligde omgevingsvariabelen.
      </p>
    </>
  );
}
