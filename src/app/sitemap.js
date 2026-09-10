import { db } from '@/lib/db';

export default async function sitemap() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://mecelfabpvtltd.com';

  const staticRoutes = [
    '',
    '/about',
    '/services',
    '/industries',
    '/projects',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  let serviceRoutes = [];
  try {
    const services = await db.service.findMany({
      where: { status: { in: ['ACTIVE', 'PUBLISHED'] } },
      select: { slug: true, updatedAt: true },
    });
    serviceRoutes = services.map((s) => ({
      url: `${baseUrl}/services/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch {
    // Fallback if DB is unavailable during build
  }

  let projectRoutes = [];
  try {
    const projects = await db.project.findMany({
      where: { status: { not: 'DISABLED' } },
      select: { slug: true, updatedAt: true },
    });
    projectRoutes = projects.map((p) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch {
    // Fallback if DB is unavailable during build
  }

  return [...staticRoutes, ...serviceRoutes, ...projectRoutes];
}
