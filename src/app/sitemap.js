import { db } from '@/lib/db';

const BASE_URL = 'https://mecelfabpvtltd.com';

export default async function sitemap() {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/industries`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/projects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/resources`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/quality`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/capabilities`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  ];

  let servicePages = [];
  let projectPages = [];
  let industryPages = [];

  try {
    const services = await db.service.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
    });
    servicePages = services.map((s) => ({
      url: `${BASE_URL}/services/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.8,
    }));
  } catch {}

  try {
    const projects = await db.project.findMany({
      where: { status: { not: 'DISABLED' } },
      select: { slug: true, updatedAt: true },
    });
    projectPages = projects.map((p) => ({
      url: `${BASE_URL}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch {}

  try {
    const industries = await db.industry.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });
    industryPages = industries.map((i) => ({
      url: `${BASE_URL}/industries/${i.slug}`,
      lastModified: i.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch {}

  return [...staticPages, ...servicePages, ...projectPages, ...industryPages];
}
