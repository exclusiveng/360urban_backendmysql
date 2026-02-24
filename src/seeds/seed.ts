import { AppDataSource } from '../config/database.js';
import { Area } from '../entities/Area.js';
import { generateSlug } from '../utils/validators.js';

const areasData = [
  {
    name: 'Jabi',
    description: 'A fast-growing district known for upscale residences, shopping centres, and proximity to the city centre. Popular with young professionals and families.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  },
  {
    name: 'Lugbe',
    description: "One of Abuja's most affordable satellite towns with rapid development. Great for budget-conscious renters and first-time buyers.",
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  },
  {
    name: 'Katampe',
    description: 'A prestigious hill-top neighbourhood offering serenity, views, and high-end properties. Ideal for executives and diplomats.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  },
  {
    name: 'Maitama',
    description: "Abuja's premier district — home to embassies, luxury estates, and top-tier amenities. The gold standard of urban living.",
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  },
  {
    name: 'Gwarinpa',
    description: "Africa's largest housing estate, known for residential comfort, family-friendly layouts, and vibrant community life.",
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  },
  {
    name: 'Wuse',
    description: 'A bustling commercial and residential hub at the heart of Abuja. Close to markets, offices, and nightlife.',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
  },
];

export const seedAreas = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const areaRepository = AppDataSource.getRepository(Area);

    console.log('🌱 Seeding areas...');

    for (const data of areasData) {
      const slug = generateSlug(data.name);

      // Check if area already exists
      const existing = await areaRepository.findOne({
        where: { slug },
      });

      if (!existing) {
        const area = areaRepository.create({
          name: data.name,
          slug,
          description: data.description,
          image: data.image,
        });

        await areaRepository.save(area);
        console.log(`✓ Created area: ${data.name}`);
      } else {
        console.log(`⊘ Area already exists: ${data.name}`);
      }
    }

    console.log('✓ Areas seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
};

seedAreas();
