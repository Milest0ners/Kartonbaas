'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Blogs, { type BlogArticle } from '@/components/ui/blogs';
import { getFeaturedBlogPosts } from '@/lib/blog';

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Blog() {
  const sectionRef = useRef<HTMLElement>(null);
  const articles: BlogArticle[] = getFeaturedBlogPosts(3).map((post) => ({
    category: post.category,
    title: post.title,
    description: post.excerpt,
    image: post.coverImage,
    publishDate: post.date,
    readMoreLink: `/blog/${post.slug}`,
  }));

  useEffect(() => {
    let killed = false;

    async function animate() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sectionRef.current?.querySelectorAll('.blog-card').forEach((el) => {
          (el as HTMLElement).style.opacity = '1';
        });
        return;
      }
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);
      if (!sectionRef.current) return;
      gsap.fromTo(
        sectionRef.current.querySelectorAll('.blog-card'),
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
        }
      );
    }

    animate();
    return () => { killed = true; };
  }, []);

  return (
    <section ref={sectionRef} id="blog" className="py-24 md:py-32 px-6 bg-cream">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border-2 border-ink rounded-full px-4 py-1.5 mb-5 shadow-bold">
              <span className="text-sm font-black text-ink uppercase tracking-widest">Blog</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-ink tracking-tight leading-tight text-balance">
              Inspiratie & tips
            </h2>
            <p className="mt-3 text-gray-600 font-medium leading-relaxed max-w-md">
              Alles over kartonnen cut-outs — van fototips tot feestideeën.
            </p>
          </div>
          <Link
            href="/blog"
            className={[
              'flex-shrink-0 inline-flex items-center justify-center px-6 py-3',
              'bg-orange-500 text-white font-black text-sm',
              'rounded-2xl border-2 border-ink shadow-bold',
              'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
              'transition-all duration-180',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
            ].join(' ')}
          >
            Lees hier alle blogs →
          </Link>
        </div>

        {/* Cards */}
        <Blogs articles={articles} />

      </div>
    </section>
  );
}
