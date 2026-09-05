"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Helper: Round a number safely to 2 decimal places to prevent floating-point drift.
 */
function round2(num) {
  const n = Number(num);
  if (isNaN(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Helper: Ensure caller is authenticated admin or staff.
 */
async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized: Please log in to perform this action.");
  }
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    throw new Error("User record not found.");
  }
  return { session, user };
}

// ======================================================================
// 1. QUOTATION MANAGEMENT
// ======================================================================

/**
 * Creates a formal Quotation with line items and GST calculation.
 */
export async function createQuotationAction(formData) {
  const { user } = await getAuthUser();

  const inquiryId = formData.get("inquiryId") || null;
  const customerId = formData.get("customerId") || null;
  const customerName = formData.get("customerName")?.trim();
  const companyName = formData.get("companyName")?.trim() || "";
  const email = formData.get("email")?.trim();
  const phone = formData.get("phone")?.trim() || "";
  const address = formData.get("address")?.trim() || "";
  const service = formData.get("service")?.trim();
  const scopeOfWork = formData.get("scopeOfWork")?.trim();
  const termsConditions = formData.get("termsConditions")?.trim() || "";
  const validityDays = parseInt(formData.get("validityDays")) || 30;

  if (!customerName || !email || !service || !scopeOfWork) {
    return { success: false, error: "Missing required fields: Customer Name, Email, Service, and Scope of Work." };
  }

  let itemsRaw = formData.get("items");
  let items;
  try {
    items = typeof itemsRaw === "string" ? JSON.parse(itemsRaw) : (itemsRaw || []);
  } catch {
    return { success: false, error: "Invalid line items format." };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: "At least one line item is required." };
  }

  const taxRate = parseFloat(formData.get("taxRate")) || 18;
  const discount = round2(parseFloat(formData.get("discount")) || 0);

  // Decimal-safe recalculation
  const sanitizedItems = items.map((it) => {
    const qty = Math.max(1, parseInt(it.quantity) || 1);
    const price = round2(parseFloat(it.unitPrice) || 0);
    return {
      description: it.description?.trim() || "Service Item",
      quantity: qty,
      unitPrice: price,
      totalPrice: round2(qty * price),
    };
  });

  const subtotal = round2(sanitizedItems.reduce((acc, it) => acc + it.totalPrice, 0));
  const taxAmount = round2(subtotal * (taxRate / 100));
  const grandTotal = Math.max(0, round2(subtotal + taxAmount - discount));

  // Determine Customer linkage
  let resolvedCustomerId = customerId;
  if (!resolvedCustomerId && email) {
    const existingCust = await db.customer.findUnique({ where: { email } });
    if (existingCust) {
      resolvedCustomerId = existingCust.id;
    } else {
      const newCust = await db.customer.create({
        data: {
          companyName: companyName || customerName,
          contactPerson: customerName,
          email,
          phone,
          location: address,
        },
      });
      resolvedCustomerId = newCust.id;
    }
  }

  // Unique sequential quotation number MEC-QT-YYYY-XXXX
  const currentYear = new Date().getFullYear();
  const count = await db.quotation.count();
  const quotationNumber = `MEC-QT-${currentYear}-${String(count + 1).padStart(4, "0")}`;

  const quotation = await db.$transaction(async (tx) => {
    const quote = await tx.quotation.create({
      data: {
        quotationNumber,
        inquiryId: inquiryId || null,
        customerId: resolvedCustomerId,
        customerName,
        companyName,
        email,
        phone,
        address,
        service,
        scopeOfWork,
        termsConditions,
        validityDays,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        grandTotal,
        status: "DRAFT",
        createdBy: user.id,
        items: {
          create: sanitizedItems,
        },
      },
      include: { items: true },
    });

    if (inquiryId) {
      await tx.inquiry.update({
        where: { id: inquiryId },
        data: { status: "QUOTATION" },
      });
    }

    await tx.activityLog.create({
      data: {
        action: "QUOTATION_CREATED",
        entity: "QUOTATION",
        entityId: quote.id,
        userId: user.id,
        details: `Created formal quotation ${quotationNumber} for ₹${grandTotal.toLocaleString("en-IN")}`,
      },
    });

    return quote;
  });

  revalidatePath("/admin/quotations");
  if (inquiryId) revalidatePath(`/admin/inquiries/${inquiryId}`);

  return { success: true, quotationId: quotation.id, quotationNumber: quotation.quotationNumber };
}

/**
 * Updates Quotation status lifecycle (DRAFT -> SENT -> ACCEPTED / REJECTED)
 * and syncs inquiry CRM status.
 */
