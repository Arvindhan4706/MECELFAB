import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient();

globalForPrisma.prisma = db;
