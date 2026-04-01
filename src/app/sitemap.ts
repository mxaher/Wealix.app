import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wealix.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Core app routes (gated but indexable landing shells)
  const appRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/fire`,        lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/portfolio`,   lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/net-worth`,   lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/retirement`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/advisor`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/budget`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/reports`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/income`,      lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/expenses`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  // Blog articles
  const blogRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/blog`,                                     lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${siteUrl}/blog/fire-calculator-saudi-arabia`,        lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
    { url: `${siteUrl}/blog/fire-calculator-saudi-arabia-ar`,     lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
    { url: `${siteUrl}/blog/portfolio-tracker-tasi-nasdaq`,       lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${siteUrl}/blog/net-worth-tracker-mena`,              lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${siteUrl}/blog/retirement-planning-saudi-expat`,     lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
  ];

  // Competitor comparison pages
  const vsRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/vs/personal-capital`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/vs/mint`,             lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/vs/ynab`,             lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/vs/excel`,            lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
  ];

  // Programmatic market pages
  const marketRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/markets/tasi`,    lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/markets/egx`,     lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/markets/nasdaq`,  lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/markets/nyse`,    lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];

  // Legal & static
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl,                lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${siteUrl}/terms`,     lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/privacy`,   lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  return [
    ...staticRoutes,
    ...appRoutes,
    ...blogRoutes,
    ...vsRoutes,
    ...marketRoutes,
  ];
}