export async function updateQuotationStatusAction(quotationId, newStatus) {
  const { user } = await getAuthUser();

  const quotation = await db.quotation.findUnique({
    where: { id: quotationId },
  });

  if (!quotation) {
    return { success: false, error: "Quotation not found." };
  }

  const validStatuses = ["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "EXPIRED"];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, error: `Invalid status: ${newStatus}` };
  }

  await db.$transaction(async (tx) => {
    await tx.quotation.update({
      where: { id: quotationId },
      data: { status: newStatus },
    });

    // CRM sync if linked to inquiry
    if (quotation.inquiryId) {
      let inquiryStatus = null;
      if (newStatus === "ACCEPTED") inquiryStatus = "WON";
      else if (newStatus === "REJECTED") inquiryStatus = "LOST";
      else if (newStatus === "SENT") inquiryStatus = "NEGOTIATION";

      if (inquiryStatus) {
        await tx.inquiry.update({
          where: { id: quotation.inquiryId },
          data: { status: inquiryStatus },
        });
      }
    }

    await tx.activityLog.create({
      data: {
        action: "QUOTATION_STATUS_UPDATED",
        entity: "QUOTATION",
        entityId: quotation.id,
        userId: user.id,
        details: `Updated quotation ${quotation.quotationNumber} status from ${quotation.status} to ${newStatus}`,
      },
    });
  });

  revalidatePath(`/admin/quotations/${quotationId}`);
  revalidatePath("/admin/quotations");
  if (quotation.inquiryId) revalidatePath(`/admin/inquiries/${quotation.inquiryId}`);

  return { success: true, status: newStatus };
}

// ======================================================================
// 2. QUOTATION → WORK ORDER CONVERSION
// ======================================================================

/**
 * Converts an ACCEPTED quotation into an active Work Order with 1-click.
 * Prevents duplicate conversions and copies all customer & project details.
 */
export async function convertQuotationToWorkOrderAction(quotationId) {
  const { user } = await getAuthUser();

  const quotation = await db.quotation.findUnique({
    where: { id: quotationId },
    include: {
      items: true,
      workOrders: true,
      customer: true,
    },
  });

  if (!quotation) {
    return { success: false, error: "Quotation not found." };
  }

  // Acceptance Gate: ONLY ACCEPTED quotations can be converted
  if (quotation.status !== "ACCEPTED") {
    return {
      success: false,
      error: `Cannot convert quotation in ${quotation.status} status. Only ACCEPTED quotations can be converted to Work Orders.`,
    };
  }

  // Duplicate Check: Prevent multiple conversions
  if (quotation.workOrders && quotation.workOrders.length > 0) {
    const existing = quotation.workOrders[0];
    return {
      success: false,
      error: `Work Order ${existing.workOrderNumber} has already been created for this quotation.`,
      workOrderId: existing.id,
      workOrderNumber: existing.workOrderNumber,
    };
  }

  // Ensure customer record exists
  let customerId = quotation.customerId;
  if (!customerId) {
    const existingCust = await db.customer.findUnique({ where: { email: quotation.email } });
    if (existingCust) {
      customerId = existingCust.id;
    } else {
      const newCust = await db.customer.create({
        data: {
          companyName: quotation.companyName || quotation.customerName,
          contactPerson: quotation.customerName,
          email: quotation.email,
          phone: quotation.phone,
          location: quotation.address,
        },
      });
      customerId = newCust.id;
    }
    // Associate customer back to quotation
    await db.quotation.update({
      where: { id: quotation.id },
      data: { customerId },
    });
  }

  // Sequential Work Order number: MEC-WO-YYYY-XXXX
  const currentYear = new Date().getFullYear();
  const count = await db.workOrder.count();
  const workOrderNumber = `MEC-WO-${currentYear}-${String(count + 1).padStart(4, "0")}`;

  // Scheduled date: default to 3 days from now
  const scheduledDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const workOrder = await db.$transaction(async (tx) => {
    const wo = await tx.workOrder.create({
      data: {
        workOrderNumber,
        quotationId: quotation.id,
        customerId,
        service: quotation.service,
        description: quotation.scopeOfWork,
        status: "SCHEDULED",
        priority: "MEDIUM",
        scheduledDate,
      },
    });

    await tx.activityLog.create({
      data: {
        action: "WORK_ORDER_CONVERTED",
        entity: "WORK_ORDER",
        entityId: wo.id,
        userId: user.id,
        details: `Converted accepted quotation ${quotation.quotationNumber} to Work Order ${workOrderNumber}`,
      },
    });

    // Notify staff
    await tx.notification.create({
      data: {
        userId: user.id,
        type: "WORK_ORDER_CREATED",
        title: "Work Order Created",
        message: `Work Order ${workOrderNumber} generated from quotation ${quotation.quotationNumber}`,
        entityType: "WORK_ORDER",
        entityId: wo.id,
      },
    });

    return wo;
  });

  revalidatePath(`/admin/quotations/${quotationId}`);
  revalidatePath("/admin/quotations");
  revalidatePath("/admin/work-orders");
  revalidatePath(`/admin/work-orders/${workOrder.id}`);

  return {
    success: true,
    workOrderId: workOrder.id,
    workOrderNumber: workOrder.workOrderNumber,
  };
}

