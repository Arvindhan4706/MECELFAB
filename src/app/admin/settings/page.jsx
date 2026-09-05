import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Save, Building, CreditCard, ShieldAlert, Share2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { getCompanyProfile } from '@/lib/companyConfig';

export const metadata = {
  title: 'Global Company Settings | Admin',
};

async function updateSettings(formData) {
  'use server';
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  const keys = Array.from(formData.keys()).filter(k => !k.startsWith('$ACTION'));
  
  const updatedSettings = {};
  for (const key of keys) {
    const rawVal = formData.get(key);
    const value = typeof rawVal === 'string' ? rawVal.trim() : '';
    updatedSettings[key] = value;
    await db.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value, type: 'STRING' }
    });
  }

  // Synchronize CONTENT_CONTACT JSON with updated settings
  const existingContentContact = await db.setting.findUnique({
    where: { key: 'CONTENT_CONTACT' }
  });
  let parsedContact = {};
  if (existingContentContact?.value) {
    try {
      parsedContact = JSON.parse(existingContentContact.value);
    } catch {
      parsedContact = {};
    }
  }

  const synchronizedContact = {
    ...parsedContact,
    companyName: updatedSettings.companyName ?? parsedContact.companyName,
    email: updatedSettings.contactEmail ?? parsedContact.email,
    billingEmail: updatedSettings.billingEmail ?? parsedContact.billingEmail,
    phone: updatedSettings.contactPhone ?? parsedContact.phone,
    address: updatedSettings.contactAddress ?? parsedContact.address,
    workingHours: updatedSettings.workingHours ?? parsedContact.workingHours,
    gstin: updatedSettings.company_gstin ?? parsedContact.gstin,
    pan: updatedSettings.company_pan ?? parsedContact.pan,
    cin: updatedSettings.company_cin ?? parsedContact.cin,
    bankName: updatedSettings.bank_name ?? parsedContact.bankName,
    bankAccount: updatedSettings.bank_account ?? parsedContact.bankAccount,
    bankIfsc: updatedSettings.bank_ifsc ?? parsedContact.bankIfsc,
    bankBeneficiary: updatedSettings.bank_beneficiary ?? parsedContact.bankBeneficiary,
    jurisdiction: updatedSettings.jurisdiction ?? parsedContact.jurisdiction,
    linkedin: updatedSettings.socialLinkedIn ?? parsedContact.linkedin,
    twitter: updatedSettings.socialTwitter ?? parsedContact.twitter
  };

  await db.setting.upsert({
    where: { key: 'CONTENT_CONTACT' },
    update: { value: JSON.stringify(synchronizedContact) },
    create: { key: 'CONTENT_CONTACT', value: JSON.stringify(synchronizedContact), type: 'JSON' }
  });

  // Revalidate relevant pages across the app
  revalidatePath('/admin/settings');
  revalidatePath('/admin/content');
  revalidatePath('/admin/quotations/[id]/print', 'page');
  revalidatePath('/admin/billing/[id]/print', 'page');
  revalidatePath('/');
  revalidatePath('/contact');
  revalidatePath('/about');
}

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
    redirect('/admin/dashboard');
  }

  const company = await getCompanyProfile();

  return (
    <div className="max-w-4xl pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-admin-heading">Company Information & Settings</h1>
        <p className="text-admin-muted text-sm mt-1">
          Authoritative single source of truth for corporate branding, tax registrations, banking details, and contact coordinates.
        </p>
      </div>

      <form action={updateSettings} className="space-y-8">
        {/* Company Identity */}
        <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-admin-border pb-3">
            <Building size={18} className="text-blue-500" />
            <h2 className="text-base font-bold text-admin-heading">Corporate Profile & Operations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                Official Registered Legal Name
              </label>
              <input
                type="text"
                name="companyName"
                defaultValue={company.legalName}
                required
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                Primary Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                defaultValue={company.email}
                required
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                Billing & Accounts Email
              </label>
              <input
                type="email"
                name="billingEmail"
                defaultValue={company.billingEmail}
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                Official Phone Number
              </label>
              <input
                type="text"
                name="contactPhone"
                defaultValue={company.phone}
                placeholder="Leave blank if not yet provided"
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                name="workingHours"
                defaultValue={company.workingHours}
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                Registered Office / Plant Address
              </label>
              <textarea
                name="contactAddress"
                rows={2}
                defaultValue={company.address}
                placeholder="Leave blank if official registered address has not been provided"
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tax & Identifiers */}
        <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-admin-border pb-3">
            <ShieldAlert size={18} className="text-blue-500" />
            <h2 className="text-base font-bold text-admin-heading">Tax & Corporate Identifiers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                GSTIN (Goods and Services Tax ID)
              </label>
              <input
                type="text"
                name="company_gstin"
                defaultValue={company.gstin}
                placeholder="Leave blank if pending official filing"
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                PAN (Permanent Account Number)
              </label>
              <input
                type="text"
                name="company_pan"
                defaultValue={company.pan}
                placeholder="Leave blank if not provided"
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                CIN (Corporate Identification Number)
              </label>
              <input
                type="text"
                name="company_cin"
                defaultValue={company.cin}
                placeholder="Leave blank if not provided"
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                Legal Jurisdiction
              </label>
              <input
                type="text"
                name="jurisdiction"
                defaultValue={company.jurisdiction}
                placeholder="e.g. Competent Courts in India"
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Banking Details */}
        <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-admin-border pb-3">
            <CreditCard size={18} className="text-blue-500" />
            <h2 className="text-base font-bold text-admin-heading">Official Bank Remittance Coordinates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                Beneficiary Name
              </label>
              <input
                type="text"
                name="bank_beneficiary"
                defaultValue={company.bankBeneficiary}
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bank_name"
                defaultValue={company.bankName}
                placeholder="Leave blank if not yet configured"
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                Account Number
              </label>
              <input
                type="text"
                name="bank_account"
                defaultValue={company.bankAccount}
                placeholder="Leave blank if not yet configured"
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                name="bank_ifsc"
                defaultValue={company.bankIfsc}
                placeholder="Leave blank if not yet configured"
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-admin-border pb-3">
            <Share2 size={18} className="text-blue-500" />
            <h2 className="text-base font-bold text-admin-heading">Social Media Links</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                name="socialLinkedIn"
                defaultValue={company.linkedin}
                placeholder="https://linkedin.com/company/..."
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-admin-muted mb-1">
                Twitter / X Profile URL
              </label>
              <input
                type="url"
                name="socialTwitter"
                defaultValue={company.twitter}
                placeholder="https://x.com/..."
                className="w-full border border-admin-border rounded px-3 py-2 text-sm bg-admin-surface text-admin-heading focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md flex items-center gap-2 font-medium text-sm transition-colors shadow-sm"
          >
            <Save size={16} />
            Save Company Information
          </button>
        </div>
      </form>
    </div>
  );
}
