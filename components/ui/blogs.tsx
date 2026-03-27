'use client';

import Image from 'next/image';
import Link from 'next/link';

export interface BlogArticle {
  category: string;
  description: string;
  image: string;
  publishDate: string;
  readMoreLink: string;
  title: string;
}

interface BlogsProps {
  articles: BlogArticle[];
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default function Blogs({ articles }: BlogsProps) {
  return (
    <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, index) => (
        <div
          key={index}
          className="blog-card group relative flex flex-col bg-white border-2 border-ink rounded-2xl overflow-hidden shadow-bold hover:-translate-y-1 hover:shadow-bold-lg transition-all duration-240 ease-spring"
          style={{ opacity: 0 }}
        >
          {/* Image */}
          <div className="relative overflow-hidden">
            <Image
              alt={article.title}
              className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
              height={600}
              src={article.image}
              width={900}
            />
            {/* Category badge */}
            <div className="absolute top-3 left-3 bg-orange-500 border-2 border-ink rounded-full px-3 py-1 shadow-bold">
              <span className="text-[10px] font-black text-white uppercase tracking-wider">
                #{article.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-6">
            <h3 className="font-black text-lg text-ink leading-tight mb-2 tracking-tight">
              {article.title}
            </h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 flex-1">
              {article.description}
            </p>

            {/* Footer row */}
            <div className="flex items-center justify-between">
              <Link
                href={article.readMoreLink}
                className="group/link inline-flex items-center gap-2.5 text-sm font-black text-ink hover:text-orange-500 transition-colors duration-180"
              >
                {/* Animated arrow box */}
                <span className="relative w-8 h-8 flex items-center justify-center rounded-lg border-2 border-ink bg-ink overflow-hidden shadow-bold group-hover/link:bg-orange-500 group-hover/link:border-orange-500 transition-all duration-180">
                  <ArrowRightIcon className="w-3.5 h-3.5 text-white absolute transition-all duration-300 group-hover/link:translate-x-8 group-hover/link:opacity-0" />
                  <ArrowRightIcon className="w-3.5 h-3.5 text-white absolute -translate-x-8 opacity-0 transition-all duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100" />
                </span>
                Lees meer
              </Link>
              <span className="text-xs font-medium text-gray-400 tabular-nums">
                {article.publishDate}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