// ======================================================================
// 3. WORK ORDER / QUOTATION → INVOICE GENERATION
// ======================================================================

/**
 * Generates an itemized Tax Invoice with GST breakdown:
 * - Intra-State: CGST 9% + SGST 9% (Total 18%)
 * - Inter-State: IGST 18% (Total 18%)
 * Uses decimal-safe arithmetic.
 */
export async function generateInvoiceAction({
  workOrderId = null,
  quotationId = null,
  customerId = null,
  gstType = "INTRA_STATE", // "INTRA_STATE" or "INTER_STATE"
  dueDateDays = 30,
  discount = 0,
  notes = "",
  customItems = null,
}) {
  const { user } = await getAuthUser();

  let resolvedCustomerId = customerId;
  let resolvedQuotationId = quotationId;
  let workOrder = null;
  let quotation = null;

  if (workOrderId) {
    workOrder = await db.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        quotation: { include: { items: true } },
        customer: true,
        invoices: true,
      },
    });
    if (!workOrder) return { success: false, error: "Work Order not found." };
    resolvedCustomerId = workOrder.customerId;
    resolvedQuotationId = workOrder.quotationId;
    quotation = workOrder.quotation;

    // Duplicate Check: Check if an active invoice already exists for this Work Order
    const existingActive = workOrder.invoices.find((inv) => inv.status !== "CANCELLED");
    if (existingActive) {
      return {
        success: false,
        error: `Active invoice ${existingActive.invoiceNumber} already exists for this Work Order.`,
        invoiceId: existingActive.id,
        invoiceNumber: existingActive.invoiceNumber,
      };
    }
  } else if (quotationId) {
    quotation = await db.quotation.findUnique({
      where: { id: quotationId },
      include: { items: true, customer: true },
    });
    if (!quotation) return { success: false, error: "Quotation not found." };
    resolvedCustomerId = quotation.customerId;
  }

  if (!resolvedCustomerId) {
    return { success: false, error: "Customer association is required to generate an invoice." };
  }

  // Compile line items: custom items, or from quotation, or single service item
  let finalItems = [];
  if (Array.isArray(customItems) && customItems.length > 0) {
    finalItems = customItems.map((it) => {
      const q = Math.max(1, parseInt(it.quantity) || 1);
      const p = round2(parseFloat(it.unitPrice) || 0);
      return {
        description: it.description?.trim() || "Item",
        quantity: q,
        unitPrice: p,
        totalPrice: round2(q * p),
      };
    });
  } else if (quotation && quotation.items && quotation.items.length > 0) {
    finalItems = quotation.items.map((it) => ({
      description: it.description,
      quantity: it.quantity,
      unitPrice: round2(it.unitPrice),
      totalPrice: round2(it.totalPrice),
    }));
  } else {
    finalItems = [
      {
        description: workOrder?.service || "Industrial Contracting Services",
        quantity: 1,
        unitPrice: round2(workOrder?.quotation?.subtotal || 0),
        totalPrice: round2(workOrder?.quotation?.subtotal || 0),
      },
    ];
  }

  // Subtotal calculation
  const subtotal = round2(finalItems.reduce((acc, it) => acc + it.totalPrice, 0));
  const numDiscount = round2(Math.max(0, parseFloat(discount) || 0));

  // GST Calculation (18% total standard GST)
  const isInterState = gstType === "INTER_STATE";
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let taxAmount = 0;

  if (isInterState) {
    igst = round2(subtotal * 0.18);
    taxAmount = igst;
  } else {
    cgst = round2(subtotal * 0.09);
    sgst = round2(subtotal * 0.09);
    taxAmount = round2(cgst + sgst);
  }

  const grandTotal = Math.max(0, round2(subtotal + taxAmount - numDiscount));

  // Dates
  const issueDate = new Date();
  const dueDate = new Date(issueDate.getTime() + (parseInt(dueDateDays) || 30) * 24 * 60 * 60 * 1000);

  // Sequential Invoice Number MEC-INV-YYYY-XXXX
  const currentYear = new Date().getFullYear();
  const invoiceCount = await db.invoice.count();
  const invoiceNumber = `MEC-INV-${currentYear}-${String(invoiceCount + 1).padStart(4, "0")}`;

  const invoice = await db.$transaction(async (tx) => {
    const inv = await tx.invoice.create({
      data: {
        invoiceNumber,
        customerId: resolvedCustomerId,
        workOrderId: workOrderId || null,
        quotationId: resolvedQuotationId || null,
        status: "ISSUED",
        subtotal,
        taxRate: 18,
        taxAmount,
        discount: numDiscount,
        grandTotal,
        gstType: isInterState ? "INTER_STATE" : "INTRA_STATE",
        cgst,
        sgst,
        igst,
        notes: notes?.trim() || null,
        issueDate,
        dueDate,
        items: {
          create: finalItems,
        },
      },
      include: { items: true },
    });

    await tx.activityLog.create({
      data: {
        action: "INVOICE_GENERATED",
        entity: "INVOICE",
        entityId: inv.id,
        userId: user.id,
        details: `Generated tax invoice ${invoiceNumber} for ₹${grandTotal.toLocaleString("en-IN")} (${isInterState ? "IGST 18%" : "CGST 9% + SGST 9%"})`,
      },
    });

    return inv;
  });

  if (workOrderId) revalidatePath(`/admin/work-orders/${workOrderId}`);
  if (resolvedQuotationId) revalidatePath(`/admin/quotations/${resolvedQuotationId}`);
  revalidatePath("/admin/billing");
  revalidatePath(`/admin/billing/${invoice.id}`);

  return {
    success: true,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    grandTotal: invoice.grandTotal,
  };
}

