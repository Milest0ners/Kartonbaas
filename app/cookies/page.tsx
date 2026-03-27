import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20 px-6 bg-cream min-h-screen">
        <div className="max-w-3xl mx-auto bg-white border-2 border-ink rounded-3xl p-8 shadow-bold">
          <h1 className="text-3xl font-black text-ink mb-4">Cookiebeleid</h1>
          <div className="space-y-4 text-gray-700">
            <p>
              Wij gebruiken functionele cookies om de website technisch goed te laten werken en, na toestemming, analytische cookies om de website te verbeteren.
            </p>
            <p>
              Bij je eerste bezoek kun je kiezen welke cookies je toestaat. Je voorkeur wordt lokaal opgeslagen.
            </p>
            <p>
              Je kunt je cookies altijd verwijderen via je browserinstellingen.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
