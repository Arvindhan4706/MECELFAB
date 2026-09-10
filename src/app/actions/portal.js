"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

import { assertPermission } from '@/lib/permissions';

/**
 * Helper: Strictly authenticate and retrieve the customer record linked to the session.
 * Never trust customerId provided by the client.
 */
async function getAuthCustomer() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized: Please log in to access the portal.");
  }
  
  try {
    assertPermission(session.user.role, 'portal:write');
  } catch (err) {
    throw new Error("Unauthorized: Customer access only.");
  }

  const customer = await db.customer.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) {
    throw new Error("No customer account associated with this login.");
  }

  return { session, customer };
}

/**
 * Submits a new customer service request:
 * - Scoped strictly to the authenticated customer
 * - Validates equipment ownership (if equipment is selected)
 * - Zero upload/storage functionality
 * - Creates inquiry with type 'SERVICE_REQUEST'
 * - Generates admin notification
 */
export async function createCustomerServiceRequestAction(formData) {
  const { customer } = await getAuthCustomer();

  const equipmentId = formData.get("equipmentId")?.trim() || null;
  const category = formData.get("category")?.trim() || "General Maintenance";
  const priority = formData.get("priority")?.trim() || "MEDIUM";
  const description = formData.get("description")?.trim();

  if (!description) {
    return { success: false, error: "Please provide a description of the issue or service needed." };
  }

  // Validate equipment ownership to prevent tampering
  let equipmentInfo = "";
  if (equipmentId) {
    const equipment = await db.equipment.findFirst({
      where: {
        id: equipmentId,
        customerId: customer.id, // STRICT ISOLATION
      },
    });

    if (!equipment) {
      return { success: false, error: "Invalid equipment selected or equipment does not belong to your account." };
    }
    equipmentInfo = ` [Equipment: ${equipment.type} - Model: ${equipment.model || "N/A"} - S/N: ${equipment.serialNumber || "N/A"}]`;
  }

  const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  const finalPriority = validPriorities.includes(priority) ? priority : "MEDIUM";

  const currentYear = new Date().getFullYear();
  const count = await db.inquiry.count();
  const referenceNumber = `MEC-SR-${currentYear}-${String(count + 1).padStart(4, "0")}`;

  const fullMessage = `${description}${equipmentInfo ? `\n\nRegistered Equipment Details:${equipmentInfo}` : ""}\n\nClient Requested Priority: ${finalPriority}`;

  const serviceRequest = await db.$transaction(async (tx) => {
    // 1. Create Inquiry record
    const inquiry = await tx.inquiry.create({
      data: {
        referenceNumber,
        name: customer.contactPerson,
        company: customer.companyName,
        email: customer.email,
        phone: customer.phone,
        location: customer.location,
        service: `[Service Request] ${category}`,
        message: fullMessage,
        status: "NEW",
        customerId: customer.id,
      },
    });

    // 2. Find administrative users to notify
    const admins = await tx.user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
      },
      select: { id: true },
    });

    // 3. Dispatch notifications to all admins
    if (admins.length > 0) {
      await tx.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "SERVICE_REQUEST_CREATED",
          title: `New Service Request: ${referenceNumber}`,
          message: `${customer.companyName || customer.contactPerson} submitted a ${finalPriority} priority request for ${category}.`,
          entityType: "INQUIRY",
          entityId: inquiry.id,
        })),
      });
    }

    // 4. Log activity
    await tx.activityLog.create({
      data: {
        action: "SERVICE_REQUEST_SUBMITTED",
        entity: "INQUIRY",
        entityId: inquiry.id,
        userId: customer.userId,
        details: `Customer ${customer.companyName || customer.contactPerson} submitted service request ${referenceNumber} (${finalPriority})`,
      },
    });

    return inquiry;
  });

  revalidatePath("/portal");
  revalidatePath("/portal/service-requests");
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/dashboard");

  return {
    success: true,
    referenceNumber: serviceRequest.referenceNumber,
    serviceRequestId: serviceRequest.id,
  };
}
