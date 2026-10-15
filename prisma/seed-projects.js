// prisma/seed-projects.js
import { PrismaClient } from '@prisma/client';
import { DEFAULT_PROJECTS } from '../src/data/projectsData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding accurately analyzed projects into PostgreSQL database...');
  
  // Clean up any earlier tentative project records
  await prisma.project.deleteMany();

  for (const proj of DEFAULT_PROJECTS) {
    const { mediaList, ...projectData } = proj;
    await prisma.project.create({
      data: {
        id: proj.id,
        title: proj.title,
        slug: proj.slug,
        category: proj.category,
        description: proj.description,
        content: proj.content,
        client: proj.client,
        year: proj.year,
        image: proj.image,
        images: proj.images,
        status: proj.status,
        featured: proj.featured,
      }
    });
    console.log(`Created project: ${proj.slug}`);
  }
  console.log('Finished seeding accurate projects.');
}

main()
  .catch((e) => {
    console.error('Error seeding projects:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
