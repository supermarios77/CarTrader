export type PrismaClientInstance = {
  $disconnect: () => Promise<void>;
};

export type PrismaClientOptions = Record<string, unknown>;

let prisma: PrismaClientInstance | null = null;

const instantiateClient = (options?: PrismaClientOptions): PrismaClientInstance => {
  const { PrismaClient } = require('@prisma/client');
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['info', 'warn', 'error'] : ['warn', 'error'],
    ...options,
  });
};

export const getPrismaClient = (options?: PrismaClientOptions): PrismaClientInstance => {
  if (!prisma) {
    prisma = instantiateClient(options);
  }

  return prisma;
};

export const createPrismaClient = (options?: PrismaClientOptions): PrismaClientInstance =>
  instantiateClient(options);

export const disconnectPrismaClient = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};
