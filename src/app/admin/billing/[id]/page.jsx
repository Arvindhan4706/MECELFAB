import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, FileText, Printer } from 'lucide-react';
import PaymentManager from './PaymentManager';

export const metadata = {
  title: 'Invoice Detail | Admin | MECELFAB',
};

export default async function InvoiceDetailPage(props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const invoice = await db.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      workOrder: true,
      quotation: {
        include: { items: true },
      },
      items: true,
      payments: {
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!invoice) notFound();

  const paidAmount = invoice.payments.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = Math.max(0, Math.round((invoice.grandTotal - paidAmount + Number.EPSILON) * 100) / 100);

  const getStatusColor = () => {
    if (invoice.status === 'CANCELLED') return 'bg-admin-elevated text-admin-heading border-admin-border';
    if (balance <= 0) return 'bg-green-100 text-green-800 border-green-200';
    if (invoice.dueDate && new Date(invoice.dueDate) < new Date() && balance > 0)
      return 'bg-red-100 text-red-800 border-red-200';
    if (paidAmount > 0) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  const getStatusText = () => {
    if (invoice.status === 'CANCELLED') return 'CANCELLED';
    if (balance <= 0) return 'PAID';
    if (invoice.dueDate && new Date(invoice.dueDate) < new Date() && balance > 0) return 'OVERDUE';
    if (paidAmount > 0) return 'PARTIALLY PAID';
    return invoice.status;
  };

  // Line items
  const items =
    invoice.items?.length > 0
      ? invoice.items
      : invoice.quotation?.items?.length > 0
      ? invoice.quotation.items
      : [];

  const isInterState = invoice.gstType === 'INTER_STATE';
  const cgstAmount =
    invoice.cgst ?? (!isInterState ? Math.round((invoice.subtotal * 0.09 + Number.EPSILON) * 100) / 100 : 0);
  const sgstAmount =
    invoice.sgst ?? (!isInterState ? Math.round((invoice.subtotal * 0.09 + Number.EPSILON) * 100) / 100 : 0);
  const igstAmount = invoice.igst ?? (isInterState ? invoice.taxAmount : 0);

  return (
    <div className="pb-12 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/billing"
            className="p-2 border border-white/10 rounded-md text-secondary hover:bg-admin-surface/5 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {invoice.invoiceNumber}
              <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full border ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </h1>
            <div className="text-secondary text-sm mt-1 flex gap-4">
              <span>Issue: {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '—'}</span>
              <span>Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}</span>
              {invoice.workOrder && <span>Work Order: {invoice.workOrder.workOrderNumber}</span>}
            </div>
          </div>
        </div>

        <Link
          href={`/admin/billing/${invoice.id}/print`}
          target="_blank"
          className="flex items-center gap-2 bg-admin-surface/10 hover:bg-admin-surface/20 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors border border-white/10 shadow-sm"
        >
          <Printer size={16} /> Print Tax Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col - Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <User size={18} className="text-blue-400" /> Bill To
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{invoice.customer.contactPerson}</p>
                <p className="text-sm text-gray-300">{invoice.customer.companyName || '—'}</p>
              </div>
              <div className="md:text-right">
                <p className="text-sm text-gray-300">{invoice.customer.email}</p>
                <p className="text-sm text-gray-300">{invoice.customer.phone || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-400 whitespace-pre-wrap">{invoice.customer.location || '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-admin-surface/5 rounded-lg shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-5 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" /> Line Items
              </h2>
              <span className="text-xs text-secondary">
                {isInterState ? 'Inter-State (IGST 18%)' : 'Intra-State (CGST 9% + SGST 9%)'}
              </span>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-black/10 text-secondary text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Description</th>
                    <th className="p-4 font-medium text-center">Qty</th>
                    <th className="p-4 font-medium text-right">Price</th>
                    <th className="p-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.length > 0 ? (
                    items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-admin-surface/5 transition-colors">
                        <td className="p-4 text-sm text-gray-300">{item.description}</td>
                        <td className="p-4 text-sm text-gray-300 text-center">{item.quantity}</td>
                        <td className="p-4 text-sm text-gray-300 text-right">
                          ₹ {item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-sm text-gray-300 text-right">
                          ₹ {item.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-4 text-sm text-gray-400 italic">
                        {invoice.workOrder?.service || 'Contracting services as per agreement.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-5 bg-black/20 border-t border-white/10 flex flex-col items-end gap-2 text-sm">
              <div className="flex justify-between w-72 text-gray-400">
                <span>Taxable Subtotal:</span>
                <span>₹ {invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between w-72 text-green-400">
                  <span>Discount:</span>
                  <span>- ₹ {invoice.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {isInterState ? (
                <div className="flex justify-between w-72 text-gray-400">
                  <span>IGST (18%):</span>
                  <span>₹ {igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between w-72 text-gray-400">
                    <span>CGST (9%):</span>
                    <span>₹ {cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between w-72 text-gray-400">
                    <span>SGST (9%):</span>
                    <span>₹ {sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between w-72 text-white font-bold text-lg mt-2 pt-2 border-t border-white/10">
                <span>Grand Total:</span>
                <span>₹ {invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Payments */}
        <div>
          <PaymentManager invoice={invoice} payments={invoice.payments} />
        </div>
      </div>
    </div>
  );
}