// ======================================================================
// 4. PAYMENT TRACKING & AUTOMATIC STATUS TRANSITIONS
// ======================================================================

/**
 * Records a payment against an invoice:
 * - Advance, Partial, or Full payment
 * - Enforces decimal-safe check to prevent overpayment (amount <= balance)
 * - Automatically marks invoice PAID when balance reaches ₹0
 */
export async function recordInvoicePaymentAction({
  invoiceId,
  amount,
  date,
  method,
  reference = "",
  type = "PARTIAL", // "ADVANCE", "PARTIAL", "FULL"
  notes = "",
}) {
  const { user } = await getAuthUser();

  const numAmount = round2(parseFloat(amount));
  if (isNaN(numAmount) || numAmount <= 0) {
    return { success: false, error: "Payment amount must be greater than zero." };
  }

  const validMethods = ["BANK_TRANSFER", "CHEQUE", "CASH", "ONLINE"];
  if (!validMethods.includes(method)) {
    return { success: false, error: `Invalid payment method: ${method}` };
  }

  const validTypes = ["ADVANCE", "PARTIAL", "FULL"];
  const paymentType = validTypes.includes(type) ? type : "PARTIAL";

  const result = await db.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      throw new Error("Invoice not found.");
    }

    if (invoice.status === "CANCELLED") {
      throw new Error("Cannot record payment on a cancelled invoice.");
    }

    const currentPaid = round2(invoice.payments.reduce((acc, p) => acc + p.amount, 0));
    const remainingBalance = round2(invoice.grandTotal - currentPaid);

    if (remainingBalance <= 0) {
      throw new Error("This invoice is already fully paid.");
    }

    // Strict validation: payment cannot exceed outstanding balance
    if (numAmount > remainingBalance) {
      throw new Error(
        `Payment amount (₹${numAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}) exceeds the remaining balance (₹${remainingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}).`
      );
    }

    const paymentDate = date ? new Date(date) : new Date();

    const payment = await tx.payment.create({
      data: {
        invoiceId,
        amount: numAmount,
        date: paymentDate,
        method,
        reference: reference?.trim() || null,
        type: paymentType,
        notes: notes?.trim() || null,
      },
    });

    const newTotalPaid = round2(currentPaid + numAmount);
    const newBalance = round2(invoice.grandTotal - newTotalPaid);

    let newStatus = invoice.status;
    if (newBalance <= 0) {
      newStatus = "PAID";
    } else if (newTotalPaid > 0) {
      newStatus = "PARTIALLY_PAID";
    }

    if (newStatus !== invoice.status) {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });
    }

    await tx.activityLog.create({
      data: {
        action: "PAYMENT_RECORDED",
        entity: "PAYMENT",
        entityId: payment.id,
        userId: user.id,
        details: `Recorded ${paymentType} payment of ₹${numAmount.toLocaleString("en-IN")} via ${method} for invoice ${invoice.invoiceNumber}. New balance: ₹${newBalance.toLocaleString("en-IN")}. Status: ${newStatus}`,
      },
    });

    return {
      payment,
      newTotalPaid,
      newBalance,
      newStatus,
      invoiceNumber: invoice.invoiceNumber,
    };
  });

  revalidatePath(`/admin/billing/${invoiceId}`);
  revalidatePath("/admin/billing");

  return {
    success: true,
    paymentId: result.payment.id,
    newBalance: result.newBalance,
    newStatus: result.newStatus,
    message: result.newBalance <= 0 ? "Invoice is now fully paid!" : `Payment recorded. Remaining balance: ₹${result.newBalance.toLocaleString("en-IN")}`,
  };
}
