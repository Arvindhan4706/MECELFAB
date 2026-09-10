/**
 * Financial Record Immutability Guards
 *
 * Once financial records (Invoices, Quotations) are in certain states,
 * their core financial data must be immutable.
 * 
 * These helpers enforce that rule server-side so no UI bug or API call
 * can accidentally mutate a live or paid financial record.
 */

/**
 * Statuses in which an Invoice's financial fields are LOCKED.
 * Only status transitions (e.g., ISSUED → PAID) are permitted.
 */
export const INVOICE_IMMUTABLE_STATUSES = ['ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'];

/**
 * Statuses in which a Quotation's financial fields are LOCKED.
 * Once sent to a customer, amounts should not silently change.
 */
export const QUOTATION_IMMUTABLE_STATUSES = ['SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

/**
 * Assert an invoice is in an editable (DRAFT) state.
 * Throws an informative error if not.
 *
 * @param {{ status: string, invoiceNumber: string }} invoice
 */
export function assertInvoiceEditable(invoice) {
  if (INVOICE_IMMUTABLE_STATUSES.includes(invoice.status)) {
    throw new Error(
      `Invoice ${invoice.invoiceNumber} cannot be modified: it is in ${invoice.status} status. ` +
      `Only DRAFT invoices are editable. To make corrections, cancel this invoice and generate a new one.`
    );
  }
}

/**
 * Assert a quotation is in an editable (DRAFT) state.
 * Throws an informative error if not.
 *
 * @param {{ status: string, quotationNumber: string }} quotation
 */
export function assertQuotationEditable(quotation) {
  if (QUOTATION_IMMUTABLE_STATUSES.includes(quotation.status)) {
    throw new Error(
      `Quotation ${quotation.quotationNumber} cannot be modified: it is in ${quotation.status} status. ` +
      `Once sent to a customer, financial details are locked. Create a new revision if changes are needed.`
    );
  }
}
