'use client';

import { useState } from 'react';

export default function ContactFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          orderNumber,
          message,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || 'Er ging iets mis met versturen.');
      }

      setDone(true);
      setName('');
      setEmail('');
      setOrderNumber('');
      setMessage('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Er ging iets mis met versturen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-orange-50 via-cream to-orange-100">
      <div className="max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white border-2 border-ink rounded-full px-4 py-1.5 mb-5 shadow-bold">
          <span className="text-sm font-black text-ink uppercase tracking-widest">Contact</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-ink tracking-tight leading-tight text-balance mb-3">
          Vraag? We helpen je graag verder
        </h1>
        <p className="text-gray-600 font-medium leading-relaxed max-w-2xl mb-10">
          Stuur je vraag in en we reageren meestal binnen een werkdag. Heb je al besteld? Voeg dan je ordernummer toe zodat we je sneller kunnen helpen.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border-2 border-ink rounded-3xl p-6 shadow-bold">
              <p className="text-xs uppercase tracking-widest font-black text-orange-600 mb-2">Snelle support</p>
              <h2 className="text-xl font-black text-ink mb-2">Hoe sneller antwoord?</h2>
              <ul className="space-y-2.5">
                {[
                  'Vermeld je ordernummer als je die hebt',
                  'Stuur je vraag zo concreet mogelijk',
                  'Gebruik hetzelfde e-mailadres als bij je bestelling',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5">
                    <span className="mt-1 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-orange-500 border-2 border-ink rounded-3xl p-6 shadow-bold text-white">
              <p className="text-xs uppercase tracking-widest font-black text-orange-100 mb-1">Direct mailen</p>
              <a
                href="mailto:info@kartonbaas.nl"
                className="text-lg sm:text-xl font-black underline underline-offset-4 decoration-orange-100/70 hover:decoration-white"
              >
                info@kartonbaas.nl
              </a>
              <p className="mt-3 text-sm text-orange-100 font-medium">
                Voor vragen over je bestelling, levering of fotokwaliteit.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white border-2 border-ink rounded-3xl p-6 sm:p-8 shadow-bold-lg">
            {done ? (
              <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-5" role="status" aria-live="polite">
                <p className="text-sm font-black text-orange-700">Bedankt! Je bericht is verstuurd.</p>
                <p className="mt-2 text-sm text-gray-700 font-medium">
                  We nemen zo snel mogelijk contact met je op.
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-naam" className="block text-sm font-semibold text-gray-700 mb-1">
                      Naam
                    </label>
                    <input
                      id="contact-naam"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Bijv. Karel Karton"
                      className="w-full px-4 py-3 rounded-xl border-2 border-ink bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 mb-1">
                      E-mailadres
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Bijv. naam@domein.nl"
                      className="w-full px-4 py-3 rounded-xl border-2 border-ink bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-ordernummer" className="block text-sm font-semibold text-gray-700 mb-1">
                    Ordernummer <span className="text-gray-400 font-medium">(optioneel)</span>
                  </label>
                  <input
                    id="contact-ordernummer"
                    name="orderNumber"
                    type="text"
                    autoComplete="off"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Bijv. KB-2026-00123"
                    className="w-full px-4 py-3 rounded-xl border-2 border-ink bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  />
                </div>

                <div>
                  <label htmlFor="contact-bericht" className="block text-sm font-semibold text-gray-700 mb-1">
                    Bericht
                  </label>
                  <textarea
                    id="contact-bericht"
                    name="message"
                    required
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Waarmee kunnen we je helpen?"
                    className="w-full px-4 py-3 rounded-xl border-2 border-ink resize-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  />
                </div>

                {error && (
                  <p className="text-sm font-semibold text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-orange-500 text-white font-black border-2 border-ink shadow-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-bold"
                >
                  {isSubmitting ? 'Versturen...' : 'Verstuur bericht'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
