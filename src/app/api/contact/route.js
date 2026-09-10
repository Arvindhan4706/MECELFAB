import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    // Rate limit: 5 requests per 1 minute for contact API
    if (!checkRateLimit(ip, 5, 60 * 1000)) {
      logger.warn('Rate limit exceeded on Contact API', { ip });
      return NextResponse.json({ success: false, message: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const data = await req.json();
    
    const name = data.fullName;
    const email = data.email;
    const phone = data.phone;
    const company = data.companyName;
    const service = data.serviceRequired;
    const projectLocation = data.projectLocation;
    const expectedTimeline = data.expectedTimeline;
    const projectDescription = data.projectDescription;
    
    // Server-side validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Full name is required.' }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ success: false, message: 'Full name is too long.' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email.trim())) {
      return NextResponse.json({ success: false, message: 'Valid email address is required.' }, { status: 400 });
    }
    if (email.length > 150) {
      return NextResponse.json({ success: false, message: 'Email address is too long.' }, { status: 400 });
    }
    if (projectDescription && projectDescription.length > 5000) {
      return NextResponse.json({ success: false, message: 'Project description exceeds maximum length.' }, { status: 400 });
    }
    if (phone && phone.length > 20) {
      return NextResponse.json({ success: false, message: 'Phone number exceeds maximum length.' }, { status: 400 });
    }
    if (company && company.length > 200) {
      return NextResponse.json({ success: false, message: 'Company name exceeds maximum length.' }, { status: 400 });
    }
    if (projectLocation && projectLocation.length > 200) {
      return NextResponse.json({ success: false, message: 'Location exceeds maximum length.' }, { status: 400 });
    }
    if (expectedTimeline && expectedTimeline.length > 100) {
      return NextResponse.json({ success: false, message: 'Timeline exceeds maximum length.' }, { status: 400 });
    }

    // Validate service against allowlist
    const VALID_SERVICES = [
      'Industrial Erection', 'Industrial Fabrication', 'Hydraulic & Pneumatic System Overhauling',
      'Industrial Generator Spare Parts', 'AMC — Annual Maintenance Contract',
      'Industrial Generator Rental', 'Air Compressor Rental', 'Turbocharger Services', 'Other'
    ];
    if (service && !VALID_SERVICES.includes(service)) {
      return NextResponse.json({ success: false, message: 'Invalid service selection.' }, { status: 400 });
    }

    // Validate preferredContactMethod against allowlist
    const VALID_CONTACT_METHODS = ['Phone', 'Email', 'WhatsApp'];
    const contactMethod = data.preferredContactMethod || 'Email';
    if (!VALID_CONTACT_METHODS.includes(contactMethod)) {
      return NextResponse.json({ success: false, message: 'Invalid contact method.' }, { status: 400 });
    }

    // We'll keep the raw projectDescription as 'message' in the DB
    const message = projectDescription?.trim() || 'No description provided.';

    // Generate Collision-Resistant Reference Number
    // Example: MEC-REQ-2026-0001
    const currentYear = new Date().getFullYear();
    const count = await db.inquiry.count();
    let refSeq = count + 1;
    let referenceNumber = `MEC-REQ-${currentYear}-${String(refSeq).padStart(4, '0')}`;
    while (await db.inquiry.findUnique({ where: { referenceNumber } })) {
      refSeq++;
      referenceNumber = `MEC-REQ-${currentYear}-${String(refSeq).padStart(4, '0')}`;
    }

    const newInquiry = await db.inquiry.create({
      data: {
        referenceNumber,
        name,
        email,
        phone: phone || null,
        company: company || null,
        service: service || null,
        location: projectLocation || null,
        timeline: expectedTimeline || null,
        preferredContactMethod: contactMethod,
        message,
        documentUrl: null,
        status: 'NEW'
      }
    });

    // Create Activity Log
    await db.activityLog.create({
      data: {
        action: 'INQUIRY_CREATED',
        entity: 'INQUIRY',
        entityId: newInquiry.id,
        details: `Customer submitted new service request for ${service || 'General Service'}.`
      }
    });

    // Create Notification for SUPER_ADMINs and ADMINs
    const admins = await db.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
      select: { id: true }
    });

    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          type: 'INQUIRY_CREATED',
          title: 'New Service Request',
          message: `New inquiry received from ${name} (${company || 'Individual'}).`,
          entityType: 'INQUIRY',
          entityId: newInquiry.id,
        }))
      });
    }

    // Import email functions dynamically to avoid edge runtime issues if applicable,
    // or just import at the top. Since it's a Node API route, we can import it.
    const { sendAdminInquiryNotification, sendCustomerInquiryConfirmation } = await import('@/lib/email');
    
    try {
      // 1. Send internal notification to admin
      await sendAdminInquiryNotification(newInquiry);
      
      // 2. Send auto-reply to the customer
      await sendCustomerInquiryConfirmation(email, name, referenceNumber);
    } catch (emailError) {
      logger.error('Failed to send inquiry emails', emailError, { referenceNumber });
      // We don't fail the request if the email fails, since the DB record is already saved
    }

    return NextResponse.json({ success: true, message: 'Inquiry received', referenceNumber });
  } catch (error) {
    logger.error('Contact API Error', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
