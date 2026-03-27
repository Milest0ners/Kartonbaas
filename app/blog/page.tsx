import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllBlogPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog | Kartonbaas',
  description: 'Tips, inspiratie en nieuws over kartonnen cut-outs.',
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <>
      <Header />
      <main className="pt-24 pb-20 px-6 bg-cream min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-black text-ink mb-8">Blog</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article key={post.slug} className="bg-white border-2 border-ink rounded-2xl overflow-hidden shadow-bold">
                <div className="relative w-full aspect-[16/10]">
                  <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" quality={90} className="object-cover" />
                </div>
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-orange-600">{post.category}</p>
                  <h2 className="mt-2 text-lg font-black text-ink">{post.title}</h2>
                  <p className="mt-2 text-sm text-gray-600">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex mt-4 text-sm font-black text-orange-600 hover:text-orange-700"
                  >
                    Lees artikel →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
