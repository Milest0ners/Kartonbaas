"use client";

import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

function StarsInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (nextValue: number) => void;
}) {
  return (
    <div className="flex items-center gap-2" role="radiogroup" aria-label="Aantal sterren">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const active = starValue <= value;
        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            onClick={() => onChange(starValue)}
            className="rounded-md p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <svg
              className={`h-7 w-7 ${active ? "text-orange-400" : "text-gray-300"}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
      <span className="text-sm font-bold text-gray-600">{value}/5</span>
    </div>
  );
}

export default function Reviews() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        name,
        email,
        orderNumber: `Review ${rating}/5`,
        message: `Nieuwe review ingestuurd via de website.\n\nBeoordeling: ${rating}/5 sterren\n\nReview:\n${reviewText}`,
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Er ging iets mis met versturen.");
      }

      setDone(true);
      setName("");
      setEmail("");
      setRating(5);
      setReviewText("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Er ging iets mis met versturen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="reviews" className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[350px] w-[700px] -translate-x-1/2 rounded-full bg-orange-100 opacity-50 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-orange-300 bg-orange-100 px-4 py-1.5">
            <span className="text-sm font-black uppercase tracking-widest text-orange-700">Reviews</span>
          </div>
          <h2 className="text-balance text-3xl font-black leading-tight tracking-tight text-ink sm:text-5xl">
            Laat je review achter
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-medium leading-relaxed text-gray-600">
            Heb je onlangs besteld? Laat een review achter en help anderen met jouw ervaring.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-3xl border-2 border-ink bg-white p-6 shadow-bold">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-orange-600">Waarom een review?</p>
              <h3 className="mb-2 text-xl font-black text-ink">Jouw feedback helpt ons</h3>
              <ul className="space-y-2.5">
                {[
                  "Nieuwe klanten krijgen een eerlijker beeld",
                  "Wij kunnen onze kwaliteit blijven verbeteren",
                  "Je ervaring helpt andere twijfelaars kiezen",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" />
                    <span className="text-sm font-medium text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border-2 border-ink bg-white p-6 shadow-bold-lg sm:p-8 lg:col-span-3">
            <div className="mb-4">
              <h3 className="text-2xl font-black text-ink">Laat hier je review achter</h3>
              <p className="mt-1 text-sm font-medium text-gray-600">
                Het invullen duurt minder dan een minuut.
              </p>
            </div>

            {done ? (
              <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-5" role="status" aria-live="polite">
                <p className="text-sm font-black text-orange-700">Bedankt! Je review is ontvangen.</p>
                <p className="mt-2 text-sm font-medium text-gray-700">
                  We lezen je feedback en gebruiken die om Kartonbaas nog beter te maken.
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    id="review-naam"
                    label="Naam"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Bijv. Karel Karton"
                  />
                  <Input
                    id="review-email"
                    label="E-mailadres"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Bijv. naam@domein.nl"
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-sm font-bold text-ink">
                    Beoordeling <span className="ml-1 text-orange-500">*</span>
                  </p>
                  <StarsInput value={rating} onChange={setRating} />
                </div>

                <Textarea
                  id="review-tekst"
                  label="Jouw review"
                  name="review"
                  required
                  rows={6}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Wat vond je van de kwaliteit, levering en het eindresultaat?"
                  hint="Minimaal 10 tekens."
                />

                {error && (
                  <p className="text-sm font-semibold text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" isLoading={isSubmitting}>
                  {isSubmitting ? "Versturen..." : "Review versturen"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
