import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogSlugClient } from './BlogSlugClient';
import { articles } from '../data';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) return { title: 'Not Found' };
  return {
    title: `${article.title} | Wealix Blog`,
    description: article.description,
    alternates: { canonical: `https://wealix.app/blog/${slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://wealix.app/blog/${slug}`,
      type: 'article',
      images: [{ url: 'https://wealix.app/og/og-default.png', width: 1200, height: 630 }],
    },
  };
}

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) notFound();
  return <BlogSlugClient article={article} slug={slug} />;
}
