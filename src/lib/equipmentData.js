/**
 * Authoritative MECELFAB Equipment & Capabilities Dataset
 * Strictly reflects verified equipment categories, capacity ranges, and services
 * provided by MECELFAB Industrial Solutions Private Limited.
 */

export const EQUIPMENT_CATEGORIES = [
  { id: 'all', label: 'All Equipment' },
  { id: 'power-generation', label: 'Power Generation' },
  { id: 'compressed-air', label: 'Compressed Air' },
  { id: 'hydraulics-pneumatics', label: 'Hydraulics & Pneumatics' },
  { id: 'turbochargers', label: 'Turbochargers' },
  { id: 'machinery-rigging', label: 'Machinery & Rigging' },
];

export const EQUIPMENT_ITEMS = [
  // ── Power Generation ──
  {
    slug: 'diesel-generators',
    title: 'Diesel Generators',
    category: 'power-generation',
    categoryLabel: 'Power Generation',
    capacityRange: '20 kVA – 2000 kVA',
    supportedBrands: 'Cummins, Kirloskar, Ashok Leyland, Caterpillar, Perkins',
    shortDescription: 'Heavy-duty industrial diesel generators deployed for base load, standby emergency power, and heavy site operations.',
    overview: 'MECELFAB provides industrial diesel generator solutions spanning installation, routine servicing, emergency overhaul, and rental deployment across manufacturing facilities, power stations, infrastructure sites, and plant shutdowns.',
    applications: [
      'Industrial manufacturing continuous standby power',
      'Construction and infrastructure project site electrification',
      'Plant shutdown and planned maintenance backup',
      'Emergency power restoration for critical utilities',
    ],
    technicalHighlights: [
      { label: 'Power Range', value: '20 kVA to 2000 kVA' },
      { label: 'Voltage & Frequency', value: '415V / 230V, 50 Hz, 3-Phase' },
      { label: 'Fuel Types', value: 'High Speed Diesel (HSD)' },
      { label: 'Configuration', value: 'Open Skid / Acoustic Enclosure' },
      { label: 'Control Features', value: 'Auto Mains Failure (AMF) & Synchronizing Panels' },
    ],
    relatedServiceSlugs: ['generator-rental', 'generator-spare-parts', 'amc'],
    relatedIndustrySlugs: ['power-energy', 'industrial-manufacturing', 'commercial-power'],
  },
  {
    slug: 'silent-generators',
    title: 'Silent Acoustic Generators',
    category: 'power-generation',
    categoryLabel: 'Power Generation',
    capacityRange: '20 kVA – 500 kVA',
    supportedBrands: 'Cummins, Mahindra Powerol, Honda, Kirloskar',
    shortDescription: 'Sound-attenuated weatherproof canopy generators engineered for noise-restricted commercial, hospital, and urban work environments.',
      overview: 'Engineered with CPCB-compliant acoustic enclosures for quiet operation, MECELFAB silent generators provide reliable power without noise disruption in urban facilities, healthcare campuses, and commercial complexes.',
    applications: [
      'Commercial buildings and corporate campuses',
      'Hospital and healthcare critical backup',
      'Urban construction and municipal projects',
      'Exhibition and corporate event temporary power',
    ],
    technicalHighlights: [
      { label: 'Noise Attenuation', value: '< 75 dBA at 1 meter (CPCB compliant)' },
      { label: 'Capacity Range', value: '20 kVA to 500 kVA' },
      { label: 'Enclosure', value: 'Weatherproof powder-coated acoustic steel canopy' },
      { label: 'Safety', value: 'Emergency stop, high temperature & low oil cutoff' },
    ],
    relatedServiceSlugs: ['generator-rental', 'generator-spare-parts', 'amc'],
    relatedIndustrySlugs: ['commercial-power', 'power-energy'],
  },
  {
    slug: 'synchronized-generators',
    title: 'Synchronized Parallel Power Sets',
    category: 'power-generation',
    categoryLabel: 'Power Generation',
    capacityRange: '250 kVA – 1500 kVA',
    supportedBrands: 'Cummins, Caterpillar, DEIF, Woodward Controls',
    shortDescription: 'Multi-generator synchronized setups engineered for high-demand industrial loads, redundancy, and auto-load sharing.',
    overview: 'For operations where single-generator failure is unacceptable or load fluctuates significantly, MECELFAB configures, erects, and manages parallel synchronizing generator banks with intelligent load dispatch.',
    applications: [
      'Continuous-process chemical and manufacturing plants',
      'Data centers and continuous utility hubs',
      'Peak-lopping and grid failure contingency',
    ],
    technicalHighlights: [
      { label: 'Total Capacity', value: 'Up to 5000 kVA combined' },
      { label: 'Switching', value: 'Automatic Synchronization & Load Sharing' },
      { label: 'Busbar Integration', value: 'Custom engineered distribution panels' },
    ],
    relatedServiceSlugs: ['generator-rental', 'industrial-erection', 'amc'],
    relatedIndustrySlugs: ['power-energy', 'industrial-manufacturing'],
  },

  // ── Compressed Air Systems ──
  {
    slug: 'rotary-screw-compressors',
    title: 'Rotary Screw Air Compressors',
    category: 'compressed-air',
    categoryLabel: 'Compressed Air',
    capacityRange: '50 CFM – 1500 CFM',
    supportedBrands: 'Atlas Copco, Ingersoll Rand, ELGi, Kaeser',
    shortDescription: 'Continuous-duty oil-injected and oil-free rotary screw compressors for uninterrupted plant pneumatic power.',
    overview: 'Rotary screw air compressors delivered and serviced by MECELFAB supply continuous pneumatic pressure to automated machinery, packaging lines, and assembly tools with high energy efficiency.',
    applications: [
      'Pneumatic machine operation in automotive & fabrication plants',
      'Industrial blast cleaning and paint booth supply',
      'Process automation and material conveying systems',
    ],
    technicalHighlights: [
      { label: 'Flow Rate', value: '50 CFM to 1500 CFM' },
      { label: 'Operating Pressure', value: '7 bar to 13 bar (100–190 PSI)' },
      { label: 'Drive Types', value: 'Fixed Speed & Variable Frequency Drive (VFD)' },
      { label: 'Cooling', value: 'Air-cooled and Water-cooled options' },
    ],
    relatedServiceSlugs: ['air-compressor-rental', 'hydraulic-pneumatic-overhauling', 'amc'],
    relatedIndustrySlugs: ['industrial-manufacturing', 'industrial-maintenance'],
  },
  {
    slug: 'reciprocating-compressors',
    title: 'Reciprocating Piston Compressors',
    category: 'compressed-air',
    categoryLabel: 'Compressed Air',
    capacityRange: '10 CFM – 200 CFM',
    supportedBrands: 'ELGi, Fini, Chicago Pneumatic',
    shortDescription: 'Rugged reciprocating piston compressors for high-pressure intermittent and heavy workshop duties.',
    overview: 'MECELFAB supplies, overhauls, and services reciprocating air compressors for applications requiring high pressures, intermittent air demands, and rugged workshop dependability.',
    applications: [
      'Fabrication workshop tool air',
      'Tire inflating and test pressure benches',
      'Small batch manufacturing and localized processes',
    ],
    technicalHighlights: [
      { label: 'Flow Capacity', value: '10 CFM to 200 CFM' },
      { label: 'Pressure Range', value: 'Up to 30 bar' },
      { label: 'Configuration', value: 'Single & Multi-Stage Cast Iron Pumps' },
    ],
    relatedServiceSlugs: ['air-compressor-rental', 'hydraulic-pneumatic-overhauling', 'amc'],
    relatedIndustrySlugs: ['industrial-manufacturing', 'industrial-maintenance'],
  },
  {
    slug: 'portable-air-compressors',
    title: 'Portable Diesel Air Compressors',
    category: 'compressed-air',
    categoryLabel: 'Compressed Air',
    capacityRange: '185 CFM – 900 CFM',
    supportedBrands: 'Atlas Copco, Doosan, Sullair, ELGi',
    shortDescription: 'Towable diesel engine-driven compressors built for remote construction, blasting, and trenchless pipe laying.',
    overview: 'Mounted on heavy-duty towable chassis, MECELFAB portable diesel compressors provide independent compressed air in remote field sites without relying on electric grid availability.',
    applications: [
      'Sandblasting and surface preparation for structural steel',
      'Pneumatic drilling and civil excavation',
      'Pipeline pressure testing and pigging',
    ],
    technicalHighlights: [
      { label: 'Capacity', value: '185 CFM to 900 CFM' },
      { label: 'Operating Pressure', value: '7 bar to 14 bar' },
      { label: 'Mobility', value: 'Towable trailer chassis with highway running gear' },
    ],
    relatedServiceSlugs: ['air-compressor-rental', 'amc'],
    relatedIndustrySlugs: ['industrial-manufacturing', 'commercial-power'],
  },

  // ── Hydraulics & Pneumatics ──
  {
    slug: 'hydraulic-power-packs',
    title: 'Hydraulic Power Packs (HPU)',
    category: 'hydraulics-pneumatics',
    categoryLabel: 'Hydraulics & Pneumatics',
    capacityRange: '5 HP – 200 HP / Up to 350 bar',
    supportedBrands: 'Rexroth, Yuken, Vickers, Parker, HAWE',
    shortDescription: 'Custom-engineered and standard hydraulic power units delivering precise fluid power for presses, shears, and lifting gear.',
    overview: 'MECELFAB fabricates, overhauls, tests, and commissions industrial Hydraulic Power Units (HPUs). Complete overhaul includes pump re-machining, valve block re-sealing, reservoir flushing, and high-pressure dynamic load validation.',
    applications: [
      'Heavy hydraulic presses and shearing machinery',
      'Industrial material lifters and tilting platforms',
      'Foundry molding and rolling mill actuators',
    ],
    technicalHighlights: [
      { label: 'Motor Power', value: '5 HP to 200 HP' },
      { label: 'Operating Pressure', value: 'Up to 350 bar (5000 PSI)' },
      { label: 'Pump Types', value: 'Variable Displacement Piston, Vane & Gear' },
      { label: 'Filtration', value: 'Dual-stage return & pressure line filters with indicator' },
    ],
    relatedServiceSlugs: ['hydraulic-pneumatic-overhauling', 'amc', 'industrial-fabrication'],
    relatedIndustrySlugs: ['industrial-manufacturing', 'industrial-maintenance'],
  },
  {
    slug: 'hydraulic-cylinders',
    title: 'Industrial Hydraulic Cylinders',
    category: 'hydraulics-pneumatics',
    categoryLabel: 'Hydraulics & Pneumatics',
    capacityRange: 'Bore 40mm – 300mm / Stroke up to 3000mm',
    supportedBrands: 'Custom Fabricated & OEM Replacements',
    shortDescription: 'Tie-rod, welded, and mill-type hydraulic cylinders built and reconditioned for extreme load actuation.',
    overview: 'From rod chrome-plating and barrel honing to precision seal kit replacement, MECELFAB provides full-cycle maintenance and manufacturing of heavy hydraulic cylinders conforming to OEM dimensional specifications.',
    applications: [
      'Press brakes, bending dies, and stamping presses',
      'EOT cranes, boom lifts, and tilting furnaces',
      'Heavy earthmoving and factory machinery',
    ],
    technicalHighlights: [
      { label: 'Bore Diameter', value: '40 mm to 300 mm' },
      { label: 'Stroke Length', value: 'Up to 3,000 mm' },
      { label: 'Testing Standard', value: 'Hydrostatic pressure test to 1.5x design pressure' },
      { label: 'Seals', value: 'High-temperature polyurethane, NBR & PTFE' },
    ],
    relatedServiceSlugs: ['hydraulic-pneumatic-overhauling', 'industrial-fabrication'],
    relatedIndustrySlugs: ['industrial-maintenance', 'industrial-manufacturing'],
  },
  {
    slug: 'pneumatic-actuators',
    title: 'Pneumatic Actuators & Valve Systems',
    category: 'hydraulics-pneumatics',
    categoryLabel: 'Hydraulics & Pneumatics',
    capacityRange: 'Standard ISO 6432 & ISO 15552',
    supportedBrands: 'Festo, SMC, Parker, Janatics',
    shortDescription: 'Pneumatic cylinders, rotary actuators, and directional solenoid manifold assemblies.',
    overview: 'MECELFAB inspects, overhauls, and optimizes pneumatic actuation circuits to reduce compressed air leaks, speed up cycle times, and prevent unpredicted production stops.',
    applications: [
      'Automated packaging lines and conveyor diverters',
      'Process control valve actuation in utility setups',
      'Jigs, clamping fixtures, and robotic pick-and-place',
    ],
    technicalHighlights: [
      { label: 'Operating Media', value: 'Filtered compressed air (lubricated/non-lubricated)' },
      { label: 'Operating Pressure', value: '1.5 bar to 10 bar' },
      { label: 'Standard Compliance', value: 'ISO 6431 / ISO 15552' },
    ],
    relatedServiceSlugs: ['hydraulic-pneumatic-overhauling', 'amc'],
    relatedIndustrySlugs: ['industrial-manufacturing', 'industrial-maintenance'],
  },

  // ── Turbochargers ──
  {
    slug: 'industrial-turbochargers',
    title: 'Industrial & Marine Turbochargers',
    category: 'turbochargers',
    categoryLabel: 'Turbochargers',
    capacityRange: 'Medium & High Speed Engines',
    supportedBrands: 'Holset, Garrett, BorgWarner, IHI, MAN, Napier',
    shortDescription: 'Dynamic balancing, cartridge rebuilds, and complete turbine overhauls for diesel generator sets and marine engines.',
    overview: 'Turbochargers operate at speeds up to 100,000+ RPM under extreme exhaust temperatures. MECELFAB performs precision balancing, journal bearing renewal, seal ring replacement, and non-destructive crack inspection.',
    applications: [
      'Heavy generator prime mover engines',
      'Marine propulsion and auxiliary power engines',
      'Heavy locomotives and off-highway equipment',
    ],
    technicalHighlights: [
      { label: 'Balancing Accuracy', value: 'Dynamic high-speed computerized balancing' },
      { label: 'Shaft Runout Tolerance', value: '< 0.01 mm precision' },
      { label: 'Inspection', value: 'Dye penetrant and magnetic crack detection' },
    ],
    relatedServiceSlugs: ['turbocharger-services', 'generator-spare-parts', 'amc'],
    relatedIndustrySlugs: ['power-energy', 'industrial-maintenance'],
  },
  {
    slug: 'generator-turbochargers',
    title: 'Generator Engine Turbocharger Cartridges',
    category: 'turbochargers',
    categoryLabel: 'Turbochargers',
    capacityRange: 'CHRA (Center Housing Rotating Assembly)',
    supportedBrands: 'Holset (HX/HE series), Garrett, Schwitzer',
    shortDescription: 'Pre-balanced factory CHRA cartridge replacements for rapid downtime reduction on industrial generators.',
    overview: 'When rapid turnaround is essential during unexpected engine downtime, MECELFAB provides and fits balanced replacement turbocharger cartridges, testing boost pressure to factory tolerances.',
    applications: [
      'Emergency diesel generator breakdown repair',
      'Planned engine top overhauls (TOH)',
      'Scheduled preventive turbo maintenance',
    ],
    technicalHighlights: [
      { label: 'Assembly', value: 'Pre-balanced rotating core with new bearings & seals' },
      { label: 'Warranty Coverage', value: 'Quality assured OEM-spec tolerance' },
    ],
    relatedServiceSlugs: ['turbocharger-services', 'generator-spare-parts'],
    relatedIndustrySlugs: ['power-energy', 'commercial-power'],
  },

  // ── Machinery & Rigging ──
  {
    slug: 'mobile-cranes-rigging',
    title: 'Mobile Cranes & Heavy Rigging Equipment',
    category: 'machinery-rigging',
    categoryLabel: 'Machinery & Rigging',
    capacityRange: '25T – 200T Lifting Capacity',
    supportedBrands: 'Certified Rigging Gear & Mobile Cranes',
    shortDescription: 'Telescopic mobile cranes, spreader beams, certified slings, and rigging hardware for heavy machine erection.',
    overview: 'MECELFAB deploys mobile cranes and certified rigging specialists for safe lifting and precision positioning of structural steel columns, generators, tanks, and heavy industrial machinery.',
    applications: [
      'Heavy factory machinery unloading and foundation lowering',
      'Structural steel truss and gantry crane erection',
      'Generator and chiller positioning on elevated plinths',
    ],
    technicalHighlights: [
      { label: 'Lifting Range', value: '25 Tons to 200 Tons' },
      { label: 'Testing Compliance', value: 'Third-party certified load test certificates' },
      { label: 'Safety Measures', value: 'Documented lift plans & certified rigging tackle' },
    ],
    relatedServiceSlugs: ['industrial-erection', 'industrial-fabrication'],
    relatedIndustrySlugs: ['industrial-manufacturing', 'power-energy'],
  },
  {
    slug: 'precision-alignment-jacking',
    title: 'Hydraulic Jacking & Precision Laser Alignment',
    category: 'machinery-rigging',
    categoryLabel: 'Machinery & Rigging',
    capacityRange: 'Multi-point jacking up to 500 Tons',
    supportedBrands: 'Enerpac, SKF, Easy-Laser',
    shortDescription: 'Synchronized low-clearance hydraulic jacks, laser shaft aligners, and dial gauges for sub-millimeter machinery installation.',
    overview: 'Proper leveling and alignment are critical to prevent premature bearing failure and excessive vibration. MECELFAB uses calibrated optical and laser alignment equipment for millimetric leveling.',
    applications: [
      'Turbine, alternator, and motor shaft alignment',
      'Precision machine tool foundation leveling',
      'Heavy press sliding and leveling adjustments',
    ],
    technicalHighlights: [
      { label: 'Alignment Precision', value: 'Within 0.02 mm tolerance' },
      { label: 'Jacking Systems', value: 'Synchronized multi-cylinder low-profile hydraulic jacks' },
      { label: 'Reporting', value: 'Pre and post-alignment digital verification certificate' },
    ],
    relatedServiceSlugs: ['industrial-erection', 'amc'],
    relatedIndustrySlugs: ['industrial-manufacturing', 'power-energy'],
  },
];

export function getAllEquipment() {
  return EQUIPMENT_ITEMS;
}

export function getEquipmentBySlug(slug) {
  if (!slug) return null;
  return EQUIPMENT_ITEMS.find((item) => item.slug === slug) || null;
}

export function getEquipmentByCategory(categoryId) {
  if (!categoryId || categoryId === 'all') return EQUIPMENT_ITEMS;
  return EQUIPMENT_ITEMS.filter((item) => item.category === categoryId);
}

export function getEquipmentByServiceSlug(serviceSlug) {
  if (!serviceSlug) return [];
  return EQUIPMENT_ITEMS.filter((item) => item.relatedServiceSlugs?.includes(serviceSlug));
}

export function getEquipmentByIndustrySlug(industrySlug) {
  if (!industrySlug) return [];
  return EQUIPMENT_ITEMS.filter((item) => item.relatedIndustrySlugs?.includes(industrySlug));
}
