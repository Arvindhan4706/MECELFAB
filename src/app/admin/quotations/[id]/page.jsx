import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import QuotationActionButtons from './QuotationActionButtons';
import DownloadPDFButton from '@/components/admin/DownloadPDFButton';

export const metadata = {
  title: 'Quotation Detail | Admin',
};


async function createRevision(formData) {
  'use server';
  const id = formData.get('id');
  const session = await getServerSession(authOptions);

  // Auth check — only admin/manager can create revisions
  if (!session || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
    throw new Error('Unauthorized');
  }

  const currentQuotation = await db.quotation.findUnique({
    where: { id },
    include: { items: true }
  });

  if (!currentQuotation) return;

  // Cannot revise an ACCEPTED quotation — it is contractually locked
  if (currentQuotation.status === 'ACCEPTED') {
    throw new Error('An ACCEPTED quotation cannot be revised. Raise a new quotation instead.');
  }

  const count = await db.quotation.count();
  const currentYear = new Date().getFullYear();
  const newQuotationNumber = `MEC-QTN-${currentYear}-${String(count + 1).padStart(4, '0')}`;

  const newRevision = await db.quotation.create({
    data: {
      quotationNumber: newQuotationNumber,
      inquiryId: currentQuotation.inquiryId,
      customerId: currentQuotation.customerId,
      customerName: currentQuotation.customerName,
      companyName: currentQuotation.companyName,
      email: currentQuotation.email,
      phone: currentQuotation.phone,
      address: currentQuotation.address,
      service: currentQuotation.service,
      scopeOfWork: currentQuotation.scopeOfWork,
      termsConditions: currentQuotation.termsConditions,
      validityDays: currentQuotation.validityDays,
      subtotal: currentQuotation.subtotal,
      taxRate: currentQuotation.taxRate,
      taxAmount: currentQuotation.taxAmount,
      discount: currentQuotation.discount,
      grandTotal: currentQuotation.grandTotal,
      status: 'DRAFT',
      version: currentQuotation.version + 1,
      parentQuotationId: currentQuotation.id,
      createdBy: session.user.id,
      items: {
        create: currentQuotation.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      }
    }
  });

  // Mark current as EXPIRED since a new revision is created
  if (['DRAFT', 'SENT', 'VIEWED', 'REJECTED'].includes(currentQuotation.status)) {
    await db.quotation.update({
      where: { id: currentQuotation.id },
      data: { status: 'EXPIRED' }
    });
  }

  revalidatePath(`/admin/quotations`);
  redirect(`/admin/quotations/${newRevision.id}`);
}


