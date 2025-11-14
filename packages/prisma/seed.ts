import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Categories
  const carCategory = await prisma.category.upsert({
    where: { slug: 'cars' },
    update: {},
    create: {
      name: 'Cars',
      slug: 'cars',
      description: 'Buy and sell cars',
      order: 1,
      isActive: true,
    },
  });

  const bikeCategory = await prisma.category.upsert({
    where: { slug: 'bikes' },
    update: {},
    create: {
      name: 'Bikes',
      slug: 'bikes',
      description: 'Buy and sell motorcycles and bikes',
      order: 2,
      isActive: true,
    },
  });

  const partsCategory = await prisma.category.upsert({
    where: { slug: 'auto-parts' },
    update: {},
    create: {
      name: 'Auto Parts',
      slug: 'auto-parts',
      description: 'Buy and sell auto parts and accessories',
      order: 3,
      isActive: true,
    },
  });

  console.log('✅ Categories created');

  // Create Makes for Cars
  const popularCarMakes = [
    'Toyota', 'Honda', 'Suzuki', 'Nissan', 'Mitsubishi',
    'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz', 'Audi',
    'Volkswagen', 'Ford', 'Chevrolet', 'Mazda', 'Subaru',
  ];

  for (const makeName of popularCarMakes) {
    await prisma.make.upsert({
      where: {
        categoryId_slug: {
          categoryId: carCategory.id,
          slug: makeName.toLowerCase().replace(/\s+/g, '-'),
        },
      },
      update: {},
      create: {
        categoryId: carCategory.id,
        name: makeName,
        slug: makeName.toLowerCase().replace(/\s+/g, '-'),
        isActive: true,
      },
    });
  }

  // Create Makes for Bikes
  const popularBikeMakes = [
    'Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Bajaj',
    'Hero', 'United', 'Ravi', 'Qingqi', 'Super Power',
  ];

  for (const makeName of popularBikeMakes) {
    await prisma.make.upsert({
      where: {
        categoryId_slug: {
          categoryId: bikeCategory.id,
          slug: makeName.toLowerCase().replace(/\s+/g, '-'),
        },
      },
      update: {},
      create: {
        categoryId: bikeCategory.id,
        name: makeName,
        slug: makeName.toLowerCase().replace(/\s+/g, '-'),
        isActive: true,
      },
    });
  }

  console.log('✅ Makes created');

  // Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cartrader.com' },
    update: {},
    create: {
      email: 'admin@cartrader.com',
      emailVerified: true,
      passwordHash: '$2b$10$KIXx.example.hash.here.change.in.production', // Change this!
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Admin user created (email: admin@cartrader.com)');
  console.log('⚠️  IMPORTANT: Change the admin password in production!');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

