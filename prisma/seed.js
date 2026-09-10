// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Initializing database with verified MECELFAB data...');

  // 1. Clear existing transactional/seed records to prevent conflicts during re-seed
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.part.deleteMany();
  await prisma.serviceReport.deleteMany();
  await prisma.serviceVisit.deleteMany();
  await prisma.aMCEquipment.deleteMany();
  await prisma.aMC.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.inquiryNote.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.document.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.service.deleteMany();

  // 2. Administrative User (Official MECELFAB Admin Account)
  const passwordHash = await bcrypt.hash('admin', 10);
  
  await prisma.user.upsert({
    where: { email: 'mecelfab@gmail.com' },
    update: {},
    create: {
      name: 'MECELFAB Administrator',
      email: 'mecelfab@gmail.com',
      password: passwordHash,
      role: 'SUPER_ADMIN'
    }
  });

  // 3. Official Confirmed Services (The 8 Authoritative Core Offerings)
  const services = [
    { title: 'Industrial Erection', slug: 'industrial-erection', description: 'Expert erection of heavy industrial machinery.' },
    { title: 'Industrial Fabrication', slug: 'industrial-fabrication', description: 'Precision metal fabrication for industrial needs.' },
    { title: 'Hydraulic and Pneumatic System Overhauling', slug: 'hydraulic-pneumatic-overhauling', description: 'Complete system diagnostics and overhauling.' },
    { title: 'Industrial Generator Spare Parts', slug: 'generator-spare-parts', description: 'Genuine spare parts for industrial generators.' },
    { title: 'Annual Maintenance Contract (AMC)', slug: 'amc', description: 'Comprehensive annual maintenance services.' },
    { title: 'Industrial Generator Rental', slug: 'generator-rental', description: 'Reliable industrial generators for rent.' },
    { title: 'Air Compressor Rental', slug: 'air-compressor-rental', description: 'High-capacity air compressors for rent.' },
    { title: 'Turbocharger Services', slug: 'turbocharger-services', description: 'Repair and maintenance of industrial turbochargers.' }
  ];

  for (const s of services) {
    await prisma.service.create({
      data: {
        ...s,
        status: 'ACTIVE'
      }
    });
  }

  // 4. Official Company Settings (Single Source of Truth)
  // Unverified/unsupplied fields remain empty strings for clean neutral states
  const defaultContact = {
    companyName: 'MECELFAB INDUSTRIAL SOLUTIONS PRIVATE LIMITED',
    email: 'mecelfab@gmail.com',
    billingEmail: 'mecelfab@gmail.com',
    phone: '',
    address: '',
    workingHours: 'Mon - Sat: 9:00 AM - 6:00 PM IST',
    gstin: '',
    pan: '',
    cin: '',
    bankName: '',
    bankAccount: '',
    bankIfsc: '',
    bankBeneficiary: 'MECELFAB INDUSTRIAL SOLUTIONS PRIVATE LIMITED',
    jurisdiction: 'Competent Courts in India',
    linkedin: '',
    twitter: ''
  };

  await prisma.setting.upsert({
    where: { key: 'CONTENT_CONTACT' },
    update: {},
    create: {
      key: 'CONTENT_CONTACT',
      value: JSON.stringify(defaultContact),
      type: 'JSON'
    }
  });

  await prisma.setting.upsert({
    where: { key: 'companyName' },
    update: {},
    create: { key: 'companyName', value: 'MECELFAB INDUSTRIAL SOLUTIONS PRIVATE LIMITED', type: 'STRING' }
  });

  await prisma.setting.upsert({
    where: { key: 'contactEmail' },
    update: {},
    create: { key: 'contactEmail', value: 'mecelfab@gmail.com', type: 'STRING' }
  });

  await prisma.setting.upsert({
    where: { key: 'billingEmail' },
    update: {},
    create: { key: 'billingEmail', value: 'mecelfab@gmail.com', type: 'STRING' }
  });

  console.log('Database initialized successfully with verified MECELFAB infrastructure.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