export default async function QuotationDetailPage(props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const quotation = await db.quotation.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      inquiry: true,
      user: true,
      workOrders: true,
      parentQuotation: { select: { id: true, quotationNumber: true, version: true } },
      revisions: { select: { id: true, quotationNumber: true, version: true, status: true, createdAt: true }, orderBy: { version: 'desc' } }
    }
  });

  if (!quotation) notFound();

  const getStatusStyle = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-admin-elevated text-admin-heading';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'VIEWED': return 'bg-purple-100 text-purple-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-amber-100 text-amber-800';
      default: return 'bg-admin-elevated text-admin-heading';
    }
  };

  return (
    <div className="pb-12 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/quotations" className="p-2 border border-admin-border rounded-md text-admin-muted hover:bg-admin-elevated transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-admin-heading flex items-center gap-3">
              {quotation.quotationNumber}
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold uppercase">
                V{quotation.version}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full ${getStatusStyle(quotation.status)}`}>
                {quotation.status}
              </span>
            </h1>
            <p className="text-admin-muted text-sm mt-1">Created on {new Date(quotation.createdAt).toLocaleDateString()} by {quotation.user.name}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <DownloadPDFButton quotationId={quotation.id} quotationNumber={quotation.quotationNumber} />
          <Link href={`/admin/quotations/${quotation.id}/print`} target="_blank" className="flex items-center gap-2 bg-admin-surface border border-admin-border text-admin-text px-4 py-2 rounded-md hover:bg-admin-elevated transition-colors text-sm font-medium shadow-sm">
            <Printer size={16} /> Print / PDF
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border p-8">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-admin-border pb-6 mb-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-admin-heading mb-1">MECELFAB</h2>
                <p className="text-xs text-admin-muted max-w-[200px]">Industrial Solutions Private Limited</p>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest mb-2">Quotation</h3>
                <p className="text-sm text-admin-heading font-semibold">{quotation.quotationNumber} <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-xs">V{quotation.version}</span></p>
                <p className="text-xs text-admin-muted mt-1">Date: {new Date(quotation.createdAt).toLocaleDateString()}</p>
                <p className="text-xs text-admin-muted">Valid until: {new Date(new Date(quotation.createdAt).getTime() + (quotation.validityDays * 24 * 60 * 60 * 1000)).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quote For:</h4>
              <p className="text-sm font-bold text-admin-heading">{quotation.customerName}</p>
              {quotation.companyName && <p className="text-sm text-admin-text">{quotation.companyName}</p>}
              <p className="text-sm text-admin-muted mt-1">{quotation.email}</p>
              {quotation.phone && <p className="text-sm text-admin-muted">{quotation.phone}</p>}
              {quotation.address && <p className="text-sm text-admin-muted mt-1 whitespace-pre-wrap">{quotation.address}</p>}
            </div>

            {/* Scope */}
            <div className="mb-8 bg-admin-elevated p-4 rounded border border-admin-border">
              <h4 className="text-xs font-bold text-admin-heading uppercase tracking-wider mb-2">Project: {quotation.service}</h4>
              <p className="text-sm text-admin-muted whitespace-pre-wrap">{quotation.scopeOfWork}</p>
            </div>

            {/* Items */}
            <div className="mb-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-admin-border">
                    <th className="py-2 text-xs font-bold text-admin-muted uppercase">Description</th>
                    <th className="py-2 text-xs font-bold text-admin-muted uppercase text-center w-16">Qty</th>
                    <th className="py-2 text-xs font-bold text-admin-muted uppercase text-right w-28">Unit Price</th>
                    <th className="py-2 text-xs font-bold text-admin-muted uppercase text-right w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border/50">
                  {quotation.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 text-sm text-admin-heading">{item.description}</td>
                      <td className="py-3 text-sm text-admin-heading text-center">{item.quantity}</td>
                      <td className="py-3 text-sm text-admin-heading text-right">₹ {item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 text-sm font-medium text-admin-heading text-right">₹ {item.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financials */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm text-admin-muted">
                  <span>Subtotal</span>
                  <span>₹ {quotation.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-admin-muted">
                  <span>Tax ({quotation.taxRate}%)</span>
                  <span>₹ {quotation.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {quotation.discount > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>Discount</span>
                    <span>- ₹ {quotation.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-admin-heading border-t border-admin-border pt-2 mt-2">
                  <span>Grand Total</span>
                  <span>₹ {quotation.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* T&C */}
            {quotation.termsConditions && (
              <div className="border-t border-admin-border pt-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Terms & Conditions</h4>
                <p className="text-xs text-admin-muted whitespace-pre-wrap">{quotation.termsConditions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col - Actions */}
        <div className="space-y-6">
          <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border overflow-hidden">
            <div className="p-4 border-b border-admin-border bg-admin-elevated">
              <h2 className="font-semibold text-admin-heading text-sm">Status & Pipeline Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              <QuotationActionButtons
                quotation={quotation}
                existingWorkOrder={quotation.workOrders?.[0] || null}
              />


              {/* Create Revision Form */}
              {['DRAFT', 'SENT', 'VIEWED', 'REJECTED'].includes(quotation.status) && (
                <form action={createRevision} className="mt-4 border-t border-admin-border pt-4">
                  <input type="hidden" name="id" value={quotation.id} />
                  <button type="submit" className="w-full flex justify-center items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2 rounded text-sm font-medium transition-colors">
                    <FileText size={16} /> Create Revision (V{quotation.version + 1})
                  </button>
                  <p className="text-[10px] text-admin-muted text-center mt-2 leading-tight">
                    This will clone the current quotation and create a new draft version. The current quotation will be marked as Expired.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Revisions History */}
          {(quotation.parentQuotation || quotation.revisions.length > 0) && (
            <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border overflow-hidden">
              <div className="p-4 border-b border-admin-border bg-admin-elevated">
                <h2 className="font-semibold text-admin-heading text-sm">Version History</h2>
              </div>
              <div className="p-4 space-y-3">
                {quotation.parentQuotation && (
                  <div className="mb-4 pb-4 border-b border-admin-border">
                    <p className="text-xs text-admin-muted mb-1">Previous Version:</p>
                    <Link href={`/admin/quotations/${quotation.parentQuotation.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                      {quotation.parentQuotation.quotationNumber} (V{quotation.parentQuotation.version})
                    </Link>
                  </div>
                )}
                
                {quotation.revisions.length > 0 && (
                  <div>
                    <p className="text-xs text-admin-muted mb-2">Newer Versions:</p>
                    <div className="space-y-2">
                      {quotation.revisions.map(rev => (
                        <Link key={rev.id} href={`/admin/quotations/${rev.id}`} className="flex justify-between items-center p-2 border border-admin-border rounded hover:bg-admin-elevated">
                          <span className="text-sm font-medium text-indigo-600">V{rev.version}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${getStatusStyle(rev.status)}`}>{rev.status}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-admin-surface rounded-lg shadow-sm border border-admin-border overflow-hidden">
            <div className="p-4 border-b border-admin-border bg-admin-elevated">
              <h2 className="font-semibold text-admin-heading text-sm">CRM Link</h2>
            </div>
            <div className="p-4 text-sm">
              {quotation.inquiry ? (
                <>
                  <p className="text-admin-muted mb-2">This quotation is linked to:</p>
                  <Link href={`/admin/inquiries/${quotation.inquiryId}`} className="flex items-center justify-between p-3 border border-indigo-100 bg-indigo-50/50 rounded-md hover:bg-indigo-50 transition-colors group">
                    <div>
                      <p className="font-bold text-indigo-700 group-hover:text-indigo-900">{quotation.inquiry.referenceNumber}</p>
                      <p className="text-xs text-indigo-500 mt-0.5">{quotation.inquiry.name}</p>
                    </div>
                    <ArrowLeft size={16} className="text-indigo-400 group-hover:text-indigo-600 rotate-180" />
                  </Link>
                </>
              ) : (
                <p className="text-admin-muted italic">No associated inquiry.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
