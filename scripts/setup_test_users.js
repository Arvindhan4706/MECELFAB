import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const pwd = await bcrypt.hash('password123', 10);
  
  const userA = await prisma.user.create({
    data: {
      email: 'customerA@test.com',
      password: pwd,
      name: 'Customer A',
      role: 'CUSTOMER',
    }
  });

  const custA = await prisma.customer.create({
    data: {
      companyName: 'Company A',
      contactPerson: 'Alice',
      email: 'customerA@test.com',
      phone: '1111',
      userId: userA.id,
    }
  });

  const eqA = await prisma.equipment.create({
    data: {
      type: 'Pump',
      manufacturer: 'Kirloskar',
      model: 'K-100',
      serialNumber: 'SN-A',
      location: 'Site A',
      customerId: custA.id,
    }
  });

  const userB = await prisma.user.create({
    data: {
      email: 'customerB@test.com',
      password: pwd,
      name: 'Customer B',
      role: 'CUSTOMER',
    }
  });

  const custB = await prisma.customer.create({
    data: {
      companyName: 'Company B',
      contactPerson: 'Bob',
      email: 'customerB@test.com',
      phone: '2222',
      userId: userB.id,
    }
  });

  const eqB = await prisma.equipment.create({
    data: {
      type: 'Motor',
      manufacturer: 'ABB',
      model: 'M-200',
      serialNumber: 'SN-B',
      location: 'Site B',
      customerId: custB.id,
    }
  });
  
  console.log(`Created EQ_A: ${eqA.id}`);
  console.log(`Created EQ_B: ${eqB.id}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
