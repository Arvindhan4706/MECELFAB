import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import PrintButton from '@/components/admin/PrintButton';
import { getCompanyProfile } from '@/lib/companyConfig';
import { assertPermission } from '@/lib/permissions';

export const metadata = {
  title: 'Tax Invoice | MECELFAB',
};

export default async function InvoicePrintPage(props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  
  try {
    assertPermission(session.user.role, 'billing:read');
  } catch {
    redirect('/admin/dashboard');
  }

  const [invoice, company] = await Promise.all([
    db.invoice.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        workOrder: true,
        quotation: { include: { items: true } },
        items: true,
        payments: { orderBy: { date: 'asc' } },
      },
    }),
    getCompanyProfile(),
  ]);

  if (!invoice) notFound();

  // Combine items from InvoiceItem or fallback to QuotationItem
  const items =
    invoice.items?.length > 0
      ? invoice.items
      : invoice.quotation?.items?.length > 0
      ? invoice.quotation.items
      : [
          {
            description: invoice.workOrder?.service || 'Industrial Contracting & Engineering Services',
            quantity: 1,
            unitPrice: invoice.subtotal,
            totalPrice: invoice.subtotal,
          },
        ];

  const totalPaid = invoice.payments.reduce((acc, p) => acc + p.amount, 0);
  const balanceDue = Math.max(0, Math.round((invoice.grandTotal - totalPaid + Number.EPSILON) * 100) / 100);

  const isInterState = invoice.gstType === 'INTER_STATE';
  const cgstAmount = invoice.cgst ?? (!isInterState ? Math.round((invoice.subtotal * 0.09 + Number.EPSILON) * 100) / 100 : 0);
  const sgstAmount = invoice.sgst ?? (!isInterState ? Math.round((invoice.subtotal * 0.09 + Number.EPSILON) * 100) / 100 : 0);
  const igstAmount = invoice.igst ?? (isInterState ? invoice.taxAmount : 0);

  return (
    <div className="bg-admin-surface min-h-screen font-sans text-admin-heading print:bg-admin-surface">
      {/* Top Bar for Browser Actions (Hidden on Print) */}
      <div className="bg-admin-elevated p-4 border-b border-admin-border flex justify-between items-center print:hidden max-w-5xl mx-auto">
        <div>
          <p className="text-sm font-bold text-admin-heading">Print Tax Invoice: {invoice.invoiceNumber}</p>
          <p className="text-xs text-admin-muted">Use standard A4 Portrait for best results.</p>
        </div>
        <PrintButton label="Print / Save PDF" />
      </div>

      {/* A4 Tax Invoice Document */}
      <div className="max-w-4xl mx-auto bg-admin-surface p-10 print:p-0 print:max-w-none print:w-full border border-admin-border print:border-none shadow-sm print:shadow-none my-6 print:my-0">
        {/* Header */}
        <header className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-admin-heading mb-0.5">{company.shortName}</h1>
            <p className="text-xs text-admin-muted font-bold tracking-widest uppercase">
              {company.legalName}
            </p>
            <div className="mt-3 text-xs text-admin-muted space-y-0.5 leading-relaxed">
              <p>{company.tagline || 'Specialized Heavy Fabrication, Erection & Maintenance'}</p>
              {company.address && <p>{company.address}</p>}
              <p>
                GSTIN: {company.gstin || 'Not provided'} • PAN: {company.pan || 'Not provided'}
                {company.cin ? ` • CIN: ${company.cin}` : ''}
              </p>
              <p>
                Email: {company.billingEmail || company.email}
                {company.phone ? ` • Phone: ${company.phone}` : ''}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-wider mb-2">TAX INVOICE</h2>
            <div className="space-y-1 text-xs">
              <p>
                <span className="font-semibold text-admin-muted">Invoice No:</span>{' '}
                <span className="font-bold text-admin-heading text-sm">{invoice.invoiceNumber}</span>
              </p>
              <p>
                <span className="font-semibold text-admin-muted">Invoice Date:</span>{' '}
                <span className="font-medium text-admin-heading">
                  {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : new Date(invoice.createdAt).toLocaleDateString()}
                </span>
              </p>
              <p>
                <span className="font-semibold text-admin-muted">Payment Due Date:</span>{' '}
                <span className="font-bold text-admin-heading">
                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Immediate'}
                </span>
              </p>
              {invoice.workOrder && (
                <p>
                  <span className="font-semibold text-admin-muted">Work Order:</span>{' '}
                  <span className="font-medium text-admin-heading">{invoice.workOrder.workOrderNumber}</span>
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Bill To & Supply Info */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-xs border border-admin-border p-4 rounded bg-admin-elevated/30">
          <div>
            <h3 className="font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-admin-border pb-1">
              Billed To (Customer Details)
            </h3>
            <p className="text-sm font-bold text-admin-heading">{invoice.customer.contactPerson}</p>
            {invoice.customer.companyName && (
              <p className="font-semibold text-admin-heading text-xs mt-0.5">{invoice.customer.companyName}</p>
            )}
            <div className="mt-1 text-admin-muted space-y-0.5">
              <p>{invoice.customer.email}</p>
              {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
              {invoice.customer.location && <p className="whitespace-pre-wrap">{invoice.customer.location}</p>}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-admin-border pb-1">
              Place of Supply & Status
            </h3>
            <div className="space-y-1.5 text-admin-muted">
              <p>
                <span className="font-semibold text-admin-heading">Place of Supply:</span>{' '}
                {isInterState ? 'Inter-State Supply (IGST 18%)' : 'Intra-State Supply (CGST 9% + SGST 9%)'}
              </p>
              <p>
                <span className="font-semibold text-admin-heading">Payment Terms:</span> 30 Days Net
              </p>
              <p>
                <span className="font-semibold text-admin-heading">Invoice Status:</span>{' '}
                <span className="font-bold text-admin-heading uppercase">{balanceDue <= 0 ? 'PAID' : invoice.status}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-admin-elevated border-y-2 border-gray-900 text-admin-text uppercase font-bold">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">Description / Service Scope</th>
                <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                <th className="py-2.5 px-3 w-28 text-right">Unit Rate (₹)</th>
                <th className="py-2.5 px-3 w-28 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3 text-center text-admin-muted">{idx + 1}</td>
                  <td className="py-3 px-3 text-admin-heading font-medium">{it.description}</td>
                  <td className="py-3 px-3 text-center text-admin-heading">{it.quantity}</td>
                  <td className="py-3 px-3 text-right text-admin-heading">
                    ₹ {it.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-admin-heading">
                    ₹ {it.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation & Tax Breakup */}
        <div className="flex justify-end mb-8 page-break-inside-avoid">
          <div className="w-80 space-y-2 text-xs border border-admin-border p-4 rounded bg-admin-elevated/30">
            <div className="flex justify-between text-admin-muted">
              <span>Taxable Subtotal:</span>
              <span className="font-medium text-admin-heading">
                ₹ {invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {invoice.discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount:</span>
                <span>- ₹ {invoice.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {isInterState ? (
              <div className="flex justify-between text-admin-muted">
                <span>IGST (18%):</span>
                <span className="font-medium text-admin-heading">
                  ₹ {igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-admin-muted">
                  <span>CGST (9%):</span>
                  <span className="font-medium text-admin-heading">
                    ₹ {cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-admin-muted">
                  <span>SGST (9%):</span>
                  <span className="font-medium text-admin-heading">
                    ₹ {sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between text-sm font-bold text-admin-heading border-t border-gray-900 pt-2 mt-2">
              <span>Total Invoice Amount:</span>
              <span>₹ {invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between text-xs text-admin-muted pt-1">
              <span>Amount Paid:</span>
              <span className="font-semibold text-green-600">
                ₹ {totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-xs font-bold text-admin-heading border-t border-admin-border pt-1">
              <span>Balance Due:</span>
              <span className={balanceDue > 0 ? 'text-amber-600' : 'text-green-600'}>
                ₹ {balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Banking & Remittance Details */}
        <div className="grid grid-cols-2 gap-6 text-xs border-t border-admin-border pt-6 mb-8 page-break-inside-avoid">
          <div className="space-y-1 text-admin-muted bg-admin-elevated/40 p-3 rounded">
            <h4 className="font-bold text-admin-heading uppercase tracking-wider text-[11px] mb-1">
              Bank Remittance Details
            </h4>
            <p>
              <span className="font-semibold text-admin-heading">Beneficiary:</span> {company.bankBeneficiary}
            </p>
            {company.bankName && company.bankAccount ? (
              <>
                <p>
                  <span className="font-semibold text-admin-heading">Bank:</span> {company.bankName}
                </p>
                <p>
                  <span className="font-semibold text-admin-heading">Account No:</span> {company.bankAccount}
                </p>
                {company.bankIfsc && (
                  <p>
                    <span className="font-semibold text-admin-heading">IFSC Code:</span> {company.bankIfsc}
                  </p>
                )}
              </>
            ) : (
              <p className="italic text-admin-muted pt-1">
                Official electronic remittance coordinates will be provided on formal invoice confirmation.
              </p>
            )}
          </div>

          <div className="text-admin-muted text-[11px] space-y-1">
            <h4 className="font-bold text-admin-heading uppercase tracking-wider text-[11px] mb-1">Terms of Invoice</h4>
            <p>1. Payment should be remitted within the stipulated credit period.</p>
            <p>2. Subject to {company.jurisdiction || 'Competent Courts in India'}.</p>
            <p>3. This is a computer-generated tax invoice.</p>
          </div>
        </div>

        {/* Signature Box */}
        <div className="flex justify-between items-end pt-8 page-break-inside-avoid">
          <div className="text-center w-48 text-xs">
            <div className="border-b border-admin-border pb-1 mb-1"></div>
            <p className="text-admin-muted">Customer Acknowledgement</p>
          </div>

          <div className="text-center w-64 text-xs">
            <p className="font-bold text-admin-heading mb-10">For {company.legalName}</p>
            <div className="border-b border-admin-border pb-1 mb-1"></div>
            <p className="text-admin-muted">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
