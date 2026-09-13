import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import PrintButton from '@/components/admin/PrintButton';
import DownloadPDFButton from '@/components/admin/DownloadPDFButton';
import { getCompanyProfile } from '@/lib/companyConfig';
import { assertPermission } from '@/lib/permissions';

export const metadata = {
  title: 'Print Quotation | MECELFAB',
};

export default async function (props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  
  try {
    assertPermission(session.user.role, 'quotations:read');
  } catch {
    redirect('/admin/dashboard');
  }

  const quotation = await db.quotation.findUnique({
    where: { id: params.id },
    include: { items: true, user: true }
  });

  if (!quotation) notFound();

  const company = await getCompanyProfile();

  return (
    <div className="bg-admin-surface min-h-screen font-sans text-admin-heading print:bg-admin-surface">
      {/* Print Controls (Hidden on Print) */}
      <div className="bg-admin-elevated p-4 border-b border-admin-border flex justify-between items-center print:hidden">
        <p className="text-sm text-admin-muted font-medium">Print Preview for {quotation.quotationNumber}</p>
        <div className="flex items-center gap-3">
          <DownloadPDFButton quotationId={quotation.id} quotationNumber={quotation.quotationNumber} />
          <PrintButton />
        </div>
      </div>

      {/* A4 Document Container */}
      <div className="max-w-4xl mx-auto bg-admin-surface p-12 print:p-0 print:max-w-none print:w-full">
        
        {/* Header */}
        <header className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-admin-heading mb-1">{company.shortName}</h1>
            <p className="text-sm text-admin-muted font-medium uppercase tracking-widest">{company.legalName}</p>
            <div className="mt-4 text-xs text-admin-muted space-y-1">
              {company.address ? (
                <p className="whitespace-pre-wrap">{company.address}</p>
              ) : (
                <p className="italic text-admin-muted">No. 35 & 36, Jayam Nagar, Shanmugapuram, Surapattu, Chennai – 600 099</p>
              )}
              <p>Email: {company.email}</p>
              {company.phone ? (
                <p>Phone: {company.phone}</p>
              ) : (
                <p className="text-admin-muted">Phone: Contact via email</p>
              )}
              {company.gstin && <p>GSTIN: {company.gstin}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-200 uppercase tracking-widest mb-4">Quotation</h2>
            <div className="space-y-1">
              <p className="text-sm"><span className="font-semibold text-admin-muted inline-block w-24 text-right pr-2">Quote No:</span> <span className="font-bold text-admin-heading">{quotation.quotationNumber}</span> <span className="font-bold text-admin-muted">V{quotation.version}</span></p>
              <p className="text-sm"><span className="font-semibold text-admin-muted inline-block w-24 text-right pr-2">Date:</span> <span className="font-medium text-admin-heading">{new Date(quotation.createdAt).toLocaleDateString()}</span></p>
              <p className="text-sm"><span className="font-semibold text-admin-muted inline-block w-24 text-right pr-2">Valid Until:</span> <span className="font-medium text-admin-heading">{new Date(new Date(quotation.createdAt).getTime() + (quotation.validityDays * 24 * 60 * 60 * 1000)).toLocaleDateString()}</span></p>
            </div>
          </div>
        </header>

        {/* Client Info & Scope */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-admin-border pb-1">Prepared For</h3>
            <p className="text-base font-bold text-admin-heading">{quotation.customerName}</p>
            {quotation.companyName && <p className="text-sm text-admin-heading font-medium">{quotation.companyName}</p>}
            <div className="mt-2 text-sm text-admin-muted space-y-0.5">
              <p>{quotation.email}</p>
              {quotation.phone && <p>{quotation.phone}</p>}
              {quotation.address && <p className="whitespace-pre-wrap mt-1">{quotation.address}</p>}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-admin-border pb-1">Project Summary</h3>
            <p className="text-sm font-bold text-admin-heading mb-1">{quotation.service}</p>
            <p className="text-sm text-admin-muted whitespace-pre-wrap">{quotation.scopeOfWork}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-10 min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-admin-elevated border-y-2 border-gray-800 print:bg-admin-elevated">
                <th className="py-3 px-4 text-xs font-bold text-admin-text uppercase">Description</th>
                <th className="py-3 px-4 text-xs font-bold text-admin-text uppercase text-center w-16">Qty</th>
                <th className="py-3 px-4 text-xs font-bold text-admin-text uppercase text-right w-32">Unit Price</th>
                <th className="py-3 px-4 text-xs font-bold text-admin-text uppercase text-right w-32">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border/50">
              {quotation.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 px-4 text-sm text-admin-heading">{item.description}</td>
                  <td className="py-4 px-4 text-sm text-admin-heading text-center">{item.quantity}</td>
                  <td className="py-4 px-4 text-sm text-admin-heading text-right">₹ {item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-4 px-4 text-sm font-bold text-admin-heading text-right">₹ {item.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end mb-12 page-break-inside-avoid">
          <div className="w-80 space-y-3">
            <div className="flex justify-between text-sm text-admin-text px-4">
              <span className="font-medium">Subtotal</span>
              <span>₹ {quotation.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {quotation.discount > 0 && (
              <div className="flex justify-between text-sm text-admin-text px-4">
                <span className="font-medium">Discount</span>
                <span>- ₹ {quotation.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-admin-text px-4">
              <span className="font-medium">Tax ({quotation.taxRate}%)</span>
              <span>₹ {quotation.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-admin-heading border-t-2 border-gray-800 pt-3 px-4 mt-2 bg-admin-elevated print:bg-transparent">
              <span>Grand Total</span>
              <span>₹ {quotation.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Footer / Terms */}
        <div className="mt-auto border-t border-admin-border pt-8 page-break-inside-avoid">
          {quotation.termsConditions && (
            <div className="mb-8">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Terms & Conditions</h4>
              <p className="text-xs text-admin-muted whitespace-pre-wrap leading-relaxed">{quotation.termsConditions}</p>
            </div>
          )}
          
          <div className="flex justify-between items-end mt-16 pt-8">
            <div className="text-center w-48">
              <div className="border-b border-admin-border pb-2 mb-2 h-8"></div>
              <p className="text-xs font-medium text-admin-heading">Accepted by Client</p>
              <p className="text-[10px] text-admin-muted mt-1">Signature & Date</p>
            </div>
            <div className="text-center w-48">
              <div className="border-b border-admin-border pb-2 mb-2 h-8 flex items-end justify-center">
                <span className="font-signature text-xl text-admin-heading">{quotation.user.name}</span>
              </div>
              <p className="text-xs font-medium text-admin-heading">For MECELFAB</p>
              <p className="text-[10px] text-admin-muted mt-1">Authorized Signatory</p>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Inline styles for precise print control */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; margin: 0; padding: 0; }
          .page-break-inside-avoid { page-break-inside: avoid; }
          @page { margin: 1cm; size: A4; }
          /* Hide the Admin layout sidebar globally if rendering in print mode, though we usually just open this in a new tab without the layout */
        }
      `}} />
    </div>
  );
}
