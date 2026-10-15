import { db } from '@/lib/db';
import { DEFAULT_PROJECTS } from '@/data/projectsData';
import { getAllServices } from '@/data/servicesData';
import { EQUIPMENT_ITEMS } from '@/lib/equipmentData';

const DEFAULT_INDUSTRY_SLUGS = [
  'industrial-manufacturing',
  'power-energy',
  'industrial-maintenance',
  'commercial-power',
];

export default async function sitemap() {
  const baseUrl = 'https://mecelfabpvtltd.com';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/industries`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/projects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/equipment`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/capabilities`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/quality`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];

  let servicePages;
  let industryPages;
  let projectPages;
  let equipmentPages;

  // 1. Services
  try {
    const services = await db.service.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true, updatedAt: true },
    });
    const list = services && services.length > 0 ? services : getAllServices();
    servicePages = list.map((s) => ({
      url: `${baseUrl}/services/${s.slug}`,
      lastModified: s.updatedAt || new Date(),
      changeFrequency: 'monthly',
      priority: 0.85,
    }));
  } catch {
    servicePages = getAllServices().map((s) => ({
      url: `${baseUrl}/services/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.85,
    }));
  }

  // 2. Industries
  try {
    const industries = await db.industry.findMany({
      select: { slug: true, updatedAt: true },
    });
    const list = industries && industries.length > 0 
      ? industries.map(i => i.slug) 
      : DEFAULT_INDUSTRY_SLUGS;
    industryPages = list.map((slug) => ({
      url: `${baseUrl}/industries/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    }));
  } catch {
    industryPages = DEFAULT_INDUSTRY_SLUGS.map((slug) => ({
      url: `${baseUrl}/industries/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    }));
  }

  // 3. Projects
  try {
    const projects = await db.project.findMany({
      where: { status: { not: 'DISABLED' } },
      select: { slug: true, updatedAt: true },
    });
    const list = projects && projects.length > 0 ? projects : DEFAULT_PROJECTS;
    projectPages = list.map((p) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch {
    projectPages = DEFAULT_PROJECTS.map((p) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  }

  // 4. Equipment
  equipmentPages = EQUIPMENT_ITEMS.map((item) => ({
    url: `${baseUrl}/equipment/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticPages, ...servicePages, ...industryPages, ...projectPages, ...equipmentPages];
}
