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
    {
      title: 'Industrial Erection',
      slug: 'industrial-erection',
      description: 'Expert erection of heavy industrial machinery, structural steel, and complete plant installations with precision alignment and commissioning.',
      content: 'MECELFAB provides end-to-end industrial erection services covering structural steel installation, heavy machinery positioning, precision alignment, grouting, and commissioning. Our erection teams handle projects from single equipment installations to complete plant setups across manufacturing, power, and process industries.',
      scopeOfWork: JSON.stringify([
        'Structural steel erection and installation',
        'Heavy machinery positioning and alignment',
        'Precision grouting and foundation work',
        'Piping and ducting installation',
        'Equipment lifting and rigging',
        'Alignment and leveling using laser instruments',
        'Commissioning and start-up support',
        'As-built documentation'
      ]),
      processSteps: JSON.stringify([
        'Requirement Analysis',
        'Site Assessment',
        'Engineering & Planning',
        'Foundation Preparation',
        'Erection & Installation',
        'Alignment & Grouting',
        'Testing & Commissioning',
        'Handover'
      ]),
      equipment: JSON.stringify([
        'Mobile cranes (25T–200T capacity)',
        'Hydraulic jacking systems',
        'Laser alignment instruments',
        'Torque wrenches and tensioning tools',
        'Scaffolding and access platforms',
        'Welding equipment (SMAW, MIG, TIG)',
        'Survey and leveling instruments'
      ]),
      industriesServed: JSON.stringify(['Manufacturing', 'Power & Energy', 'Industrial Maintenance']),
      faq: JSON.stringify([
        { question: 'What types of machinery can MECELFAB erect?', a: 'We handle industrial machinery ranging from 1 ton to 100+ tons including turbines, generators, presses, boilers, reactors, and complete production lines.' },
        { question: 'Do you provide alignment services?', a: 'Yes. Our teams use laser alignment instruments for precision positioning of rotating equipment, presses, and heavy machinery.' },
        { question: 'What is the typical timeline for erection projects?', a: 'Single equipment installation: 1-5 days. Complete plant erection: 4-16 weeks depending on scale and complexity.' }
      ]),
    },
    {
      title: 'Industrial Fabrication',
      slug: 'industrial-fabrication',
      description: 'Precision metal fabrication for industrial structures, equipment, and systems using certified welding and quality-controlled processes.',
      content: 'MECELFAB delivers precision industrial fabrication covering structural steel, pressure vessels, piping systems, tanks, and custom industrial components. Our fabrication facility handles mild steel, stainless steel, and alloy steel with certified welding procedures and quality inspection at every stage.',
      scopeOfWork: JSON.stringify([
        'Structural steel fabrication',
        'Pressure vessel and tank fabrication',
        'Piping and pipe spool fabrication',
        'Custom industrial components',
        'Plate rolling and bending',
        'CNC cutting and profiling',
        'Certified welding (SMAW, MIG, TIG, SAW)',
        'Surface treatment and painting'
      ]),
      processSteps: JSON.stringify([
        'Design Review',
        'Material Procurement',
        'Cutting & Profiling',
        'Forming & Bending',
        'Welding & Assembly',
        'Inspection & Testing',
        'Surface Treatment',
        'Delivery & Installation'
      ]),
      equipment: JSON.stringify([
        'CNC plasma and gas cutting machines',
        'Plate rolling machines (up to 50mm thickness)',
        'Hydraulic press brakes',
        'MIG/TIG/SAW welding stations',
        'Overhead cranes (10T–30T)',
        'Shot blasting and painting booth',
        'CMM and dimensional inspection tools'
      ]),
      industriesServed: JSON.stringify(['Manufacturing', 'Power & Energy', 'Oil & Gas', 'Industrial Maintenance']),
      faq: JSON.stringify([
        { question: 'What materials can MECELFAB fabricate?', a: 'We work with mild steel, stainless steel (304/316), aluminum, and alloy steels. Our facility handles plate thickness from 3mm to 50mm.' },
        { question: 'Do you provide certified welding?', a: 'Yes. All welding is performed by certified welders following approved WPS/PQR procedures. We provide weld maps and test certificates.' },
        { question: 'Can you handle large-volume fabrication?', a: 'Our fabrication yard is equipped for both prototype and large-batch production runs with consistent quality control.' }
      ]),
    },
    {
      title: 'Hydraulic and Pneumatic System Overhauling',
      slug: 'hydraulic-pneumatic-overhauling',
      description: 'Complete system diagnostics, overhaul, and restoration of hydraulic and pneumatic systems for industrial equipment.',
      content: 'MECELFAB provides comprehensive hydraulic and pneumatic system overhauling including cylinder repair, pump rebuilds, valve servicing, hose replacement, and full system testing. We restore systems to OEM specifications with documented test reports.',
      scopeOfWork: JSON.stringify([
        'Hydraulic cylinder repair and resealing',
        'Hydraulic pump and motor rebuilds',
        'Control valve servicing and calibration',
        'Pneumatic cylinder and valve repair',
        'System flushing and oil analysis',
        'Hose and fitting replacement',
        'Pressure testing and leak detection',
        'System performance documentation'
      ]),
      processSteps: JSON.stringify([
        'System Inspection',
        'Fault Diagnosis',
        'Disassembly',
        'Component Repair/Replacement',
        'Reassembly',
        'System Flushing',
        'Pressure Testing',
        'Performance Validation'
      ]),
      equipment: JSON.stringify([
        'Hydraulic test benches (up to 700 bar)',
        'Pneumatic test equipment',
        'Oil sampling and analysis kits',
        'Cylinder honing equipment',
        'Torque tools and calibrated gauges',
        'Filter carts and flushing units',
        'Leak detection equipment'
      ]),
      industriesServed: JSON.stringify(['Manufacturing', 'Construction', 'Industrial Maintenance']),
      faq: JSON.stringify([
        { question: 'How do I know if my hydraulic system needs overhauling?', a: 'Signs include slow operation, pressure drops, oil leakage, unusual noise, and overheating. We offer diagnostic assessments to determine the required scope.' },
        { question: 'Do you provide on-site overhauling?', a: 'Yes. Our mobile service teams can perform most overhauling work at your facility to minimize equipment downtime.' },
        { question: 'What is the typical turnaround time?', a: 'Cylinder resealing: 1-3 days. Complete system overhaul: 3-10 days depending on system complexity.' }
      ]),
    },
    {
      title: 'Industrial Generator Spare Parts',
      slug: 'generator-spare-parts',
      description: 'Genuine and OEM-equivalent spare parts for industrial generators including engines, alternators, and control systems.',
      content: 'MECELFAB supplies genuine and OEM-equivalent spare parts for industrial diesel and gas generators. We stock critical components for major generator brands and provide technical guidance for part selection and compatibility.',
      scopeOfWork: JSON.stringify([
        'Engine spare parts (pistons, rings, gaskets, filters)',
        'Alternator and AVR components',
        'Control panel and instrumentation parts',
        'Fuel system components',
        'Cooling system parts',
        'Exhaust system components',
        'Battery and starting system parts',
        'Genuine oil and coolant supplies'
      ]),
      processSteps: JSON.stringify([
        'Requirement Identification',
        'Part Number Verification',
        'Availability Check',
        'Quotation',
        'Order Processing',
        'Quality Verification',
        'Delivery',
        'Installation Support'
      ]),
      equipment: JSON.stringify([]),
      industriesServed: JSON.stringify(['Power & Energy', 'Manufacturing', 'Construction']),
      faq: JSON.stringify([
        { question: 'Which generator brands do you support?', a: 'We supply parts for Cummins, Perkins, Caterpillar, Mahindra Powerol, Kirloskar, and other major industrial generator brands.' },
        { question: 'Are the parts genuine or equivalent?', a: 'We stock both genuine OEM parts and certified OEM-equivalent components. All parts come with quality assurance.' },
        { question: 'Can you source parts not in stock?', a: 'Yes. We have established supply chains for urgent and non-standard part requirements across India.' }
      ]),
    },
    {
      title: 'Annual Maintenance Contract (AMC)',
      slug: 'amc',
      description: 'Comprehensive annual maintenance services for industrial equipment, generators, compressors, and hydraulic systems.',
      content: 'MECELFAB offers structured Annual Maintenance Contracts covering preventive maintenance, breakdown support, and scheduled servicing for industrial equipment. Our AMC programs are designed to maximize equipment uptime and extend service life.',
      scopeOfWork: JSON.stringify([
        'Scheduled preventive maintenance visits',
        'Breakdown and emergency repair support',
        'Oil and filter replacement',
        'Belt and hose inspection/replacement',
        'Electrical system inspection',
        'Performance testing and reporting',
        'Spare parts management',
        'Detailed service reports per visit'
      ]),
      processSteps: JSON.stringify([
        'Equipment Assessment',
        'AMC Scope Definition',
        'Contract Agreement',
        'Maintenance Schedule',
        'Scheduled Visits',
        'Breakdown Response',
        'Reporting',
        'Annual Review'
      ]),
      equipment: JSON.stringify([]),
      industriesServed: JSON.stringify(['Manufacturing', 'Power & Energy', 'Industrial Maintenance', 'Commercial']),
      faq: JSON.stringify([
        { question: 'What is included in an AMC?', a: 'Standard AMCs include scheduled preventive maintenance visits, breakdown support, oil/filter changes, and performance testing. Specific scope is defined per contract.' },
        { question: 'How many visits are included?', a: 'Typically 4-12 visits per year depending on the contract tier and equipment type.' },
        { question: 'What is the response time for breakdowns?', a: 'AMC customers receive priority breakdown support with response times defined in the contract (typically 24-48 hours).' }
      ]),
    },
    {
      title: 'Industrial Generator Rental',
      slug: 'generator-rental',
      description: 'Reliable industrial generators for rent with installation, fuel management, and maintenance support.',
      content: 'MECELFAB provides industrial generator rental services covering temporary power requirements for construction sites, events, plant shutdowns, and emergency backup. Our fleet includes generators from 20 kVA to 500 kVA with full installation and support.',
      scopeOfWork: JSON.stringify([
        'Generator sizing and selection',
        'Delivery and installation',
        'Fuel supply and management',
        'Load banking and commissioning',
        '24/7 monitoring and support',
        'Maintenance during rental period',
        'Fuel consumption reporting',
        'Pickup and de-installation'
      ]),
      processSteps: JSON.stringify([
        'Power Requirement Assessment',
        'Generator Selection',
        'Site Preparation',
        'Delivery & Installation',
        'Commissioning',
        'Operation & Monitoring',
        'Maintenance',
        'Pickup & De-installation'
      ]),
      equipment: JSON.stringify([
        'Diesel generators: 20 kVA – 500 kVA',
        'Silent and super-silent canopy options',
        'Synchronized parallel operation capability',
        'Automatic transfer switches (ATS)',
        'Fuel storage tanks',
        'Load banks for testing'
      ]),
      industriesServed: JSON.stringify(['Construction', 'Manufacturing', 'Events', 'Commercial', 'Power & Energy']),
      faq: JSON.stringify([
        { question: 'What generator capacities are available for rent?', a: 'Our rental fleet includes generators from 20 kVA to 500 kVA with both open and silent canopy options.' },
        { question: 'Is fuel included in the rental?', a: 'Fuel can be included as part of a comprehensive rental package or supplied separately. We provide consumption reporting.' },
        { question: 'Do you handle installation?', a: 'Yes. Our team handles delivery, installation, commissioning, and fuel setup as part of the rental service.' }
      ]),
    },
    {
      title: 'Air Compressor Rental',
      slug: 'air-compressor-rental',
      description: 'High-capacity industrial air compressors for rent with installation and maintenance support.',
      content: 'MECELFAB provides industrial air compressor rental services for construction, manufacturing, and process applications. Our fleet includes rotary screw and reciprocating compressors with associated air treatment equipment.',
      scopeOfWork: JSON.stringify([
        'Compressor sizing and selection',
        'Delivery and installation',
        'Air treatment (dryers, filters)',
        'Piping and distribution setup',
        'Maintenance during rental period',
        'Performance monitoring',
        'Oil and filter changes',
        'Pickup and de-installation'
      ]),
      processSteps: JSON.stringify([
        'Air Demand Assessment',
        'Compressor Selection',
        'Site Preparation',
        'Delivery & Installation',
        'Commissioning',
        'Operation & Monitoring',
        'Maintenance',
        'Pickup & De-installation'
      ]),
      equipment: JSON.stringify([
        'Rotary screw compressors: 50 CFM – 1000 CFM',
        'Reciprocating compressors: 25 CFM – 200 CFM',
        'Refrigerated air dryers',
        'Desiccant air dryers',
        'Inline filtration systems',
        'Air receiver tanks'
      ]),
      industriesServed: JSON.stringify(['Construction', 'Manufacturing', 'Automotive', 'Industrial Maintenance']),
      faq: JSON.stringify([
        { question: 'What compressor sizes are available?', a: 'Our rental fleet ranges from 50 CFM to 1000 CFM rotary screw compressors and 25 CFM to 200 CFM reciprocating units.' },
        { question: 'Do you provide air treatment equipment?', a: 'Yes. We supply refrigerated and desiccant dryers, filtration systems, and air receivers as part of the rental package.' },
        { question: 'Is maintenance included?', a: 'Yes. Routine maintenance including oil and filter changes is included in the rental agreement.' }
      ]),
    },
    {
      title: 'Turbocharger Services',
      slug: 'turbocharger-services',
      description: 'Repair, maintenance, and overhaul of industrial turbochargers for diesel engines and gas turbines.',
      content: 'MECELFAB provides specialized turbocharger services including rebuild, repair, and maintenance for industrial diesel engines and gas turbines. Our turbocharger technicians handle cartridge replacement, shaft balancing, and complete unit overhauls.',
      scopeOfWork: JSON.stringify([
        'Turbocharger inspection and diagnostics',
        'Cartridge replacement and rebuild',
        'Shaft and bearing inspection',
        'Compressor and turbine wheel inspection',
        'V-band and clamp assembly',
        'Actuator testing and calibration',
        'Oil and coolant line inspection',
        'Performance testing'
      ]),
      processSteps: JSON.stringify([
        'Performance Assessment',
        'Removal & Inspection',
        'Disassembly',
        'Component Inspection',
        'Repair/Replacement',
        'Reassembly',
        'Balancing & Testing',
        'Reinstallation'
      ]),
      equipment: JSON.stringify([
        'Turbocharger balancing machine',
        'Vibration analysis equipment',
        'Compressor flow testing rig',
        'Oil feed pressure test equipment',
        'Specialized turbocharger tools',
        'Shaft runout measurement tools'
      ]),
      industriesServed: JSON.stringify(['Power & Energy', 'Marine', 'Oil & Gas', 'Manufacturing']),
      faq: JSON.stringify([
        { question: 'Which turbocharger brands do you service?', a: 'We service major brands including Garrett, BorgWarner, IHI, Mitsubishi, Holset, and ABB turbochargers.' },
        { question: 'How do I know if my turbocharger needs rebuild?', a: 'Signs include oil consumption, smoke, reduced power, unusual noise, and boost pressure loss. We offer diagnostic assessments.' },
        { question: 'Can you rebuild turbochargers on-site?', a: 'Yes. Our mobile service team can perform turbocharger rebuilds at your facility for critical equipment.' }
      ]),
    }
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
