"use server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";

const VALID_SERVICES = [
  'Industrial Erection', 'Industrial Fabrication', 'Hydraulic & Pneumatic System Overhauling',
  'Industrial Generator Spare Parts', 'AMC — Annual Maintenance Contract',
  'Industrial Generator Rental', 'Air Compressor Rental', 'Turbocharger Services', 'Other'
];

export async function submitInquiry(formData) {
  const hdrs = headers();
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || hdrs.get('x-real-ip') || '127.0.0.1';
  if (!checkRateLimit(`action:${ip}`, 3, 60 * 1000)) {
    return { error: 'Too many requests. Please try again later.' };
  }

  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const company = formData.get('company');
  const service = formData.get('service');
  const message = formData.get('message');

  if (!name || typeof name !== 'string' || !name.trim()) {
    return { error: 'Name is required.' };
  }
  if (name.length > 100) {
    return { error: 'Name is too long.' };
  }
  if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email.trim())) {
    return { error: 'A valid email address is required.' };
  }
  if (email.length > 150) {
    return { error: 'Email is too long.' };
  }
  if (phone && (typeof phone !== 'string' || phone.length > 20)) {
    return { error: 'Invalid phone number.' };
  }
  if (company && (typeof company !== 'string' || company.length > 200)) {
    return { error: 'Company name is too long.' };
  }
  if (service && !VALID_SERVICES.includes(service)) {
    return { error: 'Invalid service selection.' };
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return { error: 'Message is required.' };
  }
  if (message.length > 5000) {
    return { error: 'Message is too long.' };
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
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        service: service || null,
        message: message.trim(),
        status: 'NEW'
      }
    });

    return { success: true, referenceNumber };
  } catch {
    return { error: 'Failed to submit inquiry. Please try again later.' };
  }
}
