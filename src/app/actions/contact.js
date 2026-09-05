"use server";
import { db } from "@/lib/db";

export async function submitInquiry(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const company = formData.get('company');
  const service = formData.get('service');
  const message = formData.get('message');

  if (!name || !email || !message) {
    return { error: 'Name, email, and message are required.' };
  }

  try {
    const currentYear = new Date().getFullYear();
    const count = await db.inquiry.count();
    let refSeq = count + 1;
    let referenceNumber = `MEC-REQ-${currentYear}-${String(refSeq).padStart(4, '0')}`;
    while (await db.inquiry.findUnique({ where: { referenceNumber } })) {
      refSeq++;
      referenceNumber = `MEC-REQ-${currentYear}-${String(refSeq).padStart(4, '0')}`;
    }

    await db.inquiry.create({
      data: {
        referenceNumber,
        name,
        email,
        phone: phone || null,
        company: company || null,
        service: service || null,
        message,
        status: 'NEW'
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    return { error: 'Failed to submit inquiry. Please try again later.' };
  }
}
