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

  // Create Models for popular car makes
  const toyotaMake = await prisma.make.findUnique({
    where: {
      categoryId_slug: {
        categoryId: carCategory.id,
        slug: 'toyota',
      },
    },
  });

  const hondaMake = await prisma.make.findUnique({
    where: {
      categoryId_slug: {
        categoryId: carCategory.id,
        slug: 'honda',
      },
    },
  });

  const suzukiMake = await prisma.make.findUnique({
    where: {
      categoryId_slug: {
        categoryId: carCategory.id,
        slug: 'suzuki',
      },
    },
  });

  const nissanMake = await prisma.make.findUnique({
    where: {
      categoryId_slug: {
        categoryId: carCategory.id,
        slug: 'nissan',
      },
    },
  });

  // Toyota Models
  if (toyotaMake) {
    const toyotaModels = ['Corolla', 'Camry', 'Prius', 'Yaris', 'Vitz', 'Land Cruiser', 'Fortuner', 'Hilux'];
    for (const modelName of toyotaModels) {
      await prisma.model.upsert({
        where: {
          makeId_slug: {
            makeId: toyotaMake.id,
            slug: modelName.toLowerCase().replace(/\s+/g, '-'),
          },
        },
        update: {},
        create: {
          makeId: toyotaMake.id,
          name: modelName,
          slug: modelName.toLowerCase().replace(/\s+/g, '-'),
          isActive: true,
        },
      });
    }
  }

  // Honda Models
  if (hondaMake) {
    const hondaModels = ['Civic', 'City', 'Accord', 'CR-V', 'HR-V', 'BR-V'];
    for (const modelName of hondaModels) {
      await prisma.model.upsert({
        where: {
          makeId_slug: {
            makeId: hondaMake.id,
            slug: modelName.toLowerCase().replace(/\s+/g, '-'),
          },
        },
        update: {},
        create: {
          makeId: hondaMake.id,
          name: modelName,
          slug: modelName.toLowerCase().replace(/\s+/g, '-'),
          isActive: true,
        },
      });
    }
  }

  // Suzuki Models
  if (suzukiMake) {
    const suzukiModels = ['Alto', 'Mehran', 'Cultus', 'Swift', 'Wagon R', 'Bolan', 'Ravi'];
    for (const modelName of suzukiModels) {
      await prisma.model.upsert({
        where: {
          makeId_slug: {
            makeId: suzukiMake.id,
            slug: modelName.toLowerCase().replace(/\s+/g, '-'),
          },
        },
        update: {},
        create: {
          makeId: suzukiMake.id,
          name: modelName,
          slug: modelName.toLowerCase().replace(/\s+/g, '-'),
          isActive: true,
        },
      });
    }
  }

  // Nissan Models
  if (nissanMake) {
    const nissanModels = ['Sunny', 'Sentra', 'Altima', 'X-Trail', 'Patrol'];
    for (const modelName of nissanModels) {
      await prisma.model.upsert({
        where: {
          makeId_slug: {
            makeId: nissanMake.id,
            slug: modelName.toLowerCase().replace(/\s+/g, '-'),
          },
        },
        update: {},
        create: {
          makeId: nissanMake.id,
          name: modelName,
          slug: modelName.toLowerCase().replace(/\s+/g, '-'),
          isActive: true,
        },
      });
    }
  }

  // Create Models for popular bike makes
  const hondaBikeMake = await prisma.make.findUnique({
    where: {
      categoryId_slug: {
        categoryId: bikeCategory.id,
        slug: 'honda',
      },
    },
  });

  const yamahaBikeMake = await prisma.make.findUnique({
    where: {
      categoryId_slug: {
        categoryId: bikeCategory.id,
        slug: 'yamaha',
      },
    },
  });

  // Honda Bike Models
  if (hondaBikeMake) {
    const hondaBikeModels = ['CB 150F', 'CB 125F', 'CG 125', 'CD 70', 'Pridor', 'Dream'];
    for (const modelName of hondaBikeModels) {
      await prisma.model.upsert({
        where: {
          makeId_slug: {
            makeId: hondaBikeMake.id,
            slug: modelName.toLowerCase().replace(/\s+/g, '-'),
          },
        },
        update: {},
        create: {
          makeId: hondaBikeMake.id,
          name: modelName,
          slug: modelName.toLowerCase().replace(/\s+/g, '-'),
          isActive: true,
        },
      });
    }
  }

  // Yamaha Bike Models
  if (yamahaBikeMake) {
    const yamahaBikeModels = ['YBR 125', 'YBR 150', 'R15', 'R1', 'FZ'];
    for (const modelName of yamahaBikeModels) {
      await prisma.model.upsert({
        where: {
          makeId_slug: {
            makeId: yamahaBikeMake.id,
            slug: modelName.toLowerCase().replace(/\s+/g, '-'),
          },
        },
        update: {},
        create: {
          makeId: yamahaBikeMake.id,
          name: modelName,
          slug: modelName.toLowerCase().replace(/\s+/g, '-'),
          isActive: true,
        },
      });
    }
  }

  console.log('✅ Models created');

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

