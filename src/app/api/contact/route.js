import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ success: false, message: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const formData = await req.formData();
    
    const name = formData.get('fullName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const company = formData.get('companyName');
    const service = formData.get('serviceRequired');
    const projectLocation = formData.get('projectLocation');
    const expectedTimeline = formData.get('expectedTimeline');
    const projectDescription = formData.get('projectDescription');
    
    // Server-side validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Full name is required.' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email.trim())) {
      return NextResponse.json({ success: false, message: 'Valid email address is required.' }, { status: 400 });
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
        preferredContactMethod: formData.get('preferredContactMethod') || 'Email',
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

    return NextResponse.json({ success: true, message: 'Inquiry received', referenceNumber });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
