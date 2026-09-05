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
// 1. AMC Scheduled Visit Generation Engine
// ----------------------------------------------------------------------
export async function generateAMCVisits(amcId) {
  const user = await getAuthenticatedUser();
  checkStaffRole(user.role);

  const amc = await db.aMC.findUnique({
    where: { id: amcId },
    include: {
      equipment: {
        include: { equipment: true }
      },
      serviceVisits: true
    }
  });

  if (!amc) {
    throw new Error("AMC contract not found.");
  }

  const startDate = new Date(amc.startDate);
  const endDate = new Date(amc.endDate);

  if (startDate >= endDate) {
    throw new Error("Invalid AMC period: Start date must be before end date.");
  }

  // Determine interval in months based on frequency
  let intervalMonths;
  switch (amc.frequency) {
    case "MONTHLY":
      intervalMonths = 1;
      break;
    case "QUARTERLY":
      intervalMonths = 3;
      break;
    case "HALF_YEARLY":
      intervalMonths = 6;
      break;
    case "YEARLY":
      intervalMonths = 12;
      break;
    default:
      intervalMonths = 3; // default quarterly
  }

  // Calculate schedule dates strictly within [startDate, endDate]
  const targetDates = [];
  const currentDate = new Date(startDate);
  
  // Advance by the interval for first routine maintenance visit
  currentDate.setMonth(currentDate.getMonth() + intervalMonths);

  while (currentDate <= endDate) {
    targetDates.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + intervalMonths);
  }

  // If no routine date fell strictly between start and end (e.g. interval >= period),
  // schedule at least one mid-point visit before endDate
  if (targetDates.length === 0) {
    const midTime = startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2;
    targetDates.push(new Date(midTime));
  }

  // Identify equipment to link: either the first assigned AMC equipment or null
  const primaryEquipmentId = amc.equipment.length > 0 ? amc.equipment[0].equipmentId : null;

  // Existing visits for duplicate prevention
  const existingVisits = await db.serviceVisit.findMany({
    where: { amcId: amc.id }
  });

  // Check existing dates by YYYY-MM-DD
  const existingDateStrings = new Set(
    existingVisits.map((v) => new Date(v.date).toISOString().split("T")[0])
  );

  let createdCount = 0;

  for (const dateObj of targetDates) {
    const dateStr = dateObj.toISOString().split("T")[0];
    if (existingDateStrings.has(dateStr)) {
      continue; // Prevent duplicate visit
    }

    await db.serviceVisit.create({
      data: {
        customerId: amc.customerId,
        amcId: amc.id,
        equipmentId: primaryEquipmentId,
        date: dateObj,
        timeSlot: "10:00 - 13:00",
        status: "SCHEDULED"
      }
    });
    createdCount++;
  }

  // Update AMC status to ACTIVE if it was DRAFT
  if (amc.status === "DRAFT") {
    await db.aMC.update({
      where: { id: amc.id },
      data: { status: "ACTIVE" }
    });
  }

  // Log activity
  await db.activityLog.create({
    data: {
      action: "AMC_VISITS_GENERATED",
      entity: "AMC",
      entityId: amc.id,
      userId: user.id,
      details: JSON.stringify({
        amcNumber: amc.amcNumber,
        frequency: amc.frequency,
        generatedVisits: createdCount
      })
    }
  });

  revalidatePath(`/admin/amcs/${amc.id}`);
  revalidatePath("/admin/amcs");
  revalidatePath("/admin/field-service");

  return { success: true, count: createdCount };
}

// ----------------------------------------------------------------------
// 2. Technician Assignment & Rescheduling (Admin / Staff)
// ----------------------------------------------------------------------
export async function assignTechnicianToVisit(formData) {
  const user = await getAuthenticatedUser();
  checkStaffRole(user.role);

  const visitId = formData.get("visitId");
  const technicianId = formData.get("technicianId") || null;
  const dateStr = formData.get("date");
  const timeSlot = formData.get("timeSlot") || null;
  const status = formData.get("status") || "ASSIGNED";

  const visit = await db.serviceVisit.findUnique({
    where: { id: visitId },
    include: { amc: true, customer: true }
  });

  if (!visit) throw new Error("Service visit not found.");

  const updateData = {
    technicianId: technicianId || null,
    status: technicianId ? status : "SCHEDULED"
  };

  if (dateStr) {
    updateData.date = new Date(dateStr);
  }
  if (timeSlot) {
    updateData.timeSlot = timeSlot;
  }

  const updatedVisit = await db.serviceVisit.update({
    where: { id: visitId },
    data: updateData
  });

  // If assigned to technician, create notification for that technician
  if (technicianId) {
    await db.notification.create({
      data: {
        userId: technicianId,
        type: "VISIT_ASSIGNED",
        title: "New Service Visit Assigned",
        message: `You have been assigned to service visit for ${visit.customer.companyName || visit.customer.contactPerson} on ${new Date(updatedVisit.date).toLocaleDateString()}.`,
        entityType: "SERVICE_VISIT",
        entityId: visit.id
      }
    });
  }

  if (visit.amcId) revalidatePath(`/admin/amcs/${visit.amcId}`);
  revalidatePath("/admin/field-service");
  return { success: true };
}

// ----------------------------------------------------------------------
// 3. Technician Field Actions (Mobile-friendly execution)
// ----------------------------------------------------------------------

