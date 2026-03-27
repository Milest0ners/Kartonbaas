import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllBlogPosts, getBlogPostBySlug } from '@/lib/blog';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return { title: 'Blog | Kartonbaas' };
  return {
    title: `${post.title} | Kartonbaas`,
    description: post.excerpt,
  };
}

export default function BlogDetailPage({ params }: Props) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  const morePosts = getAllBlogPosts().filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <Header />
      <main className="pt-24 pb-20 px-6 bg-cream min-h-screen">
        <article className="max-w-4xl mx-auto">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Link href="/" className="text-sm font-bold text-gray-600 hover:text-ink">
              ← Terug naar home
            </Link>
            <Link href="/blog" className="text-sm font-bold text-orange-600 hover:text-orange-700">
              Blog overzicht
            </Link>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-ink">{post.title}</h1>
          <p className="mt-3 text-sm text-gray-500">
            {post.date} · {post.author}
          </p>
          <div className="relative mt-6 w-full aspect-[16/9] rounded-3xl overflow-hidden border-2 border-ink">
            <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 1024px) 100vw, 896px" quality={92} className="object-cover" />
          </div>

          <div className="mt-8 space-y-8">
            {post.content.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-black text-ink mb-3">{section.heading}</h2>
                <div className="space-y-3">
                  {section.content.map((paragraph) => (
                    <p key={paragraph} className="text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>

        <section className="max-w-6xl mx-auto mt-16">
          <h3 className="text-2xl font-black text-ink mb-5">Lees ook deze blogs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {morePosts.map((item) => (
              <Link
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="block bg-white border-2 border-ink rounded-2xl p-5 shadow-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                <p className="text-xs font-black uppercase tracking-widest text-orange-600">{item.category}</p>
                <p className="mt-2 text-lg font-black text-ink">{item.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
