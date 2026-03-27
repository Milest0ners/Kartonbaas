import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20 px-6 bg-cream min-h-screen">
        <div className="max-w-3xl mx-auto bg-white border-2 border-ink rounded-3xl p-8 shadow-bold">
          <h1 className="text-3xl font-black text-ink mb-4">Privacybeleid</h1>
          <div className="space-y-4 text-gray-700">
            <p>
              Wij verwerken persoonsgegevens alleen voor het afhandelen van bestellingen, klantenservice en wettelijke verplichtingen.
            </p>
            <p>
              Gegevens worden niet langer bewaard dan nodig en niet verkocht aan derden.
            </p>
            <p>
              Je hebt recht op inzage, correctie en verwijdering van je gegevens. Hiervoor kun je mailen naar info@kartonbaas.nl.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
