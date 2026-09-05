"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

// ----------------------------------------------------------------------
// Auth & Role Helpers
// ----------------------------------------------------------------------
async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized: Please log in.");
  }
  return session.user;
}

function checkStaffRole(role) {
  const allowed = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"];
  if (!allowed.includes(role)) {
    throw new Error("Forbidden: Insufficient privileges.");
  }
}

// ----------------------------------------------------------------------
// Low Stock De-duplicated Alert Helper
// ----------------------------------------------------------------------
async function checkAndAlertLowStock(tx, part, newQuantity) {
  if (newQuantity <= part.minimumStock) {
    const existingNotification = await tx.notification.findFirst({
      where: {
        type: "LOW_STOCK",
        entityType: "PART",
        entityId: part.id,
        read: false
      }
    });

    if (!existingNotification) {
      const admins = await tx.user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "ADMIN", "MANAGER"] } },
        select: { id: true }
      });

      const isOut = newQuantity === 0;
      const title = isOut ? `OUT OF STOCK: ${part.name}` : `LOW STOCK ALERT: ${part.name}`;
      const message = `Part ${part.partNumber} (${part.name}) reached ${newQuantity} units (threshold: ${part.minimumStock}). Please reorder.`;

      for (const admin of admins) {
        await tx.notification.create({
          data: {
            userId: admin.id,
            type: "LOW_STOCK",
            title,
            message,
            entityType: "PART",
            entityId: part.id
          }
        });
      }
    }
  }
}

