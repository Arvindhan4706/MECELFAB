import { db } from './db';

export const DEFAULT_COMPANY_PROFILE = {
  legalName: 'MECELFAB INDUSTRIAL SOLUTIONS PRIVATE LIMITED',
  shortName: 'MECELFAB',
  tagline: 'Engineering reliable solutions for industrial growth.',
  description: 'Premier industrial mechanical services, heavy structural fabrication, equipment erection, power solutions, and equipment rental across India.',
  email: 'mecelfab@gmail.com',
  billingEmail: 'mecelfab@gmail.com',
  phone: '', // Left empty until official number is supplied
  address: '', // Left empty until registered office / plant address is supplied
  workingHours: 'Mon - Sat: 9:00 AM - 6:00 PM IST',
  gstin: '', // Official GSTIN
  pan: '', // Official PAN
  cin: '', // Official CIN
  bankName: '', // Official Bank Name
  bankAccount: '', // Official Bank Account
  bankIfsc: '', // Official IFSC Code
  bankBeneficiary: 'MECELFAB INDUSTRIAL SOLUTIONS PRIVATE LIMITED',
  jurisdiction: 'Competent Courts in India',
  linkedin: '',
  twitter: '',
  websiteUrl: 'https://mecelfabpvtltd.com',
  country: 'IN'
};

// Known synthetic/placeholder values to filter out from legacy DB/CMS entries
const KNOWN_SYNTHETIC_STRINGS = [
  '123 industrial area',
  'mumbai, maharashtra 400001',
  '98765 43210',
  '9876543210',
  '90000 00000',
  '27aabcm1234f1z5',
  'aabcm1234f',
  '38810293849102',
  'sbin0001234',
  'peenya industrial area, bengaluru+(mecelfab industrial solutions llp)'
];

function isSynthetic(val) {
  if (!val || typeof val !== 'string') return false;
  const lower = val.toLowerCase().trim();
  return KNOWN_SYNTHETIC_STRINGS.some(syn => lower.includes(syn));
}

function sanitizeValue(val, fallback = '') {
  if (!val || typeof val !== 'string') return fallback;
  if (isSynthetic(val)) return fallback;
  return val.trim();
}

/**
 * Retrieves the unified authoritative MECELFAB Company Profile.
 * Merges database settings (CONTENT_CONTACT & individual setting keys) over the default profile.
 * Strips any residual synthetic/placeholder data and returns clean values.
 */
export async function getCompanyProfile() {
  try {
    const rawSettings = await db.setting.findMany({
      where: {
        OR: [
          { key: 'CONTENT_CONTACT' },
          { key: { in: [
            'companyName',
            'contactEmail',
            'billingEmail',
            'contactPhone',
            'location',
            'contactAddress',
            'workingHours',
            'company_gstin',
            'company_pan',
            'company_cin',
            'bank_name',
            'bank_account',
            'bank_ifsc',
            'bank_beneficiary',
            'jurisdiction',
            'socialLinkedIn',
            'socialTwitter'
          ] } }
        ]
      }
    });

    const settingsMap = rawSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    let contentContact = {};
    if (settingsMap.CONTENT_CONTACT) {
      try {
        contentContact = JSON.parse(settingsMap.CONTENT_CONTACT);
      } catch {
        contentContact = {};
      }
    }

    const legalName = sanitizeValue(
      settingsMap.companyName || contentContact.companyName,
      DEFAULT_COMPANY_PROFILE.legalName
    );

    const email = sanitizeValue(
      settingsMap.contactEmail || contentContact.email,
      DEFAULT_COMPANY_PROFILE.email
    );

    const billingEmail = sanitizeValue(
      settingsMap.billingEmail || contentContact.billingEmail,
      DEFAULT_COMPANY_PROFILE.billingEmail
    );

    const phone = sanitizeValue(
      settingsMap.contactPhone || contentContact.phone,
      DEFAULT_COMPANY_PROFILE.phone
    );

    const address = sanitizeValue(
      settingsMap.contactAddress || settingsMap.location || contentContact.address,
      DEFAULT_COMPANY_PROFILE.address
    );

    const workingHours = sanitizeValue(
      settingsMap.workingHours || contentContact.workingHours,
      DEFAULT_COMPANY_PROFILE.workingHours
    );

    const gstin = sanitizeValue(
      settingsMap.company_gstin || contentContact.gstin,
      DEFAULT_COMPANY_PROFILE.gstin
    );

    const pan = sanitizeValue(
      settingsMap.company_pan || contentContact.pan,
      DEFAULT_COMPANY_PROFILE.pan
    );

    const cin = sanitizeValue(
      settingsMap.company_cin || contentContact.cin,
      DEFAULT_COMPANY_PROFILE.cin
    );

    const bankName = sanitizeValue(
      settingsMap.bank_name || contentContact.bankName,
      DEFAULT_COMPANY_PROFILE.bankName
    );

    const bankAccount = sanitizeValue(
      settingsMap.bank_account || contentContact.bankAccount,
      DEFAULT_COMPANY_PROFILE.bankAccount
    );

    const bankIfsc = sanitizeValue(
      settingsMap.bank_ifsc || contentContact.bankIfsc,
      DEFAULT_COMPANY_PROFILE.bankIfsc
    );

    const bankBeneficiary = sanitizeValue(
      settingsMap.bank_beneficiary || contentContact.bankBeneficiary,
      DEFAULT_COMPANY_PROFILE.bankBeneficiary
    );

    const jurisdiction = sanitizeValue(
      settingsMap.jurisdiction || contentContact.jurisdiction,
      DEFAULT_COMPANY_PROFILE.jurisdiction
    );

    const linkedin = sanitizeValue(
      settingsMap.socialLinkedIn || contentContact.linkedin,
      DEFAULT_COMPANY_PROFILE.linkedin
    );

    const twitter = sanitizeValue(
      settingsMap.socialTwitter || contentContact.twitter,
      DEFAULT_COMPANY_PROFILE.twitter
    );

    return {
      legalName,
      shortName: DEFAULT_COMPANY_PROFILE.shortName,
      tagline: DEFAULT_COMPANY_PROFILE.tagline,
      description: DEFAULT_COMPANY_PROFILE.description,
      email,
      billingEmail,
      phone,
      address,
      workingHours,
      gstin,
      pan,
      cin,
      bankName,
      bankAccount,
      bankIfsc,
      bankBeneficiary,
      jurisdiction,
      linkedin,
      twitter,
      websiteUrl: DEFAULT_COMPANY_PROFILE.websiteUrl,
      country: DEFAULT_COMPANY_PROFILE.country
    };
  } catch (err) {
    console.error('Error fetching company profile:', err);
    return { ...DEFAULT_COMPANY_PROFILE };
  }
}
