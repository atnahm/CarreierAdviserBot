import { PrismaClient } from '@prisma/client';

const tenantClients = new Map<string, PrismaClient>();

export const getTenantPrismaClient = async (databaseUrl: string): Promise<PrismaClient> => {
  if (tenantClients.has(databaseUrl)) {
    return tenantClients.get(databaseUrl)!;
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  await prisma.$connect();
  tenantClients.set(databaseUrl, prisma);

  return prisma;
};

export const disconnectAllTenantClients = async (): Promise<void> => {
  for (const client of tenantClients.values()) {
    try {
      await client.$disconnect();
    } catch (error) {
      console.warn('Tenant Prisma multiclient disconnect error', error);
    }
  }
  tenantClients.clear();
};