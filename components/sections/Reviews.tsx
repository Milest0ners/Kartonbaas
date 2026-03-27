"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { InfiniteSlider } from "@/components/ui/infinite-slider-horizontal";

type Review = {
  text:     string;
  image:    string;
  name:     string;
  occasion: string;
  emoji:    string;
  stars?:   number;
};

const reviews: Review[] = [
  {
    text:     "Mijn vriend stond versteld toen hij zijn eigen levensgrote kartonnen versie zag. Absoluut hilarisch én geweldig!",
    image:    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    name:     "Lisa de Vries",
    occasion: "Verjaardag",
    emoji:    "🎂",
    stars:    5,
  },
  {
    text:     "Voor ons vrijgezellenfeest was dit de perfecte verrassing. De kwaliteit van de print was echt indrukwekkend.",
    image:    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    name:     "Daan Janssen",
    occasion: "Vrijgezellenfeest",
    emoji:    "🥂",
    stars:    5,
  },
  {
    text:     "Zo makkelijk besteld! Foto geüpload, betaald via iDEAL en binnen een week stond mijn man in de hoek.",
    image:    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    name:     "Sophie Bakker",
    occasion: "Cadeau",
    emoji:    "🎁",
    stars:    5,
  },
  {
    text:     "Onze collega's stonden perplex. Zijn kartonnen clone leidde vergaderingen terwijl hij op vakantie was.",
    image:    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    name:     "Tom van den Berg",
    occasion: "Kantoor",
    emoji:    "💼",
    stars:    5,
  },
  {
    text:     "Snelle levering, stevige verpakking en het resultaat was nog mooier dan verwacht. Aanrader!",
    image:    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
    name:     "Emma Visser",
    occasion: "Feest",
    emoji:    "🎉",
    stars:    5,
  },
  {
    text:     "Ze namen contact op omdat mijn foto niet optimaal was en hielpen me naar het beste resultaat. Top service!",
    image:    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    name:     "Niels Smit",
    occasion: "Cadeau",
    emoji:    "🎁",
    stars:    5,
  },
  {
    text:     "De XXL versie is echt levensecht. Ik schrok er zelf van toen ik 's avonds thuiskwam!",
    image:    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face",
    name:     "Mark Willems",
    occasion: "Verjaardag",
    emoji:    "🎂",
    stars:    5,
  },
  {
    text:     "Als afscheidscadeau voor een collega — iedereen stond te juichen. Beste kantooractie ooit.",
    image:    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
    name:     "Roos Hendriksen",
    occasion: "Kantoor",
    emoji:    "💼",
    stars:    5,
  },
  {
    text:     "Meegenomen naar het vrijgezellenfeest als photo-op. Iedereen wilde er een foto mee. De hit van de avond!",
    image:    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face",
    name:     "Julia Peters",
    occasion: "Vrijgezellenfeest",
    emoji:    "🥂",
    stars:    5,
  },
];

// ─── Star rating ──────────────────────────────────────────────────────────────

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} van 5 sterren`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < count ? 'text-orange-400' : 'text-gray-200'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Review card ─────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className={[
        'w-[300px] flex-shrink-0',
        'bg-white border-2 border-ink rounded-2xl p-5',
        'shadow-bold',
        'hover:-translate-y-1 hover:shadow-bold-lg',
        'transition-all duration-240 ease-spring',
      ].join(' ')}
    >
      {/* Top: occasion + stars */}
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1">
          <span className="text-sm" aria-hidden="true">{review.emoji}</span>
          <span className="text-xs font-black text-orange-600 uppercase tracking-wider">{review.occasion}</span>
        </div>
        <Stars count={review.stars} />
      </div>

      {/* Quote */}
      <p className="text-sm font-medium text-gray-700 leading-relaxed mb-4 line-clamp-3">
        &ldquo;{review.text}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
        <Image
          src={review.image}
          alt={`Profielfoto van ${review.name}`}
          width={36}
          height={36}
          className="w-9 h-9 rounded-full border-2 border-ink object-cover flex-shrink-0"
        />
        <span className="text-sm font-black text-ink">{review.name}</span>
      </div>
    </div>
  );
}

const row1 = reviews.slice(0, 5);
const row2 = reviews.slice(4);

// ─── Section ─────────────────────────────────────────────────────────────────

export default function Reviews() {
  return (
    <section id="reviews" className="py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Soft background blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-orange-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, amount: 0.4 }}
          className="flex flex-col items-center text-center mb-12 px-6"
        >
          <div className="inline-flex items-center gap-2 bg-orange-100 border-2 border-orange-300 rounded-full px-4 py-1.5 mb-5">
            <span className="text-sm font-black text-orange-700 uppercase tracking-widest">Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-ink tracking-tight leading-tight text-balance">
            Wat onze klanten zeggen
          </h2>
          <p className="mt-4 text-gray-600 font-medium max-w-md leading-relaxed">
            Een kartonnen clone past bij elke gelegenheid. Lees wat onze klanten ervan vonden.
          </p>

          {/* Aggregate rating pill */}
          <div className="mt-6 inline-flex items-center gap-2 bg-white border-2 border-ink rounded-full px-4 py-2 shadow-bold">
            <Stars count={5} />
            <span className="text-sm font-black text-ink">4.9</span>
          </div>
        </motion.div>

        {/* Row 1 — scrolls left */}
        <div className="mb-4">
          <InfiniteSlider gap={16} duration={35} durationOnHover={80}>
            {row1.map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </InfiniteSlider>
        </div>

        {/* Row 2 — scrolls right */}
        <InfiniteSlider gap={16} duration={30} reverse durationOnHover={80}>
          {row2.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </InfiniteSlider>
      </div>
    </section>
  );
}
