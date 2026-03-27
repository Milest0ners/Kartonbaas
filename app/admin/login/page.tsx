import type { Metadata } from 'next';
import Link from 'next/link';
import { loginAdmin } from '@/app/admin/actions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Admin Login | Kartonbaas',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const error = searchParams?.error;

  return (
    <>
      <Header />
      <main className="pt-24 pb-20 px-6 bg-cream min-h-screen">
        <div className="max-w-md mx-auto bg-white border-2 border-ink rounded-2xl p-6 shadow-bold">
          <h1 className="text-2xl font-black text-ink">Admin login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Vul het admin wachtwoord in om het bestellingenoverzicht te openen.
          </p>

          {error === 'invalid' ? (
            <p className="mt-4 text-sm font-semibold text-red-600">Onjuist wachtwoord. Probeer opnieuw.</p>
          ) : null}
          {error === 'config' ? (
            <p className="mt-4 text-sm font-semibold text-red-600">
              Admin wachtwoord ontbreekt. Zet <code>ADMIN_DASHBOARD_PASSWORD</code> in je <code>.env.local</code>.
            </p>
          ) : null}

          <form action={loginAdmin} className="mt-5 space-y-3">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Wachtwoord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full h-11 rounded-lg border-2 border-ink bg-white px-3 text-sm"
              placeholder="Voer wachtwoord in"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-black border-2 border-ink shadow-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              Inloggen
            </button>
          </form>

          <div className="mt-4">
            <Link href="/" className="text-xs font-semibold text-gray-500 hover:text-ink">
              ← Terug naar website
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

