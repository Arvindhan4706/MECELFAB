import { db } from '@/lib/db';

export default async function sitemap() {
  const baseUrl = 'https://mecelfabpvtltd.com';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/industries`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/projects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/equipment`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/capabilities`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/quality`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/resources`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];

  let servicePages = [];
  let industryPages = [];
  let projectPages = [];

  try {
    const services = await db.service.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
    });
    servicePages = services.map((s) => ({
      url: `${baseUrl}/services/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.8,
    }));
  } catch {
    // DB unavailable — skip dynamic pages
  }

  try {
    const industries = await db.industry.findMany({
      select: { slug: true, updatedAt: true },
    });
    industryPages = industries.map((i) => ({
      url: `${baseUrl}/industries/${i.slug}`,
      lastModified: i.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch {
    // DB unavailable
  }

  try {
    const projects = await db.project.findMany({
      where: { status: { not: 'DISABLED' } },
      select: { slug: true, updatedAt: true },
    });
    projectPages = projects.map((p) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch {
    // DB unavailable
  }

  return [...staticPages, ...servicePages, ...industryPages, ...projectPages];
}