// Start Visit
export async function startServiceVisit(visitId) {
  const user = await getAuthenticatedUser();

  const visit = await db.serviceVisit.findUnique({
    where: { id: visitId }
  });

  if (!visit) throw new Error("Visit not found.");

  // Allow assigned technician or staff
  if (visit.technicianId && visit.technicianId !== user.id && !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(user.role)) {
    throw new Error("Forbidden: You are not assigned to this visit.");
  }

  const now = new Date();
  const timeString = now.toTimeString().split(" ")[0].slice(0, 5); // HH:MM

  await db.serviceVisit.update({
    where: { id: visitId },
    data: {
      status: "IN_PROGRESS",
      startTime: timeString
    }
  });

  if (visit.amcId) revalidatePath(`/admin/amcs/${visit.amcId}`);
  revalidatePath("/admin/field-service");
  revalidatePath(`/admin/field-service/${visitId}`);

  return { success: true };
}

// Complete Visit with Work Notes and Customer Acknowledgement
export async function completeServiceVisit(formData) {
  const user = await getAuthenticatedUser();

  const visitId = formData.get("visitId");
  const workPerformed = formData.get("workPerformed") || "";
  const observations = formData.get("observations") || "";
  const recommendations = formData.get("recommendations") || "";
  const technicianNotes = formData.get("technicianNotes") || "";
  const partsUsed = formData.get("partsUsed") || "";
  const acknowledgedBy = formData.get("acknowledgedBy") || "";
  const customerAcknowledged = formData.get("customerAcknowledgement") === "true";

  const visit = await db.serviceVisit.findUnique({
    where: { id: visitId },
    include: { amc: true, customer: true, equipment: true }
  });

  if (!visit) throw new Error("Visit not found.");

  if (visit.technicianId && visit.technicianId !== user.id && !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(user.role)) {
    throw new Error("Forbidden: You are not assigned to this visit.");
  }

  const now = new Date();
  const endTimeString = now.toTimeString().split(" ")[0].slice(0, 5);

  await db.serviceVisit.update({
    where: { id: visitId },
    data: {
      status: "COMPLETED",
      endTime: endTimeString,
      completedAt: now,
      workPerformed,
      observations,
      recommendations,
      technicianNotes,
      partsUsed,
      customerAcknowledgement: customerAcknowledged,
      acknowledgedBy: customerAcknowledged ? acknowledgedBy || visit.customer.contactPerson : null,
      acknowledgedAt: customerAcknowledged ? now : null
    }
  });

  // Log activity
  await db.activityLog.create({
    data: {
      action: "SERVICE_VISIT_COMPLETED",
      entity: "SERVICE_VISIT",
      entityId: visit.id,
      userId: user.id,
      details: JSON.stringify({
        customer: visit.customer.companyName,
        acknowledgedBy: customerAcknowledged ? acknowledgedBy : "Unacknowledged"
      })
    }
  });

  if (visit.amcId) revalidatePath(`/admin/amcs/${visit.amcId}`);
  revalidatePath("/admin/field-service");
  revalidatePath(`/admin/field-service/${visitId}`);

  return { success: true };
}

// Cancel Visit
export async function cancelServiceVisit(visitId, reason = "") {
  const user = await getAuthenticatedUser();
  checkStaffRole(user.role);

  const visit = await db.serviceVisit.findUnique({
    where: { id: visitId }
  });

  if (!visit) throw new Error("Visit not found.");

  await db.serviceVisit.update({
    where: { id: visitId },
    data: {
      status: "CANCELLED",
      technicianNotes: reason ? `Cancelled: ${reason}` : "Cancelled by admin"
    }
  });

  if (visit.amcId) revalidatePath(`/admin/amcs/${visit.amcId}`);
  revalidatePath("/admin/field-service");
  return { success: true };
}

// ----------------------------------------------------------------------
// 4. AMC Renewal Notification Trigger Engine
// ----------------------------------------------------------------------
export async function checkAMCRenewals() {
  const user = await getAuthenticatedUser();
  checkStaffRole(user.role);

  const now = new Date();
  const activeAMCs = await db.aMC.findMany({
    where: { status: { in: ["ACTIVE", "EXPIRING"] } },
    include: { customer: true }
  });

  const admins = await db.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN", "MANAGER"] } },
    select: { id: true }
  });

  let notificationsCreated = 0;

  for (const amc of activeAMCs) {
    const end = new Date(amc.endDate);
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    let alertType = null;
    let title = "";
    let message = "";

    if (diffDays <= 15 && diffDays >= 0) {
      alertType = "AMC_EXPIRING_15";
      title = `AMC Urgent Renewal: ${amc.amcNumber} (15 Days)`;
      message = `AMC ${amc.amcNumber} for ${amc.customer.companyName || amc.customer.contactPerson} expires in ${diffDays} days on ${end.toLocaleDateString()}.`;
    } else if (diffDays <= 30 && diffDays > 15) {
      alertType = "AMC_EXPIRING_30";
      title = `AMC Renewal Due: ${amc.amcNumber} (30 Days)`;
      message = `AMC ${amc.amcNumber} for ${amc.customer.companyName || amc.customer.contactPerson} expires on ${end.toLocaleDateString()} (${diffDays} days remaining).`;
    }

    if (alertType) {
      const existing = await db.notification.findFirst({
        where: {
          entityType: "AMC",
          entityId: amc.id,
          type: alertType
        }
      });

      if (!existing) {
        if (amc.status !== "EXPIRING") {
          await db.aMC.update({
            where: { id: amc.id },
            data: { status: "EXPIRING" }
          });
        }

        for (const admin of admins) {
          await db.notification.create({
            data: {
              userId: admin.id,
              type: alertType,
              title,
              message,
              entityType: "AMC",
              entityId: amc.id
            }
          });
          notificationsCreated++;
        }
      }
    }
  }

  return { success: true, notificationsCreated };
}
