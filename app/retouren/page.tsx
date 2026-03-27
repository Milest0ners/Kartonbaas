import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RetourenPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20 px-6 bg-cream min-h-screen">
        <div className="max-w-3xl mx-auto bg-white border-2 border-ink rounded-3xl p-8 shadow-bold">
          <h1 className="text-3xl font-black text-ink mb-4">Retouren</h1>
          <div className="space-y-4 text-gray-700">
            <p>
              Onze producten worden volledig op maat gemaakt op basis van jouw foto. Daardoor geldt er geen standaard herroepingsrecht zoals bij niet-gepersonaliseerde producten.
            </p>
            <p>
              Is je bestelling beschadigd geleverd of is er een productiefout? Neem dan binnen 48 uur contact met ons op via info@kartonbaas.nl met duidelijke foto&apos;s van het probleem.
            </p>
            <p>
              We zoeken altijd een passende oplossing, zoals kosteloos herstel of vervanging.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