// ----------------------------------------------------------------------
// 1. Issue Part to Work Order (Atomic & Strict Negative Prevention)
// ----------------------------------------------------------------------
export async function issuePartToWorkOrder(formData) {
  const user = await getAuthenticatedUser();
  checkStaffRole(user.role);

  const partId = formData.get("partId");
  const workOrderId = formData.get("workOrderId");
  const quantity = parseInt(formData.get("quantity"), 10);
  const note = formData.get("note") || "";

  if (!partId || !workOrderId) {
    throw new Error("Part ID and Work Order ID are required.");
  }
  if (isNaN(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer greater than zero.");
  }

  const result = await db.$transaction(async (tx) => {
    // 1. Fetch part
    const part = await tx.part.findUnique({
      where: { id: partId }
    });

    if (!part) {
      throw new Error("Part not found.");
    }

    // 2. Strict stock check
    if (part.quantity < quantity) {
      throw new Error(
        `Insufficient stock for "${part.name}". Requested: ${quantity}, Available in stock: ${part.quantity}.`
      );
    }

    const previousQuantity = part.quantity;
    const newQuantity = previousQuantity - quantity;

    // 3. Decrement Part inventory
    await tx.part.update({
      where: { id: partId },
      data: { quantity: newQuantity }
    });

    // 4. Create StockMovement linked to Work Order
    const movement = await tx.stockMovement.create({
      data: {
        partId,
        workOrderId,
        type: "ISSUED",
        quantity,
        previousQuantity,
        newQuantity,
        userId: user.id,
        note: note ? `Issued to Work Order: ${note}` : "Issued for work order service"
      }
    });

    // 5. Trigger low-stock alert if applicable
    await checkAndAlertLowStock(tx, part, newQuantity);

    // 6. Audit Activity Log
    await tx.activityLog.create({
      data: {
        action: "PART_ISSUED",
        entity: "WORK_ORDER",
        entityId: workOrderId,
        userId: user.id,
        details: JSON.stringify({
          partNumber: part.partNumber,
          partName: part.name,
          quantity,
          previousQuantity,
          newQuantity
        })
      }
    });

    return movement;
  });

  revalidatePath(`/admin/work-orders/${workOrderId}`);
  revalidatePath(`/admin/inventory/${partId}`);
  revalidatePath("/admin/inventory");

  return { success: true, movement: result };
}

// ----------------------------------------------------------------------
// 2. Return Part from Work Order (Atomic & Cannot Exceed Issued)
// ----------------------------------------------------------------------
export async function returnPartFromWorkOrder(formData) {
  const user = await getAuthenticatedUser();
  checkStaffRole(user.role);

  const partId = formData.get("partId");
  const workOrderId = formData.get("workOrderId");
  const quantity = parseInt(formData.get("quantity"), 10);
  const note = formData.get("note") || "";

  if (!partId || !workOrderId) {
    throw new Error("Part ID and Work Order ID are required.");
  }
  if (isNaN(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer greater than zero.");
  }

  const result = await db.$transaction(async (tx) => {
    const part = await tx.part.findUnique({
      where: { id: partId }
    });
    if (!part) throw new Error("Part not found.");

    // Verify how many units were issued vs returned on this work order
    const movements = await tx.stockMovement.findMany({
      where: {
        partId,
        workOrderId
      }
    });

    const totalIssued = movements
      .filter((m) => m.type === "ISSUED")
      .reduce((sum, m) => sum + m.quantity, 0);

    const totalReturned = movements
      .filter((m) => m.type === "RETURNED")
      .reduce((sum, m) => sum + m.quantity, 0);

    const netAllocated = totalIssued - totalReturned;

    if (quantity > netAllocated) {
      throw new Error(
        `Cannot return ${quantity} units. Only ${netAllocated} active issued units remain allocated to this Work Order.`
      );
    }

    const previousQuantity = part.quantity;
    const newQuantity = previousQuantity + quantity;

    // Increment Part inventory
    await tx.part.update({
      where: { id: partId },
      data: { quantity: newQuantity }
    });

    // Create RETURNED StockMovement
    const movement = await tx.stockMovement.create({
      data: {
        partId,
        workOrderId,
        type: "RETURNED",
        quantity,
        previousQuantity,
        newQuantity,
        userId: user.id,
        note: note ? `Returned unused: ${note}` : "Returned unused from work order"
      }
    });

    // Audit Activity Log
    await tx.activityLog.create({
      data: {
        action: "PART_RETURNED",
        entity: "WORK_ORDER",
        entityId: workOrderId,
        userId: user.id,
        details: JSON.stringify({
          partNumber: part.partNumber,
          partName: part.name,
          quantityReturned: quantity,
          newTotalStock: newQuantity
        })
      }
    });

    return movement;
  });

  revalidatePath(`/admin/work-orders/${workOrderId}`);
  revalidatePath(`/admin/inventory/${partId}`);
  revalidatePath("/admin/inventory");

  return { success: true, movement: result };
}

// ----------------------------------------------------------------------
// 3. Physical Stock Adjustment & Reconciliation (Full Audit Trail)
// ----------------------------------------------------------------------
export async function adjustPhysicalStock(formData) {
  const user = await getAuthenticatedUser();
  checkStaffRole(user.role);

  const partId = formData.get("partId");
  const newPhysicalQuantity = parseInt(formData.get("newQuantity"), 10);
  const reason = formData.get("reason") || "Physical stock reconciliation";

  if (!partId) throw new Error("Part ID is required.");
  if (isNaN(newPhysicalQuantity) || newPhysicalQuantity < 0) {
    throw new Error("Physical quantity cannot be negative.");
  }

  const result = await db.$transaction(async (tx) => {
    const part = await tx.part.findUnique({
      where: { id: partId }
    });
    if (!part) throw new Error("Part not found.");

    const previousQuantity = part.quantity;
    const difference = newPhysicalQuantity - previousQuantity;

    if (difference === 0) {
      return { part, noChange: true };
    }

    await tx.part.update({
      where: { id: partId },
      data: { quantity: newPhysicalQuantity }
    });

    // Create auditable StockMovement
    const movement = await tx.stockMovement.create({
      data: {
        partId,
        type: "ADJUSTED",
        quantity: Math.abs(difference),
        previousQuantity,
        newQuantity: newPhysicalQuantity,
        userId: user.id,
        note: `Physical Reconciliation: ${difference > 0 ? "+" : ""}${difference} units. Reason: ${reason}`
      }
    });

    await checkAndAlertLowStock(tx, part, newPhysicalQuantity);

    await tx.activityLog.create({
      data: {
        action: "STOCK_ADJUSTED",
        entity: "INVENTORY",
        entityId: partId,
        userId: user.id,
        details: JSON.stringify({
          partNumber: part.partNumber,
          previousQuantity,
          newQuantity: newPhysicalQuantity,
          difference,
          reason
        })
      }
    });

    return movement;
  });

  revalidatePath(`/admin/inventory/${partId}`);
  revalidatePath("/admin/inventory");

  return { success: true, movement: result };
}

// ----------------------------------------------------------------------
// 4. Receive Stock Shipment / Delivery
// ----------------------------------------------------------------------
export async function receiveStockShipment(formData) {
  const user = await getAuthenticatedUser();
  checkStaffRole(user.role);

  const partId = formData.get("partId");
  const quantity = parseInt(formData.get("quantity"), 10);
  const note = formData.get("note") || "New shipment received";

  if (!partId) throw new Error("Part ID is required.");
  if (isNaN(quantity) || quantity <= 0) {
    throw new Error("Received quantity must be a positive integer.");
  }

  const result = await db.$transaction(async (tx) => {
    const part = await tx.part.findUnique({
      where: { id: partId }
    });
    if (!part) throw new Error("Part not found.");

    const previousQuantity = part.quantity;
    const newQuantity = previousQuantity + quantity;

    await tx.part.update({
      where: { id: partId },
      data: { quantity: newQuantity }
    });

    const movement = await tx.stockMovement.create({
      data: {
        partId,
        type: "RECEIVED",
        quantity,
        previousQuantity,
        newQuantity,
        userId: user.id,
        note
      }
    });

    await tx.activityLog.create({
      data: {
        action: "STOCK_RECEIVED",
        entity: "INVENTORY",
        entityId: partId,
        userId: user.id,
        details: JSON.stringify({
          partNumber: part.partNumber,
          quantityReceived: quantity,
          newQuantity
        })
      }
    });

    return movement;
  });

  revalidatePath(`/admin/inventory/${partId}`);
  revalidatePath("/admin/inventory");

  return { success: true, movement: result };
}
