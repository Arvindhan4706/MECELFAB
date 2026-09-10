"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { assertPermission } from '@/lib/permissions';

// Helper to check admin access
async function checkAdmin(permission = 'settings:write') {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');
  
  try {
    assertPermission(session.user.role, permission);
  } catch (err) {
    throw new Error('Unauthorized', { cause: err });
  }
  
  return session;
}

// ----------------------------------------------------------------------
// Settings (Stats) Actions
// ----------------------------------------------------------------------
export async function updateStats(formData) {
  await checkAdmin();
  const keys = ['projectsCompleted', 'industrialClients', 'serviceCategories', 'safetyCompliance'];
  
  for (const key of keys) {
    const value = formData.get(key);
    if (value !== null) {
      await db.setting.upsert({
        where: { key: `stats_${key}` },
        update: { value: value.toString() },
        create: { key: `stats_${key}`, value: value.toString(), type: 'NUMBER' }
      });
    }
  }
  revalidatePath('/admin/dashboard');
  revalidatePath('/'); // Revalidate public homepage where stats are shown
  return { success: true };
}

// ----------------------------------------------------------------------
// Projects Actions
// ----------------------------------------------------------------------
export async function createProject(formData) {
  await checkAdmin();
  
  const title = formData.get('title');
  const slug = formData.get('slug');
  const description = formData.get('description');
  const category = formData.get('category');
  const status = formData.get('status') || 'Completed';
  const client = formData.get('client');
  const year = formData.get('year');
  const image = formData.get('image');
  
  await db.project.create({
    data: { title, slug, description, category, status, client, year, image }
  });
  
  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  return { success: true };
}

export async function updateProject(id, formData) {
  await checkAdmin();
  
  const title = formData.get('title');
  const slug = formData.get('slug');
  const description = formData.get('description');
  const category = formData.get('category');
  const status = formData.get('status') || 'Completed';
  const client = formData.get('client');
  const year = formData.get('year');
  const image = formData.get('image');
  
  await db.project.update({
    where: { id },
    data: { title, slug, description, category, status, client, year, image }
  });
  
  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  return { success: true };
}

export async function deleteProject(id) {
  await checkAdmin();
  await db.project.delete({ where: { id } });
  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  return { success: true };
}

// ----------------------------------------------------------------------
// Services Actions
// ----------------------------------------------------------------------
export async function createService(formData) {
  await checkAdmin();
  
  const title = formData.get('title');
  const slug = formData.get('slug');
  const description = formData.get('description');
  const image = formData.get('image') || null;
  const rawStatus = formData.get('status');
  const status = (rawStatus === 'DISABLED' || rawStatus === 'ARCHIVED') ? 'DISABLED' : 'ACTIVE';
  
  await db.service.create({
    data: { title, slug, description, image, status }
  });
  
  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/contact');
  return { success: true };
}

export async function updateService(id, formData) {
  await checkAdmin();
  
  const title = formData.get('title');
  const slug = formData.get('slug');
  const description = formData.get('description');
  const image = formData.get('image') || null;
  const rawStatus = formData.get('status');
  const status = (rawStatus === 'DISABLED' || rawStatus === 'ARCHIVED') ? 'DISABLED' : 'ACTIVE';
  
  await db.service.update({
    where: { id },
    data: { title, slug, description, image, status }
  });
  
  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/contact');
  return { success: true };
}

export async function deleteService(id) {
  await checkAdmin();
  await db.service.delete({ where: { id } });
  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/contact');
  return { success: true };
}

// ----------------------------------------------------------------------
// Users Actions
// ----------------------------------------------------------------------
export async function getUsers() {
  await checkAdmin();
  return await db.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
}

export async function deleteUser(id) {
  await checkAdmin();
  await db.user.delete({ where: { id } });
  revalidatePath('/admin/users');
  return { success: true };
}

// ----------------------------------------------------------------------
// Inquiry Actions
// ----------------------------------------------------------------------
export async function updateInquiryStatus(id, status) {
  await checkAdmin();
  await db.inquiry.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/admin/inquiries');
  return { success: true };
}

export async function deleteInquiry(id) {
  const session = await checkAdmin();

  // Guard: Do not allow deletion of inquiries linked to commercial records
  const linked = await db.inquiry.findUnique({
    where: { id },
    include: { quotations: { select: { id: true, quotationNumber: true } } }
  });

  if (linked?.quotations?.length > 0) {
    const nums = linked.quotations.map(q => q.quotationNumber).join(', ');
    return { success: false, error: `Cannot delete inquiry: linked quotation(s) exist: ${nums}. Cancel or archive the quotation first.` };
  }

  await db.inquiry.delete({ where: { id } });

  await db.activityLog.create({
    data: {
      action: 'INQUIRY_DELETED',
      entity: 'INQUIRY',
      entityId: id,
      userId: session.user.id,
      details: `Inquiry ${id} permanently deleted by ${session.user.email}`,
    }
  });

  revalidatePath('/admin/inquiries');
  return { success: true };
}

// ----------------------------------------------------------------------
// Client Actions
// ----------------------------------------------------------------------
export async function createClient(formData) {
  await checkAdmin();
  const name = formData.get('name');
  const logoUrl = formData.get('logoUrl') || formData.get('logo') || null;
  const featured = formData.get('featured') === 'true';
  await db.client.create({ data: { name, logoUrl, featured, status: 'PUBLISHED' } });
  revalidatePath('/admin/clients');
  revalidatePath('/'); // Trust section
  return { success: true };
}

export async function deleteClient(id) {
  await checkAdmin();
  await db.client.delete({ where: { id } });
  revalidatePath('/admin/clients');
  revalidatePath('/');
  return { success: true };
}

// ----------------------------------------------------------------------
// Testimonial Actions
// ----------------------------------------------------------------------
export async function createTestimonial(formData) {
  await checkAdmin();
  const name = formData.get('name') || formData.get('clientName') || 'Verified Client';
  const role = formData.get('role') || 'Project Manager';
  const company = formData.get('company') || 'Industrial Partner';
  const quote = formData.get('quote') || formData.get('content') || '';
  const rating = parseInt(formData.get('rating') || '5', 10);
  const featured = formData.get('featured') === 'true';
  await db.testimonial.create({ data: { name, role, company, quote, rating, featured, status: 'PUBLISHED' } });
  revalidatePath('/admin/testimonials');
  revalidatePath('/'); 
  return { success: true };
}

export async function deleteTestimonial(id) {
  await checkAdmin();
  await db.testimonial.delete({ where: { id } });
  revalidatePath('/admin/testimonials');
  revalidatePath('/');
  return { success: true };
}

// ----------------------------------------------------------------------
// Certification Actions
// ----------------------------------------------------------------------
export async function createCertification(formData) {
  await checkAdmin();
  const title = formData.get('title');
  const issuer = formData.get('issuer') || 'Regulatory Body';
  const year = formData.get('year') || new Date().getFullYear().toString();
  const image = formData.get('image') || null;
  const fileUrl = formData.get('fileUrl') || null;
  const featured = formData.get('featured') === 'true';
  await db.certification.create({
    data: { title, issuer, year, image, fileUrl, featured, status: 'PUBLISHED' }
  });
  revalidatePath('/admin/certifications');
  revalidatePath('/about');
  return { success: true };
}

export async function deleteCertification(id) {
  await checkAdmin();
  await db.certification.delete({ where: { id } });
  revalidatePath('/admin/certifications');
  revalidatePath('/about');
  return { success: true };
}
