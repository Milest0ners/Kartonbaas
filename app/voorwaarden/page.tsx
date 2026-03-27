import Header from '@/components/Header';
import Footer from '@/components/Footer';

const sections = [
  {
    title: '1. Definities',
    items: [
      'Klant: de natuurlijke persoon of rechtspersoon die een bestelling plaatst bij Kartonbaas.',
      'Consument: de natuurlijke persoon die niet handelt in de uitoefening van beroep of bedrijf.',
      'Overeenkomst op afstand: een overeenkomst die via de website of elektronische communicatie tot stand komt.',
      'Maatwerkproduct: een gepersonaliseerde kartonnen cut-out op basis van door de klant aangeleverde foto of specificaties.',
    ],
  },
  {
    title: '2. Identiteit van de ondernemer',
    items: [
      'Handelsnaam: Kartonbaas',
      'Website: https://kartonbaas.nl',
      'E-mail: info@kartonbaas.nl',
      'Bereikbaarheid: maandag t/m vrijdag tijdens kantooruren',
    ],
  },
  {
    title: '3. Toepasselijkheid',
    items: [
      'Deze voorwaarden zijn van toepassing op alle aanbiedingen, bestellingen en overeenkomsten via Kartonbaas.',
      'Door een bestelling te plaatsen gaat de klant akkoord met deze voorwaarden.',
      'Afwijkingen zijn alleen geldig als die schriftelijk zijn bevestigd door Kartonbaas.',
    ],
  },
  {
    title: '4. Aanbod en totstandkoming',
    items: [
      'Kartonbaas streeft naar een correcte en volledige omschrijving van producten, prijzen en levertijden.',
      'Kennelijke fouten of vergissingen in aanbod, prijs of productinformatie zijn niet bindend.',
      'De overeenkomst komt tot stand zodra de klant de bestelling afrondt en een orderbevestiging ontvangt.',
    ],
  },
  {
    title: '5. Prijzen en betaling',
    items: [
      'Alle prijzen op de website zijn inclusief btw, tenzij anders vermeld.',
      'Betaling verloopt via de op de website aangeboden betaalmethoden (zoals iDEAL via Mollie).',
      'Kartonbaas mag een bestelling opschorten of annuleren bij een mislukte of geweigerde betaling.',
      'Eventuele prijswijzigingen na bestelling hebben geen invloed op reeds bevestigde bestellingen.',
    ],
  },
  {
    title: '6. Levering en uitvoering',
    items: [
      'Opgegeven levertermijnen zijn indicatief en geen fatale termijnen, tenzij uitdrukkelijk anders overeengekomen.',
      'Kartonbaas voert bestellingen met zorg uit en informeert de klant bij onverwachte vertraging.',
      'Het risico van beschadiging of vermissing gaat over bij aflevering op het opgegeven afleveradres.',
      'Kartonbaas is niet aansprakelijk voor vertraging door vervoerders of overmachtssituaties.',
    ],
  },
  {
    title: '7. Herroepingsrecht en maatwerk',
    items: [
      'Voor consumenten geldt in beginsel een wettelijke bedenktijd van 14 dagen bij online aankopen.',
      'Uitzondering: voor maatwerkproducten (zoals gepersonaliseerde cut-outs op basis van eigen foto) is het herroepingsrecht uitgesloten zodra productie is gestart.',
      'Bij annulering voordat productie is gestart, kan Kartonbaas redelijke kosten in rekening brengen voor reeds uitgevoerde werkzaamheden.',
    ],
  },
  {
    title: '8. Verplichtingen van de klant',
    items: [
      'De klant is verantwoordelijk voor juiste en volledige aanlevering van gegevens (naam, adres, e-mail, foto).',
      'De klant verklaart dat hij/zij gerechtigd is de aangeleverde foto te gebruiken en daarmee geen rechten van derden schendt.',
      'Bij twijfel over kwaliteit of geschiktheid van foto mag Kartonbaas contact opnemen voor vervanging of correctie.',
    ],
  },
  {
    title: '9. Aansprakelijkheid',
    items: [
      'Kartonbaas is alleen aansprakelijk voor directe schade die het rechtstreekse gevolg is van opzet of grove nalatigheid.',
      'Aansprakelijkheid is beperkt tot maximaal het bedrag van de betreffende bestelling.',
      'Kartonbaas is niet aansprakelijk voor indirecte schade, gevolgschade, gemiste winst of gemiste kansen.',
    ],
  },
  {
    title: '10. Klachtenregeling',
    items: [
      'Klachten kunnen worden ingediend via info@kartonbaas.nl onder vermelding van ordernummer en omschrijving van de klacht.',
      'Kartonbaas bevestigt de ontvangst van de klacht en reageert in principe binnen 14 dagen.',
      'Als meer tijd nodig is voor afhandeling, ontvangt de klant binnen die termijn een update met indicatie van de vervolgstappen.',
    ],
  },
  {
    title: '11. Privacy en communicatie',
    items: [
      'Kartonbaas verwerkt persoonsgegevens uitsluitend voor orderverwerking, klantenservice en communicatie rondom de bestelling.',
      'Meer informatie staat in het privacybeleid op de website.',
      'Klantcommunicatie kan plaatsvinden via e-mail op het door de klant opgegeven e-mailadres.',
    ],
  },
  {
    title: '12. Overmacht',
    items: [
      'In geval van overmacht (zoals storingen, ziekte, transportproblemen, netwerk- of betalingsproblemen) mag Kartonbaas de uitvoering opschorten.',
      'Indien nakoming blijvend onmogelijk is, kunnen partijen de overeenkomst (gedeeltelijk) ontbinden zonder schadeplichtigheid.',
    ],
  },
  {
    title: '13. Toepasselijk recht en geschillen',
    items: [
      'Op alle overeenkomsten met Kartonbaas is uitsluitend Nederlands recht van toepassing.',
      'Geschillen worden in eerste instantie in onderling overleg opgelost.',
      'Als dat niet lukt, wordt het geschil voorgelegd aan de bevoegde rechter in Nederland.',
    ],
  },
];

export default function VoorwaardenPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="pt-24 pb-20 px-6 bg-cream min-h-screen">
        <div className="max-w-4xl mx-auto bg-white border-2 border-ink rounded-3xl p-8 sm:p-10 shadow-bold">
          <h1 className="text-3xl sm:text-4xl font-black text-ink mb-3">Algemene voorwaarden</h1>
          <p className="text-sm text-gray-500 mb-8">Laatst bijgewerkt: 8 maart 2026</p>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-black text-ink mb-3">{section.title}</h2>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-gray-700">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                      <span className="text-sm sm:text-[15px] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-black text-ink mb-3">Contact</h2>
              <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed">
                Vragen over deze voorwaarden? Neem contact op via{' '}
                <a href="mailto:info@kartonbaas.nl" className="font-bold text-orange-600 hover:underline">
                  info@kartonbaas.nl
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
